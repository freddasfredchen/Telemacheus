// Asset-Registry: Trage hier Pfade ein, sobald du eigene Grafiken erstellst.
// Die App nutzt solange Emoji-Fallbacks, bis ein Eintrag gesetzt ist.
//
// Beispiel nach dem Hinzufügen einer Grafik:
//   ITEM_IMAGES['hat'] = './assets/items/hat.png';
//   BRUNO_SKINS['default'] = './assets/bruno/default.png';
//   BG_IMAGES['bg-forest'] = './assets/backgrounds/bg-forest.png';

var ITEM_IMAGES  = {};  // Shop-Item-ID → Bildpfad (ersetzt Emoji-Label)
var BRUNO_SKINS  = {};  // Palette-ID oder 'default' → Bildpfad (ersetzt CSS-Bruno)
var BG_IMAGES    = {};  // Background-ID → Bildpfad (ersetzt CSS-Gradient)

function getItemImage(id)  { return ITEM_IMAGES[id]  || null; }
function getBrunoSkin(id)  { return BRUNO_SKINS[id]  || null; }
function getBgImage(id)    { return BG_IMAGES[id]    || null; }
