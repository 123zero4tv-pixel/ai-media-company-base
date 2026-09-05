const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const STATE_PATH = path.join(ROOT, 'state.json');

const ROLE_INSTRUCTIONS = {
  ceo: 'Decide direction, prioritize work, and approve or reject recommendations. Do not perform specialist work.',
  research: 'Research topics, trends, sources, evidence, conflicts, and confidence. Preserve source references.',
  idea: 'Turn research into content ideas, score them, rank them, and explain the recommendation.',
  writer: 'Turn an approved idea into a script, hook, title, caption, description, and platform adaptation.',
  producer: 'Turn an approved script into a production plan covering scenes, visuals, voice, B-roll, and coordination.',
  visual: 'Create and specify visual assets, thumbnails, illustrations, graphics, and brand-consistent directions.',
  video: 'Turn production inputs into a video assembly plan including scenes, subtitles, voice, music, and formats.',
  qa: 'Review facts, evidence, grammar, copyright risk, brand consistency, quality, and platform requirements. Reject when necessary.',
  publisher: 'Prepare publishing metadata, scheduling information, platform variants, and publication status.',
  analytics: 'Analyze content performance, diagnose results, and return evidence-based learning to research, idea, and CEO.'
};

function loadState() {
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function now() { return new Date().toISOString(); }

function runAgent(agentId, taskId, input = {}) {
  const state = loadState();
  const agent = state.agents?.[agentId];
  const task = state.tasks?.find(t => t.task_id === taskId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  if (!task) throw new Error(`Unknown task: ${taskId}`);
  if (task.owner_agent_id !== agentId) throw new Error('Task owner does not match agent');
  if (['COMPLETED','CANCELLED'].includes(task.status)) throw new Error('Task is already closed');

  const started = now();
  agent.status = 'WORKING';
  agent.current_task_id = taskId;
  task.status = 'IN_PROGRESS';
  task.started_at = task.started_at || started;
  task.runtime = {
    mode: 'role_runtime',
    role_instruction: ROLE_INSTRUCTIONS[agentId],
    input,
    started_at: started
  };
  state.audit_log = state.audit_log || [];
  state.audit_log.push({
    audit_id: `audit-${Date.now()}`,
    event_type: 'AGENT_RUNTIME_STARTED',
    actor: agentId,
    entity_type: 'Task',
    entity_id: taskId,
    created_at: started,
    details: { role: agentId }
  });
  saveState(state);
  return { agent_id: agentId, task_id: taskId, status: task.status, role_instruction: ROLE_INSTRUCTIONS[agentId] };
}

function getAgentContract(agentId) {
  if (!ROLE_INSTRUCTIONS[agentId]) throw new Error(`Unknown agent: ${agentId}`);
  return { agent_id: agentId, role_instruction: ROLE_INSTRUCTIONS[agentId] };
}

module.exports = { runAgent, getAgentContract, ROLE_INSTRUCTIONS };
