const fs = require('fs');
const path = require('path');
const { buildAgentOutput } = require('./agent-output');
const { setTaskStatus } = require('./task-engine');
const { advanceTask } = require('./workflow-engine');

const STATE_PATH = path.join(__dirname, 'state.json');
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
function loadState(){return JSON.parse(fs.readFileSync(STATE_PATH,'utf8'));}
function saveState(state){fs.writeFileSync(STATE_PATH,JSON.stringify(state,null,2)+'\n','utf8');}
function now(){return new Date().toISOString();}
function runAgent(agentId,taskId,input={}){
  const state=loadState(); const agent=state.agents?.[agentId]; const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!agent)throw new Error(`Unknown agent: ${agentId}`); if(!task)throw new Error(`Unknown task: ${taskId}`);
  if(task.owner_agent_id!==agentId)throw new Error('Task owner does not match agent');
  if(['COMPLETED','CANCELLED'].includes(task.status))throw new Error('Task is already closed');
  const started=now(); const output=buildAgentOutput(agentId,input);
  agent.status='WORKING'; agent.current_task_id=taskId; task.status='IN_PROGRESS'; task.started_at=task.started_at||started;
  task.runtime={mode:'structured_role_output',role_instruction:ROLE_INSTRUCTIONS[agentId],input,output,started_at:started};
  state.audit_log=state.audit_log||[]; state.audit_log.push({audit_id:`audit-${Date.now()}`,event_type:'AGENT_RUNTIME_OUTPUT_CREATED',actor:agentId,entity_type:'Task',entity_id:taskId,created_at:started,details:{role:agentId,execution_mode:'structured_role_output'}});
  saveState(state); return {agent_id:agentId,task_id:taskId,status:task.status,role_instruction:ROLE_INSTRUCTIONS[agentId],output};
}
function completeAgentTask(taskId, options={}){
  const state=loadState(); const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!task)throw new Error(`Unknown task: ${taskId}`);
  if(task.status!=='IN_PROGRESS')throw new Error(`Task must be IN_PROGRESS before completion: ${task.status}`);
  const output=options.output || task.runtime?.output || null;
  if(!output)throw new Error('Task has no runtime output');
  task.output_refs=Array.isArray(options.output_refs)?options.output_refs:[taskId+'.output'];
  task.runtime=task.runtime||{}; task.runtime.output=output; task.runtime.completed_at=now();
  task.runtime.execution_result={type:'structured_role_output',output};
  saveState(state);

  if(task.owner_agent_id==='ceo' && !options.approved){
    const waiting=setTaskStatus(taskId,'WAITING_APPROVAL');
    return {task:waiting.task,state:waiting.state,nextTask:null,workflow_advanced:false,approval_required:true};
  }

  const completionStatus=options.ready_for_qa ? 'READY_FOR_QA' : 'COMPLETED';
  const completed=setTaskStatus(taskId,completionStatus);
  const currentTask=completed.task;
  const advanced=advanceTask(taskId,{
    evidence_refs:options.evidence_refs || output.evidence_refs || [],
    source_refs:options.source_refs || output.source_refs || [],
    assumptions:options.assumptions || [],
    inference:options.inference || [],
    confidence:options.confidence || output.confidence || 'Medium',
    recommendation:options.recommendation || output.recommendation || null
  });
  return {...advanced,workflow_advanced:Boolean(advanced.nextTask),approval_required:false,currentTask};
}
function getAgentContract(agentId){if(!ROLE_INSTRUCTIONS[agentId])throw new Error(`Unknown agent: ${agentId}`);return {agent_id:agentId,role_instruction:ROLE_INSTRUCTIONS[agentId]};}
module.exports={runAgent,completeAgentTask,getAgentContract,ROLE_INSTRUCTIONS};