const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const coreDir = path.join(__dirname, '..', 'company-core');
const statePath = path.join(coreDir, 'state.json');
const backupPath = path.join(coreDir, 'state.smoke-test.backup.json');

const agents = ['ceo', 'research', 'idea', 'writer', 'producer', 'visual', 'video', 'qa', 'publisher', 'analytics'];

function makeAgent(id) {
  return { agent_id: id, status: 'IDLE', current_task_id: null, last_completed_task_id: null, last_error: null, updated_at: new Date().toISOString() };
}

function makeTask(taskId, owner, type, status = 'QUEUED', priority = 'NORMAL', dependsOn = []) {
  return {
    task_id: taskId,
    type,
    title: `${type} smoke test`,
    objective: `Smoke test for ${type}`,
    owner_agent_id: owner,
    requester_agent_id: 'ceo',
    priority,
    status,
    input_refs: [],
    output_refs: [],
    depends_on: dependsOn,
    retry_count: 0,
    max_retries: 3,
    last_error: null,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null
  };
}

function freshState() {
  const task = makeTask('task-research-smoke', 'research', 'research', 'QUEUED', 'HIGH');
  return {
    company: { company_id: 'smoke-company', name: 'AI Media Company Smoke Test', status: 'ACTIVE', owner_id: 'owner-001', active_task_ids: [task.task_id], pending_approval_ids: [] },
    agents: Object.fromEntries(agents.map((id) => [id, makeAgent(id)])),
    tasks: [task],
    handoffs: [],
    content: [],
    research_records: [],
    sources: [],
    evidence: [],
    decisions: [],
    approvals: [],
    knowledge: [],
    metrics: [],
    audit_log: []
  };
}

function writeState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function taskByOwner(state, owner) {
  return state.tasks.find((task) => task.owner_agent_id === owner && !['COMPLETED', 'CANCELLED'].includes(task.status));
}

const original = fs.existsSync(statePath) ? fs.readFileSync(statePath, 'utf8') : null;
if (original) fs.writeFileSync(backupPath, original, 'utf8');

try {
  writeState(freshState());

  const { runAgent, completeAgentTask } = require('../company-core/agent-runtime');
  const { approveCeoTask, rejectQaTask } = require('../company-core/approval-engine');
  const { loadState } = require('../company-core/task-engine');

  // Research -> Idea
  runAgent('research', 'task-research-smoke', { topic: 'AI media content opportunity' });
  let result = completeAgentTask('task-research-smoke');
  assert.equal(result.nextTask.owner_agent_id, 'idea');
  assert.equal(result.nextTask.type, 'idea_generation');

  // Idea -> CEO
  const ideaTask = result.nextTask.task_id;
  runAgent('idea', ideaTask, { research_refs: ['task-research-smoke.output'] });
  result = completeAgentTask(ideaTask);
  const ceoTask = result.nextTask.task_id;
  assert.equal(result.nextTask.owner_agent_id, 'ceo');
  assert.equal(result.nextTask.type, 'decision');

  // CEO -> pending owner approval
  runAgent('ceo', ceoTask, { recommendation: 'Proceed with the highest-ranked content idea.' });
  result = completeAgentTask(ceoTask);
  assert.equal(result.approval_required, true);
  assert.equal(result.task.status, 'WAITING_APPROVAL');
  assert.ok(result.approval.approval_id);
  assert.equal(result.approval.task_id, ceoTask);

  // Owner approval -> Writer
  result = approveCeoTask(ceoTask, 'Approved by smoke test');
  assert.equal(result.approval.status, 'APPROVED');
  assert.equal(result.workflow_advanced, true);
  assert.equal(result.nextTask.owner_agent_id, 'writer');
  assert.equal(result.nextTask.type, 'writing');

  // Writer -> QA
  const writerTask = result.nextTask.task_id;
  runAgent('writer', writerTask, { idea_refs: [ceoTask + '.output'] });
  result = completeAgentTask(writerTask);
  assert.equal(result.nextTask.owner_agent_id, 'qa');
  assert.equal(result.nextTask.type, 'qa');

  // QA reject -> Writer revision
  const qaTask = result.nextTask.task_id;
  runAgent('qa', qaTask, { content_refs: [writerTask + '.output'], verdict: 'REJECT' });
  result = rejectQaTask(qaTask, 'Missing evidence for a key claim');
  assert.equal(result.revision_requested, true);
  assert.equal(result.nextTask.owner_agent_id, 'writer');
  assert.equal(result.nextTask.type, 'revision');
  assert.equal(result.nextTask.revision.source_task_id, qaTask);

  // Writer revision -> QA again
  const revisionTask = result.nextTask.task_id;
  runAgent('writer', revisionTask, { revision_refs: [qaTask + '.output'] });
  result = completeAgentTask(revisionTask);
  assert.equal(result.nextTask.owner_agent_id, 'qa');
  assert.equal(result.nextTask.type, 'qa');

  const finalState = loadState();
  const approval = finalState.approvals.find((item) => item.task_id === ceoTask);
  assert.equal(approval.status, 'APPROVED');
  assert.ok(finalState.handoffs.some((item) => item.from_agent === 'ceo' && item.to_agent === 'writer'));
  assert.ok(finalState.handoffs.some((item) => item.from_agent === 'qa' && item.to_agent === 'writer'));
  assert.ok(finalState.handoffs.some((item) => item.from_agent === 'writer' && item.to_agent === 'qa'));

  console.log('SMOKE TEST PASSED');
  console.log('Research -> Idea -> CEO -> Approval -> Writer -> QA -> Revision -> QA');
} finally {
  if (original !== null) fs.writeFileSync(statePath, original, 'utf8');
  else if (fs.existsSync(statePath)) fs.unlinkSync(statePath);
  if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
}
