import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';

const ARENA_WIDTH = 1200;
const ARENA_HEIGHT = 600;

export default class Act3Boss extends Phaser.Scene {
  constructor() {
    super('Act3Boss');
  }

  create() {
    console.log('[Act3Boss] Creating boss level...');
    try {
      this._create();
      console.log('[Act3Boss] Boss level created successfully!');
    } catch (e) {
      console.error('[Act3Boss] CRASH:', e);
      this.add.text(400, 300, 'Boss level failed to load!\n' + e.message, {
        fontSize: '18px', color: '#FF4444', align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setDepth(999);
    }
  }

  _create() {
    this.levelComplete = false;
    this.bossDefeated = false;
    this.enemies = [];

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);

    // --- Background: Lanka's outer wall — dark, menacing ---
    this.wallBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);
    this.wallBg.setTint(0x2A1A0A); // Dark Lanka color

    // Fire glow on the horizon
    this.fireGlow = this.add.rectangle(GAME_WIDTH / 2, 60, GAME_WIDTH, 120, 0xFF4400, 0.08)
      .setScrollFactor(0).setDepth(-90).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: this.fireGlow,
      alpha: 0.15, duration: 2000, yoyo: true, repeat: -1,
    });

    // --- World setup ---
    this.physics.world.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    this.physics.world.gravity.y = PLAYER.fullGravity;

    // --- Ground platforms (3 tiers) ---
    this.platforms = this.physics.add.staticGroup();

    // Tier 1: Ground floor (full width)
    const ground = this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT - 20, ARENA_WIDTH, 40, 0x3A2A18);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
    ground.setDepth(3);
    // Ground accent line
    this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT - 40, ARENA_WIDTH, 4, 0x554433).setDepth(3);

    // Tier 2: Mid platforms (left and right)
    const midLeft = this.add.rectangle(200, ARENA_HEIGHT - 180, 280, 20, 0x443322);
    this.physics.add.existing(midLeft, true);
    this.platforms.add(midLeft);
    midLeft.setDepth(3);

    const midRight = this.add.rectangle(ARENA_WIDTH - 200, ARENA_HEIGHT - 180, 280, 20, 0x443322);
    this.physics.add.existing(midRight, true);
    this.platforms.add(midRight);
    midRight.setDepth(3);

    // Tier 3: High center platform
    const highCenter = this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT - 340, 240, 20, 0x554433);
    this.physics.add.existing(highCenter, true);
    this.platforms.add(highCenter);
    highCenter.setDepth(3);

    // Small stepping platforms between tiers
    const stepLeft = this.add.rectangle(380, ARENA_HEIGHT - 260, 120, 16, 0x3A2A18);
    this.physics.add.existing(stepLeft, true);
    this.platforms.add(stepLeft);
    stepLeft.setDepth(3);

    const stepRight = this.add.rectangle(ARENA_WIDTH - 380, ARENA_HEIGHT - 260, 120, 16, 0x3A2A18);
    this.physics.add.existing(stepRight, true);
    this.platforms.add(stepRight);
    stepRight.setDepth(3);

    // --- Player ---
    this.player = new Player(this, 100, ARENA_HEIGHT - 100, { canFly: true });
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.platforms);

    // --- Camera ---
    const cam = this.cameras.main;
    cam.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    cam.startFollow(this.player.sprite, true, 0.1, 0.1);
    cam.setZoom(GAME_WIDTH / ARENA_WIDTH); // fit arena to screen

    // --- LANKINI BOSS ---
    this.lankini = this.physics.add.sprite(ARENA_WIDTH - 150, ARENA_HEIGHT - 120, 'celestial-guard');
    this.lankini.setScale(2.5);
    this.lankini.setTint(0xFF4444); // Red tint
    this.lankini.body.setAllowGravity(true);
    this.lankini.body.setImmovable(false);
    this.lankini.body.setBounce(0);
    this.lankini.body.setCollideWorldBounds(true);
    this.lankini.setDepth(8);
    this.physics.add.collider(this.lankini, this.platforms);

    this.bossHealth = 20;
    this.bossMaxHealth = 20;
    this.bossPhase = 1; // 1: charge+shockwave, 2: +minions, 3: faster+double shockwave
    this.bossInvincible = false;
    this.bossActive = false;
    this.isCharging = false;

    // Shockwave group
    this.shockwaves = this.physics.add.group();
    // Minion group
    this.minionGroup = this.physics.add.group();
    this.minionCount = 0;
    this.minionTimer = 0;

    // --- Boss health bar ---
    this.bossBarBg = this.add.rectangle(GAME_WIDTH / 2, 30, 300, 16, 0x333333)
      .setScrollFactor(0).setDepth(100);
    this.bossBar = this.add.rectangle(GAME_WIDTH / 2 - 150, 30, 300, 16, 0xFF4444)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.bossBarBorder = this.add.rectangle(GAME_WIDTH / 2, 30, 300, 16)
      .setScrollFactor(0).setDepth(102).setStrokeStyle(1, 0xFF6666);
    this.bossNameText = this.add.text(GAME_WIDTH / 2, 12, 'LANKINI \u2014 Guardian of Lanka', {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#FF8866', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // --- Boss entrance ---
    this.showBossIntro();

    // --- Collisions ---
    this.physics.add.overlap(this.player.maceHitbox, this.lankini, () => this.hitBoss());
    this.physics.add.overlap(this.player.sprite, this.lankini, () => {
      if (!this.bossDefeated) this.player.takeDamage(1);
    });
    this.physics.add.overlap(this.player.sprite, this.shockwaves, (ps, sw) => {
      this.player.takeDamage(1);
    });
    this.physics.add.overlap(this.player.maceHitbox, this.minionGroup, (mh, minionSprite) => {
      if (minionSprite.enemyRef && !minionSprite.enemyRef.isDead) {
        this.player.onMaceConnected(minionSprite.x, minionSprite.y);
        minionSprite.enemyRef.takeDamage(2);
      }
    });
    this.physics.add.overlap(this.player.sprite, this.minionGroup, (ps, minionSprite) => {
      if (minionSprite.enemyRef && !minionSprite.enemyRef.isDead) {
        this.player.takeDamage(1);
      }
    });

    // --- HUD ---
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      this.hearts.push(
        this.add.image(30 + i * 28, GAME_HEIGHT - 30, 'heart')
          .setScrollFactor(0).setDepth(100)
      );
    }

    this.scoreManager.scoreText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 30, 'Score: 0', {
      fontSize: '16px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');

    this.touchState = { left: false, right: false, up: false, attack: false };
    this.input.on('pointerdown', (p) => {
      if (p.y < GAME_HEIGHT * 0.4) this.touchState.up = true;
      if (p.x < GAME_WIDTH * 0.3) this.touchState.left = true;
      else if (p.x > GAME_WIDTH * 0.7) this.touchState.right = true;
      else this.touchState.attack = true;
    });
    this.input.on('pointerup', () => {
      this.touchState = { left: false, right: false, up: false, attack: false };
    });

    // --- Events ---
    this.events.on('playerDamaged', (h) => {
      for (let i = 0; i < this.hearts.length; i++) {
        this.hearts[i].setTexture(i < h ? 'heart' : 'heart-empty');
      }
    });
    this.events.on('playerDied', () => this.onPlayerDied());
    this.events.on('enemyKilled', (data) => {
      this.scoreManager.addPoints(data.scoreType, { x: data.x, y: data.y });
      this.minionCount = Math.max(0, this.minionCount - 1);
    });

    // Attack pattern timer
    this.attackTimer = 0;
    this.chargeInterval = 3000; // ms between charges
  }

  showBossIntro() {
    // Dramatic entrance
    const introOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(199);

    const introText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20,
      'LANKINI AWAITS', {
        fontSize: '32px', fontFamily: 'Georgia, serif',
        color: '#FF4444', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const subtitleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
      'Guardian of Lanka\'s Gates', {
        fontSize: '16px', fontFamily: 'Georgia, serif',
        color: '#FF8866', fontStyle: 'italic',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: introText, alpha: 1, duration: 800,
    });
    this.tweens.add({
      targets: subtitleText, alpha: 0.8, duration: 800, delay: 400,
    });

    this.time.delayedCall(2500, () => {
      this.tweens.add({
        targets: [introText, subtitleText, introOverlay],
        alpha: 0, duration: 600,
        onComplete: () => {
          introText.destroy();
          subtitleText.destroy();
          introOverlay.destroy();
          this.bossActive = true;
          this.startBossPattern();
        },
      });
    });

    // Lankini stomps into position
    this.lankini.x = ARENA_WIDTH + 100;
    this.tweens.add({
      targets: this.lankini,
      x: ARENA_WIDTH - 150,
      duration: 2000,
      ease: 'Power2',
    });
  }

  startBossPattern() {
    // Begin the attack loop
    this.attackTimer = 0;
  }

  // --- CHARGE ATTACK ---
  chargeAtPlayer() {
    if (this.bossDefeated || !this.bossActive || this.isCharging) return;
    this.isCharging = true;

    // Warning: red flash and shake
    this.lankini.setTint(0xFF0000);
    this.cameras.main.shake(200, 0.005);

    const targetX = this.player.sprite.x;

    this.time.delayedCall(500, () => {
      if (this.bossDefeated) return;
      this.lankini.clearTint();
      this.lankini.setTint(0xFF4444);

      // Dash across arena toward player
      const chargeSpeed = this.bossPhase === 3 ? 600 : 400;
      const dir = targetX < this.lankini.x ? -1 : 1;
      this.lankini.body.setVelocityX(dir * chargeSpeed);

      // After a duration, stop and ground slam
      this.time.delayedCall(800, () => {
        if (this.bossDefeated) return;
        this.lankini.body.setVelocityX(0);
        this.groundSlam();
        this.isCharging = false;
      });
    });
  }

  // --- GROUND SLAM → SHOCKWAVE ---
  groundSlam() {
    if (this.bossDefeated) return;

    // Screen shake
    this.cameras.main.shake(300, 0.015);

    // Create shockwave(s)
    const createShockwave = (direction) => {
      const sw = this.add.rectangle(
        this.lankini.x + direction * 30,
        ARENA_HEIGHT - 50,
        60, 30, 0xFF6600, 0.7
      );
      this.physics.add.existing(sw, false);
      sw.body.setAllowGravity(false);
      sw.body.setVelocityX(direction * 250);
      sw.setDepth(7);
      sw.setBlendMode(Phaser.BlendModes.ADD);
      this.shockwaves.add(sw);

      // Shockwave visual trail
      this.tweens.add({
        targets: sw,
        alpha: 0, scaleY: 0.3,
        duration: 2000,
        onComplete: () => sw.destroy(),
      });

      // Auto-destroy after distance
      this.time.delayedCall(2500, () => {
        if (sw && sw.active) sw.destroy();
      });
    };

    // Phase 1 & 2: single shockwave toward player
    const dir = this.player.sprite.x < this.lankini.x ? -1 : 1;
    createShockwave(dir);

    // Phase 3: double shockwaves (both directions)
    if (this.bossPhase === 3) {
      createShockwave(-dir);
    }

    // Slam particles
    const particles = this.add.particles(this.lankini.x, ARENA_HEIGHT - 50, 'particle', {
      speed: { min: 40, max: 120 },
      angle: { min: 240, max: 300 },
      scale: { start: 1, end: 0 },
      tint: [0xFF6600, 0xFF4400, 0xFFAA00],
      lifespan: 500,
      quantity: 12,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    particles.explode();
    this.time.delayedCall(600, () => particles.destroy());
  }

  // --- SUMMON MINIONS (Phase 2+) ---
  summonMinions() {
    if (this.bossDefeated || this.minionCount >= 4) return;

    // Flash warning
    this.lankini.setTint(0xFF00FF);
    this.time.delayedCall(200, () => {
      if (!this.bossDefeated) this.lankini.setTint(0xFF4444);
    });

    for (let i = 0; i < 2; i++) {
      if (this.minionCount >= 4) break;

      const spawnX = 100 + Math.random() * (ARENA_WIDTH - 200);
      const spawnY = ARENA_HEIGHT - 300 - Math.random() * 150;

      const minion = new Enemy(this, spawnX, spawnY, 'demon-cloud', {
        behavior: 'chase',
        health: 1,
        speed: 70 + Math.random() * 30,
        scoreValue: 150,
        scoreType: 'demonKill',
        gravity: true,
        patrolRange: 80,
      });
      this.enemies.push(minion);
      this.minionGroup.add(minion.sprite);
      this.physics.add.collider(minion.sprite, this.platforms);
      this.minionCount++;

      // Spawn-in effect
      const spawnFlash = this.add.circle(spawnX, spawnY, 30, 0xFF4444, 0.5);
      spawnFlash.setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: spawnFlash,
        scale: 2, alpha: 0, duration: 400,
        onComplete: () => spawnFlash.destroy(),
      });
    }
  }

  // --- HIT BOSS ---
  hitBoss() {
    if (this.bossInvincible || this.bossDefeated || !this.player.isAttacking) return;

    this.bossHealth--;
    this.bossInvincible = true;

    // Update health bar
    this.bossBar.width = (this.bossHealth / this.bossMaxHealth) * 300;

    // Flash white
    this.lankini.setTintFill(0xFFFFFF);
    this.cameras.main.shake(150, 0.01);

    // Score
    this.scoreManager.addPoints('bossHit', { x: this.lankini.x, y: this.lankini.y });

    // Hit particles
    const particles = this.add.particles(this.lankini.x, this.lankini.y, 'particle', {
      speed: { min: 80, max: 200 },
      tint: [0xFF4444, 0xFFAA00, 0xFFFF00],
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 10,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    particles.explode();
    this.time.delayedCall(500, () => particles.destroy());

    // Knockback boss slightly
    const kb = this.player.sprite.x < this.lankini.x ? 150 : -150;
    this.lankini.body.setVelocityX(kb);

    this.time.delayedCall(300, () => {
      this.bossInvincible = false;
      if (!this.bossDefeated) {
        this.lankini.clearTint();
        this.lankini.setTint(0xFF4444);
      }
    });

    // --- Phase transitions ---
    if (this.bossHealth <= 14 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.showPhaseText('Lankini summons her demons!');
    } else if (this.bossHealth <= 7 && this.bossPhase === 2) {
      this.bossPhase = 3;
      this.chargeInterval = 2000; // faster charges
      this.showPhaseText('Lankini unleashes her fury!');
    }

    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  showPhaseText(msg) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontSize: '22px', fontFamily: 'Georgia, serif',
      color: '#FF6644', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({
      targets: t, y: t.y - 40, alpha: 0,
      duration: 2000,
      onComplete: () => t.destroy(),
    });
  }

  // --- DEFEAT BOSS ---
  defeatBoss() {
    this.bossDefeated = true;
    this.levelComplete = true;
    this.bossActive = false;

    // Clear hazards
    this.shockwaves.clear(true, true);
    // Kill remaining minions
    for (const enemy of this.enemies) {
      if (!enemy.isDead) {
        enemy.takeDamage(999);
      }
    }

    // Boss death sequence
    this.cameras.main.shake(600, 0.025);
    this.cameras.main.flash(800, 255, 215, 0); // golden flash

    // Multiple explosion bursts
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 350, () => {
        const p = this.add.particles(
          this.lankini.x + Phaser.Math.Between(-40, 40),
          this.lankini.y + Phaser.Math.Between(-40, 40),
          'particle', {
            speed: { min: 100, max: 300 },
            tint: [0xFFD700, 0xFF6600, 0xFF4444, 0xFFFFFF],
            scale: { start: 2, end: 0 },
            lifespan: 800,
            quantity: 20,
            emitting: false,
            blendMode: Phaser.BlendModes.ADD,
          }
        );
        p.explode();
        this.time.delayedCall(900, () => p.destroy());
      });
    }

    // Lankini fades
    this.tweens.add({
      targets: this.lankini,
      alpha: 0, scale: 0.5,
      duration: 2000, delay: 500,
    });

    // Boss health bar fades
    this.tweens.add({
      targets: [this.bossBar, this.bossBarBg, this.bossBarBorder, this.bossNameText],
      alpha: 0, duration: 1000,
    });

    // --- Victory: Gates of Lanka Open ---
    this.time.delayedCall(2000, () => {
      // Golden flash
      this.cameras.main.flash(600, 255, 215, 0);

      const gateText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50,
        'THE GATES OF LANKA OPEN', {
          fontSize: '30px', fontFamily: 'Georgia, serif',
          color: '#FFD700', stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

      const narrativeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
        'Lankini falls. The path to Sita is revealed.', {
          fontSize: '16px', fontFamily: 'Georgia, serif',
          color: '#CCAA88', fontStyle: 'italic',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

      const chalisaText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
        'Lanka kot samudra si khai,\njaat Pawansut baar na lai', {
          fontSize: '14px', fontFamily: 'Georgia, serif',
          color: '#FF8844', fontStyle: 'italic', align: 'center',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

      this.tweens.add({ targets: gateText, alpha: 1, duration: 1000 });
      this.tweens.add({ targets: narrativeText, alpha: 0.8, duration: 1000, delay: 600 });
      this.tweens.add({ targets: chalisaText, alpha: 0.7, duration: 1000, delay: 1200 });
    });

    // Save progress and transition
    ScoreManager.saveProgress(3, 4); // unlock Act 4
    ScoreManager.saveBest('act3_boss', this.scoreManager.score,
      this.scoreManager.getGrade(15000));

    this.time.delayedCall(7000, () => {
      this.cleanup();
      this.scene.start('ChalisaTransition', {
        couplet: 'boss', act: 3, nextScene: 'Act4Level1',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1500, () => {
      const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(200);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
        'Lankini stands guard...', {
          fontSize: '28px', fontFamily: 'Georgia, serif',
          color: '#FF6644', stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
        'Sankat se Hanuman chhudave', {
          fontSize: '16px', fontFamily: 'Georgia, serif',
          color: '#FFD700', fontStyle: 'italic',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60,
        '[ Press SPACE to retry ]', {
          fontSize: '14px', fontFamily: 'Georgia, serif', color: '#CCC',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
      this.tweens.add({
        targets: retryText, alpha: 0.3,
        duration: 600, yoyo: true, repeat: -1,
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
  }

  update(time, delta) {
    if (this.levelComplete) return;

    // --- Controls ---
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

    // --- Update minion enemies ---
    const playerPos = this.player.getPosition();
    for (const enemy of this.enemies) {
      enemy.update(time, playerPos);
    }

    // --- Boss AI ---
    if (this.bossActive && !this.bossDefeated) {
      this.attackTimer += delta;

      // Face the player
      this.lankini.setFlipX(this.player.sprite.x < this.lankini.x);

      // Charge attack on interval
      if (this.attackTimer >= this.chargeInterval && !this.isCharging) {
        this.attackTimer = 0;
        this.chargeAtPlayer();
      }

      // Phase 2+: summon minions every 5 seconds
      if (this.bossPhase >= 2) {
        this.minionTimer += delta;
        if (this.minionTimer >= 5000) {
          this.minionTimer = 0;
          this.summonMinions();
        }
      }

      // Boss slow patrol when not charging
      if (!this.isCharging) {
        const dx = this.player.sprite.x - this.lankini.x;
        if (Math.abs(dx) > 150) {
          this.lankini.body.setVelocityX(Math.sign(dx) * 60);
        } else {
          this.lankini.body.setVelocityX(0);
        }
      }
    }

    // --- Parallax ---
    this.wallBg.tilePositionX += 0.15;
    this.wallBg.tilePositionY += 0.05;
  }
}
