import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS, CHALISA } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';
import ParticleManager from '../systems/ParticleManager.js';

export default class Epilogue extends Phaser.Scene {
  constructor() {
    super('Epilogue');
  }

  create() {
    console.log('[Epilogue] Creating epilogue...');
    try {
      this._create();
      console.log('[Epilogue] Epilogue created successfully!');
    } catch (e) {
      console.error('[Epilogue] CRASH:', e);
      this.add.text(400, 300, 'Epilogue failed to load!\n' + e.message, {
        fontSize: '18px', color: '#FF4444', align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setDepth(999);
    }
  }

  _create() {
    this.levelComplete = false;
    this.autopilotActive = false;
    this.lotusCount = 0;

    // --- World setup ---
    const WORLD_WIDTH = 6000;
    const WORLD_HEIGHT = 600;
    this.worldWidth = WORLD_WIDTH;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.gravity.y = 100; // very gentle

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.particleManager = new ParticleManager(this);
    this.particleManager.init({ width: GAME_WIDTH, height: GAME_HEIGHT });

    // --- Background: sunset transitioning through warm colors ---
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);

    // Warm sunset overlay that shifts color
    this.sunsetOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xFF8844, 0.15)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-99).setBlendMode(Phaser.BlendModes.ADD);

    // Twilight overlay (fades in later)
    this.twilightOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x220044, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-98);

    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-60).setAlpha(0.3)
      .setTint(0xFFAA66);

    // --- Ground (far below, player flies above) ---
    this.ground = this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT - 20, WORLD_WIDTH, 30, 0x2A1A08);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(3);

    // --- Diwali lamps (x: 4000+) ---
    this.diwaliLamps = [];
    for (let x = 4000; x < WORLD_WIDTH; x += 30 + Math.random() * 50) {
      const y = WORLD_HEIGHT - 40 - Math.random() * 20;
      const lamp = this.add.circle(x, y, 2 + Math.random() * 2, 0xFFAA22, 0.7);
      lamp.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: lamp,
        alpha: 0.3 + Math.random() * 0.3,
        scale: 1.3,
        duration: 500 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });
      this.diwaliLamps.push(lamp);
    }

    // --- Player ---
    this.player = new Player(this, 100, WORLD_HEIGHT / 2);
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.ground);

    // --- Camera (auto-scroll) ---
    const cam = this.cameras.main;
    cam.startFollow(this.player.sprite, true, 0.08, 0.12);
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    cam.setZoom(1);

    // Auto-scroll speed
    this.autoScrollSpeed = 60; // pixels per second

    // --- Scatter lotuses (20 total) ---
    this.lotuses = [];
    for (let i = 0; i < 20; i++) {
      const x = 300 + (i / 20) * (WORLD_WIDTH - 800) + Math.random() * 200;
      const y = 120 + Math.random() * (WORLD_HEIGHT - 250);

      const lotus = this.physics.add.sprite(x, y, 'health-pickup');
      lotus.body.setAllowGravity(false);
      lotus.setDepth(5);
      lotus.setScale(0.9);

      const glow = this.add.circle(x, y, 16, 0xFFAACC, 0.15);
      glow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: [lotus, glow],
        y: y + 8,
        duration: 1200 + Math.random() * 600,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      this.physics.add.overlap(this.player.sprite, lotus, () => {
        this.lotusCount++;
        this.scoreManager.addPoints('lotus', { x: lotus.x, y: lotus.y });
        glow.destroy();
        lotus.destroy();
        this.lotusText.setText(`Lotuses: ${this.lotusCount}/20`);
      });

      this.lotuses.push(lotus);
    }

    // --- HUD (minimal) ---
    this.createHUD();

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');

    // --- Touch controls ---
    this.setupTouchControls();

    // --- Events ---
    this.events.on('playerDamaged', (health) => this.updateHealthDisplay(health));
    this.events.on('devotionChanged', () => {}); // no-op for epilogue

    // --- Opening text ---
    const openText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
      'Return to Ayodhya', {
        fontSize: '32px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 4,
        fontStyle: 'italic',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: openText,
      alpha: 0, y: openText.y - 40,
      duration: 2000, delay: 2500,
      onComplete: () => openText.destroy(),
    });

    // Set particle motes to peaceful
    this.particleManager.setMotesIntensity('low');
  }

  createHUD() {
    // Hearts (minimal)
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.add.image(30 + i * 28, 30, 'heart')
        .setScrollFactor(0).setDepth(100).setAlpha(0.5);
      this.hearts.push(heart);
    }

    // Score
    this.scoreManager.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setAlpha(0.6);

    // Lotus counter
    this.lotusText = this.add.text(GAME_WIDTH - 20, 42, 'Lotuses: 0/20', {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#FFAACC', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setAlpha(0.6);

    // Level name (subtle)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'EPILOGUE \u2014 Return to Ayodhya', {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(100).setAlpha(0.4);
  }

  setupTouchControls() {
    this.touchState = { left: false, right: false, up: false, attack: false };
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < GAME_HEIGHT * 0.4) this.touchState.up = true;
      if (pointer.x < GAME_WIDTH * 0.3) this.touchState.left = true;
      else if (pointer.x > GAME_WIDTH * 0.7) this.touchState.right = true;
    });
    this.input.on('pointerup', () => {
      this.touchState = { left: false, right: false, up: false, attack: false };
    });
  }

  updateHealthDisplay(health) {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setTexture(i < health ? 'heart' : 'heart-empty');
    }
  }

  triggerAutopilot() {
    this.autopilotActive = true;

    // Player loses control, starts descending
    this.player.sprite.body.setVelocity(60, 30);

    // Fade to peaceful
    this.tweens.add({
      targets: this.player.sprite,
      y: WORLD_HEIGHT - 100,
      duration: 3000,
      ease: 'Sine.easeInOut',
    });

    // Narrative text
    const narrativeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80,
      'And Hanuman knelt before Sri Ram...', {
        fontSize: '22px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 3,
        fontStyle: 'italic',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: narrativeText,
      alpha: 1, duration: 1500,
    });

    // Final Chalisa verse fades in
    const verseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30,
      CHALISA.epilogue.devanagari, {
        fontSize: '20px', fontFamily: 'Georgia, serif',
        color: '#FFCC88', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const translitText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
      CHALISA.epilogue.transliteration, {
        fontSize: '14px', fontFamily: 'Georgia, serif',
        color: '#AA8866', fontStyle: 'italic', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const englishText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40,
      CHALISA.epilogue.english, {
        fontSize: '13px', fontFamily: 'Georgia, serif',
        color: '#887755', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({ targets: verseText, alpha: 1, duration: 1500, delay: 2000 });
    this.tweens.add({ targets: translitText, alpha: 0.8, duration: 1500, delay: 2800 });
    this.tweens.add({ targets: englishText, alpha: 0.6, duration: 1500, delay: 3600 });

    // Transition to ActComplete after the moment
    this.time.delayedCall(8000, () => {
      this.levelComplete = true;

      // Save final progress
      ScoreManager.saveProgress(6, 1); // beyond act 5
      ScoreManager.saveBest('epilogue', this.scoreManager.score,
        this.scoreManager.getGrade(5000));

      this.cleanup();
      this.scene.start('ActComplete', {
        act: 'epilogue',
        finalScore: this.scoreManager.score,
        lotusCount: this.lotusCount,
      });
    });
  }

  cleanup() {
    if (this.scoreManager) this.scoreManager.destroy();
    if (this.particleManager) this.particleManager.destroy();
  }

  update(time, delta) {
    if (this.levelComplete) return;

    const dt = (delta || 16.67) / 1000;

    // --- Autopilot mode ---
    if (this.autopilotActive) {
      // Gently move player right and down
      this.player.sprite.body.setVelocityX(40);
      // Parallax still scrolls
      const scrollX = this.cameras.main.scrollX;
      this.skyBg.tilePositionX = scrollX * 0.03;
      this.cloudsBg.tilePositionX = scrollX * 0.1;
      return;
    }

    // --- Auto-scroll camera push ---
    // Gently push the camera / player rightward
    const playerPos = this.player.getPosition();
    const minX = this.cameras.main.scrollX + 80;
    if (playerPos.x < minX) {
      this.player.sprite.x = minX;
    }

    // Move the camera forward
    this.cameras.main.scrollX += this.autoScrollSpeed * dt;

    // --- Player controls ---
    const virtualCursors = {
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };

    this.player.update(virtualCursors, this.attackKey, delta);

    // --- Parallax & atmosphere ---
    const scrollX = this.cameras.main.scrollX;
    const progressNorm = scrollX / (this.worldWidth - GAME_WIDTH);

    this.skyBg.tilePositionX = scrollX * 0.03;
    this.cloudsBg.tilePositionX = scrollX * 0.1;

    // Sunset → twilight transition
    // 0-0.4: warm sunset
    // 0.4-0.7: deepening twilight
    // 0.7+: lamp-lit darkness
    if (progressNorm < 0.4) {
      const t = progressNorm / 0.4;
      this.sunsetOverlay.fillColor = Phaser.Display.Color.GetColor(
        255, Math.floor(136 - t * 60), Math.floor(68 - t * 40)
      );
      this.sunsetOverlay.setAlpha(0.15 + t * 0.05);
    } else if (progressNorm < 0.7) {
      const t = (progressNorm - 0.4) / 0.3;
      this.sunsetOverlay.setAlpha(0.2 - t * 0.15);
      this.twilightOverlay.setAlpha(t * 0.3);
    } else {
      this.twilightOverlay.setAlpha(0.3 + (progressNorm - 0.7) * 0.2);
      this.sunsetOverlay.setAlpha(0.05);
    }

    // --- Autopilot trigger at x:5500 ---
    if (!this.autopilotActive && playerPos.x >= 5500) {
      this.triggerAutopilot();
    }

    // Keep player in world
    if (playerPos.y > GAME_HEIGHT - 60) {
      this.player.sprite.y = GAME_HEIGHT - 60;
      this.player.sprite.body.setVelocityY(0);
    }
  }
}
