const STAT_NAMES = ['water', 'food', 'exercise', 'energy', 'social', 'hygiene'];

const XP_PER_ACTION   = { water: 8, food: 10, exercise: 15, social: 8, hygiene: 8 };
const COIN_PER_ACTION = { water: 5, food:  6, exercise: 10, social: 5, hygiene: 5 };
const GOOD_DAY_THRESHOLD   = 65; // avg% to count as a good day
const GOOD_DAY_BONUS_COINS = 20;
const STAGE_THRESHOLDS = [0, 150, 400, 800, 1500]; // XP for stages 1–5
const STAGE_NAMES = ['Baby 🐣', 'Teen 🐾', 'Erwachsen 💪', 'Fit ⚡', 'Legende 👑'];
const SHOP_ITEMS = [
  // Accessoires
  { id: 'hat',        name: '🎩 Schicker Hut',    cost: 50,  type: 'accessory', desc: 'Für das gewisse Etwas' },
  { id: 'sunglasses', name: '😎 Sonnenbrille',     cost: 75,  type: 'accessory', desc: 'Cool bleiben' },
  { id: 'flower',     name: '🌸 Blume',            cost: 30,  type: 'accessory', desc: 'Immer Frühling' },
  { id: 'bow',        name: '🎀 Schleife',         cost: 45,  type: 'accessory', desc: 'Süß und stylish' },
  { id: 'star',       name: '⭐ Stern',            cost: 40,  type: 'accessory', desc: 'Ein Star wie Lea' },
  { id: 'lightning',  name: '⚡ Energie-Aura',     cost: 100, type: 'accessory', desc: 'Für echte Power-Leas' },
  { id: 'butterfly',  name: '🦋 Schmetterling',    cost: 80,  type: 'accessory', desc: 'Leicht und frei' },
  { id: 'guitar',     name: '🎸 Gitarre',          cost: 90,  type: 'accessory', desc: 'Rock on, Bruno!' },
  { id: 'umbrella',   name: '🌂 Regenschirm',      cost: 60,  type: 'accessory', desc: 'Immer bereit!' },
  { id: 'crown',      name: '👑 Krone',            cost: 200, type: 'accessory', desc: 'Nur für Legenden' },
  // Punk / Kriminell
  { id: 'balaclava',      name: '🥷 Sturmhaube',         cost: 120, type: 'accessory', desc: 'Für anonyme Aktionen' },
  { id: 'mohawk',         name: '🦔 Irokese',             cost: 100, type: 'accessory', desc: 'Anti-Establishment-Frisur' },
  { id: 'gas-mask',       name: '😷 Gasmaske',            cost: 150, type: 'accessory', desc: 'Schutz bei Demos' },
  { id: 'bandana',        name: '🧣 Gesichtstuch',        cost:  70, type: 'accessory', desc: 'Kein Gesicht zeigen' },
  { id: 'anarchy-pin',    name: 'Ⓐ Anarchie-Pin',        cost:  60, type: 'accessory', desc: 'Kleines Statement' },
  { id: 'spike-collar',   name: '🔗 Stachelhalsband',    cost:  80, type: 'accessory', desc: 'Hart wie Stahl' },
  { id: 'black-hoodie',   name: '🖤 Schwarzer Hoodie',   cost: 130, type: 'accessory', desc: 'Klassisch schwarz' },
  { id: 'chain-belt',     name: '⛓️ Kettengürtel',       cost:  85, type: 'accessory', desc: 'Metal-Core-Style' },
  { id: 'safety-pins',    name: '📌 Sicherheitsnadeln',  cost:  50, type: 'accessory', desc: 'Punk-Bastelarbeit' },
  { id: 'spray-can',      name: '🎨 Sprühdose',          cost:  90, type: 'accessory', desc: 'Kunst für alle Wände' },
  { id: 'brass-knuckles', name: '🤜 Schlagring',         cost: 110, type: 'accessory', desc: 'Wenn Worte nicht reichen' },
  { id: 'black-flag',     name: '🏴 Schwarze Flagge',    cost:  75, type: 'accessory', desc: 'Keine Götter, keine Herren' },
  // Bruno-Farben
  { id: 'palette-pink',  name: '🩷 Rosa Ratte',   cost: 80,  type: 'palette',    desc: 'Knalliges Pink' },
  { id: 'palette-green', name: '💚 Grüne Ratte',  cost: 80,  type: 'palette',    desc: 'Frisches Grün' },
  { id: 'palette-gold',  name: '✨ Gold Ratte',    cost: 120, type: 'palette',    desc: 'Edel und golden' },
  { id: 'palette-dark',  name: '🖤 Dunkle Ratte', cost: 100, type: 'palette',    desc: 'Mysteriös dunkel' },
  // Bühnen-Themen
  { id: 'bg-forest', name: '🌲 Wald',             cost: 75,  type: 'background', desc: 'Tiefgrüner Wald' },
  { id: 'bg-sunset', name: '🌅 Sonnenuntergang',  cost: 75,  type: 'background', desc: 'Warme Abendfarben' },
  { id: 'bg-ocean',  name: '🌊 Ozean',            cost: 80,  type: 'background', desc: 'Tief und ruhig' },
  { id: 'bg-candy',  name: '🍬 Candy',            cost: 85,  type: 'background', desc: 'Pink und süß' },
];

const DEFAULTS = {
  water: 100, food: 100, exercise: 100,
  energy: 100, social: 80, hygiene: 100,
  age: 0, generation: 1, isEgg: false,
  xp: 0, coins: 0, stage: 1, goodDayStreak: 0,
  lastDayRecorded: null, dailyHistory: [],
  ownedItems: [], equippedItems: [],
  activeBackground: null, activePalette: null,
  dailyChallenges: [], lastChallengeDate: null, dailyActionCounts: {},
  lastSpinDate: null
};

const DECAY_RATE = {
  water: 0.8, food: 0.6, exercise: 0.4,
  energy: 0.5, social: 0.3, hygiene: 0.15
};

const REFILL_AMOUNT    = 35;
const TICK_INTERVAL    = 3000;
const PHOENIX_AGE_MINUTES = 120;
const HATCH_DELAY_MS   = 12000;

const PHASE_HOURS = [7, 9, 17, 20, 22];

const PHASE_MULTIPLIERS = {
  sleep:   { water: 0.05, food: 0.05, exercise: 0.2,  energy: -3.0, social: 0.05, hygiene: 0.02 },
  morning: { water: 2.0,  food: 2.0,  exercise: 1.0,  energy:  0.8, social: 0.6,  hygiene: 0.5  },
  day:     { water: 1.0,  food: 1.0,  exercise: 1.0,  energy:  0.7, social: 1.0,  hygiene: 1.0  },
  evening: { water: 1.0,  food: 1.0,  exercise: 0.8,  energy:  1.2, social: 2.0,  hygiene: 1.0  },
  tired:   { water: 0.8,  food: 0.8,  exercise: 0.5,  energy:  3.0, social: 0.8,  hygiene: 0.5  }
};

// All messages address Lea directly — Bruno is her health coach, not a pet to be fed.
const MESSAGES = {
  water: {
    low: [
      "Lea! Wann hast du zuletzt Wasser getrunken? Jetzt wäre perfekt! 💧",
      "Ein Glas Wasser – nicht für mich, für DICH. Jetzt. 💧",
      "Pro-Tipp: Wasser existiert. Du solltest es trinken. 💧",
      "Lea, dein Körper ist zu 60% Wasser. Dieser Anteil sinkt gerade. 🏜️",
      "Nicht durstig? Trink trotzdem! Das Durstgefühl kommt immer zu spät! 💧",
      "Ich gucke dich an, Lea. Wo ist dein Wasserglas? 👀💧"
    ],
    crit: [
      "NOTFALL! LEA TRINKT KEIN WASSER!! Sofort ein Glas! 🚨💧",
      "Lea! Das ist die rote Karte! TRINKEN! JETZT! 🚨",
      "HYDRATION: KRITISCH. EINHEIT LEA: HANDLUNG ERFORDERLICH. 🤖🚨",
      "Lea. Wasser. Mund. Los. Keine Widerrede. 💧🚨",
      "Letzter Aufruf vor dem Kopfschmerz! TRINK! 💀💧"
    ]
  },
  food: {
    low: [
      "Lea! Wann hast du zuletzt richtig gegessen? 🥗⏰",
      "Ein Snack zählt auch. Irgendwas. Bitte. 🥜",
      "Dein Blutzucker und ich grüßen dich. Iss was! 🥗",
      "Lunch-Check: Erledigt? Nein? Dann jetzt. 🥗",
      "Essen ist kein Hobby, Lea. Es ist Pflichtprogramm! 🍽️",
      "Hast du heute Mittag gegessen? Ich frage weil ich mir Sorgen mache. 😟"
    ],
    crit: [
      "MAHLZEIT! ODER HALT NICHT! LEA ISS ENDLICH!! 🍽️🚨",
      "Lea. Dein Körper ruft an. Er möchte Kalorien. Rückruf dringend! 📞🥗",
      "ERNÄHRUNGS-ALARM! SOFORTMASSNAHME: ESSEN. 🚨🍕",
      "Hast du heute schon gegessen? Wenn nein: JETZT. Wenn ja: Gut, aber nochmal! 🥗",
      "Ich bin dein Gewissen. Und dein Gewissen sagt: ISS. 🚨"
    ]
  },
  exercise: {
    low: [
      "Lea, wann warst du heute draußen? Kurze Runde? 5 Minuten? 🚶‍♀️",
      "10 Minuten Spaziergang zählen! Du musst kein Marathon laufen. 🌳",
      "Aufstehen, Lea! Dein Rücken dankt dir für jeden Schritt! 🏃",
      "Kurz strecken, kurz atmen, kurz bewegen. Das ist alles. 🤸",
      "Sitzen ist das neue Rauchen. Ich sage nur. 🪑😬",
      "Lea, steh kurz auf und streck dich. Das ist alles was ich verlange. 💙"
    ],
    crit: [
      "LEA! BITTE BEWEGE DICH! Auch Hausarbeit zählt! 🏃🚨",
      "Du sitzt seit... zu lange. AUFSTEHEN! Das ist kein Vorschlag! 🚨",
      "10-Sekunden-Challenge: Aufstehen. Gehen. Irgendwohin. Los! 🦵🚨",
      "Lea, deine Beine heißen 'Beine' und nicht 'Sitzmöbel'. Nutz sie! 🦵",
      "BEWEGUNGSNOTFALL! Steh jetzt auf während du das liest! 🚨🏃"
    ]
  },
  energy: {
    low: [
      "Lea, du wirkst müde. Schlaf heute früher! Dein Körper braucht das. 😴",
      "Müde? Vielleicht schon um 22 Uhr ins Bett heute? 🌙",
      "Koffein ersetzt keinen Schlaf, Lea. Das ist leider Fakt. ☕→😴",
      "Lea, gönne dir heute früh Bett. Alles andere kann warten. 💤",
      "Weniger Handy-Scrollen, mehr Schlafen. Heute Abend. 📵😴"
    ],
    crit: [
      "LEA! BETT! JETZT! Das ist kein Witz mehr! 🛌🚨",
      "Du bist nicht müde weil du schwach bist – du schläfst zu wenig! Jetzt ins Bett! 😤",
      "Schlafmangel ist gefährlich, Lea. Bildschirm aus, Augen zu! 🚨💤",
      "Alles kann warten. Der Schlaf nicht. JETZT ins Bett! 🛌",
      "Lea. Es. Ist. Genug. Schlafen. Jetzt. 🛌🚨"
    ]
  },
  social: {
    low: [
      "Lea, hast du heute schon jemanden gesehen oder geschrieben? 💬",
      "Eine kurze Nachricht an eine Freundin macht beide glücklicher. 💌",
      "Hey, wann hast du zuletzt mit jemandem gelacht? Das wäre jetzt fällig! 😄",
      "Menschenkontakt ist Medizin, Lea! Ein Anruf reicht! 💊👥",
      "Soziale Verbindungen sind so wichtig! Wer fehlt dir gerade? 💙"
    ],
    crit: [
      "LEA! Ruf jetzt jemanden an! Das ist Ernst! 📞🚨",
      "Soziale Isolation schadet wirklich, Lea! Schreib jetzt einer Freundin! 💔📱",
      "Ich bin nur eine Pixel-Ratte. Du brauchst echte Menschen. JETZT anrufen! 🐀→👥",
      "SOZIALER NOTFALL: Handy nehmen, Kontakt wählen, sprechen. LOS! 🚨",
      "Lea, echte Menschen sind wichtiger als ich. Geh zu ihnen! 📞💬"
    ]
  },
  hygiene: {
    low: [
      "Lea, wäre heute ein guter Tag für eine Dusche? Ich frage für einen Freund. 🚿",
      "Selbstfürsorge-Tipp: Duschen macht wirklich happy. Wann zuletzt? 🧼",
      "Frisch geduscht zu sein ist unterschätzt. Heute wäre eine gute Idee. 🚿✨",
      "Lea... you know what to do. 🧼😶",
      "Hygiene = Selbstrespekt. Und du verdienst Respekt! 🧼💙"
    ],
    crit: [
      "LEA! DUSCHE! Das ist jetzt wirklich überfällig! 🚿🚨",
      "Wann. War. Die. Letzte. Dusche. Ich frage ernsthaft. 🚿😬",
      "HYGIENECHECK: ROT! Sofortmaßnahme: Badezimmer aufsuchen! 🚨🧼",
      "Lea, du weißt was zu tun ist. Tu es. Jetzt. Kein 'gleich'. 🚿",
      "Das Badezimmer vermisst dich. Es hat mir erzählt. 🚿💔"
    ]
  },
  happy: [
    "Lea, du kümmerst dich heute super um dich selbst! 🌟",
    "Alles gecheckt! Du rockst das! Weiter so! 💪✨",
    "Hydratisiert, satt, bewegt – Lea im Hochleistungsmodus! 🚀",
    "So macht Selbstfürsorge Spaß! Ich bin stolz auf dich! 🏆",
    "Heute kein Stress von mir! Du hast alles im Griff! 🎉",
    "Lea: 10/10. Würde wieder erinnern. 🌟",
    "Siehst du? Wenn du auf dich achtest, bin ich auch happy! 💜🐾"
  ],
  neutral: [
    "Läuft so mittelprächtig. Da geht aber noch mehr, Lea! 🤷",
    "Ich lass dich kurz in Ruhe. Aber nur kurz. 👀",
    "Status: Ausbaufähig. Aber ich glaube an dich! 🐾",
    "Nicht schlecht, nicht gut. Lea, da geht noch was! 💡",
    "Ich beobachte. Unauffällig. Total unauffällig. 👀"
  ],
  phoenixWarn: [
    "Lea... ich spür dass du dich gerade gar nicht um dich kümmerst. 🔥",
    "Das ist ein Zeichen, Lea. Zeit für einen Neustart! 🌡️🔥",
    "Etwas Großes passiert gleich... ein Weckruf! 🎵🔥",
    "Ich verwandle mich – damit DU dich auch veränderst, Lea! 🔥"
  ],
  phase: {
    sleep_enter: [
      "Gute Nacht, Lea! Hast du heute gut auf dich geachtet? 💤",
      "Schlafenszeit! Leg das Handy weg und ruh dich aus. 😴💤",
      "Gute Nacht! Schlaf ist die beste Selbstfürsorge. 💙💤"
    ],
    sleep_zzz: [
      "shhh... Lea schläft... 💤",
      "Energieladen läuft... zzz... ⚡💤",
      "Traumzeit... 🌙💤"
    ],
    morning_enter: [
      "Guten Morgen, Lea! Erst mal ein großes Glas Wasser! ☀️💧",
      "Morgen! Frühstück nicht vergessen, Lea! Es ist der wichtigste Start! 🥞",
      "Aufgestanden! Jetzt Wasser trinken, Lea – bevor der Tag losgeht! ☀️"
    ],
    evening_enter: [
      "Feierabend! Was brauchst du heute Abend, Lea? 🌆",
      "Abends ist die beste Zeit für soziale Verbindungen! Wer fehlt dir? 💬🌆",
      "Entspannungszeit! Aber vergiss nicht, genug zu trinken! 🌆💧"
    ],
    tired_enter: [
      "Lea, es wird Zeit, langsam runterzukommen. Schlafvorbereitung starten! 🌙",
      "Noch ein bis zwei Stunden – dann bitte ins Bett, Lea! 😪",
      "Müde? Gut! Das heißt: Jetzt wirklich ins Bett gleich. 🌙"
    ]
  }
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
