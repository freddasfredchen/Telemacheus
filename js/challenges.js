const CHALLENGE_POOL = [
  { id: 'water3',    stat: 'water',    target: 3, label: '💧 3x Wasser trinken',       reward: 30 },
  { id: 'water5',    stat: 'water',    target: 5, label: '💧 5x Wasser trinken',       reward: 55 },
  { id: 'food2',     stat: 'food',     target: 2, label: '🥗 2x Essen',                reward: 25 },
  { id: 'food3',     stat: 'food',     target: 3, label: '🥗 3x Essen',                reward: 40 },
  { id: 'exercise2', stat: 'exercise', target: 2, label: '🏃 2x Bewegen',              reward: 40 },
  { id: 'exercise3', stat: 'exercise', target: 3, label: '🏃 3x Bewegen',              reward: 60 },
  { id: 'social2',   stat: 'social',   target: 2, label: '💬 2x Geplaudert',           reward: 25 },
  { id: 'hygiene1',  stat: 'hygiene',  target: 1, label: '🧼 1x Duschen',              reward: 20 },
  { id: 'any4',      stat: '__any4__', target: 4, label: '⭐ 4 verschiedene Aktionen', reward: 45 },
  { id: 'w2f2',      stat: '__w2f2__', target: 4, label: '💧🥗 2x Trinken & 2x Essen', reward: 35 },
];

const SPIN_PRIZES = [
  { label: '💰 10 Coins',  coins: 10,  xp: 0  },
  { label: '⭐ 15 XP',     coins: 0,   xp: 15 },
  { label: '💰 25 Coins',  coins: 25,  xp: 0  },
  { label: '🌟 20 XP',     coins: 0,   xp: 20 },
  { label: '💰 50 Coins',  coins: 50,  xp: 0  },
  { label: '✨ 30 XP',     coins: 0,   xp: 30 },
  { label: '💎 75 Coins',  coins: 75,  xp: 0  },
  { label: '🎰 JACKPOT!',  coins: 150, xp: 50 },
];

function getToday() { return new Date().toISOString().slice(0, 10); }

// ── Daily Challenges ──

function initChallenges() {
  const today = getToday();
  if (state.lastChallengeDate !== today) {
    const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5);
    state.dailyChallenges   = shuffled.slice(0, 3).map(c => ({ id: c.id, progress: 0, completed: false }));
    state.dailyActionCounts = {};
    state.lastChallengeDate = today;
    saveState();
  }
  updateSpinBtnState();
  renderChallenges();
}

function onAction(type) {
  if (!state.dailyActionCounts) state.dailyActionCounts = {};
  state.dailyActionCounts[type] = (state.dailyActionCounts[type] || 0) + 1;

  if (!state.dailyChallenges) return;

  let anyCompleted = false;
  state.dailyChallenges.forEach(ch => {
    if (ch.completed) return;
    const def = CHALLENGE_POOL.find(c => c.id === ch.id);
    if (!def) return;

    let p = ch.progress || 0;
    if      (def.stat === type)      { p = p + 1; }
    else if (def.stat === '__any4__') { p = Object.values(state.dailyActionCounts).filter(v => v > 0).length; }
    else if (def.stat === '__w2f2__') { p = Math.min(2, state.dailyActionCounts.water || 0) + Math.min(2, state.dailyActionCounts.food || 0); }
    ch.progress = Math.min(def.target, p);

    if (!ch.completed && ch.progress >= def.target) {
      ch.completed = true;
      anyCompleted = true;
      state.coins = (state.coins || 0) + def.reward;
      const msg = def.label;
      const rew = def.reward;
      setTimeout(() => {
        showToast('🎉 Challenge geschafft! +' + rew + ' Coins!');
        showSpeech('"' + msg + '" erledigt! Du rockst das, Lea! 🏆✨');
        spawnSparkles(8);
      }, 500);
    }
  });

  saveState();
  renderChallenges();
  if (anyCompleted) setTimeout(updateProgressUI, 600);
}

function renderChallenges() {
  const container = $('challengeList');
  if (!container || !state.dailyChallenges) return;
  container.innerHTML = '';
  state.dailyChallenges.forEach(ch => {
    const def = CHALLENGE_POOL.find(c => c.id === ch.id);
    if (!def) return;
    const pct = Math.min(100, Math.round(((ch.progress || 0) / def.target) * 100));
    const el  = document.createElement('div');
    el.className = 'challenge-item' + (ch.completed ? ' challenge-done' : '');
    el.innerHTML =
      '<div class="challenge-top">' +
        '<span class="challenge-name">' + def.label + '</span>' +
        '<span class="challenge-reward">+' + def.reward + '💰</span>' +
      '</div>' +
      '<div class="challenge-bar-bg"><div class="challenge-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="challenge-prog">' + (ch.progress || 0) + '/' + def.target + (ch.completed ? ' ✅' : '') + '</div>';
    container.appendChild(el);
  });
}

// ── Daily Spin ──

var _spinRunning = false;

function updateSpinBtnState() {
  var btn  = $('spinOpenBtn');
  if (!btn) return;
  var used = state.lastSpinDate === getToday();
  btn.textContent = used ? '🎰 Heute gedreht' : '🎰 Drehen!';
  btn.disabled    = used;
  btn.classList.toggle('spin-used', used);
}

function openSpin() {
  var modal = $('spinModal');
  if (!modal) return;
  var display = $('spinDisplay');
  if (display) { display.textContent = '❓'; display.className = 'spin-display'; }
  var result = $('spinResult');
  if (result) { result.textContent = ''; result.style.display = 'none'; }
  var doBtn = $('spinDoBtn');
  if (doBtn) doBtn.disabled = _spinRunning || state.lastSpinDate === getToday();
  modal.classList.add('open');
}

function closeSpin() {
  var modal = $('spinModal');
  if (modal) modal.classList.remove('open');
}

function doSpin() {
  if (_spinRunning || state.lastSpinDate === getToday()) return;
  _spinRunning = true;
  var doBtn = $('spinDoBtn');
  if (doBtn) doBtn.disabled = true;

  var idx     = Math.floor(Math.random() * SPIN_PRIZES.length);
  var display = $('spinDisplay');
  var cycles  = 0;

  (function cycle() {
    display.textContent = SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)].label;
    display.className   = 'spin-display spin-cycling';
    cycles++;

    var delay = cycles < 16 ? 80 : cycles < 26 ? 80 + (cycles - 16) * 40 : 420;

    if (cycles < 28) {
      setTimeout(cycle, delay);
    } else {
      display.textContent = SPIN_PRIZES[idx].label;
      display.className   = 'spin-display spin-win';

      var prize = SPIN_PRIZES[idx];
      state.coins = (state.coins || 0) + prize.coins;
      state.xp    = (state.xp    || 0) + prize.xp;
      state.lastSpinDate = getToday();
      checkEvolution();
      saveState();
      updateProgressUI();
      updateSpinBtnState();
      _spinRunning = false;

      var result = $('spinResult');
      if (result) {
        var txt = prize.label;
        if (prize.coins) txt += ' · +' + prize.coins + ' Coins';
        if (prize.xp)    txt += ' · +' + prize.xp + ' XP';
        result.textContent = txt;
        result.style.display = 'block';
      }

      if (prize.label.indexOf('JACKPOT') !== -1) {
        spawnFireParticles();
        showSpeech('JACKPOT!! Lea hat das große Los gezogen! 🎰🔥💜');
      } else {
        spawnSparkles(5);
        showSpeech('Lea hat gedreht: ' + prize.label + '! 🎰✨');
      }
    }
  })();
}

// ── Bruno Tap ──

var _tapCooldown = false;

var TAP_REACTIONS = [
  'Hehe! Das kitzelt! 🤣',
  'Lea tippt mich an! Ich LIEBE das! 💕',
  'Nochmal! Bitte nochmal! 🥺',
  'Oh! Eine Überraschung! 😮✨',
  'Streicheleinheit dankend angenommen! 🥰',
  'Du bist die Beste, Lea! 💜🐾',
  'Psst... ich mag dich. Sehr sehr. 🐾',
  'WUHU! Das macht mich so happy! 🎉',
  'hihi... das kitzelt SO SEHR! 😄',
  'Ich tanze für dich! 💃🐾',
  'Lea! Ich bin hier! Hallo! 🐾💜',
  'Du hast mich getippt! Das ist das Beste heute! ⭐',
];

function tapBruno() {
  if (_tapCooldown || isEgg) return;
  if (getTimePhase() === 'sleep') { showSpeech('😴 Psst... ich schlafe... zzz...'); return; }
  if (phoenixPending)             { showSpeech('🔥 Ich verwandle mich! Gleich bin ich neu! 🔥'); return; }

  _tapCooldown = true;
  setTimeout(function() { _tapCooldown = false; }, 1000);

  showSpeech(rand(TAP_REACTIONS));
  spawnSparkles(3);
  spawnFloatEmoji(rand(['💕', '✨', '🐾', '💜', '⭐', '😄']), brunoEl);

  brunoEl.classList.remove('happy', 'neutral', 'sad', 'exercise');
  brunoEl.classList.add('happy');
  clearTimeout(tapBruno._t);
  tapBruno._t = setTimeout(function() { brunoEl.classList.remove('happy'); updatePetState(); }, 900);
}
