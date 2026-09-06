const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const coreDir = path.join(__dirname, '..', 'company-core');
const statePath = path.join(coreDir, 'state.json');
const backupPath = path.join(coreDir, 'state.smoke-test.backup.json');
const agents = ['ceo', 'research', 'idea', 'writer', 'producer', 'visual', 'video', 'qa', 'publisher', 'analytics'];

function makeAgent(id) { return { agent_id: id, status: 'IDLE', current_task_id: null, last_completed_task_id: null, last_error: null, updated_at: new Date().toISOString() }; }
function makeTask(taskId, owner, type, status = 'QUEUED', priority = 'NORMAL', dependsOn = []) {
  return { task_id: taskId, type, title: `${type} smoke test`, objective: `Smoke test for ${type}`, owner_agent_id: owner, requester_agent_id: 'ceo', priority, status, input_refs: [], output_refs: [], depends_on: dependsOn, retry_count: 0, max_retries: 3, last_error: null, created_at: new Date().toISOString(), started_at: null, completed_at: null };
}
function freshState() {
  const task = makeTask('task-research-smoke', 'research', 'research', 'QUEUED', 'HIGH');
  return {
    company: { company_id: 'smoke-company', name: 'AI Media Company Smoke Test', status: 'ACTIVE', owner_id: 'owner-001', active_task_ids: [task.task_id], pending_approval_ids: [] },
    agents: Object.fromEntries(agents.map((id) => [id, makeAgent(id)])), tasks: [task], handoffs: [], content: [], research_records: [], sources: [], evidence: [], decisions: [], approvals: [], knowledge: [], metrics: [], audit_log: []
  };
}
function writeState(state) { fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8'); }

async function main() {
  const original = fs.existsSync(statePath) ? fs.readFileSync(statePath, 'utf8') : null;
  if (original) fs.writeFileSync(backupPath, original, 'utf8');
  try {
    writeState(freshState());
    const { runAgent, completeAgentTask } = require('../company-core/agent-runtime');
    const { approveCeoTask, rejectQaTask } = require('../company-core/approval-engine');
    const { loadState } = require('../company-core/task-engine');

    // Research -> Idea
    await runAgent('research', 'task-research-smoke', { topic: 'AI media content opportunity' });
    let result = completeAgentTask('task-research-smoke');
    assert.equal(result.nextTask.owner_agent_id, 'idea');
    assert.equal(result.nextTask.type, 'idea_generation');

    // Idea -> CEO
    const ideaTask = result.nextTask.task_id;
    await runAgent('idea', ideaTask, { research_refs: ['task-research-smoke.output'] });
    result = completeAgentTask(ideaTask);
    const ceoTask = result.nextTask.task_id;
    assert.equal(result.nextTask.owner_agent_id, 'ceo');
    assert.equal(result.nextTask.type, 'decision');

    // CEO -> pending owner approval
    await runAgent('ceo', ceoTask, { recommendation: 'Proceed with the highest-ranked content idea.' });
    result = completeAgentTask(ceoTask);
    assert.equal(result.approval_required, true);
    assert.equal(result.task.status, 'WAITING_APPROVAL');
    assert.ok(result.approval.approval_id);

    // Owner approval -> Writer
    result = approveCeoTask(ceoTask, 'Approved by smoke test');
    assert.equal(result.approval.status, 'APPROVED');
    assert.equal(result.nextTask.owner_agent_id, 'writer');
    assert.equal(result.nextTask.type, 'writing');

    // Writer -> Producer -> Visual -> Video
    const writerTask = result.nextTask.task_id;
    await runAgent('writer', writerTask, { idea_refs: [ceoTask + '.output'] });
    result = completeAgentTask(writerTask);
    assert.equal(result.nextTask.owner_agent_id, 'producer');
    assert.equal(result.nextTask.type, 'production');

    const producerTask = result.nextTask.task_id;
    await runAgent('producer', producerTask, { script_refs: [writerTask + '.output'] });
    result = completeAgentTask(producerTask);
    assert.equal(result.nextTask.owner_agent_id, 'visual');
    assert.equal(result.nextTask.type, 'visual_assets');

    const visualTask = result.nextTask.task_id;
    await runAgent('visual', visualTask, { production_refs: [producerTask + '.output'] });
    result = completeAgentTask(visualTask);
    assert.equal(result.nextTask.owner_agent_id, 'video');
    assert.equal(result.nextTask.type, 'video_creation');

    const videoTask = result.nextTask.task_id;
    await runAgent('video', videoTask, { visual_refs: [visualTask + '.output'] });
    result = completeAgentTask(videoTask);
    assert.equal(result.nextTask.owner_agent_id, 'qa');
    assert.equal(result.nextTask.type, 'qa');

    // QA reject -> Writer revision -> Producer -> Visual -> Video -> QA
    const qaTask = result.nextTask.task_id;
    await runAgent('qa', qaTask, { content_refs: [videoTask + '.output'], verdict: 'REJECT' });
    result = rejectQaTask(qaTask, 'Missing evidence for a key claim');
    assert.equal(result.revision_requested, true);
    assert.equal(result.nextTask.owner_agent_id, 'writer');
    assert.equal(result.nextTask.type, 'revision');
    assert.equal(result.nextTask.revision.source_task_id, qaTask);

    const revisionTask = result.nextTask.task_id;
    await runAgent('writer', revisionTask, { revision_refs: [qaTask + '.output'] });
    result = completeAgentTask(revisionTask);
    assert.equal(result.nextTask.owner_agent_id, 'producer');
    assert.equal(result.nextTask.type, 'production');

    const revisionProducerTask = result.nextTask.task_id;
    await runAgent('producer', revisionProducerTask, { revision_refs: [revisionTask + '.output'] });
    result = completeAgentTask(revisionProducerTask);
    assert.equal(result.nextTask.owner_agent_id, 'visual');

    const revisionVisualTask = result.nextTask.task_id;
    await runAgent('visual', revisionVisualTask, { production_refs: [revisionProducerTask + '.output'] });
    result = completeAgentTask(revisionVisualTask);
    assert.equal(result.nextTask.owner_agent_id, 'video');

    const revisionVideoTask = result.nextTask.task_id;
    await runAgent('video', revisionVideoTask, { visual_refs: [revisionVisualTask + '.output'] });
    result = completeAgentTask(revisionVideoTask);
    assert.equal(result.nextTask.owner_agent_id, 'qa');

    // Final QA pass -> Publisher -> Analytics -> Learning loop
    const finalQaTask = result.nextTask.task_id;
    await runAgent('qa', finalQaTask, { content_refs: [revisionVideoTask + '.output'], verdict: 'PASS' });
    result = completeAgentTask(finalQaTask);
    assert.equal(result.nextTask.owner_agent_id, 'publisher');
    assert.equal(result.nextTask.type, 'publishing');

    const publisherTask = result.nextTask.task_id;
    await runAgent('publisher', publisherTask, { qa_refs: [finalQaTask + '.output'] });
    result = completeAgentTask(publisherTask);
    assert.equal(result.nextTask.owner_agent_id, 'analytics');
    assert.equal(result.nextTask.type, 'analytics');

    const analyticsTask = result.nextTask.task_id;
    await runAgent('analytics', analyticsTask, { content_refs: [publisherTask + '.output'], metrics: [{ name: 'views', value: 1000 }] });
    result = completeAgentTask(analyticsTask, {
      output: {
        metrics: [{ name: 'views', value: 1000 }],
        findings: ['Initial audience response is measurable.'],
        observations: ['The content generated baseline performance data.'],
        evidence: ['analytics-smoke-evidence'],
        evidence_refs: ['analytics-smoke-evidence'],
        source_refs: ['analytics-smoke-source'],
        diagnosis: 'Baseline performance established.',
        learning: ['Use measured performance to inform the next research cycle.'],
        recommendations: ['Research follow-up topics using the observed performance.'],
        recommendation: 'Research follow-up topics using the observed performance.',
        confidence: 'High'
      }
    });
    assert.equal(result.workflow_advanced, false);
    assert.equal(result.currentTask.owner_agent_id, 'analytics');
    assert.ok(result.learning);
    assert.equal(result.learning.source_task_id, analyticsTask);
    assert.equal(result.learning.confidence, 'High');
    assert.ok(Array.isArray(result.learningTasks));
    assert.equal(result.learningTasks.length, 3);
    assert.deepEqual(result.learningTasks.map((task) => task.owner_agent_id), ['research', 'idea', 'ceo']);

    const finalState = loadState();
    const approval = finalState.approvals.find((item) => item.task_id === ceoTask);
    assert.equal(approval.status, 'APPROVED');
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'ceo' && item.to_agent === 'writer'));
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'writer' && item.to_agent === 'producer'));
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'producer' && item.to_agent === 'visual'));
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'visual' && item.to_agent === 'video'));
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'video' && item.to_agent === 'qa'));
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'qa' && item.to_agent === 'publisher'));
    assert.ok(finalState.handoffs.some((item) => item.from_agent === 'publisher' && item.to_agent === 'analytics'));
    assert.ok(finalState.handoffs.filter((item) => item.from_agent === 'analytics' && ['research', 'idea', 'ceo'].includes(item.to_agent)).length >= 3);
    assert.equal(finalState.knowledge.length, 1);
    assert.equal(finalState.knowledge[0].source_task_id, analyticsTask);
    assert.equal(finalState.knowledge[0].confidence, 'High');

    console.log('SMOKE TEST PASSED');
    console.log('Research -> Idea -> CEO -> Approval -> Writer -> Producer -> Visual -> Video -> QA -> Publisher -> Analytics -> Learning -> Research/Idea/CEO');
  } finally {
    if (original !== null) fs.writeFileSync(statePath, original, 'utf8');
    else if (fs.existsSync(statePath)) fs.unlinkSync(statePath);
    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });