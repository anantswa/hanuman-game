import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import ScoreManager from '../systems/ScoreManager.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.cameras.main.fadeIn(1200);
    this.showingActSelect = false;

    // Background
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky-dawn');
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'mountains').setAlpha(0.5);

    // Clouds
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.image(
        Math.random() * GAME_WIDTH,
        80 + Math.random() * 250,
        'cloud'
      ).setAlpha(0.3 + Math.random() * 0.3).setScale(0.8 + Math.random() * 0.8);
      this.clouds.push({ img: cloud, speed: 8 + Math.random() * 15 });
    }

    // Divine glow
    const glow = this.add.circle(GAME_WIDTH / 2, 170, 140, 0xFFCC44, 0.06);
    this.tweens.add({
      targets: glow, alpha: 0.18, scale: 1.15,
      duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Om symbol
    this.add.text(GAME_WIDTH / 2, 80, 'ॐ', {
      fontSize: '44px', color: '#D4A843',
    }).setOrigin(0.5).setAlpha(0.5);

    // Title
    this.add.text(GAME_WIDTH / 2, 155, 'HANUMAN', {
      fontSize: '62px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#6B3A10', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 205, 'Journey of the Divine', {
      fontSize: '19px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Hanuman sprite
    const hanuman = this.add.image(GAME_WIDTH / 2, 310, 'hanuman-fly').setScale(2.5);
    this.tweens.add({
      targets: hanuman, y: 322,
      duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Menu buttons
    const menuY = 420;
    const buttonStyle = {
      fontSize: '18px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 2,
    };

    const newGameBtn = this.add.text(GAME_WIDTH / 2, menuY, '▶  New Game', buttonStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    const actSelectBtn = this.add.text(GAME_WIDTH / 2, menuY + 35, '☰  Act Select', buttonStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    [newGameBtn, actSelectBtn].forEach(btn => {
      btn.on('pointerover', () => btn.setColor('#FFFFFF'));
      btn.on('pointerout', () => btn.setColor('#FFD700'));
    });

    newGameBtn.on('pointerdown', () => this.startGame());
    actSelectBtn.on('pointerdown', () => this.showActSelect());

    // Start prompt
    const startText = this.add.text(GAME_WIDTH / 2, menuY + 80,
      '— SPACE to start —', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#FFFFFF',
      }).setOrigin(0.5);
    this.tweens.add({ targets: startText, alpha: 0.25, duration: 900, yoyo: true, repeat: -1 });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 540,
      '↑ Fly   ← → Move   SPACE Attack   SHIFT Dash   Q Special', {
        fontSize: '11px', fontFamily: 'monospace', color: '#776644',
      }).setOrigin(0.5);

    // Credits
    this.add.text(GAME_WIDTH / 2, 565, 'A DharmaWeave Game — dharmaweave.com', {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#554422',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 582, 'Written & Illustrated by Anant Swarup', {
      fontSize: '10px', fontFamily: 'Georgia, serif', color: '#443322',
    }).setOrigin(0.5);

    // Keyboard
    this._starting = false;
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
  }

  startGame() {
    if (this._starting) return;
    this._starting = true;
    this.scene.start('ChalisaTransition', {
      couplet: 'intro', act: 1, nextScene: 'Act1Level1',
    });
  }

  showActSelect() {
    if (this.showingActSelect) return;
    this.showingActSelect = true;

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85).setDepth(300);

    this.add.text(GAME_WIDTH / 2, 50, 'SELECT ACT', {
      fontSize: '28px', fontFamily: 'Georgia, serif',
      color: '#FFD700', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(301);

    const progress = ScoreManager.getProgress();
    const acts = [
      { act: 1, title: 'Act I — Flight to the Sun', scene: 'Act1Level1', couplet: 'intro' },
      { act: 2, title: 'Act II — The Awakening', scene: 'Act2Level1', couplet: 'intro' },
      { act: 3, title: 'Act III — The Ocean Crossing', scene: 'Act3Level1', couplet: 'intro' },
      { act: 4, title: 'Act IV — Lanka', scene: 'Act4Level1', couplet: 'intro' },
      { act: 5, title: 'Act V — The Great War', scene: 'Act5Level1', couplet: 'intro' },
      { act: 6, title: 'Epilogue — Return to Ayodhya', scene: 'Epilogue', couplet: 'epilogue' },
    ];

    acts.forEach((actInfo, i) => {
      const unlocked = actInfo.act <= progress.highestAct;
      const y = 110 + i * 70;
      const best = ScoreManager.getBest(`act${actInfo.act}`);
      const color = unlocked ? '#FFD700' : '#555555';

      const label = unlocked
        ? actInfo.title
        : `🔒 ${actInfo.title}`;

      const btn = this.add.text(GAME_WIDTH / 2, y, label, {
        fontSize: '16px', fontFamily: 'Georgia, serif',
        color, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(301);

      if (best.grade) {
        this.add.text(GAME_WIDTH / 2 + 260, y, `${best.grade} — ${best.score || 0}`, {
          fontSize: '12px', fontFamily: 'monospace', color: '#AA8833',
        }).setOrigin(0.5).setDepth(301);
      }

      if (unlocked) {
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setColor('#FFFFFF'));
        btn.on('pointerout', () => btn.setColor('#FFD700'));
        btn.on('pointerdown', () => {
          this._starting = true;
          this.scene.start('ChalisaTransition', {
            couplet: actInfo.couplet,
            act: actInfo.act,
            nextScene: actInfo.scene,
          });
        });
      }
    });

    // Back button
    const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '← Back', {
      fontSize: '16px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.restart());
  }

  update(time, delta) {
    for (const cloud of this.clouds) {
      cloud.img.x += cloud.speed * (delta / 1000);
      if (cloud.img.x > GAME_WIDTH + 60) cloud.img.x = -60;
    }
  }
}
