import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, CHALISA } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';

export default class Act4Level2 extends Phaser.Scene {
  constructor() {
    super('Act4Level2');
  }

  create() {
    this.enemies = [];
    this.levelComplete = false;
    this.fireTrail = [];
    this.burningPlatforms = new Set();
    this.fireSpreadX = -200; // fire creeping from the left

    // Score manager
    this.scoreManager = new ScoreManager(this);

    // --- World setup ---
    this.physics.world.setBounds(0, 0, 8000, GAME_HEIGHT);
    this.physics.world.gravity.y = 300;

    // --- Background: dark city with fire glow ---
    this.cityBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setTint(0x661100);

    this.smokeBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setAlpha(0.15).setTint(0xFF4400);

    // --- Timer: 90 seconds ---
    this.timeRemaining = 90;
    this.timerActive = true;

    // --- Platforms: Lanka rooftops ---
    this.platforms = this.physics.add.staticGroup();
    this.platformRects = []; // track for fire spread
    this.buildLankaRooftops();

    // --- Player ---
    this.player = new Player(this, 150, 420, { canFly: true });

    // Camera
    this.cameras.main.startFollow(this.player.sprite, true, 0.3, 0.1);
    this.cameras.main.setBounds(0, 0, 8000, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#1A0800');

    // --- Fire tail particle emitter following player ---
    this.fireTailEmitter = this.add.particles(0, 0, 'particle', {
      follow: this.player.sprite,
      followOffset: { x: 0, y: 15 },
      speed: { min: 30, max: 80 },
      angle: { min: 160, max: 200 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: [COLORS.fireOrange, COLORS.fireBright, COLORS.fireDeep, 0xFFFF44],
      lifespan: 600,
      frequency: 30,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.fireTailEmitter.setDepth(12);

    // Fire trail spawn timer (every 200ms)
    this.fireTrailTimer = this.time.addEvent({
      delay: 200,
      callback: () => this.spawnFireTrailParticle(),
      loop: true,
    });

    // Fire trail physics group — damages enemies on contact
    this.fireTrailGroup = this.physics.add.group();

    // --- Enemies: rushing Lanka guards ---
    this.spawnEnemies();

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

    // Fire trail kills enemies on contact
    this.physics.add.overlap(this.fireTrailGroup, this.enemyGroup, (fire, esprite) => {
      if (esprite.enemyRef && !esprite.enemyRef.isDead) {
        esprite.enemyRef.takeDamage(999); // auto-kill
      }
    });

    // --- End zone ---
    this.endZone = this.add.zone(7500, 300, 100, GAME_HEIGHT);
    this.physics.add.existing(this.endZone, true);
    this.physics.add.overlap(this.player.sprite, this.endZone, () => this.onLevelComplete());

    // --- Fire spread overlay (creeping from left) ---
    this.fireOverlay = this.add.rectangle(0, GAME_HEIGHT / 2, 0, GAME_HEIGHT, 0xFF2200, 0.35);
    this.fireOverlay.setOrigin(0, 0.5).setDepth(50).setBlendMode(Phaser.BlendModes.ADD);

    // Fire spread particle wall
    this.fireWallEmitter = this.add.particles(0, 0, 'particle', {
      x: 0,
      y: { min: 0, max: GAME_HEIGHT },
      speed: { min: 20, max: 60 },
      angle: { min: -30, max: 30 },
      scale: { start: 1.0, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: [0xFF4400, 0xFF6600, 0xFF2200, 0xFFAA00],
      lifespan: 1000,
      frequency: 40,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.fireWallEmitter.setDepth(51);

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

    // Ambient fire particles everywhere
    this.ambientFire = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: 8000 },
      y: { min: GAME_HEIGHT - 100, max: GAME_HEIGHT },
      speedY: { min: -40, max: -100 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [COLORS.fireOrange, COLORS.fireBright, 0xFF4400],
      lifespan: 2000,
      frequency: 200,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.ambientFire.setDepth(3);
  }

  buildLankaRooftops() {
    // Ground
    this.addPlatform(0, 560, 8000, 40, 0x2A1A0A);

    // Lanka rooftops — fast-paced so more open with clear paths
    const rooftops = [
      { x: 300, y: 440, w: 200, h: 20 },
      { x: 700, y: 380, w: 180, h: 20 },
      { x: 1100, y: 320, w: 150, h: 20 },
      { x: 1400, y: 440, w: 220, h: 20 },
      { x: 1800, y: 360, w: 200, h: 20 },
      { x: 2200, y: 280, w: 160, h: 20 },
      { x: 2500, y: 440, w: 250, h: 20 },
      { x: 2900, y: 360, w: 180, h: 20 },
      { x: 3300, y: 300, w: 200, h: 20 },
      { x: 3700, y: 420, w: 220, h: 20 },
      { x: 4100, y: 340, w: 180, h: 20 },
      { x: 4500, y: 260, w: 150, h: 20 },
      { x: 4800, y: 440, w: 250, h: 20 },
      { x: 5200, y: 360, w: 200, h: 20 },
      { x: 5600, y: 300, w: 180, h: 20 },
      { x: 6000, y: 420, w: 250, h: 20 },
      { x: 6400, y: 340, w: 200, h: 20 },
      { x: 6800, y: 440, w: 300, h: 20 },
      { x: 7200, y: 380, w: 250, h: 20 },
    ];

    for (const r of rooftops) {
      this.addPlatform(r.x, r.y, r.w, r.h, 0x1A1008);
    }
  }

  addPlatform(x, y, w, h, color) {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h, color);
    rect.setDepth(5);
    this.physics.add.existing(rect, true);
    this.platforms.add(rect);
    this.platformRects.push({ rect, x, y, w, h, burning: false });

    // Stone edge highlight
    const highlight = this.add.rectangle(x + w / 2, y, w, 2, 0x443322, 0.3);
    highlight.setDepth(6);
  }

  spawnEnemies() {
    // 15 guards spread across the level — chase behavior
    const positions = [
      400, 800, 1300, 1700, 2100, 2600, 3000, 3500,
      3900, 4300, 4700, 5300, 5800, 6300, 6900,
    ];

    for (const xPos of positions) {
      const y = 300 + Math.random() * 200;
      const enemy = new Enemy(this, xPos, y, 'celestial-guard', {
        behavior: 'chase',
        health: 3,
        speed: 100,
        scoreValue: 500,
        scoreType: 'guardKill',
        patrolRange: 120,
        scale: 1.2,
      });
      enemy.sprite.setTint(0xFF6600);
      this.enemies.push(enemy);
    }
  }

  spawnFireTrailParticle() {
    if (this.levelComplete || this.player.isDead) return;

    const px = this.player.sprite.x;
    const py = this.player.sprite.y + 10;

    // Create a fire trail hitbox
    const fireHit = this.add.circle(px, py, 14, COLORS.fireOrange, 0.6);
    fireHit.setDepth(11).setBlendMode(Phaser.BlendModes.ADD);
    this.physics.add.existing(fireHit, true);
    this.fireTrailGroup.add(fireHit);

    // Check if near a platform — set it "on fire"
    for (const plat of this.platformRects) {
      if (plat.burning) continue;
      const platCx = plat.x + plat.w / 2;
      const platCy = plat.y + plat.h / 2;
      const dx = Math.abs(px - platCx);
      const dy = Math.abs(py - platCy);
      if (dx < plat.w / 2 + 30 && dy < plat.h / 2 + 40) {
        this.ignitePlatform(plat);
      }
    }

    // Fade and destroy fire trail after 2 seconds
    this.tweens.add({
      targets: fireHit,
      alpha: 0,
      scale: 0.3,
      duration: 2000,
      onComplete: () => {
        fireHit.destroy();
      },
    });

    // Remove from group after timeout
    this.time.delayedCall(2000, () => {
      if (fireHit && fireHit.body) {
        this.fireTrailGroup.remove(fireHit);
      }
    });
  }

  ignitePlatform(plat) {
    plat.burning = true;
    plat.rect.setFillStyle(COLORS.fireOrange);

    // Fire particle emitter on the platform
    const fireEmitter = this.add.particles(plat.x + plat.w / 2, plat.y - 5, 'particle', {
      x: { min: -plat.w / 2, max: plat.w / 2 },
      speedY: { min: -40, max: -80 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [COLORS.fireBright, COLORS.fireOrange, 0xFF4400, 0xFFFF44],
      lifespan: 800,
      frequency: 80,
      blendMode: Phaser.BlendModes.ADD,
    });
    fireEmitter.setDepth(7);

    // Score bonus for burning buildings
    this.scoreManager.addPoints('zoneComplete', { x: plat.x + plat.w / 2, y: plat.y });
  }

  onLevelComplete() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.timerActive = false;

    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);

    // Victory flash — fire and gold
    this.cameras.main.flash(800, 255, 140, 0);

    // Victory text
    const vicText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'Lanka Burns!', {
        fontSize: '36px',
        fontFamily: 'Georgia, serif',
        color: '#FF6600',
        stroke: '#000',
        strokeThickness: 5,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const subText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
      'The fire of dharma cannot be contained.', {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: '#FFCC88',
        stroke: '#000',
        strokeThickness: 3,
        fontStyle: 'italic',
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({ targets: vicText, alpha: 1, duration: 800 });
    this.tweens.add({ targets: subText, alpha: 1, duration: 800, delay: 500 });

    ScoreManager.saveProgress(5, 1);
    ScoreManager.saveBest('act4level2', this.scoreManager.score,
      this.scoreManager.getGrade(15 * 500 + 5000));

    this.time.delayedCall(3000, () => {
      this.scene.start('ChalisaTransition', {
        couplet: 'intro',
        act: 5,
        nextScene: 'Act5Level1',
      });
    });
  }

  onTimerExpired() {
    if (this.levelComplete || this.player.isDead) return;
    // Fire consumes everything — player dies
    this.cameras.main.flash(500, 255, 0, 0);
    this.player.takeDamage(999);
  }

  onPlayerDied() {
    this.timerActive = false;
    this.time.delayedCall(1000, () => {
      const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
      const cy = this.cameras.main.scrollY + GAME_HEIGHT / 2;
      this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setDepth(200);
      this.add.text(cx, cy - 30, 'Consumed by Fire...', {
        fontSize: '32px', fontFamily: 'Georgia, serif', color: '#FF4400',
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
    this.add.text(GAME_WIDTH / 2, 20, 'ACT IV \u2014 Lanka Burns!', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#FF8844',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0.8);

    // Timer display — center top
    this.timerText = this.add.text(GAME_WIDTH / 2, 50, '1:30', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#FF4400',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // Progress bar
    this.progressBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 15, 300, 6, 0x333333)
      .setScrollFactor(0).setDepth(100);
    this.progressBar = this.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 15, 0, 6, COLORS.fireOrange)
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
    if (this.levelComplete) return;

    const dt = (delta || 16.67) / 1000;

    // --- Timer ---
    if (this.timerActive && !this.player.isDead) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.onTimerExpired();
      }
      // Update timer display
      const mins = Math.floor(this.timeRemaining / 60);
      const secs = Math.floor(this.timeRemaining % 60);
      this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

      // Flash red when low
      if (this.timeRemaining < 15) {
        this.timerText.setColor(Math.floor(time / 300) % 2 === 0 ? '#FF0000' : '#FF4400');
        this.timerText.setFontSize('32px');
      } else if (this.timeRemaining < 30) {
        this.timerText.setColor('#FF2200');
      }
    }

    // --- Fire spread from left ---
    if (this.timerActive) {
      // Fire advances based on elapsed time (reaches end when timer expires)
      const elapsed = 90 - this.timeRemaining;
      this.fireSpreadX = (elapsed / 90) * 8000;

      // Update fire overlay width
      this.fireOverlay.setPosition(this.fireSpreadX - 200, GAME_HEIGHT / 2);
      this.fireOverlay.width = 400;

      // Update fire wall emitter position
      this.fireWallEmitter.setPosition(this.fireSpreadX, 0);

      // Kill player if fire catches up
      if (this.player.sprite.x < this.fireSpreadX - 100 && !this.player.isDead) {
        this.player.takeDamage(999);
      }
    }

    // --- Player ---
    if (this.player.isDead) return;

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
      // Enemies caught by fire wall also die
      if (!enemy.isDead && enemy.sprite.x < this.fireSpreadX - 50) {
        enemy.takeDamage(999);
      }
      enemy.update(time, pp);
    }

    // Parallax scroll
    this.cityBg.tilePositionX = pp.x * 0.03;
    this.smokeBg.tilePositionX = pp.x * 0.08;

    // Progress bar
    const progress = Math.max(0, Math.min(1, pp.x / 7500));
    this.progressBar.width = progress * 300;
  }
}
