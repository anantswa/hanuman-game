import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, CHALISA } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';

export default class Act4Level1 extends Phaser.Scene {
  constructor() {
    super('Act4Level1');
  }

  create() {
    this.enemies = [];
    this.levelComplete = false;
    this.sitaEncounterTriggered = false;

    // Score manager
    this.scoreManager = new ScoreManager(this);

    // --- World setup ---
    this.physics.world.setBounds(0, 0, 7000, GAME_HEIGHT);
    this.physics.world.gravity.y = 300;

    // --- Dark Lanka night background ---
    this.lankaBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setTint(0x1A0A2E);

    // Dim fog layer for atmosphere
    this.fogLayer = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setAlpha(0.08).setTint(0x331155);

    // --- Platforms: stone walls and rooftops ---
    this.platforms = this.physics.add.staticGroup();
    this.buildLanka();

    // --- Player ---
    this.player = new Player(this, 120, 420, { canFly: true });

    // Camera
    this.cameras.main.startFollow(this.player.sprite, true, 0.3, 0.1);
    this.cameras.main.setBounds(0, 0, 7000, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#0A0518');

    // --- Enemies: Lanka guards ---
    this.spawnGuards();

    // Enemy physics group
    this.enemyGroup = this.physics.add.group();
    for (const enemy of this.enemies) {
      this.enemyGroup.add(enemy.sprite);
    }

    // --- Collisions ---
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, (mace, esprite) => {
      if (esprite.enemyRef && !esprite.enemyRef.isDead) {
        esprite.enemyRef.takeDamage(2);
        this.player.onMaceConnected(esprite.x, esprite.y);
      }
    });
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, (ps, esprite) => {
      if (esprite.enemyRef && !esprite.enemyRef.isDead) {
        this.player.takeDamage(esprite.enemyRef.damage);
      }
    });

    // --- Sita encounter zone at x:5500 ---
    this.sitaZone = this.add.zone(5500, 300, 80, GAME_HEIGHT);
    this.physics.add.existing(this.sitaZone, true);
    this.physics.add.overlap(this.player.sprite, this.sitaZone, () => this.triggerSitaEncounter());

    // --- End zone ---
    this.endZone = this.add.zone(6800, 300, 80, GAME_HEIGHT);
    this.physics.add.existing(this.endZone, true);
    this.physics.add.overlap(this.player.sprite, this.endZone, () => this.onLevelComplete());

    // --- HUD ---
    this.createHUD();

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.touchState = { left: false, right: false, up: false, attack: false };
    this.setupTouchControls();

    // --- Events ---
    this.events.on('playerDamaged', (h) => this.updateHealthDisplay(h));
    this.events.on('playerDied', () => this.onPlayerDied());
    this.events.on('enemyKilled', (data) => {
      this.scoreManager.addPoints(data.scoreType || 'guardKill', { x: data.x, y: data.y });
      this.player.addDevotion(10);
    });
    this.events.on('devotionSpecial', () => {
      for (const enemy of this.enemies) {
        if (!enemy.isDead && this.isOnScreen(enemy.sprite)) {
          enemy.takeDamage(999);
        }
      }
    });
    this.events.on('devotionBonus', (pts) => {
      this.scoreManager.score += pts;
      this.scoreManager.updateUI();
    });

    // Ambient particles — floating embers in the night
    this.ambientEmbers = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: 7000 },
      y: { min: 0, max: GAME_HEIGHT },
      speed: { min: 5, max: 20 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.3, end: 0 },
      tint: [0x663388, 0x442266, 0x885599],
      lifespan: 4000,
      frequency: 500,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.ambientEmbers.setDepth(2);
  }

  buildLanka() {
    // Ground floor
    this.addPlatform(0, 560, 7000, 40, 0x2A1A0A);

    // Rooftop platforms — stone walls of Lanka
    const rooftops = [
      // Section 1: Outer walls
      { x: 300, y: 440, w: 200, h: 20 },
      { x: 600, y: 360, w: 150, h: 20 },
      { x: 900, y: 300, w: 120, h: 20 },
      // Section 2: Inner city
      { x: 1200, y: 420, w: 250, h: 20 },
      { x: 1550, y: 340, w: 180, h: 20 },
      { x: 1800, y: 260, w: 100, h: 20 },
      // Tall wall — forces flight to go over
      { x: 2100, y: 200, w: 30, h: 360 },
      // Section 3: Hidden path above the wall
      { x: 2200, y: 150, w: 200, h: 20 },
      { x: 2500, y: 120, w: 150, h: 20 },
      // Section 4: Deeper into Lanka
      { x: 2800, y: 440, w: 200, h: 20 },
      { x: 3100, y: 360, w: 180, h: 20 },
      { x: 3400, y: 280, w: 160, h: 20 },
      // Another tall wall
      { x: 3700, y: 180, w: 30, h: 380 },
      // Section 5: Hidden upper path
      { x: 3800, y: 130, w: 200, h: 20 },
      { x: 4100, y: 100, w: 180, h: 20 },
      // Section 6: Approach to Ashoka Garden
      { x: 4400, y: 400, w: 300, h: 20 },
      { x: 4800, y: 320, w: 200, h: 20 },
      // Ashoka Garden platforms
      { x: 5200, y: 440, w: 400, h: 20 },
      { x: 5700, y: 380, w: 250, h: 20 },
      // Exit path
      { x: 6200, y: 440, w: 300, h: 20 },
      { x: 6600, y: 380, w: 200, h: 20 },
    ];

    for (const r of rooftops) {
      this.addPlatform(r.x, r.y, r.w, r.h, 0x1A1008);
    }

    // Vertical walls (barriers requiring flight)
    const walls = [
      { x: 2100, y: 200, w: 30, h: 360 },
      { x: 3700, y: 180, w: 30, h: 380 },
    ];
    // Walls already included above in rooftops, but add visual decoration
    for (const wall of walls) {
      const deco = this.add.rectangle(wall.x + wall.w / 2, wall.y + wall.h / 2, wall.w + 4, wall.h + 4, 0x332211, 0.5);
      deco.setDepth(3);
    }
  }

  addPlatform(x, y, w, h, color) {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h, color);
    rect.setDepth(5);
    this.physics.add.existing(rect, true);
    this.platforms.add(rect);

    // Subtle highlight on top edge
    const highlight = this.add.rectangle(x + w / 2, y, w, 2, 0x443322, 0.4);
    highlight.setDepth(6);
  }

  spawnGuards() {
    const guardPositions = [
      { x: 500, y: 400 },
      { x: 1000, y: 380 },
      { x: 1400, y: 380 },
      { x: 1900, y: 220 },
      { x: 2600, y: 400 },
      { x: 3200, y: 320 },
      { x: 3900, y: 100 },
      { x: 4600, y: 360 },
      { x: 5000, y: 400 },
      { x: 6400, y: 340 },
    ];

    for (const pos of guardPositions) {
      const enemy = new Enemy(this, pos.x, pos.y, 'celestial-guard', {
        behavior: 'patrol',
        health: 4,
        speed: 90,
        scoreValue: 500,
        scoreType: 'guardKill',
        patrolRange: 80,
        scale: 1.3,
      });
      // Tint guards orange for Lanka
      enemy.sprite.setTint(0xFF6600);
      this.enemies.push(enemy);
    }
  }

  triggerSitaEncounter() {
    if (this.sitaEncounterTriggered || this.levelComplete) return;
    this.sitaEncounterTriggered = true;

    // Freeze player movement
    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);
    this.encounterPaused = true;

    // Camera zoom
    this.cameras.main.zoomTo(1.15, 1000);

    // Dark overlay for focus
    const overlay = this.add.rectangle(
      this.cameras.main.scrollX + GAME_WIDTH / 2,
      this.cameras.main.scrollY + GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5
    ).setScrollFactor(0).setDepth(150);

    // Sita visual — golden glow where she would be
    const sitaGlow = this.add.circle(5500, 350, 40, COLORS.warmGold, 0.3);
    sitaGlow.setDepth(151).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: sitaGlow,
      scale: 1.5,
      alpha: 0.6,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Emotional text sequence
    const narrativeText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
      'In the Ashoka Garden, he found her...', {
        fontSize: '22px',
        fontFamily: 'Georgia, serif',
        color: '#FFD700',
        stroke: '#1A0A2E',
        strokeThickness: 4,
        align: 'center',
        wordWrap: { width: 500 },
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: narrativeText,
      alpha: 1,
      duration: 1500,
      ease: 'Power2',
    });

    // Chalisa verse after a beat
    const verse = CHALISA.act4.intro;
    const verseText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
      verse.transliteration, {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: '#FFCC88',
        stroke: '#000',
        strokeThickness: 3,
        align: 'center',
        fontStyle: 'italic',
        wordWrap: { width: 500 },
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const englishText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60,
      verse.english, {
        fontSize: '14px',
        fontFamily: 'Georgia, serif',
        color: '#AAAACC',
        stroke: '#000',
        strokeThickness: 2,
        align: 'center',
        wordWrap: { width: 500 },
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.time.delayedCall(1500, () => {
      this.tweens.add({ targets: verseText, alpha: 1, duration: 1200 });
      this.tweens.add({ targets: englishText, alpha: 1, duration: 1200, delay: 400 });
    });

    // After 5 seconds, fade out and continue
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [overlay, narrativeText, verseText, englishText, sitaGlow],
        alpha: 0,
        duration: 800,
        onComplete: () => {
          overlay.destroy();
          narrativeText.destroy();
          verseText.destroy();
          englishText.destroy();
          sitaGlow.destroy();
          this.cameras.main.zoomTo(1, 500);
          this.player.sprite.body.setAllowGravity(true);
          this.encounterPaused = false;
        },
      });
    });
  }

  onLevelComplete() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);

    // Flash and transition
    this.cameras.main.flash(500, 255, 102, 0);

    ScoreManager.saveProgress(4, 2);
    ScoreManager.saveBest('act4level1', this.scoreManager.score,
      this.scoreManager.getGrade(10 * 500 + 2000));

    this.time.delayedCall(1500, () => {
      this.scene.start('ChalisaTransition', {
        couplet: 'level2',
        act: 4,
        nextScene: 'Act4Level2',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1000, () => {
      const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
      const cy = this.cameras.main.scrollY + GAME_HEIGHT / 2;
      this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setDepth(200);
      this.add.text(cx, cy - 30, 'Hanuman Falls...', {
        fontSize: '32px', fontFamily: 'Georgia, serif', color: '#FF6644',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(201);
      const rt = this.add.text(cx, cy + 30, '[ SPACE to retry ]', {
        fontSize: '16px', fontFamily: 'Georgia, serif', color: '#CCC',
      }).setOrigin(0.5).setDepth(201);
      this.tweens.add({ targets: rt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
      this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
      this.input.once('pointerdown', () => this.scene.restart());
    });
  }

  createHUD() {
    // Hearts
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.add.image(30 + i * 28, 30, 'heart').setScrollFactor(0).setDepth(100);
      this.hearts.push(heart);
    }

    // Score
    this.scoreManager.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Act title
    this.add.text(GAME_WIDTH / 2, 20, 'ACT IV \u2014 The Ashoka Garden', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#FFCC88',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0.7);

    // Progress bar
    this.progressBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 15, 300, 6, 0x333333)
      .setScrollFactor(0).setDepth(100);
    this.progressBar = this.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 15, 0, 6, COLORS.warmGold)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
  }

  updateHealthDisplay(health) {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setTexture(i < health ? 'heart' : 'heart-empty');
    }
  }

  setupTouchControls() {
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

  isOnScreen(sprite) {
    if (!sprite || !sprite.active) return false;
    const cam = this.cameras.main;
    return sprite.x > cam.scrollX - 50 &&
           sprite.x < cam.scrollX + GAME_WIDTH + 50 &&
           sprite.y > cam.scrollY - 50 &&
           sprite.y < cam.scrollY + GAME_HEIGHT + 50;
  }

  update(time, delta) {
    if (this.levelComplete || this.encounterPaused) return;

    // Virtual cursors (keyboard + touch)
    const vc = {
      left: { isDown: this.cursors.left.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.touchState.up },
    };

    this.player.update(vc, this.attackKey, delta);

    if (this.touchState.attack) {
      this.touchState.attack = false;
      if (!this.player.isAttacking) this.player.startAttack();
    }

    // Update enemies
    const pp = this.player.getPosition();
    for (const enemy of this.enemies) {
      enemy.update(time, pp);
    }

    // Parallax scroll
    this.lankaBg.tilePositionX = pp.x * 0.02;
    this.fogLayer.tilePositionX = pp.x * 0.06;

    // Progress bar
    const progress = Math.max(0, Math.min(1, pp.x / 6800));
    this.progressBar.width = progress * 300;
  }
}
