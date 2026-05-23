// ── Progress System ──

function getComboMultiplier() {
  return Math.min(3.0, 1 + (state.goodDayStreak || 0) * 0.15);
}

function awardAction(type) {
  var mult = getComboMultiplier();
  var xpGain   = Math.round((XP_PER_ACTION[type]   || 0) * mult);
  var coinGain = Math.round((COIN_PER_ACTION[type]  || 0) * mult);

  state.xp    = (state.xp    || 0) + xpGain;
  state.coins = (state.coins || 0) + coinGain;

  checkEvolution();
  saveState();
  updateProgressUI();

  var toastMsg = '+' + xpGain + ' XP · +' + coinGain + ' 💰';
  if (mult > 1) toastMsg += ' (x' + mult.toFixed(1) + ' Streak!)';
  showToast(toastMsg);
}

function checkEvolution() {
  var xp = state.xp || 0;
  var newStage = 1;
  for (var i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= STAGE_THRESHOLDS[i]) { newStage = i + 1; break; }
  }
  if (newStage !== (state.stage || 1)) {
    state.stage = newStage;
    triggerEvolution(newStage);
  }
}

function triggerEvolution(stage) {
  spawnFireParticles();
  showToast('🎉 Bruno ist jetzt ' + STAGE_NAMES[stage - 1] + '!');
  showSpeech('⭐ Level up! Ich bin jetzt ' + STAGE_NAMES[stage - 1] + '! Danke, Lea! 🎉');
  if (brunoWrap) {
    for (var i = 1; i <= 5; i++) brunoWrap.classList.remove('stage-' + i);
    brunoWrap.classList.add('stage-' + stage);
  }
}

function recordDailyScore() {
  var today = new Date().toISOString().slice(0, 10);
  if (state.lastDayRecorded === today) return;

  // Only record if there's a previous day (not first ever load)
  if (state.lastDayRecorded !== null) {
    var avg = STAT_NAMES.reduce(function(a, s) { return a + (state[s] || 0); }, 0) / STAT_NAMES.length;
    var history = state.dailyHistory || [];
    history.push({ date: state.lastDayRecorded, score: avg });
    if (history.length > 14) history = history.slice(history.length - 14);
    state.dailyHistory = history;

    if (avg >= GOOD_DAY_THRESHOLD) {
      state.goodDayStreak = (state.goodDayStreak || 0) + 1;
      state.coins = (state.coins || 0) + GOOD_DAY_BONUS_COINS;
      showToast('🌟 Guter Tag! +' + GOOD_DAY_BONUS_COINS + ' Bonus-Coins! Streak: ' + state.goodDayStreak);
    } else {
      state.goodDayStreak = 0;
    }
  }

  state.lastDayRecorded = today;
  saveState();
  updateProgressUI();
}

function buyItem(id) {
  var owned = state.ownedItems || [];
  if (owned.indexOf(id) !== -1) {
    toggleItem(id);
    return;
  }
  var item = null;
  for (var i = 0; i < SHOP_ITEMS.length; i++) {
    if (SHOP_ITEMS[i].id === id) { item = SHOP_ITEMS[i]; break; }
  }
  if (!item) return;
  if ((state.coins || 0) < item.cost) {
    showToast('💸 Nicht genug Coins! (' + item.cost + ' benötigt)');
    return;
  }
  state.coins = (state.coins || 0) - item.cost;
  owned.push(id);
  state.ownedItems = owned;
  // Auto-equip on purchase
  var equipped = state.equippedItems || [];
  equipped.push(id);
  state.equippedItems = equipped;
  saveState();
  renderAccessories();
  updateProgressUI();
  renderShop();
  showToast('🎉 ' + item.name + ' gekauft und angelegt!');
}

function toggleItem(id) {
  var equipped = state.equippedItems || [];
  var idx = equipped.indexOf(id);
  if (idx !== -1) {
    equipped.splice(idx, 1);
  } else {
    equipped.push(id);
  }
  state.equippedItems = equipped;
  saveState();
  renderAccessories();
  renderShop();
}

function renderAccessories() {
  var equipped = state.equippedItems || [];
  document.querySelectorAll('.bruno-acc').forEach(function(el) {
    var acc = el.getAttribute('data-acc');
    el.style.display = equipped.indexOf(acc) !== -1 ? 'block' : 'none';
  });
}

function renderCalendar() {
  var dotsEl = $('calendarDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  var history = state.dailyHistory || [];
  // Build last 14 days array (oldest first)
  var slots = [];
  for (var i = 13; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    slots.push(d.toISOString().slice(0, 10));
  }
  slots.forEach(function(date) {
    var dot = document.createElement('div');
    dot.className = 'cal-dot';
    var entry = null;
    for (var j = 0; j < history.length; j++) {
      if (history[j].date === date) { entry = history[j]; break; }
    }
    if (!entry) {
      dot.classList.add('cal-empty');
    } else if (entry.score >= GOOD_DAY_THRESHOLD) {
      dot.classList.add('cal-good');
    } else if (entry.score >= 40) {
      dot.classList.add('cal-ok');
    } else {
      dot.classList.add('cal-bad');
    }
    dot.title = date + (entry ? ': ' + Math.round(entry.score) + '%' : '');
    dotsEl.appendChild(dot);
  });
}

function updateProgressUI() {
  // XP bar
  var xp    = state.xp    || 0;
  var stage = state.stage || 1;
  var xpBar = $('xpBar');
  if (xpBar) {
    var lo = STAGE_THRESHOLDS[stage - 1] || 0;
    var hi = STAGE_THRESHOLDS[stage] || STAGE_THRESHOLDS[STAGE_THRESHOLDS.length - 1] + 500;
    var pct = stage >= STAGE_THRESHOLDS.length ? 100 : Math.min(100, Math.round((xp - lo) / (hi - lo) * 100));
    xpBar.style.width = pct + '%';
  }

  var stageLabel = $('stageLabel');
  if (stageLabel) stageLabel.textContent = STAGE_NAMES[stage - 1] || STAGE_NAMES[0];

  var coinsDisplay = $('coinsDisplay');
  if (coinsDisplay) coinsDisplay.textContent = '💰 ' + (state.coins || 0);

  var streakDisplay = $('streakDisplay');
  if (streakDisplay) {
    var streak = state.goodDayStreak || 0;
    streakDisplay.textContent = streak > 0 ? '🔥 ' + streak + 'd Streak' : '';
  }

  // Shop coins bar
  var shopCoinsBar = $('shopCoinsBar');
  if (shopCoinsBar) shopCoinsBar.textContent = '💰 ' + (state.coins || 0) + ' Coins';

  // Apply stage class to brunoWrap
  if (brunoWrap) {
    for (var i = 1; i <= 5; i++) brunoWrap.classList.remove('stage-' + i);
    brunoWrap.classList.add('stage-' + stage);
  }

  renderCalendar();
  renderAccessories();
}

function openShop() {
  var modal = $('shopModal');
  if (modal) {
    renderShop();
    updateProgressUI();
    modal.classList.add('open');
  }
}

function closeShop() {
  var modal = $('shopModal');
  if (modal) modal.classList.remove('open');
}

function renderShop() {
  var list = $('shopList');
  if (!list) return;
  var owned    = state.ownedItems    || [];
  var equipped = state.equippedItems || [];
  var coins    = state.coins         || 0;

  list.innerHTML = '';
  SHOP_ITEMS.forEach(function(item) {
    var isOwned    = owned.indexOf(item.id) !== -1;
    var isEquipped = equipped.indexOf(item.id) !== -1;

    var div = document.createElement('div');
    div.className = 'shop-item' + (isEquipped ? ' equipped' : '');

    var nameSpan = document.createElement('span');
    nameSpan.className = 'shop-item-name';
    nameSpan.textContent = item.name;

    var btn = document.createElement('button');
    btn.className = 'shop-btn';

    if (isOwned && isEquipped) {
      btn.className += ' shop-btn--unequip';
      btn.textContent = 'Ablegen';
      btn.onclick = (function(id) { return function() { toggleItem(id); }; })(item.id);
    } else if (isOwned && !isEquipped) {
      btn.className += ' shop-btn--equip';
      btn.textContent = 'Anlegen';
      btn.onclick = (function(id) { return function() { toggleItem(id); }; })(item.id);
    } else if (coins >= item.cost) {
      btn.className += ' shop-btn--buy';
      btn.textContent = 'Kaufen ' + item.cost + ' 💰';
      btn.onclick = (function(id) { return function() { buyItem(id); }; })(item.id);
    } else {
      btn.className += ' shop-btn--locked';
      btn.textContent = item.cost + ' 💰';
      btn.disabled = true;
    }

    div.appendChild(nameSpan);
    div.appendChild(btn);
    list.appendChild(div);
  });
}
