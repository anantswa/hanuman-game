import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export default class Act1Level1 extends Phaser.Scene {
  constructor() {
    super('Act1Level1');
  }

  create() {
    console.log('[Act1Level1] Creating level...');
    try { this._create(); } catch(e) { console.error('[Act1Level1] CRASH:', e); }
  }

  _create() {
    this.score = 0;
    this.enemies = [];
    this.obstacles = [];
    this.scrollSpeed = 1;
    this.altitude = 0; // Track how high player has flown
    this.levelComplete = false;

    // --- Parallax Backgrounds ---
    // Far layer (sky)
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0);

    // Mid layer (clouds)
    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1);

    // Near layer (mountains — visible at start, fade as you ascend)
    this.mountainsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'mountains')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(2).setAlpha(0.7);

    // --- World setup ---
    this.physics.world.setBounds(0, -10000, GAME_WIDTH, 10600);
    this.physics.world.gravity.y = PLAYER.gravity;

    // --- Starting ground platform (so player doesn't fall immediately) ---
    this.ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 40, 0x3A2A18);
    this.physics.add.existing(this.ground, true); // static body
    this.ground.setDepth(3);
    // Grass/earth top edge
    const grassLine = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, GAME_WIDTH, 4, 0x4A7A30);
    grassLine.setDepth(3);

    // --- Player ---
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 100);
    this.player.sprite.body.setCollideWorldBounds(false); // Free flight

    // Player stands on ground
    this.physics.add.collider(this.player.sprite, this.ground);

    // Camera follows player
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.3);
    this.cameras.main.setBounds(0, -10000, GAME_WIDTH, 10600);

    // --- On-screen control hint (fades after a few seconds) ---
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 150,
      '↑  Hold UP to fly!\n← →  Move\nSPACE  Attack', {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: '#FFD700',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
        lineSpacing: 4,
      }).setOrigin(0.5).setDepth(100);
    // Fade out hint after player starts moving
    this.time.delayedCall(5000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 1000 });
    });
    setTimeout(() => {
      if (hint && hint.active) {
        this.tweens.add({ targets: hint, alpha: 0, duration: 1000 });
      }
    }, 6000);

    // --- Sun goal at the top ---
    this.sun = this.physics.add.sprite(GAME_WIDTH / 2, -9000, 'sun');
    this.sun.setScale(1.5);
    this.sun.body.setAllowGravity(false);
    this.sun.body.setImmovable(true);
    this.sun.setDepth(5);

    // Sun pulsing glow
    this.tweens.add({
      targets: this.sun,
      scale: 1.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // --- Spawn obstacles and enemies throughout the vertical path ---
    this.spawnLevelContent();

    // --- Collisions ---
    this.enemyGroup = this.physics.add.group();
    this.obstacleGroup = this.physics.add.group();

    // Player mace hits enemies
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, this.onMaceHitEnemy, null, this);

    // Player touches enemies (takes damage)
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onPlayerTouchEnemy, null, this);

    // Player reaches sun
    this.physics.add.overlap(this.player.sprite, this.sun, this.onReachSun, null, this);

    // --- HUD ---
    this.createHUD();

    // --- Controls (arrows + WASD) ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');

    // --- Events ---
    this.events.on('playerDamaged', (health) => this.updateHealthDisplay(health));
    this.events.on('playerDied', () => this.onPlayerDied());
    this.events.on('enemyKilled', (score) => {
      this.score += score;
      this.scoreText.setText(`Score: ${this.score}`);
    });

    // --- Touch controls ---
    this.setupTouchControls();

    // --- Altitude guide ---
    this.altitudeText = this.add.text(GAME_WIDTH - 20, 80, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFCC88',
      align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  spawnLevelContent() {
    // Clouds as platforms/obstacles at various heights
    const cloudPositions = [];
    for (let y = GAME_HEIGHT - 200; y > -8500; y -= 150 + Math.random() * 200) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      cloudPositions.push({ x, y });

      const cloud = this.physics.add.sprite(x, y, 'cloud');
      cloud.body.setAllowGravity(false);
      cloud.body.setImmovable(true);
      cloud.setAlpha(0.6 + Math.random() * 0.3);
      cloud.setScale(0.8 + Math.random() * 0.6);
      cloud.setDepth(3);

      // Some clouds drift
      if (Math.random() > 0.6) {
        this.tweens.add({
          targets: cloud,
          x: cloud.x + (Math.random() > 0.5 ? 80 : -80),
          duration: 3000 + Math.random() * 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
      this.obstacles.push(cloud);
    }

    // Stars (collectibles / obstacles)
    for (let y = GAME_HEIGHT - 400; y > -8800; y -= 300 + Math.random() * 300) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const star = this.physics.add.sprite(x, y, 'star');
      star.body.setAllowGravity(false);
      star.setDepth(4);
      star.setScale(0.8);
      this.tweens.add({
        targets: star,
        angle: 360,
        duration: 3000,
        repeat: -1,
      });
      this.obstacles.push(star);
    }

    // Asteroids (hazards) — appear higher up
    for (let y = -2000; y > -8500; y -= 400 + Math.random() * 400) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const asteroid = this.physics.add.sprite(x, y, 'asteroid');
      asteroid.body.setAllowGravity(false);
      asteroid.setDepth(4);
      asteroid.body.setCircle(14);

      // Asteroids move
      const speed = 30 + Math.random() * 60;
      asteroid.body.setVelocityX(Math.random() > 0.5 ? speed : -speed);
      asteroid.body.setBounceX(1);
      asteroid.body.setCollideWorldBounds(true);

      this.tweens.add({
        targets: asteroid,
        angle: 360,
        duration: 2000 + Math.random() * 2000,
        repeat: -1,
      });

      this.obstacleGroup.add(asteroid);
      this.obstacles.push(asteroid);
    }

    // Enemies — cloud demons at various heights
    const enemyConfigs = [
      { minY: GAME_HEIGHT - 600, maxY: -1000, type: 'demon-cloud', behavior: 'patrol', count: 6, health: 2, speed: 60 },
      { minY: -1000, maxY: -4000, type: 'demon-cloud', behavior: 'float', count: 5, health: 2, speed: 50 },
      { minY: -3000, maxY: -6000, type: 'celestial-guard', behavior: 'chase', count: 4, health: 3, speed: 70, scoreValue: 200 },
      { minY: -5000, maxY: -8500, type: 'celestial-guard', behavior: 'swoop', count: 4, health: 3, speed: 90, scoreValue: 250 },
    ];

    for (const config of enemyConfigs) {
      for (let i = 0; i < config.count; i++) {
        const y = config.minY + Math.random() * (config.maxY - config.minY);
        const x = 60 + Math.random() * (GAME_WIDTH - 120);
        const enemy = new Enemy(this, x, y, config.type, {
          behavior: config.behavior,
          health: config.health,
          speed: config.speed,
          scoreValue: config.scoreValue || 100,
          patrolRange: 80 + Math.random() * 80,
        });
        this.enemies.push(enemy);
        this.enemyGroup.add(enemy.sprite);
      }
    }

    // Health pickups
    for (let y = GAME_HEIGHT - 800; y > -8000; y -= 1500 + Math.random() * 1000) {
      const x = 50 + Math.random() * (GAME_WIDTH - 100);
      const pickup = this.physics.add.sprite(x, y, 'health-pickup');
      pickup.body.setAllowGravity(false);
      pickup.setDepth(5);
      this.tweens.add({
        targets: pickup,
        y: y + 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.physics.add.overlap(this.player.sprite, pickup, () => {
        if (this.player.health < this.player.maxHealth) {
          this.player.heal();
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
    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Level name
    this.add.text(GAME_WIDTH / 2, 20, 'ACT I — Flight to the Sun', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#FFCC88',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0.7);
  }

  setupTouchControls() {
    // Simple touch: left half = move left, right half = move right
    // Top half = fly, tap = attack
    this.touchState = { left: false, right: false, up: false, attack: false };

    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < GAME_HEIGHT * 0.4) {
        this.touchState.up = true;
      }
      if (pointer.x < GAME_WIDTH * 0.3) {
        this.touchState.left = true;
      } else if (pointer.x > GAME_WIDTH * 0.7) {
        this.touchState.right = true;
      } else {
        this.touchState.attack = true;
      }
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
      enemySprite.enemyRef.takeDamage(2);
    }
  }

  onPlayerTouchEnemy(playerSprite, enemySprite) {
    if (enemySprite.enemyRef && !enemySprite.enemyRef.isDead) {
      this.player.takeDamage(enemySprite.enemyRef.damage);
    }
  }

  onReachSun() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    // Victory!
    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);

    // Flash screen with golden light
    this.cameras.main.flash(1000, 255, 215, 0);

    const victoryText = this.add.text(GAME_WIDTH / 2, this.player.sprite.y - 60, 'The Sun!', {
      fontSize: '36px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: victoryText,
      y: victoryText.y - 30,
      alpha: 0,
      duration: 2000,
      delay: 1000,
    });

    // Transition to next level
    this.time.delayedCall(3000, () => {
      this.scene.start('ChalisaTransition', {
        couplet: 'level2',
        act: 1,
        nextScene: 'Act1Level2',
      });
    });
  }

  onPlayerDied() {
    // Death screen
    this.time.delayedCall(1000, () => {
      const overlay = this.add.rectangle(
        this.cameras.main.scrollX + GAME_WIDTH / 2,
        this.cameras.main.scrollY + GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7
      ).setDepth(200);

      const deathText = this.add.text(
        this.cameras.main.scrollX + GAME_WIDTH / 2,
        this.cameras.main.scrollY + GAME_HEIGHT / 2 - 40,
        'Hanuman Falls...', {
          fontSize: '32px',
          fontFamily: 'Georgia, serif',
          color: '#FF6644',
          stroke: '#000',
          strokeThickness: 3,
        }
      ).setOrigin(0.5).setDepth(201);

      const retryText = this.add.text(
        this.cameras.main.scrollX + GAME_WIDTH / 2,
        this.cameras.main.scrollY + GAME_HEIGHT / 2 + 40,
        '[ Press SPACE to try again ]', {
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          color: '#CCCCCC',
        }
      ).setOrigin(0.5).setDepth(201);

      this.tweens.add({
        targets: retryText,
        alpha: 0.3,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });

      this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
      this.input.once('pointerdown', () => this.scene.restart());
    });
  }

  update(time, delta) {
    if (this.levelComplete) return;

    // Handle touch + keyboard + WASD combined
    const virtualCursors = {
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };

    this.player.update(virtualCursors, this.attackKey);

    if (this.touchState.attack) {
      this.touchState.attack = false;
      if (!this.player.isAttacking) this.player.attack();
    }

    // Update enemies
    const playerPos = this.player.getPosition();
    for (const enemy of this.enemies) {
      enemy.update(time, playerPos);
    }

    // Parallax scrolling based on player Y position
    const playerY = this.player.sprite.y;
    this.skyBg.tilePositionY = playerY * 0.05;
    this.cloudsBg.tilePositionY = playerY * 0.2;
    this.mountainsBg.tilePositionY = playerY * 0.1;

    // Fade mountains as player ascends
    const altNorm = Math.max(0, Math.min(1, (GAME_HEIGHT - playerY) / 3000));
    this.mountainsBg.setAlpha(0.7 * (1 - altNorm));

    // Shift sky color from dawn to cosmic as player goes higher
    if (playerY < -3000) {
      const cosmicT = Math.min(1, (-3000 - playerY) / 5000);
      this.skyBg.setAlpha(1 - cosmicT);
      if (!this.cosmicBg) {
        this.cosmicBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
          .setOrigin(0, 0).setScrollFactor(0).setDepth(0).setAlpha(0);
      }
      this.cosmicBg.setAlpha(cosmicT);
      this.cosmicBg.tilePositionY = playerY * 0.03;
    }

    // Altitude display
    this.altitude = Math.max(0, Math.floor((GAME_HEIGHT - playerY) / 10));
    this.altitudeText.setText(`↑ ${this.altitude}m`);

    // Kill enemies that fall too far below
    for (const enemy of this.enemies) {
      if (!enemy.isDead && enemy.sprite.y > playerY + GAME_HEIGHT) {
        enemy.destroy();
        enemy.isDead = true;
      }
    }

    // Fall death
    if (playerY > GAME_HEIGHT + 200 && !this.player.isDead) {
      this.player.die();
    }
  }
}
