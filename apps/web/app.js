const agentConfig = [
  ['ceo','CEO AI','Direction & Decisions'],
  ['research','Research AI','Trends & Evidence'],
  ['idea','Idea AI','Ideas & Scoring'],
  ['writer','Writer AI','Scripts & Copy'],
  ['producer','Producer AI','Production Planning'],
  ['visual','Visual AI','Visual Assets'],
  ['video','Video AI','Video Assembly'],
  ['qa','QA AI','Quality & Risk'],
  ['publisher','Publisher AI','Publishing'],
  ['analytics','Analytics AI','Performance & Learning']
];

let companyState = null;
let agents = [];
let tasks = [];

const statusText = {
  WORKING:'WORKING', WAITING_APPROVAL:'WAITING', READY:'READY', IDLE:'IDLE',
  BLOCKED:'BLOCKED', ERROR:'ERROR', OFFLINE:'OFFLINE', ASSIGNED:'ASSIGNED'
};
const roleColor = s => s === 'WAITING_APPROVAL' || s === 'BLOCKED' || s === 'ERROR' ? 'wait' : s === 'WORKING' || s === 'ASSIGNED' ? 'busy' : '';

function normalizeState(state) {
  const sourceAgents = state?.agents || {};
  agents = agentConfig.map(([id,name,role]) => {
    const s = sourceAgents[id] || {};
    const task = (state.tasks || []).find(t => t.task_id === s.current_task_id) || (state.tasks || []).find(t => t.owner_agent_id === id && ['IN_PROGRESS','WAITING_APPROVAL','ASSIGNED'].includes(t.status));
    return {
      id, name, role,
      status: s.status || 'IDLE',
      task: task?.title || (s.last_error ? `ERROR: ${s.last_error}` : 'พร้อมรับงาน'),
      currentTaskId: s.current_task_id || null,
      bubble: s.status === 'WAITING_APPROVAL' ? 'OWNER DECISION' : s.status === 'WORKING' ? 'WORKING' : s.status
    };
  });
  tasks = state.tasks || [];
}

function agentMarkup(a) {
  return `<div class="room ${a.id}" data-agent="${a.id}">
    <div class="room-label">${a.name.replace(' AI','')}</div>
    <div class="room-sub">${a.role}</div>
    <div class="status-dot ${roleColor(a.status)}"></div>
    <div class="desk"></div><div class="monitor"></div><div class="chair"></div>
    <div class="agent" data-agent="${a.id}">
      <div class="head"><div class="hair"></div></div><div class="body"></div><div class="leg l"></div><div class="leg r"></div>
      <div class="bubble">${a.bubble}</div>
    </div>
  </div>`;
}

function renderRooms() {
  document.querySelector('#rooms').innerHTML = agents.map(agentMarkup).join('') + `<div class="room lounge"><div class="room-label">LOUNGE</div><div class="room-sub">break / team sync</div></div>`;
  document.querySelectorAll('[data-agent]').forEach(el => el.addEventListener('click', e => {
    e.stopPropagation();
    openAgent(el.dataset.agent);
  }));
}

function openAgent(id) {
  const a = agents.find(x => x.id === id);
  if (!a) return;
  const openTasks = tasks.filter(t => t.owner_agent_id === id && !['COMPLETED','CANCELLED'].includes(t.status));
  const evidence = id === 'research' ? (companyState.evidence || []).length : 0;
  const sources = id === 'research' ? (companyState.sources || []).length : 0;
  const priority = openTasks[0]?.priority || '—';
  const taskStatus = openTasks[0]?.status || '—';
  document.querySelector('#sidePanel').classList.remove('hidden');
  document.querySelector('#panelContent').innerHTML = `<div class="employee">
    <h2>${a.name}</h2><div class="role">${a.role}</div>
    <div class="status-line ${roleColor(a.status)}"><b>${statusText[a.status] || a.status}</b><br><span>${a.task}</span></div>
    <div class="metric-grid">
      <div class="metric"><b>${openTasks.length}</b><span>Open Tasks</span></div>
      <div class="metric"><b>${priority}</b><span>Priority</span></div>
      <div class="metric"><b>${evidence || '—'}</b><span>Evidence</span></div>
      <div class="metric"><b>${sources || '—'}</b><span>Sources</span></div>
    </div>
    <div class="task-box"><strong>Current Task</strong><p>${openTasks[0] ? `${openTasks[0].title} · ${taskStatus}` : 'ไม่มีงานที่กำลังเปิดอยู่'}</p></div>
    <div class="task-box"><strong>Ask this AI</strong><p>ช่องสนทนาจะเชื่อมกับ agent runtime ในขั้นถัดไป โดยคำตอบจะอยู่ภายใต้ role และข้อมูลของ agent นี้</p><button class="mini-btn" onclick="showToast('Agent runtime ยังไม่เปิดใช้งาน')">ASK ${a.name.toUpperCase()}</button></div>
    <div class="task-box"><strong>Company Core</strong><p>สถานะและงานชุดนี้โหลดจาก Company Core API โดยตรง</p></div>
  </div>`;
}

function renderTaskBadge() {
  const open = tasks.filter(t => !['COMPLETED','CANCELLED'].includes(t.status));
  document.querySelector('#taskBadge').textContent = open.length;
  const approvals = companyState?.approvals || [];
  const pending = approvals.filter(a => a.status === 'PENDING').length;
  document.querySelector('#approvalBtn').innerHTML = `⚠ APPROVAL <b>${pending}</b>`;
}

function showToast(message) {
  const old = document.querySelector('.toast'); if (old) old.remove();
  const t = document.createElement('div'); t.className='toast'; t.textContent=message;
  document.querySelector('.office-wrap').appendChild(t); setTimeout(()=>t.remove(),2600);
}

async function loadCompanyState() {
  try {
    const response = await fetch('/api/company-state', { cache:'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    companyState = await response.json();
    normalizeState(companyState);
    renderRooms(); renderTaskBadge();
    document.querySelector('.live-dot').title = 'Company Core connected';
  } catch (error) {
    showToast('Company Core connection failed');
    console.error(error);
  }
}

document.querySelector('#closePanel').onclick = () => document.querySelector('#sidePanel').classList.add('hidden');
document.querySelector('#tasksBtn').onclick = () => showToast(`${tasks.length} tasks in Company Core`);
document.querySelector('#approvalBtn').onclick = () => {
  const pending = (companyState?.approvals || []).find(a => a.status === 'PENDING');
  openAgent(pending?.decision_id ? 'ceo' : 'ceo');
};
document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(`${btn.dataset.view.toUpperCase()} view — Company Core data ready`);
});
setInterval(() => document.querySelector('#clock').textContent = new Date().toLocaleTimeString('th-TH'), 1000);
setInterval(loadCompanyState, 10000);
loadCompanyState();
