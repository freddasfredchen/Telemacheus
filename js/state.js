let state = loadState();
let isEgg = !!state.isEgg;
let phoenixPending = false;
let messageRotateInterval = null;

function loadState() {
  try {
    const raw = localStorage.getItem('bruno_state');
    if (raw) {
      const s = JSON.parse(raw);
      delete s.dead;
      return { ...DEFAULTS, ...s };
    }
  } catch(e) {}
  return { ...DEFAULTS, lastTick: Date.now() };
}

function saveState() {
  state.lastTick = Date.now();
  localStorage.setItem('bruno_state', JSON.stringify(state));
}

function applyOfflineDecay() {
  const now = Date.now();
  const elapsed = (now - (state.lastTick || now)) / 60000;
  if (elapsed > 0 && !state.isEgg) {
    state.water    = Math.max(1, (state.water    ?? 100) - DECAY_RATE.water    * elapsed);
    state.food     = Math.max(1, (state.food     ?? 100) - DECAY_RATE.food     * elapsed);
    state.exercise = Math.max(1, (state.exercise ?? 100) - DECAY_RATE.exercise * elapsed);
    state.age      = (state.age || 0) + elapsed;
  }
  state.lastTick = now;
}
