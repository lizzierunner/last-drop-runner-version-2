let hydration=100,xp=0,progress=0,timer=null;
const hydrationEl=document.getElementById('hydration');
const xpEl=document.getElementById('xp');
const barEl=document.getElementById('bar');
const missionEl=document.getElementById('mission');
const resultsEl=document.getElementById('results');
const finalXPEl=document.getElementById('finalXP');
const factEl=document.getElementById('fact');
const startBtn=document.getElementById('startBtn');
const resetBtn=document.getElementById('resetBtn');
const runAgainBtn=document.getElementById('runAgain');

const raiderAlert=document.getElementById('raiderAlert');
const dodgeBtn=document.getElementById('dodgeBtn');
let raiderTimeout=null;

const facts=[
 '703 million people lack access to clean water.',
 'Collecting water often keeps kids out of school.',
 'Clean water improves health and local economies.'
];

function updateHUD(){
  hydrationEl.textContent=hydration;
  xpEl.textContent=xp;
  const pct=Math.max(0,Math.min(progress,100));
  barEl.style.width=pct+'%';
  document.querySelector('.progress').setAttribute('aria-valuenow',pct.toString());
}

function tick(){
  progress+=10; xp+=50; hydration=Math.max(0,hydration-5);
  updateHUD();
  // Raiders appear randomly (20% chance per tick)
  if(Math.random()<0.2 && !raiderTimeout){
    showRaider();
  }
  if(progress>=100){ clearInterval(timer); timer=null; finishRun(); }
}

function startRun(){
  if(timer) return;
  progress=0; hydration=100; xp=0;
  updateHUD();
  raiderAlert.hidden=true;
  timer=setInterval(tick,1200);
}

function reset(){
  clearInterval(timer); timer=null;
  progress=0; hydration=100; xp=0; updateHUD();
  resultsEl.hidden=true; missionEl.hidden=false;
  raiderAlert.hidden=true;
  if(raiderTimeout){ clearTimeout(raiderTimeout); raiderTimeout=null; }
}

function finishRun(){
  missionEl.hidden=true; resultsEl.hidden=false;
  finalXPEl.textContent=xp;
  factEl.textContent=facts[Math.floor(Math.random()*facts.length)];
  confetti({particleCount:180,spread:70,origin:{y:0.7}});
  raiderAlert.hidden=true;
  if(raiderTimeout){ clearTimeout(raiderTimeout); raiderTimeout=null; }
  // Show spectacular celebration overlay
  document.getElementById('celebration').hidden=false;
  setTimeout(()=>{
    document.getElementById('celebration').hidden=true;
  }, 3500);
}

function showRaider(){
  raiderAlert.hidden=false;
  raiderTimeout=setTimeout(()=>{
    // Penalty if not dodged in time
    hydration=Math.max(0,hydration-20);
    updateHUD();
    raiderAlert.hidden=true;
    raiderTimeout=null;
  }, 2500); // 2.5 seconds to dodge
}

dodgeBtn.addEventListener('click',()=>{
  if(raiderTimeout){
    xp+=30; // reward for dodging
    updateHUD();
    raiderAlert.hidden=true;
    clearTimeout(raiderTimeout);
    raiderTimeout=null;
  }
});

// Konami
const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let entered=[];
window.addEventListener('keydown',(e)=>{
  entered.push(e.key);
  if(entered.slice(-konami.length).join('')===konami.join('')){
    confetti({particleCount:300,spread:90,origin:{y:0.7}});
    alert('Konami Code Activated! Hydration Boost +100 💧');
    hydration=Math.min(100,hydration+20);
    updateHUD();
    entered=[];
  }
});

startBtn.addEventListener('click',startRun);
resetBtn.addEventListener('click',reset);
runAgainBtn.addEventListener('click',reset);
updateHUD();