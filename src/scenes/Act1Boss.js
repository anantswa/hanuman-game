import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';
import Player from '../entities/Player.js';

export default class Act1Boss extends Phaser.Scene {
  constructor() {
    super('Act1Boss');
  }

  create() {
    this.levelComplete = false;
    this.bossDefeated = false;
    // Cosmic arena background
    this.cosmicBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-cosmic')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(0);

    // Sun in the background (the prize)
    this.bgSun = this.add.image(GAME_WIDTH / 2, 80, 'sun').setScale(0.8).setAlpha(0.4).setDepth(1);
    this.tweens.add({
      targets: this.bgSun,
      scale: 0.9,
      alpha: 0.5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    // Arena bounds
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.physics.world.gravity.y = PLAYER.gravity * 0.4;

    // Player
    this.player = new Player(this, 100, GAME_HEIGHT - 100);

    // --- INDRA BOSS ---
    this.indra = this.physics.add.sprite(GAME_WIDTH - 100, 150, 'indra-boss');
    this.indra.setScale(1.8);
    this.indra.body.setAllowGravity(false);
    this.indra.body.setImmovable(true);
    this.indra.setDepth(8);

    this.bossHealth = 20;
    this.bossMaxHealth = 20;
    this.bossPhase = 1; // 1 = vajra throws, 2 = charge + vajra, 3 = rapid fire
    this.bossInvincible = false;
    this.vajras = this.physics.add.group();

    // Boss health bar
    this.bossBarBg = this.add.rectangle(GAME_WIDTH / 2, 50, 300, 16, 0x333333)
      .setDepth(100);
    this.bossBar = this.add.rectangle(GAME_WIDTH / 2 - 150, 50, 300, 16, 0xFF4444)
      .setOrigin(0, 0.5).setDepth(101);
    this.add.text(GAME_WIDTH / 2, 32, 'INDRA — King of the Gods', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
    }).setOrigin(0.5).setDepth(100);

    // Boss entrance
    this.bossActive = false;
    this.showBossIntro();

    // Collisions
    this.physics.add.overlap(this.player.maceHitbox, this.indra, () => this.hitBoss());
    this.physics.add.overlap(this.player.sprite, this.indra, () => this.player.takeDamage(1));
    this.physics.add.overlap(this.player.sprite, this.vajras, (ps, vajra) => {
      this.player.takeDamage(1);
      vajra.destroy();
    });

    // HUD
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      this.hearts.push(
        this.add.image(30 + i * 28, GAME_HEIGHT - 30, 'heart').setDepth(100)
      );
    }

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('SPACE');
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

    this.events.on('playerDamaged', (h) => {
      for (let i = 0; i < this.hearts.length; i++) {
        this.hearts[i].setTexture(i < h ? 'heart' : 'heart-empty');
      }
    });
    this.events.on('playerDied', () => this.onPlayerDied());

    // Boss attack timer
    this.attackTimer = 0;
    this.chargeTimer = 0;
  }

  showBossIntro() {
    const introText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'INDRA APPROACHES', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: introText,
      alpha: 1,
      duration: 800,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        introText.destroy();
        this.bossActive = true;
        this.startBossPattern();
      },
    });

    // Indra entrance — fly in from right
    this.indra.x = GAME_WIDTH + 100;
    this.tweens.add({
      targets: this.indra,
      x: GAME_WIDTH - 100,
      duration: 2000,
      ease: 'Power2',
    });
  }

  startBossPattern() {
    // Boss movement — float around the right side
    this.bossMovePattern();
  }

  bossMovePattern() {
    if (this.bossDefeated) return;

    const targetY = 80 + Math.random() * (GAME_HEIGHT - 200);
    const targetX = GAME_WIDTH / 2 + 100 + Math.random() * (GAME_WIDTH / 2 - 150);

    this.tweens.add({
      targets: this.indra,
      x: targetX,
      y: targetY,
      duration: 1500 + Math.random() * 1000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!this.bossDefeated) {
          this.bossMovePattern();
        }
      },
    });
  }

  throwVajra() {
    if (this.bossDefeated || !this.bossActive) return;

    const vajra = this.vajras.create(this.indra.x, this.indra.y, 'vajra');
    vajra.body.setAllowGravity(false);
    vajra.setDepth(7);
    vajra.setScale(1.5);

    // Aim at player
    const pp = this.player.getPosition();
    const angle = Phaser.Math.Angle.Between(this.indra.x, this.indra.y, pp.x, pp.y);
    const speed = 200 + this.bossPhase * 50;
    vajra.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    vajra.setRotation(angle + Math.PI / 2);

    // Flash warning
    this.indra.setTint(0xFFFF00);
    this.time.delayedCall(100, () => {
      if (!this.bossDefeated) this.indra.clearTint();
    });

    // Destroy after time
    this.time.delayedCall(4000, () => vajra.destroy());
  }

  chargeAtPlayer() {
    if (this.bossDefeated || !this.bossActive) return;

    // Warning flash
    this.indra.setTint(0xFF0000);
    this.cameras.main.shake(200, 0.005);

    const pp = this.player.getPosition();

    this.time.delayedCall(600, () => {
      if (this.bossDefeated) return;
      this.indra.clearTint();

      // Charge!
      this.tweens.add({
        targets: this.indra,
        x: pp.x,
        y: pp.y,
        duration: 500,
        ease: 'Power3',
        onComplete: () => {
          // Return to position
          if (!this.bossDefeated) {
            this.tweens.add({
              targets: this.indra,
              x: GAME_WIDTH - 100,
              y: 150,
              duration: 1000,
              ease: 'Sine.easeOut',
            });
          }
        },
      });
    });
  }

  hitBoss() {
    if (this.bossInvincible || this.bossDefeated || !this.player.isAttacking) return;

    this.bossHealth--;
    this.bossInvincible = true;

    // Update health bar
    this.bossBar.width = (this.bossHealth / this.bossMaxHealth) * 300;

    // Flash
    this.indra.setTint(0xFF4444);
    this.cameras.main.shake(150, 0.01);

    // Hit particles
    const particles = this.add.particles(this.indra.x, this.indra.y, 'particle', {
      speed: { min: 80, max: 200 },
      tint: [0xFFFF00, 0xFFAA00, 0xFF4444],
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 8,
      emitting: false,
    });
    particles.explode();

    this.time.delayedCall(300, () => {
      this.bossInvincible = false;
      if (!this.bossDefeated) this.indra.clearTint();
    });

    // Phase transitions
    if (this.bossHealth <= 14 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.showPhaseText('Indra grows furious!');
    } else if (this.bossHealth <= 7 && this.bossPhase === 2) {
      this.bossPhase = 3;
      this.showPhaseText('Indra unleashes his full power!');
    }

    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  showPhaseText(msg) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      color: '#FF6644',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: t,
      y: t.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => t.destroy(),
    });
  }

  defeatBoss() {
    this.bossDefeated = true;
    this.levelComplete = true;
    this.bossActive = false;

    // Clear vajras
    this.vajras.clear(true, true);

    // Boss death
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(500, 255, 255, 0);

    // Explosion particles
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => {
        const p = this.add.particles(
          this.indra.x + Phaser.Math.Between(-30, 30),
          this.indra.y + Phaser.Math.Between(-30, 30),
          'particle', {
            speed: { min: 100, max: 300 },
            tint: [0xFFFF00, 0xFFAA00, 0xFF6600, 0xFFFFFF],
            scale: { start: 2, end: 0 },
            lifespan: 800,
            quantity: 20,
            emitting: false,
          }
        );
        p.explode();
      });
    }

    // Indra fades
    this.tweens.add({
      targets: this.indra,
      alpha: 0,
      scale: 0.5,
      duration: 1500,
      delay: 500,
    });

    // Victory text
    this.time.delayedCall(1500, () => {
      const vt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'INDRA DEFEATED', {
        fontSize: '36px',
        fontFamily: 'Georgia, serif',
        color: '#FFD700',
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(200);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
        'But the vajra strikes Hanuman\'s jaw...\nHe falls from the sky...', {
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          color: '#CCAA88',
          align: 'center',
          fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(200);
    });

    // Transition
    this.time.delayedCall(5000, () => {
      this.scene.start('ActComplete', { act: 1 });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1000, () => {
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setDepth(200);
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Hanuman Falls...', {
        fontSize: '32px', fontFamily: 'Georgia, serif', color: '#FF6644',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(201);
      const rt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, '[ SPACE to retry ]', {
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

    // Boss attack patterns
    if (this.bossActive && !this.bossDefeated) {
      this.attackTimer += delta;
      const attackInterval = this.bossPhase === 1 ? 2000 : this.bossPhase === 2 ? 1400 : 900;

      if (this.attackTimer >= attackInterval) {
        this.attackTimer = 0;
        this.throwVajra();

        // Phase 2+: occasional charges
        if (this.bossPhase >= 2) {
          this.chargeTimer += attackInterval;
          if (this.chargeTimer >= 4000) {
            this.chargeTimer = 0;
            this.chargeAtPlayer();
          }
        }

        // Phase 3: double vajra
        if (this.bossPhase === 3) {
          this.time.delayedCall(300, () => this.throwVajra());
        }
      }
    }

    // Parallax
    this.cosmicBg.tilePositionX += 0.2;
    this.cosmicBg.tilePositionY += 0.1;
  }
}
