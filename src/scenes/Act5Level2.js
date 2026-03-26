import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS, CHALISA } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';
import ParticleManager from '../systems/ParticleManager.js';

export default class Act5Level2 extends Phaser.Scene {
  constructor() {
    super('Act5Level2');
  }

  create() {
    console.log('[Act5Level2] Creating level...');
    try {
      this._create();
      console.log('[Act5Level2] Level created successfully!');
    } catch (e) {
      console.error('[Act5Level2] CRASH:', e);
      this.add.text(400, 300, 'Level failed to load!\n' + e.message, {
        fontSize: '18px', color: '#FF4444', align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setDepth(999);
    }
  }

  _create() {
    this.enemies = [];
    this.obstacles = [];
    this.levelComplete = false;
    this.levelFailed = false;

    // Phase: 'ascend' or 'descend'
    this.phase = 'ascend';
    this.reachedMountain = false;
    this.carryingMountain = false;

    // Timer: 60 seconds
    this.timeLimit = 60000;
    this.timeRemaining = this.timeLimit;

    // --- World setup (vertical flight) ---
    const WORLD_WIDTH = 800;
    const WORLD_HEIGHT = 12000;
    this.worldWidth = WORLD_WIDTH;
    this.worldHeight = WORLD_HEIGHT;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.gravity.y = 150; // space-like

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.particleManager = new ParticleManager(this);
    this.particleManager.init({ width: GAME_WIDTH, height: GAME_HEIGHT });

    // --- Background layers ---
    // Dark night sky that brightens with time
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);
    this.dawnBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-99).setAlpha(0);

    // Dawn overlay that gradually appears as timer runs down
    this.dawnOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xFFAA44, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-98).setBlendMode(Phaser.BlendModes.ADD);

    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-60).setAlpha(0.3);

    // --- Ground (starting area at bottom) ---
    this.ground = this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT - 30, WORLD_WIDTH, 60, 0x3A2A18);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(3);

    // --- Player ---
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT - 100);
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.ground);

    // --- Camera ---
    const cam = this.cameras.main;
    cam.startFollow(this.player.sprite, true, 0.08, 0.15);
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    cam.setZoom(1);

    // --- Mountain at the top ---
    this.mountain = this.add.circle(WORLD_WIDTH / 2, 800, 60, 0x558844, 0.9);
    this.mountain.setDepth(5);
    // Mountain glow
    this.mountainGlow = this.add.circle(WORLD_WIDTH / 2, 800, 100, 0x44FF44, 0.15);
    this.mountainGlow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: this.mountainGlow,
      scale: 1.3, alpha: 0.3,
      duration: 1500, yoyo: true, repeat: -1,
    });
    // Mountain physics
    this.mountainTrigger = this.add.circle(WORLD_WIDTH / 2, 800, 80);
    this.physics.add.existing(this.mountainTrigger, true);

    // --- Obstacles: storm clouds and asteroids (ascending) ---
    this.obstacleGroup = this.physics.add.group();
    this.spawnObstacles();

    // --- Collision: player with obstacles ---
    this.physics.add.overlap(this.player.sprite, this.obstacleGroup, this.onHitObstacle, null, this);
    this.physics.add.overlap(this.player.sprite, this.mountainTrigger, this.onReachMountain, null, this);

    // --- HUD ---
    this.createHUD();

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');

    // --- Events ---
    this.events.on('playerDamaged', (health) => this.updateHealthDisplay(health));
    this.events.on('playerDied', () => this.onPlayerDied());
    this.events.on('devotionChanged', (val, max) => {
      this.updateDevotionBar(val, max);
    });

    // --- Touch controls ---
    this.setupTouchControls();

    // --- Start text ---
    const goText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'FLY TO THE HIMALAYAS!', {
        fontSize: '28px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: goText,
      alpha: 0, y: goText.y - 40,
      duration: 2000, delay: 1500,
      onComplete: () => goText.destroy(),
    });
  }

  spawnObstacles() {
    // Storm clouds — moving obstacles from bottom to mountain
    for (let y = this.worldHeight - 500; y > 1200; y -= 200 + Math.random() * 300) {
      const x = 60 + Math.random() * (this.worldWidth - 120);
      const cloud = this.physics.add.sprite(x, y, 'cloud');
      cloud.body.setAllowGravity(false);
      cloud.setDepth(4);
      cloud.setAlpha(0.6);
      cloud.setTint(0x888899);
      cloud.body.setSize(cloud.width * 0.6, cloud.height * 0.5);

      // Horizontal movement
      const speed = 30 + Math.random() * 60;
      cloud.body.setVelocityX(Math.random() > 0.5 ? speed : -speed);
      cloud.body.setBounceX(1);
      cloud.body.setCollideWorldBounds(true);

      this.obstacleGroup.add(cloud);
      this.obstacles.push(cloud);
    }

    // Asteroids — faster, smaller hazards
    for (let y = this.worldHeight - 1500; y > 1500; y -= 400 + Math.random() * 500) {
      const x = 60 + Math.random() * (this.worldWidth - 120);
      const asteroid = this.physics.add.sprite(x, y, 'asteroid');
      asteroid.body.setAllowGravity(false);
      asteroid.setDepth(4);
      asteroid.body.setCircle(14);

      const speed = 40 + Math.random() * 80;
      asteroid.body.setVelocityX(Math.random() > 0.5 ? speed : -speed);
      asteroid.body.setBounceX(1);
      asteroid.body.setCollideWorldBounds(true);
      this.tweens.add({
        targets: asteroid,
        angle: 360, duration: 1500 + Math.random() * 1500, repeat: -1,
      });

      this.obstacleGroup.add(asteroid);
      this.obstacles.push(asteroid);
    }
  }

  onHitObstacle(playerSprite, obstacle) {
    // Bounce off and take minor damage
    this.player.takeDamage(1);
  }

  onReachMountain() {
    if (this.reachedMountain || this.levelComplete || this.levelFailed) return;
    this.reachedMountain = true;

    // Freeze player momentarily
    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);

    // "Which herb?" text
    const whichText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
      'Which herb?', {
        fontSize: '28px', fontFamily: 'Georgia, serif',
        color: '#AAFFAA', stroke: '#000', strokeThickness: 3,
        fontStyle: 'italic',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.time.delayedCall(1500, () => {
      whichText.destroy();

      const takeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
        'TAKE THE MOUNTAIN!', {
          fontSize: '32px', fontFamily: 'Georgia, serif',
          color: '#FFD700', stroke: '#000', strokeThickness: 5,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

      this.cameras.main.shake(600, 0.02);
      this.cameras.main.flash(400, 200, 255, 100);

      this.time.delayedCall(1500, () => {
        takeText.destroy();
        this.startDescentPhase();
      });
    });
  }

  startDescentPhase() {
    this.phase = 'descend';
    this.carryingMountain = true;

    // Player grows (carrying mountain)
    const currentScale = this.player.sprite.scaleX;
    this.player._descentScale = currentScale;
    this.tweens.add({
      targets: this.player.sprite,
      scaleX: currentScale * 1.5,
      scaleY: currentScale * 1.5,
      duration: 400,
    });

    // Hide mountain visuals
    this.mountain.setAlpha(0);
    this.mountainGlow.setAlpha(0);
    this.mountainTrigger.destroy();

    // Re-enable gravity and movement
    this.player.sprite.body.setAllowGravity(true);
    this.physics.world.gravity.y = 200; // heavier with mountain

    // Mountain icon follows player
    this.mountainIcon = this.add.circle(0, 0, 20, 0x558844, 0.8);
    this.mountainIcon.setDepth(9);

    // Descent text
    const descentText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      'DESCEND! SAVE LAKSHMANA!', {
        fontSize: '24px', fontFamily: 'Georgia, serif',
        color: '#FF8844', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: descentText,
      alpha: 0, y: descentText.y - 40,
      duration: 2000, delay: 1000,
      onComplete: () => descentText.destroy(),
    });
  }

  createHUD() {
    // Health hearts
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.add.image(30 + i * 28, 30, 'heart')
        .setScrollFactor(0).setDepth(100);
      this.hearts.push(heart);
    }

    // Timer (big, prominent)
    this.timerText = this.add.text(GAME_WIDTH / 2, 18, '60', {
      fontSize: '36px', fontFamily: 'Georgia, serif',
      color: '#FF4444', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.timerLabel = this.add.text(GAME_WIDTH / 2, 55, 'DAWN APPROACHES', {
      fontSize: '10px', fontFamily: 'monospace',
      color: '#FF8866',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // Altitude
    this.altitudeText = this.add.text(GAME_WIDTH - 20, 80, '', {
      fontSize: '12px', fontFamily: 'monospace',
      color: '#FFCC88', align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Score
    this.scoreManager.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Level name
    this.add.text(20, GAME_HEIGHT - 20, 'ACT V \u2014 Sanjeevani', {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(100).setAlpha(0.5);

    // Devotion meter bar
    this.devotionBarBg = this.add.rectangle(30, 58, 100, 6, 0x333333, 0.6)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.devotionBarFill = this.add.rectangle(30, 58, 0, 6, 0xFFD700, 0.8)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
  }

  updateDevotionBar(val, max) {
    const pct = val / max;
    this.devotionBarFill.width = 100 * pct;
  }

  setupTouchControls() {
    this.touchState = { left: false, right: false, up: false, attack: false };
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < GAME_HEIGHT * 0.4) this.touchState.up = true;
      if (pointer.x < GAME_WIDTH * 0.3) this.touchState.left = true;
      else if (pointer.x > GAME_WIDTH * 0.7) this.touchState.right = true;
      else this.touchState.attack = true;
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

  onTimerExpired() {
    if (this.levelComplete || this.levelFailed) return;
    this.levelFailed = true;

    // Bright dawn flash — too late
    this.cameras.main.flash(2000, 255, 200, 100);

    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);

    const failOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xFFCC88, 0.6)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(290);

    const failText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'The dawn breaks... too late.', {
        fontSize: '28px', fontFamily: 'Georgia, serif',
        color: '#882200', stroke: '#000', strokeThickness: 3,
        fontStyle: 'italic',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30,
      '[ Press SPACE to retry ]', {
        fontSize: '16px', fontFamily: 'Georgia, serif', color: '#666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({ targets: retryText, alpha: 0.7, duration: 800, delay: 2000 });
    this.tweens.add({
      targets: retryText, alpha: 0.3,
      duration: 600, yoyo: true, repeat: -1, delay: 3000,
    });

    this.time.delayedCall(2000, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.cleanup();
        this.scene.restart();
      });
      this.input.once('pointerdown', () => {
        this.cleanup();
        this.scene.restart();
      });
    });
  }

  onDescentSuccess() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);

    // Golden flash of triumph
    this.cameras.main.flash(1000, 255, 215, 0);
    this.cameras.main.shake(400, 0.015);

    const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'LAKSHMANA IS SAVED!', {
        fontSize: '32px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 5,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    const verseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
      CHALISA.act5.sanjeevani.transliteration, {
        fontSize: '16px', fontFamily: 'Georgia, serif',
        color: '#FFCC88', fontStyle: 'italic', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({ targets: verseText, alpha: 1, duration: 1000, delay: 800 });

    // Save progress
    ScoreManager.saveProgress(5, 3);
    ScoreManager.saveBest('act5_level2', this.scoreManager.score,
      this.scoreManager.getGrade(8000));

    this.time.delayedCall(4000, () => {
      this.cleanup();
      this.scene.start('ChalisaTransition', {
        couplet: 'boss', act: 5, nextScene: 'Act5Boss',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1500, () => {
      const overlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7
      ).setDepth(200).setScrollFactor(0);

      const deathText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30,
        'Hanuman Falls...', {
          fontSize: '32px', fontFamily: 'Georgia, serif', color: '#FF6644',
          stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

      const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30,
        '[ Press SPACE ]', {
          fontSize: '16px', fontFamily: 'Georgia, serif', color: '#CCC',
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
      this.tweens.add({ targets: retryText, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

      this.input.keyboard.once('keydown-SPACE', () => {
        this.cleanup();
        this.scene.restart();
      });
      this.input.once('pointerdown', () => {
        this.cleanup();
        this.scene.restart();
      });
    });
  }

  cleanup() {
    if (this.scoreManager) this.scoreManager.destroy();
    if (this.particleManager) this.particleManager.destroy();
  }

  update(time, delta) {
    if (this.levelComplete || this.levelFailed) return;

    // --- Timer ---
    this.timeRemaining -= delta;
    const seconds = Math.max(0, Math.ceil(this.timeRemaining / 1000));
    this.timerText.setText(String(seconds));

    // Timer color urgency
    if (seconds <= 10) {
      this.timerText.setColor('#FF0000');
      // Pulse the timer
      if (seconds !== this._lastTimerSecond) {
        this._lastTimerSecond = seconds;
        this.tweens.add({
          targets: this.timerText,
          scaleX: 1.3, scaleY: 1.3,
          duration: 100, yoyo: true,
        });
      }
    } else if (seconds <= 20) {
      this.timerText.setColor('#FF6622');
    }

    // Dawn brightening based on timer
    const timeElapsed = 1 - (this.timeRemaining / this.timeLimit);
    this.dawnBg.setAlpha(timeElapsed * 0.8);
    this.dawnOverlay.setAlpha(timeElapsed * 0.15);

    if (this.timeRemaining <= 0) {
      this.onTimerExpired();
      return;
    }

    // --- Controls ---
    const virtualCursors = {
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };

    this.player.update(virtualCursors, this.attackKey, delta);

    // --- Parallax ---
    const playerY = this.player.sprite.y;
    this.cloudsBg.tilePositionY = playerY * 0.1;
    this.skyBg.tilePositionY = playerY * 0.03;

    // --- Altitude display ---
    const altitude = Math.max(0, Math.floor((this.worldHeight - playerY) / 10));
    this.altitudeText.setText(`\u2191 ${altitude}m`);

    // --- Mountain icon follows player in descent ---
    if (this.mountainIcon && this.carryingMountain) {
      this.mountainIcon.setPosition(this.player.sprite.x, this.player.sprite.y + 30);
    }

    // --- Descent success check ---
    if (this.phase === 'descend' && playerY >= this.worldHeight - 200) {
      this.onDescentSuccess();
    }

    // Camera lead
    const cam = this.cameras.main;
    const velY = this.player.sprite.body.velocity.y;
    cam.setFollowOffset(0, -velY * 0.1);
  }
}
