import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS, CHALISA } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';
import ParticleManager from '../systems/ParticleManager.js';

export default class Act5Level1 extends Phaser.Scene {
  constructor() {
    super('Act5Level1');
  }

  create() {
    console.log('[Act5Level1] Creating level...');
    try {
      this._create();
      console.log('[Act5Level1] Level created successfully!');
    } catch (e) {
      console.error('[Act5Level1] CRASH:', e);
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
    this.lakshmanaFallen = false;
    this.currentWave = 0;

    // Giant form state
    this.isGiant = false;
    this.giantTimer = 0;
    this.giantDuration = 8000;

    // --- World setup (side-scrolling battlefield) ---
    const WORLD_WIDTH = 8000;
    const WORLD_HEIGHT = 600;
    this.worldWidth = WORLD_WIDTH;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.gravity.y = 400;

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.particleManager = new ParticleManager(this);
    this.particleManager.init({ width: GAME_WIDTH, height: GAME_HEIGHT });

    // --- Background: war sky ---
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);
    // Dark war overlay
    this.warOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x220000, 0.35)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-99);
    // Smoke / clouds
    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-60).setAlpha(0.4)
      .setTint(0xFF6600);

    // --- Ground ---
    this.ground = this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT - 30, WORLD_WIDTH, 60, 0x3A2208);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(3);
    // Ground top edge
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT - 60, WORLD_WIDTH, 4, 0x5A3A18).setDepth(3);

    // --- Raised platforms ---
    this.platforms = this.physics.add.staticGroup();
    const platformPositions = [
      { x: 1200, y: 440, w: 200 },
      { x: 2800, y: 420, w: 160 },
      { x: 3600, y: 460, w: 180 },
      { x: 4800, y: 400, w: 200 },
      { x: 5600, y: 440, w: 160 },
      { x: 6400, y: 420, w: 200 },
      { x: 7200, y: 450, w: 160 },
    ];
    for (const plat of platformPositions) {
      const p = this.add.rectangle(plat.x, plat.y, plat.w, 20, 0x4A3218);
      this.physics.add.existing(p, true);
      this.platforms.add(p);
      p.setDepth(3);
      // Platform edge highlight
      this.add.rectangle(plat.x, plat.y - 10, plat.w, 3, 0x6A5228).setDepth(4);
    }

    // --- Player ---
    this.player = new Player(this, 100, WORLD_HEIGHT - 120);
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.collider(this.player.sprite, this.platforms);

    // --- Camera ---
    const cam = this.cameras.main;
    cam.startFollow(this.player.sprite, true, 0.08, 0.12);
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    cam.setZoom(1);

    // --- Enemy group ---
    this.enemyGroup = this.physics.add.group();

    // --- Spawn wave-based enemies ---
    this.spawnAllWaves();

    // --- Collisions ---
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, this.onMaceHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onPlayerTouchEnemy, null, this);

    // --- Health pickups ---
    this.spawnHealthPickups();

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
      // Giant form instead of screen-clear
      if (!this.isGiant) {
        this.activateGiantForm();
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

    // --- Battlefield fire decorations ---
    this.spawnBattlefieldDecor();
  }

  spawnAllWaves() {
    // Wave 1 (x: 0-2000): 6 rakshasa demons
    for (let i = 0; i < 6; i++) {
      const x = 400 + Math.random() * 1500;
      const y = this.worldWidth > 0 ? 350 + Math.random() * 150 : 400;
      const enemy = new Enemy(this, x, y, 'demon-cloud', {
        behavior: 'patrol',
        health: 2,
        speed: 60,
        scoreType: 'demonKill',
        patrolRange: 80 + Math.random() * 80,
        gravity: true,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
      this.physics.add.collider(enemy.sprite, this.ground);
    }

    // Wave 2 (x: 2000-4000): 8 demons + 3 guards
    for (let i = 0; i < 8; i++) {
      const x = 2100 + Math.random() * 1800;
      const y = 350 + Math.random() * 150;
      const enemy = new Enemy(this, x, y, 'demon-cloud', {
        behavior: 'patrol',
        health: 2,
        speed: 70,
        scoreType: 'demonKill',
        patrolRange: 60 + Math.random() * 100,
        gravity: true,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
      this.physics.add.collider(enemy.sprite, this.ground);
    }
    for (let i = 0; i < 3; i++) {
      const x = 2200 + Math.random() * 1600;
      const y = 200 + Math.random() * 200;
      const enemy = new Enemy(this, x, y, 'celestial-guard', {
        behavior: 'chase',
        health: 3,
        speed: 70,
        scoreValue: 500,
        scoreType: 'guardKill',
        patrolRange: 100,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }

    // Wave 3 (x: 4000-6000): 10 demons + 5 guards
    for (let i = 0; i < 10; i++) {
      const x = 4100 + Math.random() * 1800;
      const y = 350 + Math.random() * 150;
      const enemy = new Enemy(this, x, y, 'demon-cloud', {
        behavior: 'patrol',
        health: 2,
        speed: 80,
        scoreType: 'demonKill',
        patrolRange: 60 + Math.random() * 80,
        gravity: true,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
      this.physics.add.collider(enemy.sprite, this.ground);
    }
    for (let i = 0; i < 5; i++) {
      const x = 4200 + Math.random() * 1600;
      const y = 150 + Math.random() * 250;
      const behavior = Math.random() > 0.5 ? 'chase' : 'swoop';
      const enemy = new Enemy(this, x, y, 'celestial-guard', {
        behavior,
        health: 3,
        speed: 80,
        scoreValue: 500,
        scoreType: 'guardKill',
        patrolRange: 100,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }

    // Wave 4 (x: 6000-8000): 12 enemies total (heavy combat)
    for (let i = 0; i < 7; i++) {
      const x = 6100 + Math.random() * 1400;
      const y = 350 + Math.random() * 150;
      const enemy = new Enemy(this, x, y, 'demon-cloud', {
        behavior: 'chase',
        health: 3,
        speed: 90,
        scoreType: 'demonKill',
        patrolRange: 60 + Math.random() * 80,
        gravity: true,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
      this.physics.add.collider(enemy.sprite, this.ground);
    }
    for (let i = 0; i < 5; i++) {
      const x = 6200 + Math.random() * 1300;
      const y = 120 + Math.random() * 250;
      const behavior = Math.random() > 0.4 ? 'swoop' : 'chase';
      const enemy = new Enemy(this, x, y, 'celestial-guard', {
        behavior,
        health: 4,
        speed: 100,
        scoreValue: 500,
        scoreType: 'guardKill',
        patrolRange: 120,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }
  }

  spawnHealthPickups() {
    const pickupXPositions = [800, 1800, 3000, 4200, 5400, 6800];
    for (const px of pickupXPositions) {
      const pickup = this.physics.add.sprite(px, 400, 'health-pickup');
      pickup.body.setAllowGravity(false);
      pickup.setDepth(5);

      const glow = this.add.circle(px, 400, 20, 0xFFAACC, 0.2);
      glow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: [pickup, glow],
        y: 390,
        duration: 1000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
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

  spawnBattlefieldDecor() {
    // Fire columns along the battlefield
    for (let x = 500; x < 7500; x += 600 + Math.random() * 400) {
      const fireY = GAME_HEIGHT - 80;
      const fire = this.add.circle(x, fireY, 8 + Math.random() * 6, 0xFF6600, 0.6);
      fire.setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: fire,
        alpha: 0.2,
        scale: 1.5,
        duration: 500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  activateGiantForm() {
    this.isGiant = true;
    this.giantTimer = this.giantDuration;

    // Scale up player
    const currentScale = this.player.sprite.scaleX;
    this.player._normalScale = currentScale;
    this.tweens.add({
      targets: this.player.sprite,
      scaleX: currentScale * 3,
      scaleY: currentScale * 3,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Enlarge mace hitbox
    this.player.maceHitbox.body.setSize(72, 96);

    // Glow intensifies
    this.player.glow.setScale(3);
    this.player.glow.setAlpha(0.5);

    // Camera zoom out
    this.cameras.main.zoomTo(0.85, 500);

    // Giant form text
    const giantText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
      'BHIMA ROOP!', {
        fontSize: '42px', fontFamily: 'Georgia, serif',
        color: '#FF6600', stroke: '#000', strokeThickness: 5,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.tweens.add({
      targets: giantText,
      y: giantText.y - 40, alpha: 0, scale: 1.5,
      duration: 1200, onComplete: () => giantText.destroy(),
    });

    // Screen shake
    this.cameras.main.shake(500, 0.015);

    // Golden flash
    this.cameras.main.flash(400, 255, 180, 0);
  }

  deactivateGiantForm() {
    this.isGiant = false;

    const normalScale = this.player._normalScale || this.player.sprite.scaleX / 3;
    this.tweens.add({
      targets: this.player.sprite,
      scaleX: normalScale,
      scaleY: normalScale,
      duration: 400,
      ease: 'Power2',
    });

    // Restore mace hitbox
    this.player.maceHitbox.body.setSize(36, 48);

    // Restore glow
    this.player.glow.setScale(1);
    this.player.glow.setAlpha(0.12);

    // Camera zoom back
    this.cameras.main.zoomTo(1, 400);
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
    this.add.text(GAME_WIDTH / 2, 20, 'ACT V \u2014 The Battlefield', {
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

    // Giant form indicator
    this.giantTimerText = this.add.text(GAME_WIDTH / 2, 50, '', {
      fontSize: '16px', fontFamily: 'Georgia, serif',
      color: '#FF6600', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0);
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
      const damage = this.isGiant ? 4 : 2;
      enemySprite.enemyRef.takeDamage(damage);
    }
  }

  onPlayerTouchEnemy(playerSprite, enemySprite) {
    if (enemySprite.enemyRef && !enemySprite.enemyRef.isDead) {
      this.player.takeDamage(enemySprite.enemyRef.damage);
    }
  }

  triggerLakshmanaFalls() {
    this.lakshmanaFallen = true;

    // Dramatic screen shake
    this.cameras.main.shake(1000, 0.025);

    // Dark red flash
    this.cameras.main.flash(800, 180, 20, 0);

    // "LAKSHMANA FALLS!" text
    const fallText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'LAKSHMANA FALLS!', {
        fontSize: '36px', fontFamily: 'Georgia, serif',
        color: '#FF2222', stroke: '#000', strokeThickness: 5,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const subtitleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
      'Only the Sanjeevani herb can save him...', {
        fontSize: '16px', fontFamily: 'Georgia, serif',
        color: '#CCAA88', fontStyle: 'italic',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);

    this.tweens.add({ targets: subtitleText, alpha: 1, duration: 800, delay: 800 });
    this.tweens.add({
      targets: [fallText, subtitleText],
      alpha: 0, duration: 1000, delay: 3000,
      onComplete: () => { fallText.destroy(); subtitleText.destroy(); },
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1500, () => {
      const overlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7
      ).setDepth(200).setScrollFactor(0);

      const deathVerse = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
        CHALISA.death.transliteration, {
          fontSize: '20px', fontFamily: 'Georgia, serif',
          color: '#FFD700', stroke: '#000', strokeThickness: 2,
          fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      const riseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
        'Rise again, devotee.', {
          fontSize: '24px', fontFamily: 'Georgia, serif', color: '#FF8844',
          stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70,
        '[ Press SPACE ]', {
          fontSize: '14px', fontFamily: 'Georgia, serif', color: '#999',
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

      this.tweens.add({ targets: deathVerse, alpha: 1, duration: 800 });
      this.tweens.add({ targets: riseText, alpha: 1, duration: 800, delay: 600 });
      this.tweens.add({ targets: retryText, alpha: 0.6, duration: 600, delay: 1200 });
      this.tweens.add({
        targets: retryText, alpha: 0.2,
        duration: 600, yoyo: true, repeat: -1, delay: 1800,
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

    // --- Giant form timer ---
    if (this.isGiant) {
      this.giantTimer -= delta;
      const remaining = Math.ceil(this.giantTimer / 1000);
      this.giantTimerText.setText(`GIANT FORM: ${remaining}s`).setAlpha(1);
      if (this.giantTimer <= 0) {
        this.deactivateGiantForm();
        this.giantTimerText.setAlpha(0);
      }
    }

    // --- Parallax ---
    const scrollX = this.cameras.main.scrollX;
    this.skyBg.tilePositionX = scrollX * 0.05;
    this.cloudsBg.tilePositionX = scrollX * 0.15;

    // --- Lakshmana event at x:7500 ---
    if (!this.lakshmanaFallen && playerPos.x >= 7500) {
      this.triggerLakshmanaFalls();
    }

    // --- Level end at x:7800 ---
    if (!this.levelComplete && playerPos.x >= 7800) {
      this.levelComplete = true;

      // Save progress
      ScoreManager.saveProgress(5, 2);
      ScoreManager.saveBest('act5_level1', this.scoreManager.score,
        this.scoreManager.getGrade(15000));

      this.time.delayedCall(2000, () => {
        this.cleanup();
        this.scene.start('ChalisaTransition', {
          couplet: 'sanjeevani', act: 5, nextScene: 'Act5Level2',
        });
      });
    }

    // Camera lead
    const cam = this.cameras.main;
    const velX = this.player.sprite.body.velocity.x;
    cam.setFollowOffset(-velX * 0.12, 0);

    // Kill enemies far behind
    for (const enemy of this.enemies) {
      if (!enemy.isDead && enemy.sprite.x < playerPos.x - GAME_WIDTH) {
        enemy.destroy();
        enemy.isDead = true;
      }
    }

    // Fall death
    if (playerPos.y > GAME_HEIGHT + 100 && !this.player.isDead) {
      this.player.die();
    }
  }
}
