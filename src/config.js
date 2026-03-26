// Game configuration and constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Color palette — drawn from the Hanuman graphic novel by Anant Swarup
export const COLORS = {
  // Primary divine golds
  gold: 0xD4A843,
  warmGold: 0xC89B3C,
  brightGold: 0xFFD700,
  amber: 0xE8A832,

  // Cosmic/space
  cosmic: 0x1A0A2E,
  cosmicMid: 0x2A1848,
  starWhite: 0xFFF8E7,

  // Sacred blue
  divineBlue: 0x3A6EA5,
  ramBlue: 0x4477AA,
  oceanDeep: 0x1A3355,

  // Forest/nature
  forestGreen: 0x2D5A27,
  forestCanopy: 0x3B6B30,
  forestLight: 0x7A9A44,

  // Fire/Lanka
  fireOrange: 0xE8731A,
  fireBright: 0xFF8C00,
  fireDeep: 0xCC4400,
  ember: 0x992200,

  // Dawn/dusk
  dawn: 0xFFB347,
  dusk: 0xCC7744,
  horizon: 0xFFCC88,

  // Sacred saffron
  saffron: 0xFF6600,
  saffronLight: 0xFF8833,

  // Darks
  darkLanka: 0x2A1A0A,
  shadow: 0x1A1008,
  black: 0x000000,
  white: 0xFFFFFF,

  // Lightning/vajra
  lightning: 0xCCAAFF,
  lightningBright: 0xEEDDFF,
  vajraYellow: 0xFFFF44,
};

// Player settings
export const PLAYER = {
  speed: 240,
  flySpeed: -380,
  gravity: 200, // gentle gravity (divine monkey floats)
  fullGravity: 600, // for grounded acts
  maxFlyVelocity: -380,
  attackDuration: 250,
  health: 5,
  invincibleDuration: 2000,
};

// Chalisa couplets — all verses for all acts
export const CHALISA = {
  act1: {
    intro: {
      devanagari: 'बल समय रवि भक्षि लियो\nताहि मधुर फल जानी',
      transliteration: 'Bal samay ravi bhakshi liyo,\ntahi madhur phal jani',
      english: 'In childhood, He swallowed the sun,\nthinking it a sweet fruit',
      narrative: 'Born to Anjani and Kesari, blessed by Pawan, Lord of the Wind.\nTo him, the sun was a sweet fruit.\nAnd so, the child leapt into the sky...',
    },
    level2: {
      devanagari: 'जुग सहस्र जोजन पर भानू\nलील्यो ताहि मधुर फल जानू',
      transliteration: 'Jug sahastra jojan par bhanu,\nleelyo tahi madhur phal janu',
      english: 'The sun, thousands of leagues away,\nHe swallowed thinking it a sweet fruit',
      narrative: 'Higher and higher, past the clouds, past the birds,\ninto the realm of the celestials.\nThe child flew on, innocent and fearless...',
    },
    boss: {
      devanagari: 'भूत पिसाच निकट नहिं आवै\nमहाबीर जब नाम सुनावै',
      transliteration: 'Bhoot pisach nikat nahi aave,\nmahabir jab nam sunave',
      english: 'No ghost or demon dares approach\nwhen great Hanuman\'s name is spoken',
      narrative: 'Indra, king of gods, hurled his thunderbolt at the child...',
    },
  },
  act2: {
    intro: {
      devanagari: 'विद्यावान गुनी अति चातुर\nराम काज करिबे को आतुर',
      transliteration: 'Vidyavan guni ati chatur,\nRam kaj karibe ko aatur',
      english: 'Full of wisdom, virtue and wit,\never eager to serve Sri Ram',
      narrative: 'In the sacred forest, young Hanuman learned at the feet of the sages...',
    },
    level2: {
      devanagari: 'सूक्ष्म रूप धरि सियहिं दिखावा\nविकट रूप धरि लंक जरावा',
      transliteration: 'Suksham roop dhari Siyahi dikhava,\nbikat roop dhari Lank jarava',
      english: 'In tiny form he appeared to Sita,\nin terrible form he burned Lanka',
      narrative: 'The rishis tested his patience, his courage, his heart...',
    },
    boss: {
      devanagari: 'रघुपति कीन्हीं बहुत बड़ाई\nतुम मम प्रिय भरतहि सम भाई',
      transliteration: 'Raghupati kinhi bahut badai,\ntum mama priya Bharat-hi sam bhai',
      english: 'Ram praised him greatly:\nYou are dear to me as my brother Bharat',
      narrative: 'Looking into the Lord\'s eyes, the curse was shattered...',
    },
  },
  act3: {
    intro: {
      devanagari: 'प्रभु मुद्रिका मेलि मुख माहीं\nजलधि लांघि गये अचरज नाहीं',
      transliteration: 'Prabhu mudrika meli mukh mahee,\njaladhi langhi gaye achraj nahee',
      english: 'Placing the Lord\'s ring in his mouth,\ncrossing the ocean was no surprise',
      narrative: 'To find Ma Sita, he stepped into the unknown...',
    },
    level2: {
      devanagari: 'दुर्गम काज जगत के जेते\nसुगम अनुग्रह तुम्हरे तेते',
      transliteration: 'Durgam kaj jagat ke jete,\nsugam anugrah tumhre tete',
      english: 'All impossible tasks of the world\nbecome easy with your grace',
      narrative: 'Surasa and Simhika — guardians of the ocean path...',
    },
    boss: {
      devanagari: 'लंक कोट समुद्र सी खाई\nजात पवनसुत बार न लाई',
      transliteration: 'Lanka kot samudra si khai,\njaat Pawansut baar na lai',
      english: 'Lanka\'s fortress surrounded by ocean moat,\nSon of Wind crossed without delay',
      narrative: 'At the gates of Lanka, the guardian Lankini stood watch...',
    },
  },
  act4: {
    intro: {
      devanagari: 'सूक्ष्म रूप धरि सियहिं दिखावा\nविकट रूप धरि लंक जरावा',
      transliteration: 'Suksham roop dhari Siyahi dikhava,\nbikat roop dhari Lank jarava',
      english: 'In tiny form he appeared to Sita,\nin terrible form he burned Lanka',
      narrative: 'In the presence of truth, illusion dissolved — and Lanka burned.',
    },
    level2: {
      devanagari: 'राम दुआरे तुम रखवारे\nहोत न आज्ञा बिन पैसारे',
      transliteration: 'Ram dware tum rakhvare,\nhot na agya bin paisare',
      english: 'You are the guardian at Ram\'s door,\nnone may enter without your leave',
      narrative: 'The flames of Lanka — righteous fury unleashed...',
    },
  },
  act5: {
    intro: {
      devanagari: 'भीम रूप धरि असुर संहारे\nरामचन्द्र के काज सँवारे',
      transliteration: 'Bhima roop dhari asur sanghare,\nRamchandra ke kaj sanvare',
      english: 'Taking fierce form he destroyed the demons,\ncompleting Ram\'s mission',
      narrative: 'One warrior, with the strength of a million...',
    },
    sanjeevani: {
      devanagari: 'लाये सञ्जीवन लखन जियाये\nश्री रघुबीर हरषि उर लाये',
      transliteration: 'Laye Sanjivan Lakhan jiyaye,\nShri Raghubir harashi ur laye',
      english: 'He brought Sanjeevani and revived Lakshmana,\nRam embraced him with joy',
      narrative: 'When hope was fading, he carried a mountain to bring back life.',
    },
    boss: {
      devanagari: 'नासै रोग हरै सब पीरा\nजपत निरन्तर हनुमत बीरा',
      transliteration: 'Nasai rog harai sab peera,\njapat nirantar Hanumat beera',
      english: 'All illness and pain are destroyed\nby constant remembrance of brave Hanuman',
      narrative: 'In the depths of the underworld, Ahiravana\'s dark magic awaited...',
    },
  },
  victory: {
    devanagari: 'जय जय जय हनुमान गोसाईं\nकृपा करहु गुरुदेव की नाईं',
    transliteration: 'Jai Jai Jai Hanuman Gosai,\nkripa karahu guru dev ki nai',
    english: 'Glory, glory, glory to Lord Hanuman!\nBestow grace as our divine guru',
    narrative: 'Boundless as the sky, empty of all self, full of Sri Ram.',
  },
  epilogue: {
    devanagari: 'पवनतनय संकट हरन\nमंगल मूरति रूप',
    transliteration: 'Pavan tanay sankat haran,\nMangal murti roop',
    english: 'Son of the Wind, destroyer of sorrow,\nembodiment of auspiciousness',
    narrative: 'And so the story lives on, in every heart that calls his name.',
  },
  death: {
    transliteration: 'Sankat se Hanuman chhudave,\nman kram bachan dhyan jo lave',
    english: 'Hanuman rescues from all troubles\nthose who remember him',
    narrative: 'Rise again, devotee. The path continues.',
  },
};

// Parallax layer definitions
export const PARALLAX_LAYERS = [
  { key: 'bg-sky-dawn', scrollFactor: 0.0, depth: -100 },
  { key: 'bg-sky-cosmic', scrollFactor: 0.0, depth: -99 },
  { key: 'bg-mountains-far', scrollFactor: 0.1, depth: -80 },
  { key: 'bg-mountains-near', scrollFactor: 0.2, depth: -70 },
  { key: 'bg-clouds-far', scrollFactor: 0.3, depth: -60 },
  { key: 'bg-clouds-near', scrollFactor: 0.5, depth: -50 },
  // gameplay layer (depth 0)
  { key: 'bg-foreground-leaves', scrollFactor: 1.2, depth: 50 },
];
