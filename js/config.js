const STAT_NAMES = ['water', 'food', 'exercise', 'energy', 'social', 'hygiene'];

const DEFAULTS = {
  water: 100, food: 100, exercise: 100,
  energy: 100, social: 80, hygiene: 100,
  age: 0, generation: 1, isEgg: false
};

const DECAY_RATE = {
  water: 0.8, food: 0.6, exercise: 0.4,
  energy: 0.5, social: 0.3, hygiene: 0.15
};

const REFILL_AMOUNT    = 35;
const TICK_INTERVAL    = 3000;
const PHOENIX_AGE_MINUTES = 120;
const HATCH_DELAY_MS   = 12000;

// Hours where the time phase changes (24h)
const PHASE_HOURS = [7, 9, 17, 20, 22];

// Per-stat decay multipliers per phase.
// Negative energy = energy recovers (night sleep).
const PHASE_MULTIPLIERS = {
  sleep:   { water: 0.05, food: 0.05, exercise: 0.2,  energy: -3.0, social: 0.05, hygiene: 0.02 },
  morning: { water: 2.0,  food: 2.0,  exercise: 1.0,  energy:  0.8, social: 0.6,  hygiene: 0.5  },
  day:     { water: 1.0,  food: 1.0,  exercise: 1.0,  energy:  0.7, social: 1.0,  hygiene: 1.0  },
  evening: { water: 1.0,  food: 1.0,  exercise: 0.8,  energy:  1.2, social: 2.0,  hygiene: 1.0  },
  tired:   { water: 0.8,  food: 0.8,  exercise: 0.5,  energy:  3.0, social: 0.8,  hygiene: 0.5  }
};

const MESSAGES = {
  water: {
    low: [
      "Ich sterbe gleich vor Durst... und du? 💀",
      "Wasser ist Leben. Wo. Ist. Das. Wasser.",
      "Mein Mund ist trockener als die Sahara 🏜️",
      "Bitte, Lea. Nur ein Schluck. Ich flehe dich an.",
      "Ich weine gerade – aber aus Mangel an Flüssigkeit.",
      "H₂O? Nie gehört in diesem Haushalt. 😤"
    ],
    crit: [
      "ICH VERDURSTE HIER!! NOTRUF! 🚨",
      "Letzte Worte: ...W...Was...ser...",
      "Lea. LEA. WASSER. BITTE. JETZT. 💀💧",
      "Mein Anwalt wird von dir hören. Verdursten ist illegal.",
      "404: Wasser nicht gefunden. Ich auch bald nicht mehr. 👻"
    ]
  },
  food: {
    low: [
      "Mein Magenknurren ist lauter als dein Wecker 🔔",
      "Ich hab Hunger und du bist hier einfach... nichts? 🥲",
      "Essen wäre schon geil jetzt, nur so als Idee.",
      "Der letzte Bissen war vor einer Ewigkeit. Bin ich ein Sklave?",
      "Ich muss jetzt an Essen denken, um nicht an Hunger zu denken.",
      "Lea, mein Magen und ich sind uns einig: DU BIST SCHULD. 😤"
    ],
    crit: [
      "ICH VERHUNGERE!! ESSEN JETZT!! 🍕🚨",
      "Sende Lebenszeichen... nein, doch nicht. Zu schwach.",
      "Die Rippen sehe ich schon durch das Fell. Ich hoffe das macht dir was.",
      "MAHLZEIT. Oder halt nicht. Weil keine. 😭",
      "Ich esse gleich die Möbel. Das steht auf deine Kaution."
    ]
  },
  exercise: {
    low: [
      "Ich bin rund wie ein Vollmond. Danke Lea. 🌕",
      "Meine Beine haben vergessen wie Laufen geht.",
      "Couch-Potato-Level: Meister. Schade eigentlich.",
      "Der Arzt sagt, ich soll mich bewegen. Du auch, nebenbei.",
      "Ich und Sport... wir sollten uns mal wieder treffen.",
      "Mein Fitnesslevel ist: Sofa. Stage 3. 🛋️😮‍💨"
    ],
    crit: [
      "HILFE ICH BIN EIN BLOB!! 🫠 Wir müssen reden.",
      "Ich rolle statt zu gehen. Das ist ein Hilferuf.",
      "Mein letztes Workout war... ich erinnere mich nicht. Zu lange her.",
      "Bewegungsmangel – die stille Katastrophe. Ich bin die Katastrophe.",
      "Mir ist warm und ich habe mich nicht bewegt. Das ist ein Zeichen. 🚩"
    ]
  },
  energy: {
    low: [
      "Ich bin so müde... war das ein Marathon? 😩",
      "Meine Akkuanzeige blinkt rot. Ich bin kein Witz. 🪫",
      "Yawn... sorry... ich... schlaf kurz... 😪",
      "Lea, ich brauch Schlaf oder Koffein. Beides. Sofort. 🛌",
      "Energie: critical. Bitte laden. Irgendwie. 😮‍💨"
    ],
    crit: [
      "ICH FALLE UM!! BETT. JETZT. 🪫💀",
      "Energie: 3%. Bitte nicht anreden. 😶",
      "Ich funktioniere auf Autopilot. Jemand zu Hause? Nein. 🤖",
      "Schlaf ist kein Luxus. Er ist NOTWENDIG. Hörst du das, Lea??",
      "System shutdown imminent... z... z... ZZZ... 💤"
    ]
  },
  social: {
    low: [
      "Lea, wann spielen wir mal wieder? 🥺",
      "Ich fühl mich so... allein. Das ist doch nicht nötig. 😢",
      "Soziale Interaktion: Wäre cool. Irgendwann. Bitte. 🙏",
      "Ich ruf die Einsamkeit-Hotline an. Die kennt mich schon.",
      "Ohne dich bin ich nur ein Pixel-Tier im Void. 💔"
    ],
    crit: [
      "ICH VEREINSAME HIER!! Ruf mich an!! 📞😭",
      "Das ist emotionale Vernachlässigung. Ich zeig dich an.",
      "PLAY WITH ME!!!! BITTE!!! 😭😭😭",
      "Einsamkeit-Level: Eremit auf einer Insel. Schäm dich.",
      "Lea. LEA. Ich bin noch hier. Hallo?? 👋💔"
    ]
  },
  hygiene: {
    low: [
      "Ich... rieche mich selbst. Das ist neu. 🤢",
      "Wann war mein letztes Bad? Ich erinnere mich nicht. Das sagt alles.",
      "Die Fliegen um mich sind kein gutes Zeichen. 🪰",
      "Meine Hygiene-Situation ist: suboptimal. Sagen wir mal so.",
      "Lea, ich brauche Seife. Und Würde. In dieser Reihenfolge. 🧼"
    ],
    crit: [
      "Lea. Ich bin eine Gefahr für die öffentliche Gesundheit. 🦠",
      "ICH BIN EIN BIOLOGISCHES RISIKO!! WASCHEN!! 🚨🧼",
      "Man riecht mich bevor man mich sieht. Das ist kein Flex.",
      "Biodiversität ist schön. Aber nicht in meinem Fell. 🦠😱",
      "Ich habe einen eigenen Geruch. Er hat einen Namen. Er ist schlimm."
    ]
  },
  happy: [
    "Du bist die Beste, Lea! 🌈✨",
    "Ich bin so glücklich – kein Dramatik heute! 🎉",
    "Leben ist schön wenn man gut versorgt ist! 💖",
    "Danke für alles! Ich liebe dich! 🥰",
    "Perfekte Pflege! 10/10 Würde mich wieder pflegen lassen.",
    "Bruno.exe läuft einwandfrei! 🟢",
    "Ich spring vor Freude! Wörtlich! Siehst du das?! 🐾"
  ],
  neutral: [
    "Hmm. Könnte besser sein. Könnte schlechter sein.",
    "Mir geht's... mittelmäßig. Also eigentlich typisch.",
    "Ich beobachte die Situation. Aufmerksam.",
    "Weder glücklich noch traurig. Sehr deutsch von mir.",
    "Durchschnitt ist auch ein Zustand. 🤷"
  ],
  phoenixWarn: [
    "Ich spüre etwas... Seltsames. Eine Hitze von innen. 🔥",
    "Mein Körper macht gerade Dinge. Große Dinge. 🌡️",
    "Ist es hier heiß oder bin ich das...? 🔥",
    "Ich höre epische Musik. Hörst du sie auch? 🎵🔥"
  ],
  phase: {
    sleep_enter: [
      "Gute Nacht, Lea... 💤 Träum was Schönes.",
      "Ich fall jetzt um. Gute Nacht. ZZZ 😴",
      "Schlafenszeit! Endlich. Ich bin so müde. 💤"
    ],
    sleep_zzz: [
      "zzz... 💤", "zzzZZZzzz... 😴", "...mmmh... Essen... zzz... 💤"
    ],
    morning_enter: [
      "Guten Morgen, Lea... brauche... Wasser... 🥱",
      "Wer hat mich geweckt?! Es ist doch noch NACHT. 😤☀️",
      "Morgens bin ich kein Mensch. Ich bin auch kein Mensch. Trotzdem. 😑"
    ],
    evening_enter: [
      "Endlich Feierabend! Lass uns was tun! 🎉",
      "Abendstimmung! High Energy Mode aktiviert! ⚡🌆",
      "Jetzt erst recht! Ich bin SO lebendig! 🕺"
    ],
    tired_enter: [
      "Ich werd müde... 😪 Noch ein bisschen...",
      "Bald Schlafenszeit... ich kämpfe dagegen an... 🌙",
      "Meine Augen fallen zu... zumindest innerlich... 😴"
    ]
  }
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
