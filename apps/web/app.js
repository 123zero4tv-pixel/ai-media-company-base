const agents=[
 {id:'ceo',name:'CEO AI',role:'Direction & Decisions',status:'WAITING_APPROVAL',task:'รออนุมัติ Content Direction',bubble:'OWNER DECISION'},
 {id:'research',name:'Research AI',role:'Trends & Evidence',status:'WORKING',task:'ตรวจ trend รอบล่าสุด',bubble:'RESEARCHING'},
 {id:'idea',name:'Idea AI',role:'Ideas & Scoring',status:'READY',task:'จัดอันดับ content ideas',bubble:'READY'},
 {id:'writer',name:'Writer AI',role:'Scripts & Copy',status:'IDLE',task:'พร้อมรับ brief',bubble:'IDLE'},
 {id:'producer',name:'Producer AI',role:'Production Planning',status:'IDLE',task:'พร้อมวาง production plan',bubble:'IDLE'},
 {id:'visual',name:'Visual AI',role:'Visual Assets',status:'IDLE',task:'รอ visual brief',bubble:'IDLE'},
 {id:'video',name:'Video AI',role:'Video Assembly',status:'IDLE',task:'รอ production assets',bubble:'IDLE'},
 {id:'qa',name:'QA AI',role:'Quality & Risk',status:'READY',task:'พร้อมตรวจ content',bubble:'QA READY'},
 {id:'publisher',name:'Publisher AI',role:'Publishing',status:'IDLE',task:'รอ approved content',bubble:'IDLE'},
 {id:'analytics',name:'Analytics AI',role:'Performance & Learning',status:'IDLE',task:'รอ published data',bubble:'IDLE'}
];
let tasks=[
 {title:'ตรวจ trend รอบล่าสุด',owner:'research',priority:'HIGH',status:'IN_PROGRESS'},
 {title:'จัดอันดับ content ideas',owner:'idea',priority:'NORMAL',status:'QUEUED'},
 {title:'รอ CEO decision',owner:'ceo',priority:'URGENT',status:'WAITING_APPROVAL'}
];
const roomOrder=['ceo','research','idea','writer','producer','visual','video','qa','publisher','analytics'];
const statusText={WORKING:'WORKING',WAITING_APPROVAL:'WAITING',READY:'READY',IDLE:'IDLE'};
const roleColor=s=>s==='WAITING_APPROVAL'?'wait':s==='WORKING'?'busy':'';
function agentMarkup(a){return `<div class="room ${a.id}" data-agent="${a.id}"><div class="room-label">${a.name.replace(' AI','')}</div><div class="room-sub">${a.role}</div><div class="status-dot ${roleColor(a.status)}"></div><div class="desk"></div><div class="monitor"></div><div class="chair"></div><div class="agent" data-agent="${a.id}"><div class="head"><div class="hair"></div></div><div class="body"></div><div class="leg l"></div><div class="leg r"></div><div class="bubble">${a.bubble}</div></div></div>`}
function renderRooms(){document.querySelector('#rooms').innerHTML=agents.map(agentMarkup).join('')+`<div class="room lounge"><div class="room-label">LOUNGE</div><div class="room-sub">break / team sync</div></div>`;document.querySelectorAll('[data-agent]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openAgent(el.dataset.agent)}))}
function openAgent(id){const a=agents.find(x=>x.id===id);const count=tasks.filter(t=>t.owner===id).length;document.querySelector('#sidePanel').classList.remove('hidden');document.querySelector('#panelContent').innerHTML=`<div class="employee"><h2>${a.name}</h2><div class="role">${a.role}</div><div class="status-line ${roleColor(a.status)}"><b>${statusText[a.status]}</b><br><span>${a.task}</span></div><div class="metric-grid"><div class="metric"><b>${count}</b><span>Open Tasks</span></div><div class="metric"><b>${a.status==='WORKING'?'HIGH':'—'}</b><span>Priority</span></div><div class="metric"><b>${a.id==='research'?'12':'—'}</b><span>Evidence</span></div><div class="metric"><b>${a.id==='research'?'7':'—'}</b><span>Sources</span></div></div><div class="task-box"><strong>Ask this AI</strong><p>ถามเรื่องงาน เหตุผล หลักฐาน ปัญหา หรือสิ่งที่ต้องการจาก Owner ได้โดยตรง</p><button class="mini-btn" onclick="showToast('Chat interface จะเชื่อมกับ agent runtime ในขั้นถัดไป')">ASK ${a.name.toUpperCase()}</button></div><div class="task-box"><strong>Handoff</strong><p>${a.id==='research'?'→ IDEA AI':'Company Core → Task Queue'}</p></div></div>`}
function renderTaskBadge(){document.querySelector('#taskBadge').textContent=tasks.length}
function showToast(message){const old=document.querySelector('.toast');if(old)old.remove();const t=document.createElement('div');t.className='toast';t.textContent=message;document.querySelector('.office-wrap').appendChild(t);setTimeout(()=>t.remove(),2600)}
function render(){renderRooms();renderTaskBadge()}
document.querySelector('#closePanel').onclick=()=>document.querySelector('#sidePanel').classList.add('hidden');document.querySelector('#tasksBtn').onclick=()=>showToast(`${tasks.length} open tasks · 1 waiting approval`);document.querySelector('#approvalBtn').onclick=()=>openAgent('ceo');document.querySelectorAll('.nav-btn').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');showToast(`${btn.dataset.view.toUpperCase()} view จะเชื่อม Company Core ในขั้นถัดไป`)});setInterval(()=>document.querySelector('#clock').textContent=new Date().toLocaleTimeString('th-TH'),1000);render();
