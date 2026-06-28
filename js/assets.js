// Asset-Registry: Trage hier Pfade ein, sobald du eigene Grafiken erstellst.
// Die App nutzt solange Emoji-Fallbacks, bis ein Eintrag gesetzt ist.
//
// Beispiel nach dem Hinzufügen einer Grafik:
//   ITEM_IMAGES['hat'] = './assets/items/hat.png';
//   BRUNO_SKINS['default'] = './assets/bruno/default.png';
//   BG_IMAGES['bg-forest'] = './assets/backgrounds/bg-forest.png';
//
// Punk / Antifa Items — Platzhalter (auskommentieren & Pfad anpassen um eigene Grafik zu nutzen):
// ITEM_IMAGES['balaclava']      = './assets/items/balaclava.svg';
// ITEM_IMAGES['mohawk']         = './assets/items/mohawk.svg';
// ITEM_IMAGES['gas-mask']       = './assets/items/gas-mask.svg';
// ITEM_IMAGES['bandana']        = './assets/items/bandana.svg';
// ITEM_IMAGES['anarchy-pin']    = './assets/items/anarchy-pin.svg';
// ITEM_IMAGES['spike-collar']   = './assets/items/spike-collar.svg';
// ITEM_IMAGES['black-hoodie']   = './assets/items/black-hoodie.svg';
// ITEM_IMAGES['chain-belt']     = './assets/items/chain-belt.svg';
// ITEM_IMAGES['safety-pins']    = './assets/items/safety-pins.svg';
// ITEM_IMAGES['spray-can']      = './assets/items/spray-can.svg';
// ITEM_IMAGES['brass-knuckles'] = './assets/items/brass-knuckles.svg';
// ITEM_IMAGES['black-flag']     = './assets/items/black-flag.svg';

// Bruno-Sprites — 4 Zustände (auskommentieren & Pfad anpassen zum Aktivieren):
// BRUNO_SKINS['idle']   = './assets/bruno/idle.png';    // Stehen / Atmen / Neutral / Schlafen
// BRUNO_SKINS['happy']  = './assets/bruno/happy.png';   // Freude / Hochspringen
// BRUNO_SKINS['walk-r'] = './assets/bruno/walk-r.png';  // Mission: läuft nach rechts
// BRUNO_SKINS['walk-l'] = './assets/bruno/walk-l.png';  // Rückkehr: läuft nach links (optional — walk-r wird automatisch gespiegelt wenn nicht gesetzt)

var ITEM_IMAGES  = {};  // Shop-Item-ID → Bildpfad (ersetzt Emoji-Label)
var BRUNO_SKINS  = {};  // Skin-Key → Bildpfad (ersetzt CSS-Bruno)
var BG_IMAGES    = {};  // Background-ID → Bildpfad (ersetzt CSS-Gradient)

function getItemImage(id)  { return ITEM_IMAGES[id]  || null; }
function getBrunoSkin(id)  { return BRUNO_SKINS[id]  || null; }
function getBgImage(id)    { return BG_IMAGES[id]    || null; }
