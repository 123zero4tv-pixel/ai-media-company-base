const fs = require('fs');
const path = require('path');
const { buildAgentOutput } = require('./agent-output');
const { generateAgentOutput } = require('./llm-client');
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
function outputSchema(agentId){return buildAgentOutput(agentId, {}).output_schema || buildAgentOutput(agentId, {});}
async function runAgent(agentId,taskId,input={}){
  const state=loadState(); const agent=state.agents?.[agentId]; const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!agent)throw new Error(`Unknown agent: ${agentId}`); if(!task)throw new Error(`Unknown task: ${taskId}`);
  if(task.owner_agent_id!==agentId)throw new Error('Task owner does not match agent');
  if(['COMPLETED','CANCELLED'].includes(task.status))throw new Error('Task is already closed');
  const started=now();
  const llm=await generateAgentOutput({role:agentId,instruction:ROLE_INSTRUCTIONS[agentId],input,schema:outputSchema(agentId)});
  const output=llm.output || buildAgentOutput(agentId,input);
  output.execution_mode=llm.configured?'llm':'structured_role_output';
  if(llm.model) output.model=llm.model;
  agent.status='WORKING'; agent.current_task_id=taskId; task.status='IN_PROGRESS'; task.started_at=task.started_at||started;
  task.runtime={mode:output.execution_mode,role_instruction:ROLE_INSTRUCTIONS[agentId],input,output,started_at:started};
  state.audit_log=state.audit_log||[]; state.audit_log.push({audit_id:`audit-${Date.now()}`,event_type:'AGENT_RUNTIME_OUTPUT_CREATED',actor:agentId,entity_type:'Task',entity_id:taskId,created_at:started,details:{role:agentId,execution_mode:output.execution_mode,model:llm.model||null}});
  saveState(state); return {agent_id:agentId,task_id:taskId,status:task.status,role_instruction:ROLE_INSTRUCTIONS[agentId],output};
}
function ensureOwnerApproval(task, output){
  const state=loadState(); state.approvals=state.approvals||[];
  const existing=state.approvals.find(a=>a.task_id===task.task_id&&a.status==='PENDING'); if(existing)return {state,approval:existing};
  const approvalId=`approval-${Date.now()}-${state.approvals.length+1}`; const decisionId=`decision-${Date.now()}-${state.decisions?.length+1||1}`;
  const approval={approval_id:approvalId,decision_id:decisionId,task_id:task.task_id,required_from:'OWNER',status:'PENDING',comment:null,created_at:now(),resolved_at:null};
  state.approvals.push(approval); state.decisions=state.decisions||[];
  state.decisions.push({decision_id:decisionId,task_id:task.task_id,agent_id:'ceo',decision:output.decision||null,recommendation:output.recommendation||null,rationale:output.rationale||null,confidence:output.confidence||'Medium',status:'PENDING_APPROVAL',created_at:now()});
  state.company.pending_approval_ids=(state.approvals||[]).filter(a=>a.status==='PENDING').map(a=>a.approval_id);
  state.audit_log=state.audit_log||[]; state.audit_log.push({event_id:`event-${Date.now()}-${state.audit_log.length+1}`,timestamp:now(),actor_type:'SYSTEM',actor_id:'agent-runtime',event_type:'APPROVAL_REQUESTED',entity_type:'Approval',entity_id:approvalId,summary:`Owner approval requested for ${task.task_id}`,metadata:{task_id:task.task_id,decision_id:decisionId}});
  saveState(state); return {state,approval};
}
function completeAgentTask(taskId, options={}){
  const state=loadState(); const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!task)throw new Error(`Unknown task: ${taskId}`); if(task.status!=='IN_PROGRESS')throw new Error(`Task must be IN_PROGRESS before completion: ${task.status}`);
  const output=options.output || task.runtime?.output || null; if(!output)throw new Error('Task has no runtime output');
  task.output_refs=Array.isArray(options.output_refs)?options.output_refs:[taskId+'.output']; task.runtime=task.runtime||{}; task.runtime.output=output; task.runtime.completed_at=now(); task.runtime.execution_result={type:task.runtime.mode||'structured_role_output',output}; saveState(state);
  if(task.owner_agent_id==='ceo' && !options.approved){const waiting=setTaskStatus(taskId,'WAITING_APPROVAL');const approval=ensureOwnerApproval(task,output).approval;return {task:waiting.task,state:loadState(),nextTask:null,workflow_advanced:false,approval_required:true,approval};}
  const completionStatus=options.ready_for_qa ? 'READY_FOR_QA' : 'COMPLETED'; const completed=setTaskStatus(taskId,completionStatus); const currentTask=completed.task;
  const advanced=advanceTask(taskId,{evidence_refs:options.evidence_refs||output.evidence_refs||[],source_refs:options.source_refs||output.source_refs||[],assumptions:options.assumptions||[],inference:options.inference||[],confidence:options.confidence||output.confidence||'Medium',recommendation:options.recommendation||output.recommendation||null});
  return {...advanced,workflow_advanced:Boolean(advanced.nextTask),approval_required:false,currentTask};
}
function getAgentContract(agentId){if(!ROLE_INSTRUCTIONS[agentId])throw new Error(`Unknown agent: ${agentId}`);return {agent_id:agentId,role_instruction:ROLE_INSTRUCTIONS[agentId]};}
module.exports={runAgent,completeAgentTask,getAgentContract,ROLE_INSTRUCTIONS};