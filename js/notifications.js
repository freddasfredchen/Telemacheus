const NOTIF_COOLDOWN_MS = 30 * 60 * 1000;
const NOTIF_CHECK_MS   = 60 * 1000;

let notifEnabled  = false;
let notifCooldowns = {};

function loadNotifSettings() {
  notifEnabled = localStorage.getItem('bruno_notif_enabled') === 'true';
  try {
    notifCooldowns = JSON.parse(localStorage.getItem('bruno_notif_cooldowns') || '{}');
  } catch(e) {
    notifCooldowns = {};
  }
}

function saveNotifSettings() {
  localStorage.setItem('bruno_notif_enabled', notifEnabled ? 'true' : 'false');
  localStorage.setItem('bruno_notif_cooldowns', JSON.stringify(notifCooldowns));
}

async function toggleNotifications() {
  if (notifEnabled) {
    notifEnabled = false;
    saveNotifSettings();
    updateNotifToggleUI();
    showToast('🔕 Benachrichtigungen ausgeschaltet');
    return;
  }

  if (!('Notification' in window)) {
    showToast('❌ Dein Browser unterstützt keine Benachrichtigungen');
    return;
  }

  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  if (perm !== 'granted') {
    showToast('❌ Benachrichtigungen wurden blockiert – bitte in den Browser-Einstellungen erlauben');
    return;
  }

  notifEnabled = true;
  saveNotifSettings();
  updateNotifToggleUI();
  showToast('🔔 Benachrichtigungen eingeschaltet!');
  new Notification('🐾 Bruno ist bereit!', {
    body: 'Ich werde dich erinnern, wenn du Selbstfürsorge brauchst, Lea! 💜',
    icon: './icons/icon.svg',
    tag:  'bruno-welcome'
  });
}

function sendNotif(title, body, tag) {
  if (!notifEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, { body, icon: './icons/icon.svg', tag, badge: './icons/icon.svg' });
    n.onclick = () => { window.focus(); n.close(); };
  } catch(e) {}
}

function checkAndNotify() {
  if (!notifEnabled || isEgg || phoenixPending) return;
  if (getTimePhase() === 'sleep') return;

  const now   = Date.now();
  const names = { water: 'Trinken', food: 'Essen', exercise: 'Bewegen', energy: 'Energie', social: 'Soziales', hygiene: 'Hygiene' };

  STAT_NAMES.forEach(stat => {
    if (now - (notifCooldowns[stat] || 0) < NOTIF_COOLDOWN_MS) return;

    const v = state[stat];
    if (v > 35) return;

    if (v <= 15) {
      sendNotif(`🚨 ${STAT_ICONS[stat]} ${names[stat]}: KRITISCH!`, rand(MESSAGES[stat].crit), `stat-${stat}`);
    } else {
      sendNotif(`⚠️ ${STAT_ICONS[stat]} ${names[stat]} wird niedrig`, rand(MESSAGES[stat].low), `stat-${stat}`);
    }
    notifCooldowns[stat] = now;
    saveNotifSettings();
  });
}

function updateNotifToggleUI() {
  const btn = $('notifToggleBtn');
  if (!btn) return;
  if (notifEnabled) {
    btn.textContent = '🔔';
    btn.title = 'Benachrichtigungen ausschalten';
    btn.classList.add('notif-on');
  } else {
    btn.textContent = '🔕';
    btn.title = 'Benachrichtigungen einschalten';
    btn.classList.remove('notif-on');
  }
}

function initNotifications() {
  loadNotifSettings();

  // If permission was revoked externally, reset state
  if (notifEnabled && ('Notification' in window) && Notification.permission !== 'granted') {
    notifEnabled = false;
    saveNotifSettings();
  }

  updateNotifToggleUI();
  setInterval(checkAndNotify, NOTIF_CHECK_MS);
}
