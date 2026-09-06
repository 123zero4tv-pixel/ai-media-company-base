const { loadState, saveState, createHandoff } = require('./task-engine');

// Analytics closes the content loop by turning performance observations into
// explicit learning records and follow-up research/idea work. Learning is
// evidence-backed; it does not silently rewrite company policy.
function recordLearning({ analyticsTaskId, metrics = [], observations = [], recommendations = [], confidence = 'Medium', evidence_refs = [], source_refs = [] } = {}) {
  const state = loadState();
  const record = {
    learning_id: `learning-${Date.now()}`,
    source_task_id: analyticsTaskId || null,
    created_at: new Date().toISOString(),
    metrics,
    observations,
    recommendations,
    evidence_refs,
    source_refs,
    confidence,
    status: 'RECORDED'
  };
  state.knowledge.push(record);
  state.audit_log.push({
    audit_id: `audit-${Date.now()}`,
    event_type: 'LEARNING_RECORDED',
    task_id: analyticsTaskId || null,
    timestamp: new Date().toISOString(),
    details: { learning_id: record.learning_id, confidence }
  });
  saveState(state);
  return record;
}

function createLearningTasks(learningId, priority = 'NORMAL') {
  const state = loadState();
  const learning = state.knowledge.find((item) => item.learning_id === learningId);
  if (!learning) throw new Error(`Learning record not found: ${learningId}`);

  const existing = state.tasks.filter((task) => task.learning_id === learningId && !['COMPLETED', 'CANCELLED'].includes(task.status));
  if (existing.length) return { state, tasks: existing };

  const specs = [
    { agent: 'research', type: 'learning_research', title: 'ตรวจสอบ learning จากผลลัพธ์ content' },
    { agent: 'idea', type: 'learning_ideas', title: 'แปลง learning เป็น content ideas ใหม่' },
    { agent: 'ceo', type: 'learning_decision', title: 'ทบทวน learning และกำหนดทิศทางรอบถัดไป' }
  ];
  const tasks = specs.map((spec) => ({
    task_id: `task-${spec.agent}-learning-${Date.now()}-${spec.agent}`,
    type: spec.type,
    title: spec.title,
    objective: `ใช้ learning ${learningId} เพื่อปรับปรุง content pipeline`,
    owner_agent_id: spec.agent,
    requester_agent_id: 'analytics',
    priority,
    status: 'QUEUED',
    input_refs: [learningId],
    output_refs: [],
    depends_on: [],
    retry_count: 0,
    max_retries: 3,
    last_error: null,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    learning_id: learningId
  }));
  state.tasks.push(...tasks);
  saveState(state);
  tasks.forEach((task) => createHandoff({
    task_id: learningId,
    from_agent: 'analytics',
    to_agent: task.owner_agent_id,
    objective: task.objective,
    input_refs: task.input_refs,
    evidence_refs: learning.evidence_refs || [],
    source_refs: learning.source_refs || [],
    assumptions: [],
    inference: learning.observations || [],
    confidence: learning.confidence || 'Medium',
    recommendation: (learning.recommendations || []).join('; ') || null,
    requested_action: `ดำเนินการ learning task ${task.task_id}`
  }));
  return { state: loadState(), tasks };
}

module.exports = { recordLearning, createLearningTasks };
