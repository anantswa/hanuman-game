import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';
import ParticleManager from '../systems/ParticleManager.js';

export default class Act2Level1 extends Phaser.Scene {
  constructor() {
    super('Act2Level1');
  }

  create() {
    console.log('[Act2Level1] Creating level...');
    try {
      this._create();
      console.log('[Act2Level1] Level created successfully!');
    } catch (e) {
      console.error('[Act2Level1] CRASH:', e);
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
    this.checkpointX = 100;
    this.checkpointY = 500;

    // World dimensions — wide side-scrolling level
    this.WORLD_WIDTH = 6000;
    this.WORLD_HEIGHT = 600;

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.particleManager = new ParticleManager(this);
    this.particleManager.init({ width: GAME_WIDTH, height: GAME_HEIGHT });

    // --- Parallax Backgrounds ---
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100);

    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-60).setAlpha(0.4);

    this.mountainsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'mountains')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-80).setAlpha(0.5);

    // Lush green-gold forest tint overlay
    this.forestTint = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.forestGreen, 0.06)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(40).setBlendMode(Phaser.BlendModes.ADD);

    // --- World setup (side-scrolling platformer) ---
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
    this.physics.world.gravity.y = PLAYER.fullGravity;

    // --- Ground platform (full width) ---
    this.platforms = this.physics.add.staticGroup();

    // Main ground — rocky earth
    const ground = this.add.rectangle(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT - 20, this.WORLD_WIDTH, 40, 0x3A2A18);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
    ground.setDepth(3);

    // Grass line on top of ground
    this.add.rectangle(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT - 40, this.WORLD_WIDTH, 4, COLORS.forestGreen).setDepth(3);

    // --- Platforms: rocky ground, tree branches, floating stone ---
    this.buildPlatforms();

    // --- Walls for wall-jumping ---
    this.walls = this.physics.add.staticGroup();
    this.buildWalls();

    // --- Player (depowered, no flight) ---
    this.player = new Player(this, 100, 500, { canFly: false });
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.walls);

    // Wall-jump state
    this.wallJumpCooldown = 0;

    // --- Camera ---
    const cam = this.cameras.main;
    cam.startFollow(this.player.sprite, true, 0.08, 0.12);
    cam.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
    cam.setFollowOffset(0, 0);
    cam.setZoom(1);

    // --- Hint ---
    const hint = this.add.text(200, 440,
      '← → Run   ↑ Jump   SPACE Attack\nPress into wall + ↑ = Wall Jump', {
        fontSize: '14px', fontFamily: 'Georgia, serif',
        color: '#FFD700', align: 'center',
        stroke: '#000000', strokeThickness: 3, lineSpacing: 4,
      }).setOrigin(0.5).setDepth(100);
    this.time.delayedCall(6000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 1000 });
    });

    // --- Collision groups ---
    this.enemyGroup = this.physics.add.group();
    this.collectibleGroup = this.physics.add.group();

    // --- Spawn enemies and collectibles ---
    this.spawnEnemies();
    this.spawnCollectibles();
    this.spawnHealthPickups();

    // --- Checkpoints ---
    this.checkpoints = [];
    this.createCheckpoint(1500, 520);
    this.createCheckpoint(3000, 520);
    this.createCheckpoint(4500, 520);

    // --- End trigger ---
    this.endZone = this.add.rectangle(5800, this.WORLD_HEIGHT / 2, 80, this.WORLD_HEIGHT, 0xFFD700, 0.08);
    this.physics.add.existing(this.endZone, true);
    this.endZone.setDepth(1);
    // Golden pillar glow at the end
    const endGlow = this.add.rectangle(5800, this.WORLD_HEIGHT / 2, 40, this.WORLD_HEIGHT, 0xFFD700, 0.15);
    endGlow.setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: endGlow, alpha: 0.05, duration: 1200, yoyo: true, repeat: -1,
    });

    // --- Collisions ---
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, this.onMaceHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onPlayerTouchEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.collectibleGroup, this.onCollectScroll, null, this);
    this.physics.add.overlap(this.player.sprite, this.endZone, this.onReachEnd, null, this);

    // Enemy-platform collision
    this.physics.add.collider(this.enemyGroup, this.platforms);

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
          if (dx < GAME_WIDTH) {
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

    // --- Forest decoration ---
    this.spawnForestDecor();
  }

  // ── PLATFORM LAYOUT ──
  buildPlatforms() {
    const platformDefs = [
      // Rocky ground sections with gaps
      // Section 1: introductory platforms
      { x: 400, y: 480, w: 200, h: 16, color: 0x5A4A38 },
      { x: 600, y: 420, w: 120, h: 14, color: 0x4A6A30 }, // tree branch
      { x: 850, y: 360, w: 100, h: 14, color: 0x4A6A30 },
      { x: 1100, y: 400, w: 160, h: 16, color: 0x5A4A38 },
      { x: 1300, y: 340, w: 100, h: 14, color: 0x4A6A30 },

      // Section 2: more vertical challenge
      { x: 1700, y: 460, w: 180, h: 16, color: 0x5A4A38 },
      { x: 1950, y: 380, w: 120, h: 14, color: 0x4A6A30 },
      { x: 2100, y: 300, w: 80, h: 16, color: 0x666688 }, // floating stone
      { x: 2300, y: 360, w: 120, h: 14, color: 0x4A6A30 },
      { x: 2500, y: 420, w: 160, h: 16, color: 0x5A4A38 },

      // Section 3: wall-jump gauntlet
      { x: 2800, y: 480, w: 140, h: 16, color: 0x5A4A38 },
      { x: 3100, y: 300, w: 100, h: 16, color: 0x666688 },
      { x: 3300, y: 400, w: 120, h: 16, color: 0x5A4A38 },
      { x: 3500, y: 320, w: 80, h: 16, color: 0x666688 },

      // Section 4: tree canopy run
      { x: 3800, y: 360, w: 200, h: 14, color: 0x4A6A30 },
      { x: 4050, y: 300, w: 120, h: 14, color: 0x4A6A30 },
      { x: 4250, y: 380, w: 150, h: 14, color: 0x4A6A30 },
      { x: 4500, y: 440, w: 180, h: 16, color: 0x5A4A38 },

      // Section 5: final approach
      { x: 4800, y: 360, w: 120, h: 16, color: 0x666688 },
      { x: 5000, y: 300, w: 100, h: 16, color: 0x666688 },
      { x: 5200, y: 400, w: 160, h: 16, color: 0x5A4A38 },
      { x: 5500, y: 460, w: 200, h: 16, color: 0x5A4A38 },
    ];

    for (const def of platformDefs) {
      const plat = this.add.rectangle(def.x, def.y, def.w, def.h, def.color);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);
      plat.setDepth(3);

      // Moss / grass on branches
      if (def.color === 0x4A6A30) {
        this.add.rectangle(def.x, def.y - def.h / 2 - 1, def.w, 2, COLORS.forestLight)
          .setDepth(3).setAlpha(0.7);
      }
    }
  }

  // ── WALLS (for wall-jumping) ──
  buildWalls() {
    const wallDefs = [
      // Tall stone walls for wall-jump sections
      { x: 2750, y: 380, w: 24, h: 200 },
      { x: 2900, y: 350, w: 24, h: 260 },
      { x: 3050, y: 320, w: 24, h: 200 },
      { x: 3200, y: 340, w: 24, h: 220 },
      // Additional walls mid-level
      { x: 4700, y: 360, w: 24, h: 180 },
      { x: 4850, y: 340, w: 24, h: 200 },
    ];

    for (const def of wallDefs) {
      const wall = this.add.rectangle(def.x, def.y, def.w, def.h, 0x555544);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
      wall.setDepth(2);

      // Stone texture lines
      for (let i = 0; i < def.h; i += 20) {
        this.add.rectangle(def.x, def.y - def.h / 2 + i, def.w - 4, 1, 0x666655)
          .setDepth(2).setAlpha(0.3);
      }
    }
  }

  // ── ENEMIES ──
  spawnEnemies() {
    const enemyConfigs = [
      // Forest asuras — ground patrollers
      { x: 500, y: 540, speed: 60, patrolRange: 100 },
      { x: 900, y: 540, speed: 70, patrolRange: 80 },
      { x: 1400, y: 540, speed: 65, patrolRange: 120 },
      { x: 1800, y: 540, speed: 75, patrolRange: 90 },
      { x: 2200, y: 540, speed: 70, patrolRange: 100 },
      { x: 2600, y: 540, speed: 80, patrolRange: 80 },
      { x: 3400, y: 540, speed: 75, patrolRange: 110 },
      { x: 3900, y: 540, speed: 85, patrolRange: 90 },
      { x: 4400, y: 540, speed: 80, patrolRange: 100 },
      { x: 5100, y: 540, speed: 90, patrolRange: 80 },
      { x: 5400, y: 540, speed: 85, patrolRange: 100 },
    ];

    for (const config of enemyConfigs) {
      const enemy = new Enemy(this, config.x, config.y, 'demon-cloud', {
        behavior: 'patrol',
        health: 2,
        speed: config.speed,
        gravity: true,
        scoreValue: 200,
        scoreType: 'demonKill',
        patrolRange: config.patrolRange,
      });
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }
  }

  // ── COLLECTIBLES (wisdom scrolls) ──
  spawnCollectibles() {
    const scrollPositions = [
      { x: 400, y: 440 },
      { x: 850, y: 320 },
      { x: 1300, y: 300 },
      { x: 1950, y: 340 },
      { x: 2100, y: 260 },
      { x: 2500, y: 380 },
      { x: 3100, y: 260 },
      { x: 3500, y: 280 },
      { x: 4050, y: 260 },
      { x: 4500, y: 400 },
      { x: 5000, y: 260 },
      { x: 5500, y: 420 },
    ];

    for (const pos of scrollPositions) {
      const scroll = this.physics.add.sprite(pos.x, pos.y, 'star');
      scroll.body.setAllowGravity(false);
      scroll.setDepth(5);
      scroll.setScale(0.8);
      scroll.setTint(0xFFD700); // golden

      // Gentle float animation
      this.tweens.add({
        targets: scroll,
        y: pos.y - 8,
        duration: 1000 + Math.random() * 400,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      // Slow spin
      this.tweens.add({ targets: scroll, angle: 360, duration: 3000, repeat: -1 });

      // Glow behind scroll
      const glow = this.add.circle(pos.x, pos.y, 16, 0xFFD700, 0.15);
      glow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: glow, alpha: 0.3, scale: 1.2,
        duration: 1000, yoyo: true, repeat: -1,
      });
      scroll.scrollGlow = glow;

      this.collectibleGroup.add(scroll);
    }
  }

  // ── HEALTH PICKUPS ──
  spawnHealthPickups() {
    const lotusPositions = [
      { x: 1500, y: 460 },
      { x: 3000, y: 460 },
      { x: 4500, y: 380 },
    ];

    for (const pos of lotusPositions) {
      const pickup = this.physics.add.sprite(pos.x, pos.y, 'health-pickup');
      pickup.body.setAllowGravity(false);
      pickup.setDepth(5);

      const glow = this.add.circle(pos.x, pos.y, 20, 0xFFAACC, 0.2);
      glow.setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: [pickup, glow],
        y: pos.y + 8,
        duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
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

  // ── CHECKPOINTS ──
  createCheckpoint(x, y) {
    const marker = this.add.rectangle(x, y, 8, 40, 0xFFD700, 0.5);
    marker.setDepth(4);

    // Soft glow
    const glow = this.add.circle(x, y, 24, 0xFFD700, 0.1);
    glow.setDepth(3).setBlendMode(Phaser.BlendModes.ADD);

    const zone = this.add.rectangle(x, y, 40, 60);
    this.physics.add.existing(zone, true);

    this.physics.add.overlap(this.player.sprite, zone, () => {
      if (this.checkpointX !== x) {
        this.checkpointX = x;
        this.checkpointY = y;
        // Flash checkpoint marker
        marker.fillColor = 0x00FF88;
        glow.fillColor = 0x00FF88;
        glow.setAlpha(0.4);
        this.tweens.add({ targets: glow, alpha: 0.1, duration: 800 });
        // Checkpoint text
        const cpText = this.add.text(x, y - 40, 'Checkpoint!', {
          fontSize: '14px', fontFamily: 'Georgia, serif',
          color: '#00FF88', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
          targets: cpText, y: cpText.y - 30, alpha: 0, duration: 1200,
          onComplete: () => cpText.destroy(),
        });
      }
    });

    this.checkpoints.push({ x, y, marker, glow, zone });
  }

  // ── FOREST DECORATION ──
  spawnForestDecor() {
    // Trees in the background
    for (let x = 100; x < this.WORLD_WIDTH; x += 200 + Math.random() * 300) {
      const treeH = 120 + Math.random() * 80;
      const treeY = this.WORLD_HEIGHT - 40 - treeH / 2;

      // Trunk
      this.add.rectangle(x, treeY + treeH * 0.3, 16, treeH * 0.5, 0x5A3A1A)
        .setDepth(1).setAlpha(0.6);
      // Canopy
      this.add.circle(x, treeY - treeH * 0.1, 40 + Math.random() * 20, COLORS.forestCanopy, 0.3)
        .setDepth(1);
    }

    // Fireflies / leaf particles (using scrollFactor for depth)
    for (let i = 0; i < 20; i++) {
      const fx = Math.random() * this.WORLD_WIDTH;
      const fy = 200 + Math.random() * 300;
      const firefly = this.add.circle(fx, fy, 2, 0xFFDD44, 0.5);
      firefly.setDepth(20).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: firefly,
        x: fx + Phaser.Math.Between(-30, 30),
        y: fy + Phaser.Math.Between(-20, 20),
        alpha: { from: 0.2, to: 0.7 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: Math.random() * 2000,
      });
    }
  }

  // ── HUD ──
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
    this.add.text(GAME_WIDTH / 2, 20, 'ACT II \u2014 The Sacred Forest', {
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

  // ── WALL-JUMP LOGIC ──
  handleWallJump(cursors) {
    const body = this.player.sprite.body;
    const onGround = body.blocked.down || body.touching.down;
    const touchingWallLeft = body.blocked.left || body.touching.left;
    const touchingWallRight = body.blocked.right || body.touching.right;
    const pressingUp = cursors.up.isDown;

    if (this.wallJumpCooldown > 0) {
      this.wallJumpCooldown -= 16;
      return;
    }

    // Standard jump from ground
    if (onGround && pressingUp) {
      body.setVelocityY(-420);
      return;
    }

    // Wall-jump: in air, pressing into a wall, pressing UP
    if (!onGround && pressingUp) {
      if (touchingWallLeft && cursors.left.isDown) {
        // Bounce off left wall — push right and up
        body.setVelocityY(-380);
        body.setVelocityX(280);
        this.player.facingRight = true;
        this.player.sprite.setFlipX(false);
        this.wallJumpCooldown = 200;
        this.spawnWallJumpEffect(this.player.sprite.x - 16, this.player.sprite.y);
        return;
      }
      if (touchingWallRight && cursors.right.isDown) {
        // Bounce off right wall — push left and up
        body.setVelocityY(-380);
        body.setVelocityX(-280);
        this.player.facingRight = false;
        this.player.sprite.setFlipX(true);
        this.wallJumpCooldown = 200;
        this.spawnWallJumpEffect(this.player.sprite.x + 16, this.player.sprite.y);
        return;
      }
    }

    // Wall-slide: slow the fall when pressing into a wall in the air
    if (!onGround && body.velocity.y > 0) {
      if ((touchingWallLeft && cursors.left.isDown) || (touchingWallRight && cursors.right.isDown)) {
        body.setVelocityY(Math.min(body.velocity.y, 80));
      }
    }
  }

  spawnWallJumpEffect(x, y) {
    // Dust particles from wall
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.4, end: 0 },
      tint: [0xCCBB99, 0xAA9977],
      lifespan: 400,
      quantity: 6,
      emitting: false,
    });
    particles.explode();
    this.time.delayedCall(500, () => particles.destroy());
  }

  // ── COLLISION CALLBACKS ──
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

  onCollectScroll(playerSprite, scroll) {
    this.scoreManager.addPoints('demonKill', { x: scroll.x, y: scroll.y }); // +100 for scroll via reuse
    this.scoreManager.score += 100; // bonus on top (100 total = wisdom scroll value)

    // Collect effect
    if (scroll.scrollGlow) scroll.scrollGlow.destroy();
    const collectText = this.add.text(scroll.x, scroll.y - 20, '+100', {
      fontSize: '16px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: collectText, y: collectText.y - 40, alpha: 0,
      duration: 800, onComplete: () => collectText.destroy(),
    });

    // Golden burst
    const burst = this.add.particles(scroll.x, scroll.y, 'particle', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.5, end: 0 },
      tint: [0xFFD700, 0xFFCC44],
      lifespan: 500,
      quantity: 8,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    burst.explode();
    this.time.delayedCall(600, () => burst.destroy());

    scroll.destroy();
    this.scoreManager.updateUI();
  }

  onReachEnd() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.player.sprite.body.setVelocity(0, 0);
    this.cameras.main.flash(1000, 255, 215, 0);

    const victoryText = this.add.text(this.player.sprite.x, this.player.sprite.y - 60,
      'Forest Cleared!', {
        fontSize: '32px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: victoryText,
      y: victoryText.y - 30, alpha: 0,
      duration: 2000, delay: 1000,
    });

    ScoreManager.saveProgress(2, 2);
    ScoreManager.saveBest('act2_level1', this.scoreManager.score,
      this.scoreManager.getGrade(5000));

    this.time.delayedCall(3000, () => {
      this.cleanup();
      this.scene.start('ChalisaTransition', {
        couplet: 'level2', act: 2, nextScene: 'Act2Level2',
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

    // Combined controls
    const virtualCursors = {
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };

    // Wall-jump handling (overrides normal UP behavior for grounded player)
    this.handleWallJump(virtualCursors);

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

    // --- Parallax ---
    const camX = this.cameras.main.scrollX;
    this.cloudsBg.tilePositionX = camX * 0.15;
    this.mountainsBg.tilePositionX = camX * 0.08;

    // --- Camera lead based on velocity ---
    const cam = this.cameras.main;
    const velX = this.player.sprite.body.velocity.x;
    cam.setFollowOffset(-velX * 0.15, 0);

    // Velocity zoom
    const speed = Math.abs(velX);
    const speedNorm = Math.min(1, speed / 400);
    const targetZoom = 1 - speedNorm * 0.05;
    cam.setZoom(Phaser.Math.Linear(cam.zoom, targetZoom, 0.05));

    // Dash indicator
    const dashCd = this.player.getDashCooldown();
    this.dashIndicator.fillColor = dashCd > 0 ? 0x666666 : 0x00FF88;
    this.dashIndicator.setAlpha(dashCd > 0 ? 0.4 : 0.8);

    // Kill off-screen enemies (far behind)
    for (const enemy of this.enemies) {
      if (!enemy.isDead && enemy.sprite.x < camX - 200) {
        enemy.destroy();
        enemy.isDead = true;
      }
    }

    // Pit death
    if (this.player.sprite.y > this.WORLD_HEIGHT + 50 && !this.player.isDead) {
      this.player.die();
    }

    // Particle following
    const playerSpeed = Math.sqrt(
      this.player.sprite.body.velocity.x ** 2 +
      this.player.sprite.body.velocity.y ** 2
    );
    this.particleManager.followSprite(this.player.sprite, playerSpeed > 200);
  }
}
