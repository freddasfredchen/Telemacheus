const DECAY_RATE          = { water: 0.8, food: 0.6, exercise: 0.4 };
const REFILL_AMOUNT       = 35;
const TICK_INTERVAL       = 3000;
const PHOENIX_AGE_MINUTES = 120;
const HATCH_DELAY_MS      = 12000;
const DEFAULTS            = { water: 100, food: 100, exercise: 100, age: 0, generation: 1, isEgg: false };

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
  happy: [
    "Du bist die Beste, Lea! 🌈✨",
    "Ich bin so glücklich – kein Dramatik heute! 🎉",
    "Leben ist schön wenn man gut versorgt ist! 💖",
    "Danke für das Essen! Ich liebe dich! 🥰",
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
  ]
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
