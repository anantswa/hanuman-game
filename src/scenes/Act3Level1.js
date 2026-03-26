import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';
import ParticleManager from '../systems/ParticleManager.js';

const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 800;
const SCROLL_SPEED = 120; // pixels per second — auto-scroll pace
const END_X = 9500;
const MAINAK_X = 4000;

export default class Act3Level1 extends Phaser.Scene {
  constructor() {
    super('Act3Level1');
  }

  create() {
    console.log('[Act3Level1] Creating level...');
    try {
      this._create();
      console.log('[Act3Level1] Level created successfully!');
    } catch (e) {
      console.error('[Act3Level1] CRASH:', e);
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
    this.scrollX = 0; // current auto-scroll position

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.particleManager = new ParticleManager(this);
    this.particleManager.init({ width: GAME_WIDTH, height: GAME_HEIGHT });

    // --- Parallax Backgrounds ---
    // Warm golden sky
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);

    // Ocean layer 1 (deep) — clouds-layer tinted deep blue, slow
    this.oceanDeep = this.add.tileSprite(0, WORLD_HEIGHT - 200, GAME_WIDTH, 300, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-60);
    this.oceanDeep.setTint(0x1A3355);
    this.oceanDeep.setAlpha(0.8);

    // Ocean layer 2 (surface) — clouds-layer tinted lighter blue, faster
    this.oceanSurface = this.add.tileSprite(0, WORLD_HEIGHT - 140, GAME_WIDTH, 200, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-50);
    this.oceanSurface.setTint(0x3A6EA5);
    this.oceanSurface.setAlpha(0.6);

    // Warm golden light overlay
    this.goldenOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xFFB347, 0.06)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(40).setBlendMode(Phaser.BlendModes.ADD);

    // --- World setup ---
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.gravity.y = 100; // very low — space-like

    // --- Player ---
    this.player = new Player(this, 100, 300);
    this.player.sprite.body.setCollideWorldBounds(true);

    // --- Camera ---
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    cam.startFollow(this.player.sprite, true, 0.1, 0.15);
    cam.setFollowOffset(-100, 0); // lead the camera slightly ahead
    cam.setZoom(1);

    // --- Hint ---
    const hint = this.add.text(GAME_WIDTH / 2, 50,
      'FLY EAST! Keep ahead of the wind.\n↑ Fly  ← → Move  SPACE Attack  SHIFT Dash', {
        fontSize: '14px', fontFamily: 'Georgia, serif',
        color: '#FFD700', align: 'center',
        stroke: '#000000', strokeThickness: 3, lineSpacing: 4,
      }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
    this.time.delayedCall(5000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 1000 });
    });

    // --- Collision groups ---
    this.enemyGroup = this.physics.add.group();
    this.obstacleGroup = this.physics.add.group();

    // --- Spawn content ---
    this.spawnLevelContent();

    // --- Collisions ---
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, this.onMaceHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onPlayerTouchEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.obstacleGroup, this.onPlayerTouchObstacle, null, this);

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
    this.events.on('enemyKilled', (data) => {
      this.scoreManager.addPoints(data.scoreType, { x: data.x, y: data.y });
      this.player.addDevotion(10);
    });
    this.events.on('devotionSpecial', () => {
      for (const enemy of this.enemies) {
        if (!enemy.isDead) {
          const dx = Math.abs(enemy.sprite.x - this.player.sprite.x);
          const dy = Math.abs(enemy.sprite.y - this.player.sprite.y);
          if (dx < GAME_WIDTH && dy < GAME_HEIGHT) {
            enemy.takeDamage(999);
          }
        }
      }
    });
    this.events.on('devotionBonus', (pts) => {
      this.scoreManager.score += pts;
      this.scoreManager.updateUI();
    });
    this.events.on('devotionChanged', (val, max) => {
      this.updateDevotionBar(val, max);
    });

    // --- Touch controls ---
    this.setupTouchControls();

    // --- Level title flash ---
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'ACT III \u2014 The Leap', {
        fontSize: '32px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: titleText,
      alpha: 0, y: titleText.y - 40,
      duration: 2000, delay: 2000,
      onComplete: () => titleText.destroy(),
    });
  }

  spawnLevelContent() {
    // --- Storm clouds (obstacles) — scattered across the level ---
    const stormPositions = [
      { x: 800, y: 200 }, { x: 1400, y: 400 }, { x: 2000, y: 150 },
      { x: 2600, y: 350 }, { x: 3200, y: 250 }, { x: 3800, y: 450 },
      { x: 5000, y: 200 }, { x: 5600, y: 380 }, { x: 6200, y: 150 },
      { x: 6800, y: 420 }, { x: 7400, y: 280 }, { x: 8000, y: 350 },
      { x: 8600, y: 180 }, { x: 9000, y: 300 },
    ];
    for (const pos of stormPositions) {
      const storm = this.physics.add.sprite(pos.x, pos.y, 'cloud');
      storm.setScale(1.2 + Math.random() * 0.6);
      storm.setTint(0x555577); // dark stormy tint
      storm.body.setAllowGravity(false);
      storm.body.setImmovable(true);
      storm.setDepth(5);
      storm.setAlpha(0.7 + Math.random() * 0.2);
      storm.isStormCloud = true;
      this.obstacleGroup.add(storm);
      this.obstacles.push(storm);

      // Drift slightly
      this.tweens.add({
        targets: storm,
        y: pos.y + (Math.random() > 0.5 ? 30 : -30),
        duration: 2000 + Math.random() * 2000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // --- Water spouts (vertical hazards rising from ocean) ---
    const spoutXPositions = [1200, 2400, 3600, 5400, 6600, 7800, 8800];
    for (const sx of spoutXPositions) {
      // Vertical column of sprites acting as water spout
      for (let sy = WORLD_HEIGHT - 100; sy > WORLD_HEIGHT - 400; sy -= 60) {
        const spout = this.physics.add.sprite(sx, sy, 'cloud');
        spout.setScale(0.5, 1.2);
        spout.setTint(0x4488CC);
        spout.setAlpha(0.5);
        spout.body.setAllowGravity(false);
        spout.body.setImmovable(true);
        spout.setDepth(4);
        spout.isWaterSpout = true;
        this.obstacleGroup.add(spout);
        this.obstacles.push(spout);
      }
      // Warning line
      const warnLine = this.add.rectangle(sx, WORLD_HEIGHT - 250, 6, 300, 0x4488CC, 0.15)
        .setDepth(3);
      this.tweens.add({
        targets: warnLine,
        alpha: 0.05, duration: 1000, yoyo: true, repeat: -1,
      });
    }

    // --- Mt. Mainak at x:4000 — large resting platform ---
    this.mainak = this.physics.add.sprite(MAINAK_X, 500, 'cloud');
    this.mainak.setScale(3);
    this.mainak.setTint(0x886644); // earthy brown
    this.mainak.body.setAllowGravity(false);
    this.mainak.body.setImmovable(true);
    this.mainak.setDepth(5);
    this.physics.add.collider(this.player.sprite, this.mainak);

    // Mainak label
    const mainakLabel = this.add.text(MAINAK_X, 470, 'Mt. Mainak', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6);

    // Health pickup on Mainak
    this.mainakPickup = this.physics.add.sprite(MAINAK_X, 460, 'health-pickup');
    this.mainakPickup.body.setAllowGravity(false);
    this.mainakPickup.setDepth(6);
    const mainakGlow = this.add.circle(MAINAK_X, 460, 20, 0xFFAACC, 0.3)
      .setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: [this.mainakPickup, mainakGlow],
      y: 450, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.mainakCollected = false;
    this.physics.add.overlap(this.player.sprite, this.mainakPickup, () => {
      if (this.mainakCollected) return;
      this.mainakCollected = true;

      // Heal to full + bonus
      this.player.health = this.player.maxHealth;
      this.events.emit('playerDamaged', this.player.health);
      this.scoreManager.score += 1000;
      this.scoreManager.updateUI();

      // Floating text
      const bonusText = this.add.text(MAINAK_X, 430, '+1000 REST AT MAINAK', {
        fontSize: '18px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(200);
      this.tweens.add({
        targets: bonusText, y: 380, alpha: 0, duration: 2000,
        onComplete: () => bonusText.destroy(),
      });

      mainakGlow.destroy();
      this.mainakPickup.destroy();
    });

    // --- Sea demon enemies (chase behavior) — 8 total ---
    const demonPositions = [
      { x: 1600, y: 250 }, { x: 2800, y: 350 },
      { x: 4800, y: 200 }, { x: 5800, y: 400 },
      { x: 6400, y: 250 }, { x: 7200, y: 350 },
      { x: 8200, y: 200 }, { x: 9000, y: 350 },
    ];
    for (const pos of demonPositions) {
      const enemy = new Enemy(this, pos.x, pos.y, 'demon-cloud', {
        behavior: 'chase',
        health: 2,
        speed: 80 + Math.random() * 30,
        scoreValue: 200,
        scoreType: 'demonKill',
        patrolRange: 100,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }

    // --- Sacred lotuses floating on wind currents — 20 across level ---
    for (let i = 0; i < 20; i++) {
      const lx = 400 + (i / 20) * (END_X - 600);
      const ly = 100 + Math.random() * 400;
      const lotus = this.physics.add.sprite(lx, ly, 'health-pickup');
      lotus.body.setAllowGravity(false);
      lotus.setDepth(5);

      const glow = this.add.circle(lx, ly, 18, 0xFFAACC, 0.2);
      glow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);

      // Gentle floating motion
      this.tweens.add({
        targets: [lotus, glow],
        y: ly + 15, duration: 1200 + Math.random() * 800,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.tweens.add({
        targets: glow, alpha: 0.4, scale: 1.3,
        duration: 1000, yoyo: true, repeat: -1,
      });

      this.physics.add.overlap(this.player.sprite, lotus, () => {
        if (this.player.health < this.player.maxHealth) {
          this.player.heal();
        } else {
          this.player.addDevotion(5);
        }
        this.scoreManager.addPoints('lotus', { x: lotus.x, y: lotus.y });
        glow.destroy();
        lotus.destroy();
      });
    }
  }

  createHUD() {
    // Health hearts
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.add.image(30 + i * 28, 30, 'heart')
        .setScrollFactor(0).setDepth(100);
      this.hearts.push(heart);
    }

    // Score
    this.scoreManager.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
      fontSize: '18px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Level name
    this.add.text(GAME_WIDTH / 2, 20, 'ACT III \u2014 The Leap', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0.7);

    // Progress bar background
    this.progressBarBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, 300, 8, 0x333333, 0.6)
      .setScrollFactor(0).setDepth(100);
    this.progressBarFill = this.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 20, 0, 8, 0x3A6EA5, 0.8)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.progressBarBorder = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, 300, 8)
      .setScrollFactor(0).setDepth(102).setStrokeStyle(1, 0x5588AA);
    this.progressLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 34, 'Ocean Crossing', {
      fontSize: '10px', fontFamily: 'monospace', color: '#88AACC',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // Devotion meter bar
    this.devotionBarBg = this.add.rectangle(30, 58, 120, 8, 0x333333, 0.6)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.devotionBarFill = this.add.rectangle(30, 58, 0, 8, 0xFFD700, 0.8)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.devotionBarBorder = this.add.rectangle(30, 58, 120, 8)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(102)
      .setStrokeStyle(1, 0xAA8833);
    this.devotionLabel = this.add.text(152, 58, 'Q', {
      fontSize: '10px', fontFamily: 'monospace', color: '#888',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

    // Dash cooldown indicator
    this.dashIndicator = this.add.circle(GAME_WIDTH - 30, 55, 6, 0x666666)
      .setScrollFactor(0).setDepth(100);
    this.add.text(GAME_WIDTH - 30, 68, 'SHIFT', {
      fontSize: '8px', fontFamily: 'monospace', color: '#666',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
  }

  updateDevotionBar(val, max) {
    const pct = val / max;
    this.devotionBarFill.width = 120 * pct;
    if (pct >= 1) {
      this.devotionBarFill.fillColor = 0xFF6600;
      this.devotionLabel.setColor('#FFD700').setText('Q!');
    } else {
      this.devotionBarFill.fillColor = 0xFFD700;
      this.devotionLabel.setColor('#888').setText('Q');
    }
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

  onMaceHitEnemy(maceHitbox, enemySprite) {
    if (enemySprite.enemyRef && !enemySprite.enemyRef.isDead) {
      this.player.onMaceConnected(enemySprite.x, enemySprite.y);
      enemySprite.enemyRef.takeDamage(2);
    }
  }

  onPlayerTouchEnemy(playerSprite, enemySprite) {
    if (enemySprite.enemyRef && !enemySprite.enemyRef.isDead) {
      this.player.takeDamage(enemySprite.enemyRef.damage);
    }
  }

  onPlayerTouchObstacle(playerSprite, obstacle) {
    if (obstacle.isStormCloud || obstacle.isWaterSpout) {
      this.player.takeDamage(1);
    }
  }

  onReachEnd() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);
    this.cameras.main.flash(800, 255, 200, 100);

    this.particleManager.setMotesIntensity('divine');

    const victoryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'Lanka draws near...', {
        fontSize: '30px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.tweens.add({
      targets: victoryText, y: victoryText.y - 30, alpha: 0,
      duration: 2000, delay: 1500,
    });

    ScoreManager.saveProgress(3, 2);
    ScoreManager.saveBest('act3_level1', this.scoreManager.score,
      this.scoreManager.getGrade(10000));

    this.time.delayedCall(3500, () => {
      this.cleanup();
      this.scene.start('ChalisaTransition', {
        couplet: 'level2', act: 3, nextScene: 'Act3Level2',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1500, () => {
      const overlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7
      ).setDepth(200).setScrollFactor(0);

      const deathVerse = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
        'Sankat se Hanuman chhudave', {
          fontSize: '20px', fontFamily: 'Georgia, serif',
          color: '#FFD700', stroke: '#000', strokeThickness: 2,
          fontStyle: 'italic',
        }
      ).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      const deathEnglish = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30,
        'Hanuman rescues from all troubles', {
          fontSize: '14px', fontFamily: 'Georgia, serif', color: '#CCAA88',
        }
      ).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      const riseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
        'Rise again, devotee.', {
          fontSize: '24px', fontFamily: 'Georgia, serif', color: '#FF8844',
          stroke: '#000', strokeThickness: 3,
        }
      ).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70,
        '[ Press SPACE ]', {
          fontSize: '14px', fontFamily: 'Georgia, serif', color: '#999',
        }
      ).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      this.tweens.add({ targets: deathVerse, alpha: 1, duration: 800 });
      this.tweens.add({ targets: deathEnglish, alpha: 0.7, duration: 800, delay: 400 });
      this.tweens.add({ targets: riseText, alpha: 1, duration: 800, delay: 800 });
      this.tweens.add({ targets: retryText, alpha: 0.6, duration: 600, delay: 1400 });
      this.tweens.add({
        targets: retryText, alpha: 0.2,
        duration: 600, yoyo: true, repeat: -1, delay: 2000,
      });

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
    if (this.levelComplete) return;

    const dt = (delta || 16.67) / 1000;

    // --- Auto-scroll: push the camera's left bound rightward ---
    this.scrollX += SCROLL_SPEED * dt;
    // Clamp so it doesn't go past end
    this.scrollX = Math.min(this.scrollX, END_X - GAME_WIDTH / 2);

    // If player falls behind the auto-scroll, push them forward (or kill)
    const leftEdge = this.scrollX - 50;
    if (this.player.sprite.x < leftEdge && !this.player.isDead) {
      // Give a brief grace: push, then kill if too far behind
      if (this.player.sprite.x < leftEdge - 100) {
        this.player.die();
      } else {
        this.player.sprite.body.setVelocityX(SCROLL_SPEED + 100);
      }
    }

    // --- Combined controls ---
    const virtualCursors = {
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };

    this.player.update(virtualCursors, this.attackKey, delta);

    if (this.touchState.attack) {
      this.touchState.attack = false;
      if (!this.player.isAttacking) this.player.startAttack();
    }

    // --- Update enemies ---
    const playerPos = this.player.getPosition();
    for (const enemy of this.enemies) {
      enemy.update(time, playerPos);
    }

    // --- Parallax ocean layers scroll with camera ---
    const camScrollX = this.cameras.main.scrollX;
    this.oceanDeep.tilePositionX = camScrollX * 0.3;
    this.oceanDeep.tilePositionY = Math.sin(time * 0.001) * 8; // gentle wave
    this.oceanSurface.tilePositionX = camScrollX * 0.6;
    this.oceanSurface.tilePositionY = Math.sin(time * 0.0015 + 1) * 12;

    // Sky parallax
    this.skyBg.tilePositionX = camScrollX * 0.05;

    // --- Update particles ---
    this.particleManager.setMotesIntensity('normal');
    const speed = Math.sqrt(
      this.player.sprite.body.velocity.x ** 2 +
      this.player.sprite.body.velocity.y ** 2
    );
    this.particleManager.followSprite(this.player.sprite, speed > 200);

    // --- Camera lead ---
    const cam = this.cameras.main;
    const velX = this.player.sprite.body.velocity.x;
    cam.setFollowOffset(-velX * 0.12, 0);

    // Velocity zoom
    const speedNorm = Math.min(1, speed / 500);
    const targetZoom = 1 - speedNorm * 0.06;
    cam.setZoom(Phaser.Math.Linear(cam.zoom, targetZoom, 0.05));

    // --- Progress bar ---
    const progress = Math.min(1, this.player.sprite.x / END_X);
    this.progressBarFill.width = 300 * progress;

    // --- Dash indicator ---
    const dashCd = this.player.getDashCooldown();
    this.dashIndicator.fillColor = dashCd > 0 ? 0x666666 : 0x00FF88;
    this.dashIndicator.setAlpha(dashCd > 0 ? 0.4 : 0.8);

    // --- Kill far-behind enemies ---
    for (const enemy of this.enemies) {
      if (!enemy.isDead && enemy.sprite.x < camScrollX - 200) {
        enemy.destroy();
        enemy.isDead = true;
      }
    }

    // --- End trigger ---
    if (this.player.sprite.x >= END_X) {
      this.onReachEnd();
    }

    // --- Fall into ocean death ---
    if (this.player.sprite.y > WORLD_HEIGHT - 50 && !this.player.isDead) {
      this.player.die();
    }
  }
}
