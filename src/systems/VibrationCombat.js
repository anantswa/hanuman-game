// VibrationCombat.js — Maps mace hits to Chalisa syllables
// Complete a verse through combat → Divine Intervention screen-clear
// Experimental but genuinely unique to this game

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const CHAUPAI_SYLLABLES = 16; // syllables per half-verse

// Sample verse syllable breakdown for display
const CURRENT_VERSE_SYLLABLES = [
  'jai', 'ha', 'nu', 'man', 'gyan', 'gun', 'sa', 'gar',
  'jai', 'ka', 'pee', 'sh', 'ti', 'hu', 'lok', 'u'
];

export default class VibrationCombat {
  constructor(scene) {
    this.scene = scene;
    this.hitCounter = 0;
    this.versesCompleted = 0;
    this.syllableMarkers = [];
    this.uiContainer = null;
    this.active = false;
  }

  // Initialize the UI display
  init() {
    this.active = true;
    this.hitCounter = 0;

    // Create syllable markers along bottom of screen
    this.uiContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(150);

    const startX = GAME_WIDTH / 2 - (CHAUPAI_SYLLABLES * 14) / 2;
    const y = GAME_HEIGHT - 35;

    for (let i = 0; i < CHAUPAI_SYLLABLES; i++) {
      const marker = this.scene.add.text(startX + i * 14, y,
        CURRENT_VERSE_SYLLABLES[i] || '·', {
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#444444',
        }).setOrigin(0.5);
      this.syllableMarkers.push(marker);
      this.uiContainer.add(marker);
    }
  }

  // Called on every mace hit that connects
  onMaceHit() {
    if (!this.active) return;

    this.hitCounter++;
    const idx = this.hitCounter - 1;

    // Light up the current syllable
    if (idx < this.syllableMarkers.length) {
      const marker = this.syllableMarkers[idx];
      marker.setColor('#FFD700');
      marker.setFontSize('13px');

      // Pulse animation
      this.scene.tweens.add({
        targets: marker,
        scale: 1.5,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }

    // Check for verse completion
    if (this.hitCounter >= CHAUPAI_SYLLABLES) {
      this.triggerDivineIntervention();
    }
  }

  // DIVINE INTERVENTION — verse completed through combat!
  triggerDivineIntervention() {
    this.versesCompleted++;
    this.hitCounter = 0;

    // Reset syllable markers
    this.syllableMarkers.forEach(m => {
      m.setColor('#444444');
      m.setFontSize('10px');
      m.setScale(1);
    });

    // === SCREEN-CLEARING GOLDEN WAVE ===
    const cam = this.scene.cameras.main;

    // Full-screen golden flash
    const flash = this.scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0xFFD700, 0.7
    ).setScrollFactor(0).setDepth(350).setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1200,
      onComplete: () => flash.destroy(),
    });

    // Expanding ring
    const ring = this.scene.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 10, 0xFFD700, 0.5)
      .setScrollFactor(0).setDepth(351).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: ring,
      scale: 30,
      alpha: 0,
      duration: 800,
      onComplete: () => ring.destroy(),
    });

    // Verse text display
    const verseText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30,
      '✦ DIVINE INTERVENTION ✦\nजय हनुमान ज्ञान गुन सागर', {
        fontSize: '24px',
        fontFamily: 'Georgia, serif',
        color: '#FFD700',
        stroke: '#000',
        strokeThickness: 4,
        align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(352);

    this.scene.tweens.add({
      targets: verseText,
      y: verseText.y - 40,
      alpha: 0,
      duration: 2000,
      delay: 500,
      onComplete: () => verseText.destroy(),
    });

    // Camera effects
    cam.shake(300, 0.015);
    cam.zoomTo(0.8, 300);
    this.scene.time.delayedCall(500, () => cam.zoomTo(1, 600, 'Back.easeOut'));

    // Emit event — scene should kill all on-screen enemies
    this.scene.events.emit('divineIntervention', {
      versesCompleted: this.versesCompleted,
      bonusPoints: 3000,
    });
  }

  destroy() {
    if (this.uiContainer) this.uiContainer.destroy();
    this.syllableMarkers = [];
    this.active = false;
  }
}
