const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(__dirname, 'state.json');
const FALLBACK_STATE_FILE = path.join(__dirname, 'state.example.json');

const TRANSITIONS = {
  QUEUED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
  IN_PROGRESS: ['BLOCKED', 'WAITING_APPROVAL', 'READY_FOR_QA', 'COMPLETED', 'FAILED'],
  BLOCKED: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  WAITING_APPROVAL: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  READY_FOR_QA: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: ['QUEUED', 'CANCELLED'],
  CANCELLED: []
};

function statePath() {
  return fs.existsSync(STATE_FILE) ? STATE_FILE : FALLBACK_STATE_FILE;
}

function loadState() {
  return JSON.parse(fs.readFileSync(statePath(), 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function now() {
  return new Date().toISOString();
}

function nextId(prefix, collection) {
  return `${prefix}-${Date.now()}-${collection.length + 1}`;
}

function audit(state, actorType, actorId, eventType, entityType, entityId, summary, metadata = {}) {
  state.audit_log = state.audit_log || [];
  state.audit_log.push({
    event_id: nextId('event', state.audit_log),
    timestamp: now(),
    actor_type: actorType,
    actor_id: actorId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata
  });
}

function findTask(state, taskId) {
  return state.tasks.find((task) => task.task_id === taskId) || null;
}

function updateAgentForTask(state, task, previousStatus) {
  const agent = state.agents?.[task.owner_agent_id];
  if (!agent) return;

  agent.current_task_id = ['COMPLETED', 'CANCELLED'].includes(task.status) ? null : task.task_id;
  agent.updated_at = now();

  if (task.status === 'IN_PROGRESS') agent.status = 'WORKING';
  else if (task.status === 'WAITING_APPROVAL') agent.status = 'WAITING_APPROVAL';
  else if (task.status === 'BLOCKED') agent.status = 'BLOCKED';
  else if (task.status === 'FAILED') {
    agent.status = 'ERROR';
    agent.last_error = task.last_error;
  } else if (task.status === 'COMPLETED') {
    agent.status = 'READY';
    agent.last_completed_task_id = task.task_id;
    agent.last_error = null;
  } else if (task.status === 'QUEUED') agent.status = 'READY';

  if (previousStatus === 'FAILED' && task.status === 'QUEUED') agent.last_error = null;
}

function setTaskStatus(taskId, status, options = {}) {
  const state = loadState();
  const task = findTask(state, taskId);
  if (!task) throw new Error(`Task not found: ${taskId}`);
  if (!TRANSITIONS[task.status]?.includes(status)) {
    throw new Error(`Invalid task transition: ${task.status} -> ${status}`);
  }

  const previousStatus = task.status;
  task.status = status;
  const timestamp = now();

  if (status === 'IN_PROGRESS' && !task.started_at) task.started_at = timestamp;
  if (['COMPLETED', 'CANCELLED'].includes(status)) task.completed_at = timestamp;
  if (status === 'FAILED') {
    task.retry_count = Number(task.retry_count || 0) + 1;
    task.last_error = options.error || 'Task failed';
  }
  if (status === 'QUEUED' && previousStatus === 'FAILED') task.last_error = null;

  updateAgentForTask(state, task, previousStatus);
  state.company.active_task_ids = state.tasks
    .filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.status))
    .map((item) => item.task_id);

  const eventMap = {
    ASSIGNED: 'TASK_ASSIGNED',
    IN_PROGRESS: 'TASK_STARTED',
    BLOCKED: 'TASK_BLOCKED',
    WAITING_APPROVAL: 'APPROVAL_REQUESTED',
    READY_FOR_QA: 'TASK_COMPLETED',
    COMPLETED: 'TASK_COMPLETED',
    FAILED: 'TASK_FAILED'
  };
  audit(state, 'SYSTEM', 'task-engine', eventMap[status] || 'ERROR', 'Task', task.task_id,
    `Task ${task.task_id}: ${previousStatus} -> ${status}`, { previous_status: previousStatus, next_status: status });

  saveState(state);
  return { state, task };
}

function createHandoff(input) {
  const state = loadState();
  const task = findTask(state, input.task_id);
  if (!task) throw new Error(`Task not found: ${input.task_id}`);
  if (!state.agents?.[input.from_agent]) throw new Error(`Unknown from_agent: ${input.from_agent}`);
  if (!state.agents?.[input.to_agent]) throw new Error(`Unknown to_agent: ${input.to_agent}`);
  if (!input.objective || !input.requested_action) throw new Error('objective and requested_action are required');

  const handoff = {
    handoff_id: nextId('handoff', state.handoffs || []),
    task_id: task.task_id,
    from_agent: input.from_agent,
    to_agent: input.to_agent,
    objective: input.objective,
    input_refs: input.input_refs || [],
    evidence_refs: input.evidence_refs || [],
    source_refs: input.source_refs || [],
    assumptions: input.assumptions || [],
    inference: input.inference || [],
    confidence: input.confidence || 'Medium',
    recommendation: input.recommendation || null,
    requested_action: input.requested_action,
    status: 'PENDING'
  };

  state.handoffs = state.handoffs || [];
  state.handoffs.push(handoff);
  audit(state, 'AGENT', input.from_agent, 'HANDOFF_CREATED', 'TaskHandoff', handoff.handoff_id,
    `Handoff created: ${input.from_agent} -> ${input.to_agent}`, { task_id: task.task_id });
  saveState(state);
  return { state, handoff };
}

module.exports = { loadState, saveState, setTaskStatus, createHandoff, TRANSITIONS };
