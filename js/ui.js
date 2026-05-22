const $ = id => document.getElementById(id);
const brunoEl = $('bruno');

function updateBars() {
  ['water','food','exercise'].forEach(stat => {
    const val = Math.round(state[stat]);
    $(`${stat}Bar`).style.width = val + '%';
    $(`${stat}Val`).textContent = val;
    const bar = $(`${stat}Bar`);
    bar.classList.remove('low','crit');
    if (val <= 15) bar.classList.add('crit');
    else if (val <= 35) bar.classList.add('low');
  });
}

function getMood() {
  if (isEgg || phoenixPending) return phoenixPending ? 'phoenix' : 'egg';
  const min = Math.min(state.water, state.food, state.exercise);
  const avg = (state.water + state.food + state.exercise) / 3;
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
  brunoEl.classList.remove('happy','neutral','sad','exercise','phoenix');
  brunoEl.classList.add(mood);

  const avg = (state.water + state.food + state.exercise) / 3;
  const dots = Math.max(1, Math.round(avg / 20));
  for (let i = 1; i <= 5; i++) $(`md${i}`).classList.toggle('active', i <= dots);

  if (mood === 'phoenix') {
    $('moodLabel').textContent = '🔥 PHÖNIX';
    $('moodLabel').style.color = 'var(--phoenix)';
  } else {
    const labels = ['','SAD','MEH','OKAY','GOOD','HAPPY'];
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
  const sorted = ['water','food','exercise']
    .map(s => ({ s, v: state[s] }))
    .sort((a,b) => a.v - b.v);
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
    el.textContent = '🥚 Bruno verwandelt sich... Warte auf das Schlüpfen!';
    el.style.color = 'var(--phoenix)';
    return;
  }
  if (phoenixPending) {
    el.textContent = '🔥 Etwas Magisches passiert... Bruno leuchtet!';
    el.style.color = 'var(--phoenix)';
    return;
  }
  const min = Math.min(state.water, state.food, state.exercise);
  if (min <= 15) {
    el.textContent = '🚨 NOTFALL! Bruno braucht sofort Hilfe!';
    el.style.color = 'var(--red)';
  } else if (min <= 35) {
    const icons = { water:'💧', food:'🥗', exercise:'🏃' };
    const which = ['water','food','exercise'].filter(s => state[s] <= 35).map(n => icons[n]).join(' ');
    el.textContent = `⚠️ ${which} braucht Aufmerksamkeit!`;
    el.style.color = 'var(--accent3)';
  } else {
    const avg = (state.water + state.food + state.exercise) / 3;
    if (avg > 75) { el.textContent = 'Bruno ist topfit! Danke, Lea! 💜'; el.style.color = 'var(--green)'; }
    else          { el.textContent = 'Alles im grünen Bereich! 👍';       el.style.color = '#b090f0'; }
  }
}

function spawnSparkles(count) {
  const s = $('sparkles');
  const emojis = ['✨','⭐','💫','🌟','💥'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = rand(emojis);
      el.style.left = (10 + Math.random() * 80) + '%';
      el.style.top  = (10 + Math.random() * 60) + '%';
      s.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * 80);
  }
}

function spawnFireParticles() {
  const s = $('sparkles');
  const emojis = ['🔥','✨','💫','⭐','🌟','🧡','💛'];
  for (let i = 0; i < 14; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = rand(emojis);
      el.style.left = (5 + Math.random() * 90) + '%';
      el.style.top  = (5 + Math.random() * 75) + '%';
      el.style.fontSize = (11 + Math.random() * 10) + 'px';
      s.appendChild(el);
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
