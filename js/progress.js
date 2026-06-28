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
  applyStageClass(stage);
}

function recordDailyScore() {
  var today = getToday();
  if (state.lastDayRecorded === today) return;

  // Only record if there's a previous day (not first ever load)
  if (state.lastDayRecorded !== null) {
    var avg = statAvg();
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

// Activate/deactivate an already-owned item according to its type.
function applyItem(id, type) {
  if (type === 'background')   selectBackground(id);
  else if (type === 'palette') selectPalette(id);
  else                         toggleItem(id);
}

function buyItem(id) {
  var item = SHOP_BY_ID[id];
  if (!item) return;
  var owned = state.ownedItems || [];
  if (owned.indexOf(id) !== -1) { applyItem(id, item.type); return; }
  if ((state.coins || 0) < item.cost) {
    showToast('💸 Nicht genug Coins! (' + item.cost + ' benötigt)');
    return;
  }
  state.coins = (state.coins || 0) - item.cost;
  owned.push(id);
  state.ownedItems = owned;
  if (item.type === 'background') {
    state.activeBackground = id;
  } else if (item.type === 'palette') {
    state.activePalette = id;
  } else {
    var equipped = state.equippedItems || [];
    equipped.push(id);
    state.equippedItems = equipped;
  }
  saveState();
  renderAccessories();
  updateProgressUI();
  renderShop();
  showToast('🎉 ' + item.name + ' aktiviert!');
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

function selectBackground(id) {
  state.activeBackground = state.activeBackground === id ? null : id;
  saveState(); renderAccessories(); renderShop();
}

function selectPalette(id) {
  state.activePalette = state.activePalette === id ? null : id;
  saveState(); renderAccessories(); renderShop();
}

function renderAccessories() {
  var equipped = state.equippedItems || [];
  document.querySelectorAll('.bruno-acc').forEach(function(el) {
    var acc = el.getAttribute('data-acc');
    var show = equipped.indexOf(acc) !== -1;
    el.style.display = show ? 'block' : 'none';
    if (show) {
      var imgSrc = getItemImage(acc);
      if (imgSrc && !el.querySelector('img')) {
        el.innerHTML = '';
        var img = document.createElement('img');
        img.src = imgSrc;
        img.alt = '';
        img.style.cssText = 'width:28px;height:28px;object-fit:contain;display:block;';
        el.appendChild(img);
      }
    }
  });
  var petStage = $('petStage');
  if (petStage) {
    petStage.classList.remove('bg-forest', 'bg-sunset', 'bg-ocean', 'bg-candy');
    if (state.activeBackground) petStage.classList.add(state.activeBackground);
  }
  var wrap = $('brunoWrap');
  if (wrap) {
    wrap.classList.remove('palette-pink', 'palette-green', 'palette-gold', 'palette-dark');
    if (state.activePalette) wrap.classList.add(state.activePalette);
  }
}

function renderCalendar() {
  var dotsEl = $('calendarDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  var history = state.dailyHistory || [];
  var byDate = {};
  history.forEach(function(h) { byDate[h.date] = h; });
  // Build last 14 days (oldest first)
  for (var i = 13; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var date = d.toISOString().slice(0, 10);
    var dot = document.createElement('div');
    dot.className = 'cal-dot';
    var entry = byDate[date];
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
  }
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

  applyStageClass(stage);

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

  var CATS = [
    { type: 'accessory',  label: '🎭 Accessoires'  },
    { type: 'palette',    label: '🎨 Bruno-Farbe'   },
    { type: 'background', label: '🖼️ Bühnen-Thema' },
  ];

  CATS.forEach(function(cat) {
    var catItems = SHOP_ITEMS.filter(function(i) { return (i.type || 'accessory') === cat.type; });
    if (!catItems.length) return;

    var hdr = document.createElement('div');
    hdr.className = 'shop-cat-header';
    hdr.textContent = cat.label;
    list.appendChild(hdr);

    catItems.forEach(function(item) {
      var isOwned  = owned.indexOf(item.id) !== -1;
      var isActive = cat.type === 'background' ? state.activeBackground === item.id
                   : cat.type === 'palette'    ? state.activePalette    === item.id
                   : equipped.indexOf(item.id) !== -1;

      var div = document.createElement('div');
      div.className = 'shop-item' + (isActive ? ' equipped' : '');

      var nameSpan = document.createElement('span');
      nameSpan.className = 'shop-item-name';
      nameSpan.textContent = item.name;

      var btn = document.createElement('button');
      btn.className = 'shop-btn';

      if (isOwned) {
        if (isActive) {
          btn.className += ' shop-btn--unequip';
          btn.textContent = cat.type === 'accessory' ? 'Ablegen' : 'Aktiv ✓';
        } else {
          btn.className += ' shop-btn--equip';
          btn.textContent = cat.type === 'accessory' ? 'Anlegen' : 'Aktivieren';
        }
        btn.onclick = (function(id, t) { return function() { applyItem(id, t); }; })(item.id, cat.type);
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
  });
}
