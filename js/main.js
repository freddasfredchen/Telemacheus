let exerciseAnimTimeout = null;
let zzzInterval = null;
let currentPhase = null;

function feedAction(type) {
  if (isEgg || phoenixPending) {
    showToast('🥚 Bruno schläft im Ei. Warte auf das Schlüpfen!');
    return;
  }
  if (getTimePhase() === 'sleep') {
    showToast('💤 Psst! Bruno schläft gerade...');
    return;
  }

  // Exercise costs a bit of energy; playing recovers a little
  if (type === 'exercise') state.energy = Math.max(1, state.energy - 15);
  if (type === 'social')   state.energy = Math.min(100, state.energy + 8);

  state[type] = Math.min(100, state[type] + REFILL_AMOUNT);
  saveState();
  updateBars();
  awardAction(type);

  const btnId = 'btn' + type[0].toUpperCase() + type.slice(1);
  const btn = $(btnId);
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 200);

  const r = {
    water:    { msg: 'Ja Lea! Getrunken! Du bist mein Held! 💧✨',           emoji: '💧', toast: 'Getrunken! Weiter so! 💧' },
    food:     { msg: 'Lea hat gegessen! Das ist das Beste heute! 🥗🎉',      emoji: '🥗', toast: 'Gegessen! Sehr gut! 🥗' },
    exercise: { msg: 'BEWEGUNG! Lea macht Sport! Ich bin so stolz! 🏃💪',   emoji: '🏃', toast: 'Bewegt! Hammer! 🏃' },
    social:   { msg: 'Echte Verbindungen! So wichtig! Gut gemacht, Lea! 💬🥰', emoji: '💬', toast: 'Sozial aktiv! 💬' },
    hygiene:  { msg: 'Lea ist frisch und gepflegt! Selbstfürsorge! 🧼✨',    emoji: '🧼', toast: 'Geduscht! Frisch! 🧼' }
  }[type];

  showSpeech(r.msg);
  showToast(r.toast);
  spawnFloatEmoji(r.emoji, btn);

  if (type === 'exercise') {
    brunoEl.classList.remove('happy', 'neutral', 'sad');
    brunoEl.classList.add('exercise');
    clearTimeout(exerciseAnimTimeout);
    exerciseAnimTimeout = setTimeout(() => { brunoEl.classList.remove('exercise'); updatePetState(); }, 2000);
  } else {
    brunoEl.classList.remove('happy', 'neutral', 'sad', 'exercise');
    brunoEl.classList.add('happy');
    clearTimeout(exerciseAnimTimeout);
    exerciseAnimTimeout = setTimeout(() => { brunoEl.classList.remove('happy'); updatePetState(); }, 1500);
    spawnSparkles(5);
  }
  updatePetState();
  updateStatusMsg();
}

function checkPhaseTransition() {
  const phase = getTimePhase();
  if (phase === currentPhase) return;
  const prev = currentPhase;
  currentPhase = phase;
  if (!prev) return;

  if (phase === 'sleep') {
    showSpeech(rand(MESSAGES.phase.sleep_enter));
    clearInterval(messageRotateInterval);
    zzzInterval = setInterval(spawnZzz, 2500);
  } else if (phase === 'morning') {
    clearInterval(zzzInterval); zzzInterval = null;
    showSpeech(rand(MESSAGES.phase.morning_enter));
    startMessageRotation();
  } else if (phase === 'evening') {
    showSpeech(rand(MESSAGES.phase.evening_enter));
  } else if (phase === 'tired') {
    showSpeech(rand(MESSAGES.phase.tired_enter));
  }

  updatePetState();
  updateStatusMsg();
}

function startMessageRotation() {
  clearInterval(messageRotateInterval);
  if (getTimePhase() !== 'sleep') {
    rotateMessages();
    messageRotateInterval = setInterval(rotateMessages, 6000);
  }
}

function tick() {
  if (isEgg || phoenixPending) return;

  checkPhaseTransition();

  const frac  = TICK_INTERVAL / 60000;
  const mults = PHASE_MULTIPLIERS[getTimePhase()];
  STAT_NAMES.forEach(s => {
    const delta = DECAY_RATE[s] * (mults[s] || 1) * frac;
    state[s] = Math.max(1, Math.min(100, state[s] - delta));
  });
  state.age = (state.age || 0) + frac;

  if (state.water <= 1 && state.food <= 1 && state.age >= PHOENIX_AGE_MINUTES) {
    beginPhoenixSequence();
    return;
  }

  updateBars();
  updatePetState();
  updateStatusMsg();
  saveState();
}

function init() {
  const offlineMs = Date.now() - (state.lastTick || Date.now());
  recordDailyScore();
  applyOfflineDecay();

  currentPhase = getTimePhase();

  if (isEgg) {
    brunoEl.style.display = 'none';
    $('eggWrap').classList.add('show');
    scheduleHatch();
  }

  if (currentPhase === 'sleep') {
    zzzInterval = setInterval(spawnZzz, 2500);
  }

  updateBars();
  updatePetState();
  updateStatusMsg();
  if (!isEgg && currentPhase !== 'sleep') startMessageRotation();

  setInterval(tick, TICK_INTERVAL);
  initNotifications();

  const offlineMin = Math.round(offlineMs / 60000);
  if (offlineMin > 5 && !isEgg) {
    setTimeout(() => showToast(`Bruno war ${offlineMin} Minuten allein... 😢`), 1500);
  }
  saveState();
}

init();
