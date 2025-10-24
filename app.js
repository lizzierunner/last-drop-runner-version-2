let hydration=100,xp=0,progress=0,timer=null;
let timeLeft = 0;
let timeLimit = 0;
let timeInterval = null;
const milestoneMessages = [
  { score: 100, message: '💧 Milestone: First 100 XP! Every drop counts.' },
  { score: 250, message: '🌟 Milestone: 250 XP! You are making a difference.' },
  { score: 400, message: '🚀 Milestone: 400 XP! Water for more lives.' },
  { score: 600, message: '🏆 Milestone: 600 XP! You are a true water hero.' }
];
let lastMilestone = 0;
let difficulty = 'normal';
let tickInterval = 1200;
let hydrationDrain = 5;
let xpPerTick = 50;
let progressPerTick = 10;
let raiderPenalty = 20;
let winXP = 500;
let raiderChance = 0.2;
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

const difficultySelect = document.getElementById('difficulty');
if (difficultySelect) {
  difficultySelect.addEventListener('change', function() {
    difficulty = this.value;
    setDifficultyParams();
  });
}

function setDifficultyParams() {
  if (difficulty === 'easy') {
    tickInterval = 1500;
    hydrationDrain = 3;
    xpPerTick = 40;
    progressPerTick = 12;
    raiderPenalty = 10;
    winXP = 300;
    raiderChance = 0.12;
    timeLimit = 60; // 60 seconds
  } else if (difficulty === 'hard') {
    tickInterval = 900;
    hydrationDrain = 8;
    xpPerTick = 60;
    progressPerTick = 8;
    raiderPenalty = 30;
    winXP = 700;
    raiderChance = 0.32;
    timeLimit = 30; // 30 seconds
  } else {
    tickInterval = 1200;
    hydrationDrain = 5;
    xpPerTick = 50;
    progressPerTick = 10;
    raiderPenalty = 20;
    winXP = 500;
    raiderChance = 0.2;
    timeLimit = 45; // 45 seconds
  }
}
setDifficultyParams();

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
  // Show time left if timer is running
  let timeDiv = document.getElementById('timeLeft');
  if (!timeDiv) {
    timeDiv = document.createElement('div');
    timeDiv.id = 'timeLeft';
    timeDiv.style.fontWeight = '900';
    timeDiv.style.fontSize = '1.1em';
    timeDiv.style.color = '#FFD600';
    timeDiv.style.margin = '8px 0';
    barEl.parentElement.insertAdjacentElement('beforebegin', timeDiv);
  }
  if (timer) {
    timeDiv.textContent = `⏱️ Time Left: ${timeLeft}s`;
    timeDiv.style.display = '';
  } else {
    timeDiv.style.display = 'none';
  }
  // Milestone message logic
  for (let i = milestoneMessages.length - 1; i >= 0; i--) {
    if (xp >= milestoneMessages[i].score && lastMilestone < milestoneMessages[i].score) {
      lastMilestone = milestoneMessages[i].score;
      showMilestone(milestoneMessages[i].message);
      break;
    }
  }
}

function showMilestone(msg) {
  let milestoneDiv = document.getElementById('milestoneMsg');
  if (!milestoneDiv) {
    milestoneDiv = document.createElement('div');
    milestoneDiv.id = 'milestoneMsg';
    milestoneDiv.style.position = 'fixed';
    milestoneDiv.style.top = '18px';
    milestoneDiv.style.left = '50%';
    milestoneDiv.style.transform = 'translateX(-50%)';
    milestoneDiv.style.background = 'rgba(255,214,0,0.95)';
    milestoneDiv.style.color = '#142E50';
    milestoneDiv.style.fontWeight = '900';
    milestoneDiv.style.fontSize = '1.35rem';
    milestoneDiv.style.padding = '12px 32px';
    milestoneDiv.style.borderRadius = '16px';
    milestoneDiv.style.zIndex = '9999';
    milestoneDiv.style.boxShadow = '0 0 24px #FFD600';
    document.body.appendChild(milestoneDiv);
  }
  milestoneDiv.textContent = msg;
  milestoneDiv.style.display = 'block';
  setTimeout(() => {
    milestoneDiv.style.display = 'none';
  }, 2200);
}

function tick(){
  progress+=progressPerTick; xp+=xpPerTick; hydration=Math.max(0,hydration-hydrationDrain);
  updateHUD();
  // Raiders appear randomly (difficulty-based chance per tick)
  if(Math.random()<raiderChance && !raiderTimeout){
    showRaider();
  }
  if(progress>=100 || xp>=winXP){ clearInterval(timer); timer=null; stopTimeLimit(); finishRun(); return; }
}

function timeTick() {
  if (timer) {
    timeLeft--;
    updateHUD();
    if (timeLeft <= 0) {
      clearInterval(timer); timer=null;
      stopTimeLimit();
      showNarration('⏱️ Time is up! Try again.');
      missionEl.hidden=true; resultsEl.hidden=false;
      finalXPEl.textContent=xp;
      factEl.textContent=facts[Math.floor(Math.random()*facts.length)];
      document.getElementById('celebration').hidden=true;
      raiderAlert.hidden=true;
      if(raiderTimeout){ clearTimeout(raiderTimeout); raiderTimeout=null; }
      // No leaderboard update on time out
    }
  }
}

function startTimeLimit() {
  stopTimeLimit();
  timeLeft = timeLimit;
  timeInterval = setInterval(timeTick, 1000);
}
function stopTimeLimit() {
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = null;
}

function startRun(){
  if(timer) return;
  setDifficultyParams();
  progress=0; hydration=100; xp=0;
  updateHUD();
  raiderAlert.hidden=true;
  timer=setInterval(tick,tickInterval);
  startTimeLimit();
  showNarration('Mission started! Run for the last clean water.');
}

function reset(){
  clearInterval(timer); timer=null;
  stopTimeLimit();
  progress=0; hydration=100; xp=0; updateHUD();
  resultsEl.hidden=true; missionEl.hidden=false;
  raiderAlert.hidden=true;
  if(raiderTimeout){ clearTimeout(raiderTimeout); raiderTimeout=null; }
  lastMilestone = 0;
}

function finishRun(){
  missionEl.hidden=true; resultsEl.hidden=false;
  finalXPEl.textContent=xp;
  factEl.textContent=facts[Math.floor(Math.random()*facts.length)];
  playAudio(audioWin);
  confetti({particleCount:180,spread:70,origin:{y:0.7}});
  raiderAlert.hidden=true;
  if(raiderTimeout){ clearTimeout(raiderTimeout); raiderTimeout=null; }
  // Show spectacular celebration overlay
  document.getElementById('celebration').hidden=false;
  setTimeout(()=>{
    document.getElementById('celebration').hidden=true;
  }, 3500);
  showNarration('Mission complete! You helped bring water to more lives.');

  // Leaderboard logic
  let scores = JSON.parse(localStorage.getItem('ld_scores') || '[]');
  scores.push({ xp, date: new Date().toLocaleString() });
  scores = scores.sort((a,b)=>b.xp-a.xp).slice(0,5);
  localStorage.setItem('ld_scores', JSON.stringify(scores));
  let best = scores[0]?.xp || xp;
  let leaderboardDiv = document.getElementById('leaderboard');
  if (leaderboardDiv) {
    leaderboardDiv.innerHTML = `<h3>Leaderboard</h3><ul>` +
      scores.map(s=>`<li>${s.xp} XP <span style='color:#FFD600'>${s.date}</span></li>`).join('') +
      `</ul><p><strong>Personal Best:</strong> ${best} XP</p>`;
  }

    // Unlockable runner skins
    let skinDiv = document.getElementById('skinUnlock');
    let skins = [
      {name:'Classic', color:'#FFD600', milestone:0},
      {name:'Aqua', color:'#56CCF2', milestone:250},
      {name:'Gold', color:'#F2C94C', milestone:400},
      {name:'Night', color:'#142E50', milestone:600}
    ];
    let unlocked = skins.filter(s=>best>=s.milestone);
    if (skinDiv) {
      skinDiv.innerHTML = `<h3>Unlocked Runner Skins</h3>` +
        unlocked.map(s=>`<button class='skin-btn' style='background:${s.color};color:#142E50;font-weight:900;margin:4px 8px;border-radius:8px;padding:8px 18px;border:none;cursor:pointer' data-skin='${s.name}'>${s.name}</button>`).join('');
    }
    document.querySelectorAll('.skin-btn').forEach(btn=>{
      btn.onclick = function() {
        let runnerImg = document.querySelector('.runner-img.focal');
        if (runnerImg) runnerImg.style.boxShadow = `0 0 32px 8px ${btn.style.background}, 0 0 80px 10px ${btn.style.background}`;
      };
    });
}

function showRaider(){
  raiderAlert.hidden=false;
  raiderTimeout=setTimeout(()=>{
    // Penalty if not dodged in time
    hydration=Math.max(0,hydration-raiderPenalty);
  updateHUD();
  playAudio(audioMiss);
  raiderAlert.hidden=true;
  raiderTimeout=null;
  }, 2500); // 2.5 seconds to dodge
}

dodgeBtn.addEventListener('click',()=>{
  if(raiderTimeout){
    xp+=30; // reward for dodging
  updateHUD();
  playAudio(audioCollect);
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

// Sound/music toggle and audio feedback
const audioCollect = document.getElementById('audioCollect');
const audioMiss = document.getElementById('audioMiss');
const audioWin = document.getElementById('audioWin');
const audioToggle = document.getElementById('audioToggle');
let audioMuted = false;
function playAudio(audEl) {
  if (!audioMuted && audEl) {
    audEl.currentTime = 0;
    audEl.play();
  }
}
if (audioToggle) {
  audioToggle.onclick = function() {
    audioMuted = !audioMuted;
    let audios = [audioCollect, audioMiss, audioWin];
    audios.forEach(a => { if (a) a.muted = audioMuted; });
    audioToggle.textContent = audioMuted ? 'Unmute Audio' : 'Mute Audio';
  };
}

// Share button logic
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.onclick = function() {
    let score = document.getElementById('finalXP')?.textContent || '0';
    let best = JSON.parse(localStorage.getItem('ld_scores') || '[]')[0]?.xp || score;
    let msg = `I just completed Last Drop: A Charity Water Run with ${score} XP! My personal best is ${best} XP. Play and support clean water: https://www.charitywater.org/`;
    if (navigator.share) {
      navigator.share({ title: 'Last Drop Run', text: msg, url: window.location.href });
    } else {
      navigator.clipboard.writeText(msg);
      shareBtn.textContent = 'Copied!';
      setTimeout(()=>shareBtn.textContent='Share Result', 1800);
    }
  };
}

// Accessibility: High Contrast Mode
const contrastBtn = document.getElementById('contrastToggle');
let contrastOn = false;
if (contrastBtn) {
  contrastBtn.onclick = function() {
    contrastOn = !contrastOn;
    document.body.style.background = contrastOn ? '#000' : '';
    document.body.style.color = contrastOn ? '#FFD600' : '';
    document.querySelectorAll('.card,.hud,.mission,.results,.story,.impact').forEach(el=>{
      el.style.background = contrastOn ? '#222' : '';
      el.style.color = contrastOn ? '#FFD600' : '';
    });
  };
}

// Accessibility: Text to Speech
const ttsBtn = document.getElementById('ttsBtn');
if (ttsBtn) {
  ttsBtn.onclick = function() {
    let text = '';
    let mission = document.getElementById('mission');
    if (mission) text += mission.innerText + '\n';
    let story = document.getElementById('story');
    if (story) text += story.innerText + '\n';
    let impact = document.getElementById('impact');
    if (impact) text += impact.innerText + '\n';
    let utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
  };
}

// Random fact popups during gameplay
function showFactPopup() {
  let factDiv = document.getElementById('factPopup');
  if (!factDiv) {
    factDiv = document.createElement('div');
    factDiv.id = 'factPopup';
    factDiv.style.position = 'fixed';
    factDiv.style.right = '24px';
    factDiv.style.bottom = '80px';
    factDiv.style.background = 'rgba(86,204,242,0.92)';
    factDiv.style.color = '#142E50';
    factDiv.style.fontWeight = '700';
    factDiv.style.fontSize = '1.08rem';
    factDiv.style.padding = '10px 22px';
    factDiv.style.borderRadius = '12px';
    factDiv.style.zIndex = '9999';
    factDiv.style.boxShadow = '0 0 12px #56CCF2';
    document.body.appendChild(factDiv);
  }
  factDiv.textContent = facts[Math.floor(Math.random()*facts.length)];
  factDiv.style.display = 'block';
  setTimeout(() => {
    factDiv.style.display = 'none';
  }, 2600);
}

let factInterval = null;
function startFactPopups() {
  if (factInterval) clearInterval(factInterval);
  factInterval = setInterval(showFactPopup, 12000);
}
function stopFactPopups() {
  if (factInterval) clearInterval(factInterval);
}

// Mission narration popup
function showNarration(msg) {
  let narrationDiv = document.getElementById('narrationMsg');
  if (!narrationDiv) {
    narrationDiv = document.createElement('div');
    narrationDiv.id = 'narrationMsg';
    narrationDiv.style.position = 'fixed';
    narrationDiv.style.bottom = '32px';
    narrationDiv.style.left = '50%';
    narrationDiv.style.transform = 'translateX(-50%)';
    narrationDiv.style.background = 'rgba(15,51,88,0.92)';
    narrationDiv.style.color = '#FFD600';
    narrationDiv.style.fontWeight = '900';
    narrationDiv.style.fontSize = '1.25rem';
    narrationDiv.style.padding = '10px 28px';
    narrationDiv.style.borderRadius = '14px';
    narrationDiv.style.zIndex = '9999';
    narrationDiv.style.boxShadow = '0 0 18px #FFD600';
    document.body.appendChild(narrationDiv);
  }
  narrationDiv.textContent = msg;
  narrationDiv.style.display = 'block';
  setTimeout(() => {
    narrationDiv.style.display = 'none';
  }, 2200);
}

// Animated background effects (ripples/particles)
const bgCanvas = document.getElementById('bgCanvas');
if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle/ripple state
  let ripples = [];
  function spawnRipple() {
    const x = Math.random() * bgCanvas.width;
    const y = Math.random() * bgCanvas.height * 0.7;
    ripples.push({x, y, r: 0, alpha: 0.7 + Math.random()*0.3});
    if (ripples.length > 18) ripples.shift();
  }
  setInterval(spawnRipple, 900);

  function drawRipples() {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (let ripple of ripples) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.r, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(86,204,242,${ripple.alpha})`;
      ctx.lineWidth = 2 + ripple.r * 0.08;
      ctx.globalAlpha = ripple.alpha;
      ctx.shadowColor = '#56CCF2';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
      ripple.r += 1.8 + Math.random();
      ripple.alpha *= 0.98;
    }
    ripples = ripples.filter(r => r.alpha > 0.08);
    requestAnimationFrame(drawRipples);
  }
  drawRipples();
}

// Interactive drop icon
const dropIcon = document.getElementById('dropIcon');
if (dropIcon) {
  dropIcon.addEventListener('click', function() {
    dropIcon.classList.add('disappear');
    hydration = Math.min(100, hydration + 15);
    updateHUD();
    playAudio(audioCollect);
    confetti({particleCount:60,spread:40,origin:{y:0.7}});
  });
}

// Runner image rotation on click
const runnerImg = document.querySelector('.runner-img.focal');
if (runnerImg) {
  runnerImg.addEventListener('click', function() {
    runnerImg.classList.add('rotate');
    setTimeout(()=>runnerImg.classList.remove('rotate'), 700);
  });
}