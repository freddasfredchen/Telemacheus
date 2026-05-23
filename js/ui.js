const $ = id => document.getElementById(id);
const brunoEl = $('bruno');

function updateBars() {
  STAT_NAMES.forEach(stat => {
    const bar = $(`${stat}Bar`);
    const val = $(`${stat}Val`);
    if (!bar) return;
    const v = Math.round(state[stat]);
    bar.style.width = v + '%';
    val.textContent = v;
    bar.classList.remove('low', 'crit');
    if (v <= 15) bar.classList.add('crit');
    else if (v <= 35) bar.classList.add('low');
  });
}

function getMood() {
  if (isEgg || phoenixPending) return phoenixPending ? 'phoenix' : 'egg';
  if (getTimePhase() === 'sleep') return 'sleeping';
  const min = Math.min(state.water, state.food, state.energy);
  const avg = STAT_NAMES.reduce((a, s) => a + state[s], 0) / STAT_NAMES.length;
  if (min <= 15 || avg < 25) return 'sad';
  if (min > 60 && avg > 70)  return 'happy';
  return 'neutral';
}

function updatePetState() {
  const mood = getMood();

  if (mood === 'egg') {
    brunoEl.style.display = 'none';
    $('eggWrap').classList.add('show');
    for (let i = 1; i <= 5; i++) $(`md${i}`).classList.remove('active');
    $('moodLabel').textContent = '🥚 EI';
    $('moodLabel').style.color = 'var(--phoenix)';
    $('genInfo').textContent = `Generation ${state.generation} · ${formatAge(state.age)}`;
    return;
  }

  $('eggWrap').classList.remove('show');
  brunoEl.style.display = '';
  brunoEl.classList.remove('happy', 'neutral', 'sad', 'exercise', 'phoenix', 'sleeping');
  brunoEl.classList.add(mood);

  const sleeping = mood === 'sleeping';
  $('sleepOverlay').style.display = sleeping ? 'flex' : 'none';
  document.querySelectorAll('.btn').forEach(b => { b.disabled = sleeping; });

  const avg = STAT_NAMES.reduce((a, s) => a + state[s], 0) / STAT_NAMES.length;
  const dots = Math.max(1, Math.round(avg / 20));
  for (let i = 1; i <= 5; i++) $(`md${i}`).classList.toggle('active', i <= dots && !sleeping);

  if (mood === 'phoenix') {
    $('moodLabel').textContent = '🔥 PHÖNIX';
    $('moodLabel').style.color = 'var(--phoenix)';
  } else if (sleeping) {
    $('moodLabel').textContent = '💤 SCHLÄFT';
    $('moodLabel').style.color = 'var(--accent2)';
  } else {
    const labels = ['', 'SAD', 'MEH', 'OKAY', 'GOOD', 'HAPPY'];
    $('moodLabel').textContent = labels[Math.min(5, dots)];
    $('moodLabel').style.color = dots >= 4 ? 'var(--green)' : dots <= 2 ? 'var(--red)' : 'var(--accent3)';
  }
  $('genInfo').textContent = `Generation ${state.generation} · ${formatAge(state.age)}`;
}

function formatAge(m) {
  m = Math.floor(m || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
}

function pickMessage() {
  if (isEgg) return null;
  if (phoenixPending) return rand(MESSAGES.phoenixWarn);
  if (getTimePhase() === 'sleep') return rand(MESSAGES.phase.sleep_zzz);

  const sorted = STAT_NAMES
    .map(s => ({ s, v: state[s] }))
    .sort((a, b) => a.v - b.v);

  const worst = sorted[0];
  if (worst.v <= 15) return rand(MESSAGES[worst.s].crit);
  if (worst.v <= 35) return rand(MESSAGES[worst.s].low);
  return getMood() === 'happy' ? rand(MESSAGES.happy) : rand(MESSAGES.neutral);
}

function showSpeech(msg) {
  const el = $('speechBubble');
  el.style.opacity = '0';
  setTimeout(() => { el.textContent = msg; el.style.opacity = '1'; }, 200);
}

function rotateMessages() {
  const msg = pickMessage();
  if (msg) showSpeech(msg);
}

function updateStatusMsg() {
  const el = $('statusMsg');
  if (isEgg) {
    el.textContent = '🥚 Bruno verwandelt sich... Ein Neustart für Lea!';
    el.style.color = 'var(--phoenix)';
    return;
  }
  if (phoenixPending) {
    el.textContent = '🔥 Bruno sendet ein Zeichen: Zeit für einen Neustart, Lea!';
    el.style.color = 'var(--phoenix)';
    return;
  }
  if (getTimePhase() === 'sleep') {
    el.textContent = '💤 Schlaf gut, Lea! Morgen früh erst Wasser trinken! ⚡';
    el.style.color = 'var(--accent2)';
    return;
  }
  const icons = { water: '💧', food: '🥗', exercise: '🏃', energy: '⚡', social: '💬', hygiene: '🧼' };
  const labels = { water: 'Trinken', food: 'Essen', exercise: 'Bewegen', energy: 'Schlafen', social: 'Verbindungen', hygiene: 'Duschen' };
  const min = Math.min(...STAT_NAMES.map(s => state[s]));
  if (min <= 15) {
    el.textContent = '🚨 Lea braucht jetzt sofort Selbstfürsorge!';
    el.style.color = 'var(--red)';
  } else if (min <= 35) {
    const which = STAT_NAMES.filter(s => state[s] <= 35).map(s => `${icons[s]} ${labels[s]}`).join(' · ');
    el.textContent = `⚠️ Lea, denk an: ${which}`;
    el.style.color = 'var(--accent3)';
  } else {
    const avg = STAT_NAMES.reduce((a, s) => a + state[s], 0) / STAT_NAMES.length;
    if (avg > 75) { el.textContent = 'Lea kümmert sich super um sich selbst! 💜'; el.style.color = 'var(--green)'; }
    else          { el.textContent = 'Alles im grünen Bereich! Weiter so, Lea! 👍'; el.style.color = '#b090f0'; }
  }
}

// ── Visual effects ──

function spawnSparkles(count) {
  const s = $('sparkles');
  const emojis = ['✨', '⭐', '💫', '🌟', '💥'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = rand(emojis);
      el.style.left = (10 + Math.random() * 80) + '%';
      el.style.top  = (10 + Math.random() * 60) + '%';
      $('sparkles').appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * 80);
  }
}

function spawnZzz() {
  const el = document.createElement('div');
  el.className = 'sparkle-zzz';
  el.textContent = ['💤', 'Z', 'z', 'Zzz'][Math.floor(Math.random() * 4)];
  el.style.left = (30 + Math.random() * 40) + '%';
  el.style.top  = (15 + Math.random() * 35) + '%';
  el.style.fontSize = (10 + Math.random() * 8) + 'px';
  $('sparkles').appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function spawnFireParticles() {
  const emojis = ['🔥', '✨', '💫', '⭐', '🌟', '🧡', '💛'];
  for (let i = 0; i < 14; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = rand(emojis);
      el.style.left = (5 + Math.random() * 90) + '%';
      el.style.top  = (5 + Math.random() * 75) + '%';
      el.style.fontSize = (11 + Math.random() * 10) + 'px';
      $('sparkles').appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * 90);
  }
}

function triggerFlash() {
  const f = $('stageFlash');
  f.classList.remove('active');
  void f.offsetWidth;
  f.classList.add('active');
  setTimeout(() => f.classList.remove('active'), 450);
}

function spawnFloatEmoji(emoji, btn) {
  const el = document.createElement('div');
  el.className = 'float-pop';
  el.textContent = emoji;
  const r = btn.getBoundingClientRect();
  el.style.left = r.left + r.width / 2 - 15 + 'px';
  el.style.top  = r.top - 10 + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2500);
}
