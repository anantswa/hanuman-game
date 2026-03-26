// SiddhiSystem.js — Divine powers from the Hanuman Chalisa
// Each of the 8 Siddhis maps to a gameplay ability unlocked per act
// The Chalisa verse explains the power — making scripture mechanically meaningful

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Phaser from 'phaser';

// The 8 Siddhis (divine powers) + their gameplay mappings
const SIDDHIS = {
  laghima: {
    name: 'Laghima',
    sanskrit: 'लघिमा',
    title: 'Weightlessness',
    act: 1,
    description: 'Divine flight — the core mechanic',
    mechanic: 'Hold UP to fly. Half-gravity at apex for divine weightlessness.',
    verse: 'अष्ट सिद्धि नौ निधि के दाता\nAs-var deen Janki Mata',
    verseEnglish: 'Granter of the eight siddhis and nine treasures',
    key: null, // Always active from Act 1
    icon: '🕊️',
  },
  anima: {
    name: 'Anima',
    sanskrit: 'अणिमा',
    title: 'Shrinking',
    act: 3,
    description: 'Shrink to tiny size — used for Surasa boss puzzle',
    mechanic: 'Press DOWN while flying to shrink. Smaller hitbox, enter small spaces.',
    verse: 'सूक्ष्म रूप धरि सियहिं दिखावा',
    verseEnglish: 'In tiny form He appeared before Sita',
    key: 'DOWN',
    icon: '🔬',
  },
  prapti: {
    name: 'Prapti',
    sanskrit: 'प्राप्ति',
    title: 'Reach',
    act: 3,
    description: 'Extended mace range during ocean crossing',
    mechanic: 'Mace attack range increased 1.5x.',
    verse: 'दुर्गम काज जगत के जेते',
    verseEnglish: 'All impossible tasks become easy with your grace',
    key: null, // Passive
    icon: '🏏',
  },
  prakamya: {
    name: 'Prakamya',
    sanskrit: 'प्राकाम्य',
    title: 'Irresistible Will',
    act: 4,
    description: 'Break through barriers in Lanka',
    mechanic: 'Dash can break through destructible walls.',
    verse: 'लंक कोट समुद्र सी खाई',
    verseEnglish: 'Lanka\'s fortress, its ocean moat — none could stop Him',
    key: 'SHIFT',
    icon: '💥',
  },
  vasitva: {
    name: 'Vasitva',
    sanskrit: 'वशित्व',
    title: 'Control',
    act: 4,
    description: 'Tail fire control in Lanka',
    mechanic: 'Tail fire damages enemies on contact. Toggle with V.',
    verse: 'विकट रूप धरि लंक जरावा',
    verseEnglish: 'In terrible form He burned Lanka',
    key: 'V',
    icon: '🔥',
  },
  mahima: {
    name: 'Mahima',
    sanskrit: 'महिमा',
    title: 'Growth',
    act: 5,
    description: 'Grow to giant Bhima Roop',
    mechanic: 'Devotion meter full = grow 3x size. More damage, wider mace.',
    verse: 'भीम रूप धरि असुर संहारे',
    verseEnglish: 'Taking fierce form He destroyed the demons',
    key: 'Q',
    icon: '⚡',
  },
  garima: {
    name: 'Garima',
    sanskrit: 'गरिमा',
    title: 'Weight',
    act: 5,
    description: 'Ground pound attack',
    mechanic: 'Press DOWN while airborne = devastating ground slam.',
    verse: 'रामचन्द्र के काज सँवारे',
    verseEnglish: 'Completing the mission of Lord Ram',
    key: 'DOWN (airborne)',
    icon: '🪨',
  },
  isitva: {
    name: 'Isitva',
    sanskrit: 'ईशित्व',
    title: 'Supremacy',
    act: 5,
    description: 'Command vanara allies',
    mechanic: 'Q summons allied warriors to fight alongside.',
    verse: 'नासै रोग हरै सब पीरा',
    verseEnglish: 'All illness and pain are destroyed',
    key: 'Q (alt)',
    icon: '🐵',
  },
};

export default class SiddhiSystem {
  constructor(scene) {
    this.scene = scene;
    this.unlockedSiddhis = new Set();
    this.activeSiddhis = new Set();

    // Load unlocked siddhis from localStorage
    this.loadProgress();
  }

  // Check if a siddhi is unlocked
  isUnlocked(siddhiKey) {
    return this.unlockedSiddhis.has(siddhiKey);
  }

  // Check if a siddhi is currently active in this act
  isActive(siddhiKey) {
    return this.activeSiddhis.has(siddhiKey);
  }

  // Unlock a siddhi with a dramatic reveal
  unlock(siddhiKey, showUI = true) {
    const siddhi = SIDDHIS[siddhiKey];
    if (!siddhi) return;

    this.unlockedSiddhis.add(siddhiKey);
    this.activeSiddhis.add(siddhiKey);
    this.saveProgress();

    if (showUI) {
      this.showUnlockScreen(siddhi);
    }
  }

  // Activate siddhis appropriate for the current act
  activateForAct(actNumber) {
    this.activeSiddhis.clear();
    for (const [key, siddhi] of Object.entries(SIDDHIS)) {
      if (siddhi.act <= actNumber && this.unlockedSiddhis.has(key)) {
        this.activeSiddhis.add(key);
      }
    }
    // Laghima is always active
    this.activeSiddhis.add('laghima');
  }

  // Auto-unlock siddhis for an act (called at act start)
  unlockForAct(actNumber) {
    for (const [key, siddhi] of Object.entries(SIDDHIS)) {
      if (siddhi.act <= actNumber) {
        this.unlockedSiddhis.add(key);
      }
    }
    this.activateForAct(actNumber);
    this.saveProgress();
  }

  // Show dramatic unlock screen
  showUnlockScreen(siddhi) {
    const cam = this.scene.cameras.main;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark overlay
    const overlay = this.scene.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(400);

    // Golden burst
    const burst = this.scene.add.circle(cx, cy, 10, 0xFFD700, 0.8)
      .setScrollFactor(0).setDepth(401).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: burst,
      scale: 20,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
    });

    // Icon
    const icon = this.scene.add.text(cx, cy - 80, siddhi.icon, {
      fontSize: '64px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    // Sanskrit name
    const sanskrit = this.scene.add.text(cx, cy - 30, siddhi.sanskrit, {
      fontSize: '32px', color: '#FFD700',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    // English name
    const name = this.scene.add.text(cx, cy + 10, `${siddhi.name} — ${siddhi.title}`, {
      fontSize: '20px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', fontStyle: 'italic',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    // Mechanic description
    const desc = this.scene.add.text(cx, cy + 50, siddhi.mechanic, {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#AAAAAA', align: 'center',
      wordWrap: { width: 500 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    // Chalisa verse
    const verse = this.scene.add.text(cx, cy + 100, siddhi.verse, {
      fontSize: '16px', color: '#D4A843', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    const verseEng = this.scene.add.text(cx, cy + 130, `"${siddhi.verseEnglish}"`, {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#AA8855', fontStyle: 'italic',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    // Key binding
    const keyHint = siddhi.key
      ? this.scene.add.text(cx, cy + 165, `[ ${siddhi.key} ]`, {
          fontSize: '14px', fontFamily: 'monospace', color: '#666',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0)
      : null;

    // Animate in sequence
    const elements = [icon, sanskrit, name, desc, verse, verseEng, keyHint].filter(Boolean);
    elements.forEach((el, i) => {
      this.scene.tweens.add({
        targets: el,
        alpha: 1,
        y: el.y,
        duration: 600,
        delay: 400 + i * 200,
        ease: 'Power2',
      });
    });

    // Continue prompt
    const continueText = this.scene.add.text(cx, cy + 200, '— press any key —', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setAlpha(0);

    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.6,
      duration: 400,
      delay: 2000,
    });

    // Dismiss after delay
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      const allElements = [overlay, burst, ...elements, continueText];
      this.scene.tweens.add({
        targets: allElements,
        alpha: 0,
        duration: 400,
        onComplete: () => allElements.forEach(e => e.destroy()),
      });
    };

    setTimeout(() => {
      this.scene.input.keyboard.once('keydown', dismiss);
      this.scene.input.once('pointerdown', dismiss);
    }, 2000);

    // Auto-dismiss after 6 seconds
    setTimeout(dismiss, 6000);
  }

  // Get all siddhis info for UI display
  getAllSiddhis() {
    return Object.entries(SIDDHIS).map(([key, siddhi]) => ({
      ...siddhi,
      key: key,
      unlocked: this.unlockedSiddhis.has(key),
      active: this.activeSiddhis.has(key),
    }));
  }

  // Persistence
  saveProgress() {
    localStorage.setItem('hanuman_siddhis', JSON.stringify([...this.unlockedSiddhis]));
  }

  loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('hanuman_siddhis') || '["laghima"]');
      this.unlockedSiddhis = new Set(saved);
    } catch {
      this.unlockedSiddhis = new Set(['laghima']);
    }
  }

  destroy() {
    // Nothing to clean up
  }
}

export { SIDDHIS };
