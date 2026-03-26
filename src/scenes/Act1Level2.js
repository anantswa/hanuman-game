import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ScoreManager from '../systems/ScoreManager.js';

export default class Act1Level2 extends Phaser.Scene {
  constructor() {
    super('Act1Level2');
  }

  create() {
    this.score = 0;
    this.enemies = [];
    this.levelComplete = false;

    // Deep space background — we're higher now
    this.cosmicBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0);

    // Scattered cosmic clouds
    this.cloudsBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'clouds-layer')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1).setAlpha(0.2);

    // World is horizontal scrolling this level — approaching the sun
    this.physics.world.setBounds(0, 0, 8000, GAME_HEIGHT);
    this.physics.world.gravity.y = PLAYER.gravity * 0.5; // Less gravity in space

    // Player
    this.player = new Player(this, 100, GAME_HEIGHT / 2);

    // Camera follows horizontally
    this.cameras.main.startFollow(this.player.sprite, true, 0.3, 0.1);
    this.cameras.main.setBounds(0, 0, 8000, GAME_HEIGHT);

    // Sun at the end
    this.sun = this.physics.add.sprite(7600, GAME_HEIGHT / 2, 'sun');
    this.sun.setScale(2);
    this.sun.body.setAllowGravity(false);
    this.sun.body.setImmovable(true);
    this.sun.setDepth(5);
    this.tweens.add({
      targets: this.sun,
      scale: 2.3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Spawn level content
    this.spawnContent();

    // Groups
    this.enemyGroup = this.physics.add.group();
    for (const enemy of this.enemies) {
      this.enemyGroup.add(enemy.sprite);
    }

    // Collisions
    this.physics.add.overlap(this.player.maceHitbox, this.enemyGroup, (mace, esprite) => {
      if (esprite.enemyRef && !esprite.enemyRef.isDead) esprite.enemyRef.takeDamage(2);
    });
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, (ps, esprite) => {
      if (esprite.enemyRef && !esprite.enemyRef.isDead) this.player.takeDamage(1);
    });
    this.physics.add.overlap(this.player.sprite, this.sun, () => this.onReachSun());

    // HUD
    this.createHUD();

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.touchState = { left: false, right: false, up: false, attack: false };
    this.setupTouchControls();

    // Events
    this.events.on('playerDamaged', (h) => this.updateHealthDisplay(h));
    this.events.on('playerDied', () => this.onPlayerDied());
    this.events.on('enemyKilled', (data) => {
      this.score += data.scoreValue || 200;
      this.scoreText.setText(`Score: ${this.score}`);
    });
  }

  spawnContent() {
    // Asteroids scrolling
    for (let x = 400; x < 7200; x += 200 + Math.random() * 300) {
      const y = 50 + Math.random() * (GAME_HEIGHT - 100);
      const asteroid = this.physics.add.sprite(x, y, 'asteroid');
      asteroid.body.setAllowGravity(false);
      asteroid.body.setCircle(14);
      asteroid.setDepth(4);
      // Some move vertically
      this.tweens.add({
        targets: asteroid,
        y: y + (Math.random() > 0.5 ? 100 : -100),
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.tweens.add({ targets: asteroid, angle: 360, duration: 3000, repeat: -1 });

      // Overlap damage
      this.physics.add.overlap(this.player.sprite, asteroid, () => {
        this.player.takeDamage(1);
      });
    }

    // Stars
    for (let x = 300; x < 7000; x += 250 + Math.random() * 250) {
      const y = 50 + Math.random() * (GAME_HEIGHT - 100);
      const star = this.physics.add.sprite(x, y, 'star');
      star.body.setAllowGravity(false);
      star.setDepth(3);
      this.tweens.add({ targets: star, angle: 360, duration: 3000, repeat: -1 });
    }

    // Enemies — celestial guards in space
    for (let x = 600; x < 7000; x += 400 + Math.random() * 400) {
      const y = 80 + Math.random() * (GAME_HEIGHT - 160);
      const behavior = Math.random() > 0.5 ? 'chase' : 'swoop';
      const enemy = new Enemy(this, x, y, 'celestial-guard', {
        behavior,
        health: 3,
        speed: 70 + Math.random() * 40,
        scoreValue: 200,
        patrolRange: 120,
      });
      this.enemies.push(enemy);
    }

    // Cloud demons
    for (let x = 500; x < 6500; x += 500 + Math.random() * 500) {
      const y = 50 + Math.random() * (GAME_HEIGHT - 100);
      const enemy = new Enemy(this, x, y, 'demon-cloud', {
        behavior: 'float',
        health: 2,
        speed: 40,
        scoreValue: 100,
      });
      this.enemies.push(enemy);
    }

    // Health pickups
    for (let x = 1000; x < 7000; x += 1500 + Math.random() * 1000) {
      const y = 50 + Math.random() * (GAME_HEIGHT - 100);
      const pickup = this.physics.add.sprite(x, y, 'health-pickup');
      pickup.body.setAllowGravity(false);
      pickup.setDepth(5);
      this.tweens.add({
        targets: pickup,
        y: y + 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
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
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.add.image(30 + i * 28, 30, 'heart').setScrollFactor(0).setDepth(100);
      this.hearts.push(heart);
    }
    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.add.text(GAME_WIDTH / 2, 20, 'ACT I — Approaching the Sun', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#FFCC88',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0.7);

    // Progress bar
    this.progressBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 15, 300, 6, 0x333333)
      .setScrollFactor(0).setDepth(100);
    this.progressBar = this.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 15, 0, 6, 0xFFD700)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
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

  updateHealthDisplay(health) {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setTexture(i < health ? 'heart' : 'heart-empty');
    }
  }

  onReachSun() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.setAllowGravity(false);
    this.cameras.main.flash(1000, 255, 215, 0);

    this.time.delayedCall(2500, () => {
      this.scene.start('ChalisaTransition', {
        couplet: 'boss',
        act: 1,
        nextScene: 'Act1Boss',
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

  update(time, delta) {
    if (this.levelComplete) return;
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

    const pp = this.player.getPosition();
    for (const enemy of this.enemies) enemy.update(time, pp);

    // Parallax
    this.cosmicBg.tilePositionX = pp.x * 0.03;
    this.cloudsBg.tilePositionX = pp.x * 0.1;

    // Progress
    const progress = Math.max(0, Math.min(1, pp.x / 7600));
    this.progressBar.width = progress * 300;
  }
}
