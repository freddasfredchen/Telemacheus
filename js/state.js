let state = loadState();
let isEgg = !!state.isEgg;
let phoenixPending = false;
let messageRotateInterval = null;

function getPhaseAt(ms) {
  const h = new Date(ms).getHours();
  if (h >= 22 || h < 7) return 'sleep';
  if (h < 9)            return 'morning';
  if (h < 17)           return 'day';
  if (h < 20)           return 'evening';
  return 'tired';
}

function getTimePhase() {
  return getPhaseAt(Date.now());
}

// Returns the timestamp (ms) when the current phase ends.
function nextPhaseChangeMs(ms) {
  const d = new Date(ms);
  const h = d.getHours();
  for (const ph of PHASE_HOURS) {
    if (h < ph) {
      const next = new Date(d);
      next.setHours(ph, 0, 0, 0);
      return next.getTime();
    }
  }
  // Past 22:00 → next change is 07:00 next day
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  next.setHours(PHASE_HOURS[0], 0, 0, 0);
  return next.getTime();
}

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

// Walk through phase segments between lastTick and now,
// applying appropriate multipliers to each segment.
function getToday() { return new Date().toISOString().slice(0, 10); }

function applyOfflineDecay() {
  const now = Date.now();
  let t = state.lastTick || now;
  if (t >= now || state.isEgg) { state.lastTick = now; return; }

  while (t < now) {
    const segEnd = Math.min(nextPhaseChangeMs(t), now);
    const mins   = (segEnd - t) / 60000;
    const mults  = PHASE_MULTIPLIERS[getPhaseAt(t)];
    STAT_NAMES.forEach(s => {
      const delta = DECAY_RATE[s] * (mults[s] || 1) * mins;
      state[s] = Math.max(1, Math.min(100, (state[s] ?? DEFAULTS[s]) - delta));
    });
    state.age = (state.age || 0) + mins;
    t = segEnd;
  }
  state.lastTick = now;
}
