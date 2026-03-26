// Game configuration and constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Color palette — drawn from the Hanuman graphic novel by Anant Swarup
// Warm oil-painting luminosity: golden ambers, cosmic indigos, forest dapple, sacred fire
export const COLORS = {
  // Primary divine golds (Hanuman's skin, divine light, ornaments)
  gold: 0xD4A843,
  warmGold: 0xC89B3C,
  brightGold: 0xFFD700,
  amber: 0xE8A832,

  // Cosmic/space (pages 4-5, 40 — deep indigo with star scatter)
  cosmic: 0x1A0A2E,
  cosmicMid: 0x2A1848,
  starWhite: 0xFFF8E7,

  // Sacred blue (Sri Ram's skin, ocean, twilight)
  divineBlue: 0x3A6EA5,
  ramBlue: 0x4477AA,
  oceanDeep: 0x1A3355,

  // Forest/nature (pages 14-16 — dappled golden-green)
  forestGreen: 0x2D5A27,
  forestCanopy: 0x3B6B30,
  forestLight: 0x7A9A44,

  // Fire/Lanka (page 28 — wall of flame)
  fireOrange: 0xE8731A,
  fireBright: 0xFF8C00,
  fireDeep: 0xCC4400,
  ember: 0x992200,

  // Dawn/dusk (page 1 cover — warm horizon glow)
  dawn: 0xFFB347,
  dusk: 0xCC7744,
  horizon: 0xFFCC88,

  // Sacred saffron (Hanuman's dhoti)
  saffron: 0xFF6600,
  saffronLight: 0xFF8833,

  // Darks
  darkLanka: 0x2A1A0A,
  shadow: 0x1A1008,
  black: 0x000000,
  white: 0xFFFFFF,

  // Lightning/vajra (page 6 — electric violet-white)
  lightning: 0xCCAAFF,
  lightningBright: 0xEEDDFF,
  vajraYellow: 0xFFFF44,
};

// Player settings
export const PLAYER = {
  speed: 200,
  flySpeed: -300,
  gravity: 600,
  maxFlyVelocity: -400,
  attackDuration: 300,
  health: 5,
  invincibleDuration: 1500,
};

// Chalisa couplets — narrative drawn from the graphic novel's storytelling
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
      devanagari: 'जग चारि जुग परताप तुम्हारा\nहै परसिद्ध जगत उजियारा',
      transliteration: 'Jag chari jug partap tumhara,\nhai parsiddh jagat ujiyara',
      english: 'Your glory fills the four ages,\nYour fame illumines the world',
      narrative: 'But Indra and the Gods protected the Sun.\nAnd Hanuman fell from the heavens.\nTo make amends, the Gods placed thunder in his hands...',
    },
  },
};
