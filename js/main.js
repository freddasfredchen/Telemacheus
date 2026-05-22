let exerciseAnimTimeout = null;

function feedAction(type) {
  if (isEgg || phoenixPending) {
    showToast('🥚 Bruno schläft im Ei. Warte auf das Schlüpfen!');
    return;
  }
  state[type] = Math.min(100, state[type] + REFILL_AMOUNT);
  saveState();
  updateBars();

  const btn = $('btn' + type[0].toUpperCase() + type.slice(1));
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 200);

  const reactions = {
    water:    { msg: 'Ahhh! Erfrischend! Danke Lea! 💧😊', emoji: '💧', toast: 'Wasser gegeben! 💧' },
    food:     { msg: 'Nom nom nom! SO GUT! 🥗😋',           emoji: '🥗', toast: 'Gefüttert! 🥗' },
    exercise: { msg: 'JA! Sport! Ich liebe Sport! 🏃💪',    emoji: '🏃', toast: 'Sport gemacht! 🏃' }
  };
  const r = reactions[type];
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

function startMessageRotation() {
  clearInterval(messageRotateInterval);
  rotateMessages();
  messageRotateInterval = setInterval(rotateMessages, 6000);
}

function tick() {
  if (isEgg || phoenixPending) return;

  const frac = TICK_INTERVAL / 60000;
  state.water    = Math.max(1, state.water    - DECAY_RATE.water    * frac);
  state.food     = Math.max(1, state.food     - DECAY_RATE.food     * frac);
  state.exercise = Math.max(1, state.exercise - DECAY_RATE.exercise * frac);
  state.age      = (state.age || 0) + frac;

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
  applyOfflineDecay();

  if (isEgg) {
    brunoEl.style.display = 'none';
    $('eggWrap').classList.add('show');
    scheduleHatch();
  }

  updateBars();
  updatePetState();
  updateStatusMsg();
  if (!isEgg) startMessageRotation();

  setInterval(tick, TICK_INTERVAL);

  const offlineMin = Math.round(offlineMs / 60000);
  if (offlineMin > 5 && !isEgg) {
    setTimeout(() => showToast(`Bruno war ${offlineMin} Minuten allein... 😢`), 1500);
  }
  saveState();
}

init();
