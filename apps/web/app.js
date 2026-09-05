const agents=[['ceo','CEO AI','WAITING_APPROVAL'],['research','Research AI','WORKING'],['idea','Idea AI','READY'],['writer','Writer AI','IDLE'],['producer','Producer AI','IDLE'],['visual','Visual AI','IDLE'],['video','Video AI','IDLE'],['qa','QA AI','READY'],['publisher','Publisher AI','IDLE'],['analytics','Analytics AI','IDLE']];
let tasks=[{title:'ตรวจ trend รอบล่าสุด',owner:'research',priority:'HIGH',status:'IN_PROGRESS'},{title:'จัดอันดับ content ideas',owner:'idea',priority:'NORMAL',status:'QUEUED'},{title:'รอ CEO decision',owner:'ceo',priority:'URGENT',status:'WAITING_APPROVAL'}];
const labels={WORKING:'WORKING',WAITING_APPROVAL:'WAITING',READY:'READY',IDLE:'IDLE'};
function render(){
 document.querySelector('#stats').innerHTML=`<div class="stat"><b>10</b><span class="muted">AI Employees</span></div><div class="stat"><b>${tasks.length}</b><span class="muted">Open Tasks</span></div><div class="stat"><b>1</b><span class="muted">Pending Approval</span></div><div class="stat"><b>V1</b><span class="muted">Company Runtime</span></div>`;
 document.querySelector('#agents').innerHTML=agents.map(a=>`<div class="agent"><span><span class="name">${a[1]}</span><br><span class="muted">${a[0]}</span></span><span class="status ${a[2]==='WAITING_APPROVAL'?'wait':a[2]==='WORKING'?'busy':''}">${labels[a[2]]}</span></div>`).join('');
 document.querySelector('#tasks').innerHTML=tasks.map(t=>`<div class="task"><strong>${t.title}</strong><span class="muted">${t.owner} · ${t.status}</span><br><span class="priority">${t.priority}</span></div>`).join('');
 document.querySelector('#taskCount').textContent=`${tasks.length} open`;
 const stages=['RESEARCH','IDEA','CEO DECISION','WRITING','QA','PUBLISH READY','PUBLISHED','ANALYTICS'];
 document.querySelector('#pipeline').innerHTML=stages.map((s,i)=>`<span class="stage ${i===0?'active':''}">${i+1}. ${s}</span>`).join('');
 document.querySelector('#activity').innerHTML=[['Research AI','started trend research'],['Idea AI','received research handoff'],['CEO AI','awaiting approval'],['System','Company Core initialized']].map(x=>`<div class="activity"><b>${x[0]}</b> — ${x[1]}</div>`).join('');
 document.querySelector('#taskOwner').innerHTML=agents.map(a=>`<option value="${a[0]}">${a[1]}</option>`).join('');
}
setInterval(()=>document.querySelector('#clock').textContent=new Date().toLocaleTimeString('th-TH'),1000);document.querySelector('#newTask').onclick=()=>document.querySelector('#taskDialog').showModal();document.querySelector('#createTask').onclick=e=>{const title=document.querySelector('#taskTitle').value.trim();if(title){tasks.unshift({title,owner:document.querySelector('#taskOwner').value,priority:document.querySelector('#taskPriority').value,status:'QUEUED'});render();}};render();
