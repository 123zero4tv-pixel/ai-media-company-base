const { loadState, saveState, setTaskStatus, createHandoff } = require('./task-engine');
const { advanceTask } = require('./workflow-engine');

function now(){ return new Date().toISOString(); }
function audit(state, actor, event, taskId, metadata={}){
  state.audit_log=state.audit_log||[];
  state.audit_log.push({event_id:`approval-${Date.now()}-${state.audit_log.length+1}`,timestamp:now(),actor_type:actor==='owner'?'OWNER':'SYSTEM',actor_id:actor,event_type:event,entity_type:'Task',entity_id:taskId,summary:event,metadata});
}
function findApproval(state, taskId){
  return (state.approvals||[]).find(a=>a.task_id===taskId&&a.status==='PENDING') || (state.approvals||[]).find(a=>a.task_id==null&&a.decision_id===state.tasks?.find(t=>t.task_id===taskId)?.decision_id&&a.status==='PENDING');
}
function approveCeoTask(taskId, comment=''){
  const state=loadState();
  const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!task) throw new Error(`Unknown task: ${taskId}`);
  if(task.owner_agent_id!=='ceo'||task.status!=='WAITING_APPROVAL') throw new Error('CEO task must be WAITING_APPROVAL');
  const approval=findApproval(state,taskId);
  if(!approval) throw new Error('Pending owner approval not found');
  const result=setTaskStatus(taskId,'COMPLETED');
  const fresh=loadState();
  const resolved=fresh.approvals.find(a=>a.approval_id===approval.approval_id);
  resolved.task_id=taskId; resolved.status='APPROVED'; resolved.comment=comment; resolved.resolved_at=now();
  fresh.company.pending_approval_ids=(fresh.approvals||[]).filter(a=>a.status==='PENDING').map(a=>a.approval_id);
  audit(fresh,'owner','CEO_APPROVAL_GRANTED',taskId,{approval_id:approval.approval_id,comment});
  saveState(fresh);
  const advanced=advanceTask(taskId,{confidence:result.task.runtime?.output?.confidence||'Medium',recommendation:result.task.runtime?.output?.recommendation||null});
  return {task:advanced.task,approval:resolved,nextTask:advanced.nextTask,state:loadState(),workflow_advanced:Boolean(advanced.nextTask)};
}
function rejectCeoTask(taskId, reason='Owner rejected CEO recommendation'){
  const state=loadState();
  const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!task) throw new Error(`Unknown task: ${taskId}`);
  if(task.owner_agent_id!=='ceo'||task.status!=='WAITING_APPROVAL') throw new Error('CEO task must be WAITING_APPROVAL');
  const approval=findApproval(state,taskId);
  if(!approval) throw new Error('Pending owner approval not found');
  const result=setTaskStatus(taskId,'CANCELLED');
  const fresh=loadState();
  const resolved=fresh.approvals.find(a=>a.approval_id===approval.approval_id);
  resolved.task_id=taskId; resolved.status='REJECTED'; resolved.comment=reason; resolved.resolved_at=now();
  fresh.company.pending_approval_ids=(fresh.approvals||[]).filter(a=>a.status==='PENDING').map(a=>a.approval_id);
  audit(fresh,'owner','CEO_APPROVAL_REJECTED',taskId,{approval_id:approval.approval_id,reason});
  saveState(fresh);
  return {task:result.task,approval:resolved,state:loadState(),workflow_advanced:false};
}
function rejectQaTask(taskId, reason='QA requested revision'){
  const state=loadState();
  const task=state.tasks?.find(t=>t.task_id===taskId);
  if(!task) throw new Error(`Unknown task: ${taskId}`);
  if(task.owner_agent_id!=='qa'||task.status!=='IN_PROGRESS') throw new Error('QA task must be IN_PROGRESS');
  const result=setTaskStatus(taskId,'BLOCKED');
  const fresh=loadState();
  const next={task_id:`task-writer-revision-${Date.now()}`,type:'revision',title:'แก้ไข content ตาม QA feedback',objective:`แก้ไขงาน ${taskId} ตาม QA feedback`,owner_agent_id:'writer',requester_agent_id:'qa',priority:task.priority,status:'QUEUED',input_refs:task.output_refs?.length?task.output_refs:[taskId],output_refs:[],depends_on:[taskId],retry_count:0,max_retries:3,last_error:null,created_at:now(),started_at:null,completed_at:null,revision:{source_task_id:taskId,reason}};
  fresh.tasks.push(next); saveState(fresh);
  const handoff=createHandoff({task_id:taskId,from_agent:'qa',to_agent:'writer',objective:next.objective,input_refs:next.input_refs,evidence_refs:[],source_refs:[],assumptions:[],inference:[],confidence:'High',recommendation:reason,requested_action:`แก้ไขและส่งกลับ QA: ${next.task_id}`});
  return {task:result.task,nextTask:next,handoff,state:loadState(),revision_requested:true};
}
module.exports={approveCeoTask,rejectCeoTask,rejectQaTask};