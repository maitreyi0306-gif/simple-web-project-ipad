// thumbi.js - interactive Thumbi pet (local-only prototype)
const STORAGE_KEY = 'thumbi-v1-state';
const defaultState = {
  name: 'Thumbi',
  happiness: 70, // 0-100
  hunger: 40, // 0-100 (0 full, 100 starving)
  energy: 80, // 0-100
  lastInteraction: Date.now()
};

let state = loadState();

// DOM
const thumbiEl = document.getElementById('thumbi');
const wingsEl = document.getElementById('wings');
const tailEl = document.getElementById('tail');
const happinessBar = document.getElementById('happinessBar');
const hungerBar = document.getElementById('hungerBar');
const energyBar = document.getElementById('energyBar');

const petBtn = document.getElementById('petBtn');
const feedBtn = document.getElementById('feedBtn');
const playBtn = document.getElementById('playBtn');
const talkBtn = document.getElementById('talkBtn');

const talkPanel = document.getElementById('talkPanel');
const closeTalk = document.getElementById('closeTalk');
const sendTalk = document.getElementById('sendTalk');
const talkLog = document.getElementById('talkLog');
const talkInput = document.getElementById('talkInput');

// helpers
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  return {...defaultState};
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

function updateHUD(){
  happinessBar.style.width = state.happiness + '%';
  hungerBar.style.width = (100 - state.hunger) + '%'; // show filled when less hungry
  energyBar.style.width = state.energy + '%';
}

function giveFeedback(text, duration=1200){
  const fb = document.createElement('div');
  fb.className = 'feedback';
  fb.style.left = '50%'; fb.style.top = '20%'; fb.style.transform = 'translateX(-50%)';
  fb.textContent = text;
  thumbiEl.appendChild(fb);
  fb.animate([{opacity:1, transform:'translate(-50%,0) scale(1)'},{opacity:0, transform:'translate(-50%,-24px) scale(0.98)'}],{duration});
  setTimeout(()=>fb.remove(), duration+50);
}

function react(name){
  // small reactions
  if(name==='tap'){
    thumbiEl.classList.add('breathe');
    setTimeout(()=>thumbiEl.classList.remove('breathe'),400);
    giveFeedback('♪');
  }
  if(name==='pet'){ giveFeedback('♡ purr ♡'); }
  if(name==='feed'){ giveFeedback('Yum!'); }
  if(name==='play'){ giveFeedback('Woo!'); }
  if(name==='tail'){ giveFeedback('Whoa!'); }
}

// Actions
function petAction(){
  state.happiness = clamp(state.happiness + 8);
  state.hunger = clamp(state.hunger + 3);
  state.energy = clamp(state.energy + 2);
  state.lastInteraction = Date.now();
  saveState(); updateHUD(); react('pet');
}
function feedAction(){
  state.hunger = clamp(state.hunger - 30);
  state.happiness = clamp(state.happiness + 6);
  state.lastInteraction = Date.now();
  saveState(); updateHUD(); react('feed');
}
function playAction(){
  state.happiness = clamp(state.happiness + 14);
  state.energy = clamp(state.energy - 18);
  state.hunger = clamp(state.hunger + 8);
  state.lastInteraction = Date.now();
  saveState(); updateHUD(); react('play');
}

// Talk panel (placeholder)
function openTalk(){ talkPanel.classList.remove('hidden'); }
function closeTalkPanel(){ talkPanel.classList.add('hidden'); }

function sendTalkMessage(){
  const text = talkInput.value.trim();
  if(!text) return;
  const userMsg = document.createElement('div'); userMsg.textContent = 'You: ' + text; userMsg.style.fontWeight='700';
  talkLog.appendChild(userMsg);
  // placeholder reply (no AI yet)
  const reply = document.createElement('div'); reply.textContent = 'Thumbi: (I will respond soon!)'; reply.style.opacity=0.9; reply.style.marginTop='6px';
  talkLog.appendChild(reply);
  talkLog.scrollTop = talkLog.scrollHeight;
  talkInput.value='';
}

// interactions: tap, drag petting, tap wings/tail
petBtn.addEventListener('click', petAction);
feedBtn.addEventListener('click', feedAction);
playBtn.addEventListener('click', playAction);
talkBtn.addEventListener('click', openTalk);
closeTalk.addEventListener('click', closeTalkPanel);
sendTalk.addEventListener('click', sendTalkMessage);

// tap thumbi
thumbiEl.addEventListener('pointerdown', (e)=>{
  const rect = thumbiEl.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if(y < rect.height*0.5 && (x < rect.width*0.3 || x > rect.width*0.7)){
    wingsEl.classList.add('flap');
    setTimeout(()=>wingsEl.classList.remove('flap'),600);
    giveFeedback('flutter');
    state.happiness = clamp(state.happiness + 4); saveState(); updateHUD(); return;
  }
  if(x > rect.width*0.58 && y > rect.height*0.5){
    tailEl.classList.add('anim-wag');
    setTimeout(()=>tailEl.classList.remove('anim-wag'),800);
    giveFeedback('!'); state.happiness = clamp(state.happiness + 3); saveState(); updateHUD(); return;
  }
  react('tap');
  state.happiness = clamp(state.happiness + 2); saveState(); updateHUD();
});

// petting by dragging
let isPointerDown = false;
let lastPetTS = 0;

thumbiEl.addEventListener('pointerdown', (e)=>{ isPointerDown = true; lastPetTS = Date.now(); thumbiEl.setPointerCapture(e.pointerId); });
window.addEventListener('pointerup', (e)=>{ isPointerDown = false; });

thumbiEl.addEventListener('pointermove', (e)=>{
  if(!isPointerDown) return;
  const now = Date.now();
  if(now - lastPetTS > 250){
    state.happiness = clamp(state.happiness + 3);
    state.energy = clamp(state.energy + 1);
    state.hunger = clamp(state.hunger + 1);
    saveState(); updateHUD(); react('pet'); lastPetTS = now;
  }
});

// idle behavior and passive stat changes
setInterval(()=>{
  state.hunger = clamp(state.hunger + 1);
  state.energy = clamp(state.energy - 1);
  if(state.energy < 20) state.happiness = clamp(state.happiness - 1);
  saveState(); updateHUD();
}, 15000);

// occasional random idle actions
const idleActions = ['blink','look','small-tail','flutter','spin'];
setInterval(()=>{
  const action = idleActions[Math.floor(Math.random()*idleActions.length)];
  if(action==='blink'){ thumbiEl.classList.add('blink'); setTimeout(()=>thumbiEl.classList.remove('blink'),220); }
  if(action==='look'){ thumbiEl.classList.add('breathe'); setTimeout(()=>thumbiEl.classList.remove('breathe'),700); }
  if(action==='small-tail'){ tailEl.classList.add('anim-wag'); setTimeout(()=>tailEl.classList.remove('anim-wag'),700); }
  if(action==='flutter'){ wingsEl.classList.add('flap'); setTimeout(()=>wingsEl.classList.remove('flap'),600); }
}, 6000 + Math.random()*8000);

// initial UI
updateHUD();

// keyboard shortcuts for desktop testing
document.addEventListener('keydown', (e)=>{
  if(e.key==='p') petAction();
  if(e.key==='f') feedAction();
  if(e.key==='l') playAction();
  if(e.key==='t') openTalk();
});
talkInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter') sendTalkMessage(); });
