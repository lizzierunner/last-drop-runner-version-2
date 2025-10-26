window.addEventListener('DOMContentLoaded', function() {
  // DOM queries (move all to top for reliability)
  const staminaEl = document.getElementById('stamina');
  const agilityEl = document.getElementById('agility');
  const luckEl = document.getElementById('luck');
  const inventoryEl = document.getElementById('inventory');
  const dropIcon = document.getElementById('dropIcon');
  const dodgeBtn = document.getElementById('dodgeBtn');
  const hydrationEl = document.getElementById('hydration');
  const xpEl = document.getElementById('xp');
  const barEl = document.getElementById('bar');
  const missionEl = document.getElementById('mission');
  const resultsEl = document.getElementById('results');
  const finalXPEl = document.getElementById('finalXP');
  const factEl = document.getElementById('fact');
  const difficultySelect = document.getElementById('difficulty');
  const raiderAlert = document.getElementById('raiderAlert');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const tronSoundtrack = document.getElementById('tronSoundtrack');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const runAgainBtn = document.getElementById('runAgain');
  const audioCollect = document.getElementById('audioCollect');
  const audioMiss = document.getElementById('audioMiss');
  const audioWin = document.getElementById('audioWin');
  const audioToggle = document.getElementById('audioToggle');
  const runnerImg = document.querySelector('.runner-img.focal');

  // Story choice popup logic
  let storyChoiceMade = false;
  function showStoryChoice() {
    if (document.getElementById('storyChoicePopup')) return;
    const popup = document.createElement('div');
    popup.id = 'storyChoicePopup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = 'rgba(15,51,88,0.97)';
    popup.style.color = '#FFD600';
    popup.style.fontWeight = '900';
    popup.style.fontSize = '1.18rem';
    popup.style.padding = '22px 38px';
    popup.style.borderRadius = '18px';
    popup.style.zIndex = '99999';
    popup.style.boxShadow = '0 0 24px #FFD600';
    popup.innerHTML = `
      <div style="margin-bottom:18px;">You find a hidden well. What do you do?</div>
      <button id="choiceHelp" style="margin:8px 12px 0 0; background:#FFD600;color:#142E50;font-weight:900;border-radius:8px;padding:8px 18px;border:none;cursor:pointer;">Help Community</button>
      <button id="choiceSolo" style="margin:8px 0 0 0; background:#56CCF2;color:#142E50;font-weight:900;border-radius:8px;padding:8px 18px;border:none;cursor:pointer;">Take Water & Run</button>
    `;
    document.body.appendChild(popup);
    document.getElementById('choiceHelp').onclick = function() {
      hydration = Math.min(100, hydration + 10);
      xp += 40;
      addItem('Community Thanks');
      showMilestone('🌍 You helped the community!');
      updateHUD();
      updateRPGHUD();
      popup.remove();
      storyChoiceMade = true;
    };
    document.getElementById('choiceSolo').onclick = function() {
      hydration = Math.min(100, hydration + 25);
      xp += 10;
      addItem('Extra Water');
      showMilestone('💧 You took the water and ran!');
      updateHUD();
      updateRPGHUD();
      popup.remove();
      storyChoiceMade = true;
    };
  }

  // Fix lint: declare oldTick once and chain tick overrides
  let oldTick = tick;
  // Update HUDs after each tick (RPG HUD and level up)
  tick = function() {
    oldTick();
    updateRPGHUD();
    checkLevelUp();
    if (!storyChoiceMade && xp > 0) {
      showStoryChoice();
    }
  };
  // RPG elements: stats and inventory
  let stamina = 10;
  let agility = 10;
  let luck = 10;
  let inventory = [];

  function updateRPGHUD() {
    if (staminaEl) staminaEl.textContent = stamina;
    if (agilityEl) agilityEl.textContent = agility;
    if (luckEl) luckEl.textContent = luck;
    if (inventoryEl) inventoryEl.textContent = inventory.length ? inventory.join(', ') : 'None';
  }

  // Level up logic
  function levelUp() {
    stamina += 2;
    agility += 2;
    luck += 1;
    showMilestone('🎉 Level Up! Stats increased.');
    updateRPGHUD();
  }

  // Add item to inventory
  function addItem(item) {
    inventory.push(item);
    showMilestone(`🎒 Found: ${item}`);
    updateRPGHUD();
  }

  // Example: add item on hydration boost
  if (dropIcon) {
    dropIcon.addEventListener('click', function() {
      dropIcon.classList.add('disappear');
      hydration = Math.min(100, hydration + 15 + Math.floor(stamina/5));
      addItem('Water Filter');
      updateHUD();
      updateRPGHUD();
      playAudio(audioCollect);
      confetti({particleCount:60,spread:40,origin:{y:0.7}});
      setTimeout(() => dropIcon.classList.remove('disappear'), 1200);
    });
  }

  // Example: use agility for raider dodge
  if (dodgeBtn) {
    dodgeBtn.addEventListener('click',()=>{
      if(raiderTimeout){
        let dodgeSuccess = Math.random() < (0.7 + agility/50);
        if (dodgeSuccess) {
          xp+=30;
          showMilestone('🏃 Dodge Success!');
        } else {
          hydration = Math.max(0, hydration - raiderPenalty);
          showMilestone('💥 Dodge Failed!');
        }
        updateHUD();
        updateRPGHUD();
        playAudio(audioCollect);
        raiderAlert.hidden=true;
        clearTimeout(raiderTimeout);
        raiderTimeout=null;
      }
    });
  }

  // Example: level up at XP milestones
  function checkLevelUp() {
    if (xp >= 200 && stamina < 20) levelUp();
    if (xp >= 400 && stamina < 30) levelUp();
  }

  // Update HUDs after each tick
  // (Removed duplicate oldTick declaration)

  // Initial HUD update
  updateRPGHUD();
  // Audio elements
  let audioMuted = false;
  function playAudio(audEl) {
    if (!audioMuted && audEl) {
      audEl.currentTime = 0;
      audEl.play();
    }
  }
  // Game logic variables and functions
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
    missionEl.hidden=true; 
    resultsEl.hidden=false;
    finalXPEl.textContent=xp;
    factEl.textContent=facts[Math.floor(Math.random()*facts.length)];
    setTimeout(()=>{ 
      if (audioWin) {
        try {
          audioWin.currentTime = 0;
          let playPromise = audioWin.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.warn('Mission complete sound failed:', e);
            });
          }
          console.log('Mission complete sound played.');
        } catch (err) {
          console.warn('Mission complete sound error:', err);
        }
      } else {
        console.warn('audioWin element not found.');
      }
    }, 100);
    confetti({particleCount:180,spread:70,origin:{y:0.7}});
    raiderAlert.hidden=true;
    if(raiderTimeout){ clearTimeout(raiderTimeout); raiderTimeout=null; }
    document.getElementById('celebration').hidden=false;
      // Add event listeners for celebration popup controls
      setTimeout(()=>{
        const closeBtn = document.getElementById('closeCelebration');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            document.getElementById('celebration').hidden = true;
          });
        }
        const replayBtn = document.getElementById('replayCelebration');
        if (replayBtn) {
          replayBtn.addEventListener('click', function() {
            document.getElementById('celebration').hidden = true;
            reset();
          });
        }
        const homeBtn = document.getElementById('homeCelebration');
        if (homeBtn) {
          homeBtn.addEventListener('click', function() {
            document.getElementById('celebration').hidden = true;
            resultsEl.hidden = true;
            missionEl.hidden = false;
          });
        }
      }, 100);
  // Removed auto-hide timeout so users can always close celebration manually
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
      hydration=Math.max(0,hydration-raiderPenalty);
    updateHUD();
    playAudio(audioMiss);
    raiderAlert.hidden=true;
    raiderTimeout=null;
    }, 2500);
  }
  dodgeBtn.addEventListener('click',()=>{
    if(raiderTimeout){
      xp+=30;
    updateHUD();
    playAudio(audioCollect);
    raiderAlert.hidden=true;
    clearTimeout(raiderTimeout);
    raiderTimeout=null;
    }
  });
  updateHUD();
  // Music toggle button logic
  let musicOn = false;
  if (musicToggleBtn && tronSoundtrack) {
    musicToggleBtn.addEventListener('click', function() {
      musicOn = !musicOn;
      if (musicOn) {
        tronSoundtrack.volume = 0.5;
        tronSoundtrack.muted = false;
        const playPromise = tronSoundtrack.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            musicToggleBtn.textContent = 'Music: On';
            musicToggleBtn.setAttribute('aria-label', 'Turn soundtrack off');
          }).catch(e => {
            musicToggleBtn.textContent = 'Music: Blocked';
            musicToggleBtn.setAttribute('aria-label', 'Soundtrack blocked by browser');
            console.warn('Music playback blocked:', e);
          });
        } else {
          musicToggleBtn.textContent = 'Music: On';
          musicToggleBtn.setAttribute('aria-label', 'Turn soundtrack off');
        }
      } else {
        tronSoundtrack.pause();
        musicToggleBtn.textContent = 'Music: Off';
        musicToggleBtn.setAttribute('aria-label', 'Turn soundtrack on');
      }
    });
  }
  // Start button logic
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      startRun();
      // Optionally play music if toggled on
      if (musicOn && tronSoundtrack.paused) {
        tronSoundtrack.play();
      }
    });
  }
  // Reset button logic
  if (resetBtn) {
    resetBtn.addEventListener('click', reset);
  }
  // Run Again button logic
  if (runAgainBtn) {
    runAgainBtn.addEventListener('click', reset);
  }
  // Runner image rotation
  if (runnerImg) {
    runnerImg.addEventListener('click', function() {
      runnerImg.classList.add('rotate');
      setTimeout(() => runnerImg.classList.remove('rotate'), 700);
    });
  }

  // Konami code for secret boost
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

  // Sound/music toggle and audio feedback
  // ...existing code...
  function playAudio(audEl) {
    if (!audioMuted && audEl) {
      audEl.currentTime = 0;
      audEl.play();
    }
  }
  if (audioToggle) {
    audioToggle.onclick = function() {
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
  if (dropIcon) {
    dropIcon.addEventListener('click', function() {
      dropIcon.classList.add('disappear');
      hydration = Math.min(100, hydration + 15);
      updateHUD();
      playAudio(audioCollect);
      confetti({particleCount:60,spread:40,origin:{y:0.7}});
    });
  }
});