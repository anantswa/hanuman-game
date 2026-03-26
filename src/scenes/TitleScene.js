import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.cameras.main.fadeIn(1200);

    // Background — dawn sky
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky-dawn');

    // Mountains (like the comic's cover — cliff overlooking vast landscape)
    const mtns = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'mountains');
    mtns.setAlpha(0.5);

    // Floating clouds — dawn-tinted
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.image(
        Math.random() * GAME_WIDTH,
        80 + Math.random() * 250,
        'cloud'
      );
      cloud.setAlpha(0.3 + Math.random() * 0.3);
      cloud.setScale(0.8 + Math.random() * 0.8);
      this.clouds.push({ img: cloud, speed: 8 + Math.random() * 15 });
    }

    // Divine glow behind title (warm golden, like the comic's light sources)
    const glow = this.add.circle(GAME_WIDTH / 2, 170, 140, 0xFFCC44, 0.06);
    this.tweens.add({
      targets: glow,
      alpha: 0.18,
      scale: 1.15,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Om symbol — sacred opener
    this.add.text(GAME_WIDTH / 2, 90, 'ॐ', {
      fontSize: '44px',
      color: '#D4A843',
    }).setOrigin(0.5).setAlpha(0.5);

    // Title — HANUMAN
    this.add.text(GAME_WIDTH / 2, 165, 'HANUMAN', {
      fontSize: '62px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      stroke: '#6B3A10',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Subtitle — from the comic's spirit
    this.add.text(GAME_WIDTH / 2, 215, 'Journey of the Divine', {
      fontSize: '19px',
      fontFamily: 'Georgia, serif',
      color: '#FFCC88',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Chalisa opening verse
    this.add.text(GAME_WIDTH / 2, 270, 'श्री गुरु चरन सरोज रज\nनिज मनु मुकुरु सुधारि', {
      fontSize: '15px',
      color: '#D4A843',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 310, 'With the dust of the Guru\'s lotus feet,\nI cleanse the mirror of my mind', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#AA8855',
      fontStyle: 'italic',
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5);

    // Hanuman sprite — floating gently
    const hanuman = this.add.image(GAME_WIDTH / 2, 400, 'hanuman-fly');
    hanuman.setScale(2.5);
    this.tweens.add({
      targets: hanuman,
      y: 412,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Divine glow under Hanuman
    const hGlow = this.add.circle(GAME_WIDTH / 2, 410, 30, 0xFFDD44, 0.1);
    this.tweens.add({
      targets: hGlow,
      alpha: 0.2,
      scale: 1.3,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start prompt
    const startText = this.add.text(GAME_WIDTH / 2, 490, '— Press SPACE or Tap to Begin —', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.25,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    // Controls
    this.add.text(GAME_WIDTH / 2, 535, '↑ Fly    ← → Move    SPACE Attack', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#776644',
    }).setOrigin(0.5);

    // Credits — honoring the source
    this.add.text(GAME_WIDTH / 2, 570, 'Based on the Hanuman Chalisa', {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      color: '#665533',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 585, 'Written & Illustrated by Anant Swarup', {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      color: '#554422',
    }).setOrigin(0.5);

    // Input — listen for ANY key or click
    this._starting = false;
    this.input.keyboard.on('keydown', (event) => {
      console.log('[Title] Key pressed:', event.key);
      this.startGame();
    });
    this.input.on('pointerdown', () => {
      console.log('[Title] Pointer down');
      this.startGame();
    });
  }

  startGame() {
    if (this._starting) return;
    this._starting = true;
    console.log('[Title] → Starting ChalisaTransition');

    try {
      this.scene.start('ChalisaTransition', {
        couplet: 'intro',
        act: 1,
        nextScene: 'Act1Level1',
      });
    } catch (e) {
      console.error('[Title] Scene start failed:', e);
    }
  }

  update(time, delta) {
    for (const cloud of this.clouds) {
      cloud.img.x += cloud.speed * (delta / 1000);
      if (cloud.img.x > GAME_WIDTH + 60) {
        cloud.img.x = -60;
      }
    }
  }
}
