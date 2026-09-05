const { loadState, saveState, setTaskStatus, createHandoff } = require('./task-engine');

const PIPELINE = [
  { from: 'research', to: 'idea', taskType: 'idea_generation', title: 'สร้างและคัดกรอง content ideas' },
  { from: 'idea', to: 'ceo', taskType: 'decision', title: 'เตรียม CEO decision' },
  { from: 'ceo', to: 'writer', taskType: 'writing', title: 'เขียน script ตาม direction ที่อนุมัติ' },
  { from: 'writer', to: 'qa', taskType: 'qa', title: 'ตรวจสอบ script ก่อน production' },
  { from: 'qa', to: 'producer', taskType: 'production', title: 'วาง production plan' }
];

function nextStage(agentId) {
  return PIPELINE.find((stage) => stage.from === agentId) || null;
}

function createNextTask(task, stage, state) {
  const existing = state.tasks.find((item) =>
    item.owner_agent_id === stage.to &&
    item.depends_on.includes(task.task_id) &&
    !['CANCELLED', 'FAILED'].includes(item.status)
  );
  if (existing) return existing;

  const next = {
    task_id: `task-${stage.to}-${Date.now()}`,
    type: stage.taskType,
    title: stage.title,
    objective: `ดำเนินงานต่อจาก ${task.task_id}`,
    owner_agent_id: stage.to,
    requester_agent_id: task.owner_agent_id,
    priority: task.priority,
    status: 'QUEUED',
    input_refs: task.output_refs.length ? task.output_refs : [task.task_id],
    output_refs: [],
    depends_on: [task.task_id],
    retry_count: 0,
    max_retries: 3,
    last_error: null,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null
  };
  state.tasks.push(next);
  return next;
}

function advanceTask(taskId, options = {}) {
  const state = loadState();
  const task = state.tasks.find((item) => item.task_id === taskId);
  if (!task) throw new Error(`Task not found: ${taskId}`);
  if (task.status !== 'COMPLETED' && task.status !== 'READY_FOR_QA') {
    throw new Error(`Task must be COMPLETED or READY_FOR_QA before workflow advance: ${task.status}`);
  }

  const stage = nextStage(task.owner_agent_id);
  if (!stage) return { state, task, nextTask: null, completed: true };

  const nextTask = createNextTask(task, stage, state);
  saveState(state);
  createHandoff({
    task_id: task.task_id,
    from_agent: task.owner_agent_id,
    to_agent: stage.to,
    objective: nextTask.objective,
    input_refs: nextTask.input_refs,
    evidence_refs: options.evidence_refs || [],
    source_refs: options.source_refs || [],
    assumptions: options.assumptions || [],
    inference: options.inference || [],
    confidence: options.confidence || 'Medium',
    recommendation: options.recommendation || null,
    requested_action: `รับ task ${nextTask.task_id}`
  });

  return { state: loadState(), task, nextTask, completed: false };
}

module.exports = { PIPELINE, advanceTask, nextStage };
