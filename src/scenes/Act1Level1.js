import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';
import ParticleManager from '../systems/ParticleManager.js';
import CombatFeel from '../systems/CombatFeel.js';
import DepthFog from '../systems/DepthFog.js';
import GlowSystem from '../systems/GlowSystem.js';
import SiddhiSystem from '../systems/SiddhiSystem.js';
import VibrationCombat from '../systems/VibrationCombat.js';

export default class Act1Level1 extends Phaser.Scene {
  constructor() {
    super('Act1Level1');
  }

  create() {
    console.log('[Act1Level1] Creating level...');
    try {
      this._create();
      console.log('[Act1Level1] Level created successfully!');
    } catch (e) {
      console.error('[Act1Level1] CRASH:', e);
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

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.particleManager = new ParticleManager(this);
    this.combatFeel = new CombatFeel(this);
    this.depthFog = new DepthFog(this);
    this.glowSystem = new GlowSystem(this);
    this.siddhiSystem = new SiddhiSystem(this);
    this.vibrationCombat = new VibrationCombat(this);

    // Unlock Act 1 siddhis (Laghima — divine flight)
    this.siddhiSystem.unlockForAct(1);

    // Initialize vibration combat syllable tracker
    this.vibrationCombat.init();
    this.particleManager.init({ width: GAME_WIDTH, height: GAME_HEIGHT });

    // --- Parallax Backgrounds ---
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);

    this.cosmicBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-99).setAlpha(0);

    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-60);

    this.mountainsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'mountains')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-80).setAlpha(0.7);

    // Altitude tint overlay (warm amber → neutral → cool indigo → golden glow)
    this.altitudeTint = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xFFB347, 0.08)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(40).setBlendMode(Phaser.BlendModes.ADD);

    // Depth fog — starts as forest biome, transitions with altitude
    this.depthFog.init('forest', [
      { depth: -80, scrollFactor: 0.08 },
      { depth: -60, scrollFactor: 0.15 },
    ]);

    // --- World setup ---
    this.physics.world.setBounds(0, -10000, GAME_WIDTH, 10600);
    this.physics.world.gravity.y = PLAYER.gravity;

    // Ground
    this.ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 40, 0x3A2A18);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(3);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, GAME_WIDTH, 4, 0x4A7A30).setDepth(3);

    // --- Player ---
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 100);
    this.player.sprite.body.setCollideWorldBounds(false);
    this.physics.add.collider(this.player.sprite, this.ground);

    // --- Camera with lead ---
    const cam = this.cameras.main;
    cam.startFollow(this.player.sprite, true, 0.08, 0.12);
    cam.setBounds(0, -10000, GAME_WIDTH, 10600);
    cam.setFollowOffset(0, 0);
    this.cameraBaseZoom = 1;
    cam.setZoom(1);

    // --- Hint ---
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 150,
      '↑  Fly   ← → Move   SPACE Attack\nSHIFT Dash   Q  Divine Special', {
        fontSize: '14px', fontFamily: 'Georgia, serif',
        color: '#FFD700', align: 'center',
        stroke: '#000000', strokeThickness: 3, lineSpacing: 4,
      }).setOrigin(0.5).setDepth(100);
    this.time.delayedCall(6000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 1000 });
    });

    // --- Sun goal ---
    this.sun = this.physics.add.sprite(GAME_WIDTH / 2, -9000, 'sun');
    this.sun.setScale(1.5);
    this.sun.body.setAllowGravity(false);
    this.sun.body.setImmovable(true);
    this.sun.setDepth(5);

    // Sun glow aura — use proper radial gradient glow texture (Ori-style)
    if (this.textures.exists('glow-sun')) {
      this.sunGlow = this.add.image(GAME_WIDTH / 2, -9000, 'glow-sun');
      this.sunGlow.setScale(4).setAlpha(0.35);
    } else {
      this.sunGlow = this.add.circle(GAME_WIDTH / 2, -9000, 120, 0xFFD700, 0.15);
    }
    this.sunGlow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: [this.sun, this.sunGlow],
      scale: '+=0.2',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Second larger glow layer for corona
    this.sunCorona = this.add.circle(GAME_WIDTH / 2, -9000, 200, 0xFFAA00, 0.06);
    this.sunCorona.setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: this.sunCorona,
      scale: 1.3,
      alpha: 0.12,
      duration: 3000,
      yoyo: true,
      repeat: -1,
    });

    // --- Collision groups ---
    this.enemyGroup = this.physics.add.group();
    this.obstacleGroup = this.physics.add.group();

    // --- Spawn content ---
    this.spawnLevelContent();

    // --- Collisions ---
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, this.onMaceHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onPlayerTouchEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.sun, this.onReachSun, null, this);

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
      this.player.addDevotion(10); // devotion per kill
    });
    this.events.on('devotionSpecial', () => {
      // Kill all enemies on screen
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
    // Vibration Combat: divine intervention (verse completed through combat)
    this.events.on('divineIntervention', (data) => {
      for (const enemy of this.enemies) {
        if (!enemy.isDead) {
          const dx = Math.abs(enemy.sprite.x - this.player.sprite.x);
          const dy = Math.abs(enemy.sprite.y - this.player.sprite.y);
          if (dx < GAME_WIDTH && dy < GAME_HEIGHT) {
            enemy.takeDamage(999);
          }
        }
      }
      this.scoreManager.score += data.bonusPoints;
      this.scoreManager.updateUI();
    });
    this.events.on('devotionChanged', (val, max) => {
      this.updateDevotionBar(val, max);
    });

    // --- Touch controls ---
    this.setupTouchControls();

    // --- Altitude text ---
    this.altitudeText = this.add.text(GAME_WIDTH - 20, 80, '', {
      fontSize: '12px', fontFamily: 'monospace',
      color: '#FFCC88', align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  spawnLevelContent() {
    // Clouds as platforms
    for (let y = GAME_HEIGHT - 200; y > -8500; y -= 150 + Math.random() * 200) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const cloud = this.physics.add.sprite(x, y, 'cloud');
      cloud.body.setAllowGravity(false);
      cloud.body.setImmovable(true);
      cloud.setAlpha(0.5 + Math.random() * 0.3);
      cloud.setScale(0.8 + Math.random() * 0.6);
      cloud.setDepth(3);

      if (Math.random() > 0.6) {
        this.tweens.add({
          targets: cloud,
          x: cloud.x + (Math.random() > 0.5 ? 80 : -80),
          duration: 3000 + Math.random() * 2000,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
      this.obstacles.push(cloud);
    }

    // Stars (decorative)
    for (let y = GAME_HEIGHT - 400; y > -8800; y -= 300 + Math.random() * 300) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const star = this.physics.add.sprite(x, y, 'star');
      star.body.setAllowGravity(false);
      star.setDepth(4);
      star.setScale(0.8);
      this.tweens.add({ targets: star, angle: 360, duration: 3000, repeat: -1 });
      this.obstacles.push(star);
    }

    // Asteroids (hazards)
    for (let y = -2000; y > -8500; y -= 400 + Math.random() * 400) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const asteroid = this.physics.add.sprite(x, y, 'asteroid');
      asteroid.body.setAllowGravity(false);
      asteroid.setDepth(4);
      asteroid.body.setCircle(14);
      const speed = 30 + Math.random() * 60;
      asteroid.body.setVelocityX(Math.random() > 0.5 ? speed : -speed);
      asteroid.body.setBounceX(1);
      asteroid.body.setCollideWorldBounds(true);
      this.tweens.add({ targets: asteroid, angle: 360, duration: 2000 + Math.random() * 2000, repeat: -1 });
      this.obstacleGroup.add(asteroid);
      this.obstacles.push(asteroid);
    }

    // Enemies
    const enemyConfigs = [
      { minY: GAME_HEIGHT - 600, maxY: -1000, type: 'demon-cloud', behavior: 'patrol', count: 6, health: 2, speed: 60, scoreType: 'demonKill' },
      { minY: -1000, maxY: -4000, type: 'demon-cloud', behavior: 'float', count: 5, health: 2, speed: 50, scoreType: 'demonKill' },
      { minY: -3000, maxY: -6000, type: 'celestial-guard', behavior: 'chase', count: 4, health: 3, speed: 70, scoreValue: 500, scoreType: 'guardKill' },
      { minY: -5000, maxY: -8500, type: 'celestial-guard', behavior: 'swoop', count: 4, health: 3, speed: 90, scoreValue: 500, scoreType: 'guardKill' },
    ];

    for (const config of enemyConfigs) {
      for (let i = 0; i < config.count; i++) {
        const y = config.minY + Math.random() * (config.maxY - config.minY);
        const x = 60 + Math.random() * (GAME_WIDTH - 120);
        const enemy = new Enemy(this, x, y, config.type, {
          behavior: config.behavior,
          health: config.health,
          speed: config.speed,
          scoreValue: config.scoreValue || 200,
          scoreType: config.scoreType,
          patrolRange: 80 + Math.random() * 80,
        });
        this.enemies.push(enemy);
        this.enemyGroup.add(enemy.sprite);
      }
    }

    // Health pickups (lotuses)
    for (let y = GAME_HEIGHT - 800; y > -8000; y -= 1200 + Math.random() * 800) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const pickup = this.physics.add.sprite(x, y, 'health-pickup');
      pickup.body.setAllowGravity(false);
      pickup.setDepth(5);

      // Soft glow behind lotus
      const glow = this.add.circle(x, y, 20, 0xFFAACC, 0.2);
      glow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: [pickup, glow],
        y: y + 10,
        duration: 1000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.tweens.add({
        targets: glow,
        alpha: 0.4, scale: 1.3,
        duration: 1200,
        yoyo: true, repeat: -1,
      });

      this.physics.add.overlap(this.player.sprite, pickup, () => {
        if (this.player.health < this.player.maxHealth) {
          this.player.heal();
          this.scoreManager.addPoints('lotus', { x: pickup.x, y: pickup.y });
          glow.destroy();
          pickup.destroy();
        }
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
    this.add.text(GAME_WIDTH / 2, 20, 'ACT I — Flight to the Sun', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0.7);

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

    // Dash cooldown indicator (small dot near hearts)
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
      // CombatFeel: hit-stop + camera punch + particles
      if (this.combatFeel) {
        this.combatFeel.maceImpact(enemySprite, 1.0);
      }
      // Player hit-stop callback
      this.player.onMaceConnected(enemySprite.x, enemySprite.y);
      // Vibration combat: count syllable
      if (this.vibrationCombat) {
        this.vibrationCombat.onMaceHit();
      }
      enemySprite.enemyRef.takeDamage(2);
    }
  }

  onPlayerTouchEnemy(playerSprite, enemySprite) {
    if (enemySprite.enemyRef && !enemySprite.enemyRef.isDead) {
      this.player.takeDamage(enemySprite.enemyRef.damage);
      // CombatFeel: damage flash
      if (this.combatFeel) {
        this.combatFeel.damageFlash();
      }
    }
  }

  onReachSun() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);
    this.cameras.main.flash(1000, 255, 215, 0);

    // Intensify particles
    this.particleManager.setMotesIntensity('divine');

    const victoryText = this.add.text(GAME_WIDTH / 2, this.player.sprite.y - 60, 'The Sun!', {
      fontSize: '36px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: victoryText,
      y: victoryText.y - 30, alpha: 0,
      duration: 2000, delay: 1000,
    });

    // Save progress
    ScoreManager.saveProgress(1, 2);
    ScoreManager.saveBest('act1_level1', this.scoreManager.score,
      this.scoreManager.getGrade(8000));

    this.time.delayedCall(3000, () => {
      this.cleanup();
      this.scene.start('ChalisaTransition', {
        couplet: 'level2', act: 1, nextScene: 'Act1Level2',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1500, () => {
      const overlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7
      ).setDepth(200).setScrollFactor(0);

      // Death verse from Chalisa
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

      // Fade in sequentially
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
    if (this.combatFeel) this.combatFeel.destroy();
    if (this.depthFog) this.depthFog.destroy();
    if (this.glowSystem) this.glowSystem.destroy();
    if (this.vibrationCombat) this.vibrationCombat.destroy();
  }

  update(time, delta) {
    if (this.levelComplete) return;

    // Combined controls
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

    // Update enemies
    const playerPos = this.player.getPosition();
    for (const enemy of this.enemies) {
      enemy.update(time, playerPos);
    }

    // --- Parallax & atmosphere ---
    const playerY = this.player.sprite.y;
    const altNorm = Math.max(0, Math.min(1, (GAME_HEIGHT - playerY) / 9000));

    // Clouds and mountains parallax
    this.cloudsBg.tilePositionY = playerY * 0.15;
    this.mountainsBg.tilePositionY = playerY * 0.08;

    // Fade layers with altitude
    this.mountainsBg.setAlpha(0.7 * Math.max(0, 1 - altNorm * 3));
    this.cloudsBg.setAlpha(Math.max(0, 1 - altNorm * 2));

    // Dawn → cosmic transition
    const cosmicT = Math.max(0, Math.min(1, (altNorm - 0.2) / 0.5));
    this.skyBg.setAlpha(1 - cosmicT);
    this.cosmicBg.setAlpha(cosmicT);

    // Altitude tint overlay
    if (altNorm < 0.22) {
      // Forest zone: warm amber
      this.altitudeTint.fillColor = 0xFFB347;
      this.altitudeTint.setAlpha(0.06);
    } else if (altNorm < 0.56) {
      // Cloud zone: neutral
      this.altitudeTint.setAlpha(0.02);
    } else if (altNorm < 0.89) {
      // Cosmic zone: cool indigo
      this.altitudeTint.fillColor = 0x4444AA;
      this.altitudeTint.setAlpha(0.08);
    } else {
      // Near sun: golden glow intensifying
      this.altitudeTint.fillColor = 0xFFD700;
      this.altitudeTint.setAlpha(0.1 + (altNorm - 0.89) * 1.5);
    }

    // Update altitude particles
    this.particleManager.updateAltitude(altNorm);

    // Depth fog biome transitions with altitude
    if (this.depthFog) {
      if (altNorm < 0.22) this.depthFog.transitionTo('forest');
      else if (altNorm < 0.56) this.depthFog.transitionTo('clouds');
      else if (altNorm < 0.89) this.depthFog.transitionTo('cosmic');
      else this.depthFog.transitionTo('sun');

      // Devotion intensity reduces fog (world becomes more divine)
      this.depthFog.updateDevotionIntensity(this.player.getDevotionPercent());
    }

    // Update glow system
    if (this.glowSystem) this.glowSystem.update();

    // Movement trail particles
    const speed = Math.sqrt(
      this.player.sprite.body.velocity.x ** 2 +
      this.player.sprite.body.velocity.y ** 2
    );
    this.particleManager.followSprite(this.player.sprite, speed > 200);

    // --- Camera lead (offset toward velocity direction) ---
    const cam = this.cameras.main;
    const velX = this.player.sprite.body.velocity.x;
    const velY = this.player.sprite.body.velocity.y;
    cam.setFollowOffset(-velX * 0.15, -velY * 0.1);

    // Velocity zoom (faster = slight zoom out)
    const speedNorm = Math.min(1, speed / 500);
    const targetZoom = 1 - speedNorm * 0.08;
    cam.setZoom(Phaser.Math.Linear(cam.zoom, targetZoom, 0.05));

    // Altitude display
    const altitude = Math.max(0, Math.floor((GAME_HEIGHT - playerY) / 10));
    this.altitudeText.setText(`↑ ${altitude}m`);

    // Dash indicator
    const dashCd = this.player.getDashCooldown();
    this.dashIndicator.fillColor = dashCd > 0 ? 0x666666 : 0x00FF88;
    this.dashIndicator.setAlpha(dashCd > 0 ? 0.4 : 0.8);

    // Kill far enemies
    for (const enemy of this.enemies) {
      if (!enemy.isDead && enemy.sprite.y > playerY + GAME_HEIGHT * 1.5) {
        enemy.destroy();
        enemy.isDead = true;
      }
    }

    // Fall death
    if (playerY > GAME_HEIGHT + 200 && !this.player.isDead) {
      this.player.die();
    }

    // Sun glow follows sun (for parallax)
    if (this.sunGlow) {
      this.sunGlow.setPosition(this.sun.x, this.sun.y);
      this.sunCorona.setPosition(this.sun.x, this.sun.y);
    }
  }
}
