import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../config.js';
import Player from '../entities/Player.js';
import ScoreManager from '../systems/ScoreManager.js';
import CombatFeel from '../systems/CombatFeel.js';
import DepthFog from '../systems/DepthFog.js';
import GlowSystem from '../systems/GlowSystem.js';
import SiddhiSystem from '../systems/SiddhiSystem.js';

export default class Act2Boss extends Phaser.Scene {
  constructor() {
    super('Act2Boss');
  }

  create() {
    console.log('[Act2Boss] Creating boss fight...');
    try {
      this._create();
      console.log('[Act2Boss] Boss fight created successfully!');
    } catch (e) {
      console.error('[Act2Boss] CRASH:', e);
      this.add.text(400, 300, 'Boss fight failed to load!\n' + e.message, {
        fontSize: '18px', color: '#FF4444', align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setDepth(999);
    }
  }

  _create() {
    this.levelComplete = false;
    this.bossDefeated = false;
    this.bossActive = false;

    // --- Systems ---
    this.combatFeel = new CombatFeel(this);
    this.glowSystem = new GlowSystem(this);
    this.depthFog = new DepthFog(this);
    this.depthFog.init('forest');

    // --- Arena background: dark sacred forest ---
    this.skyBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky-dawn')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-100).setAlpha(0.3);

    // Dark overlay for ominous tone
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x110011, 0.5)
      .setDepth(-90);

    // Subtle fog particles
    this.fogParticles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 0, max: GAME_HEIGHT },
      speed: { min: 5, max: 15 },
      angle: { min: 170, max: 190 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.15, end: 0 },
      tint: 0x663366,
      lifespan: { min: 3000, max: 5000 },
      frequency: 300,
      emitting: true,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.fogParticles.setDepth(-50);

    // --- Arena bounds ---
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.physics.world.gravity.y = PLAYER.fullGravity;

    // Arena floor
    this.ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x2A1A2A);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(3);

    // Floor glow line
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH, 2, 0x663366)
      .setDepth(3).setAlpha(0.5);

    // Arena walls (invisible, keep players in)
    const wallLeft = this.add.rectangle(0, GAME_HEIGHT / 2, 20, GAME_HEIGHT, 0x000000, 0);
    this.physics.add.existing(wallLeft, true);
    const wallRight = this.add.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, 20, GAME_HEIGHT, 0x000000, 0);
    this.physics.add.existing(wallRight, true);

    // --- Player (depowered) ---
    this.player = new Player(this, 150, GAME_HEIGHT - 100, { canFly: false });
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.collider(this.player.sprite, wallLeft);
    this.physics.add.collider(this.player.sprite, wallRight);

    // --- SHADOW HANUMAN BOSS ---
    this.shadow = this.physics.add.sprite(GAME_WIDTH - 150, GAME_HEIGHT - 100, 'hanuman-idle');
    this.shadow.setTint(0x330033);
    this.shadow.setScale(this.player.sprite.scaleX, this.player.sprite.scaleY);
    this.shadow.setDepth(8);
    this.shadow.body.setCollideWorldBounds(true);
    this.shadow.setAlpha(0.85);
    this.physics.add.collider(this.shadow, this.ground);

    // Match body size to player
    const texFrame = this.textures.getFrame('hanuman-idle');
    if (texFrame && texFrame.width > 100) {
      this.shadow.body.setSize(texFrame.width * 0.6, texFrame.height * 0.7);
      this.shadow.body.setOffset(texFrame.width * 0.2, texFrame.height * 0.15);
    } else {
      this.shadow.body.setSize(20, 28);
      this.shadow.body.setOffset(14, 14);
    }

    // Shadow dark aura
    this.shadowAura = this.add.circle(this.shadow.x, this.shadow.y, 40, 0x660066, 0.15);
    this.shadowAura.setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: this.shadowAura,
      scale: 1.3, alpha: 0.08,
      duration: 1500, yoyo: true, repeat: -1,
    });

    // Shadow mace hitbox
    this.shadowMaceHitbox = this.add.rectangle(this.shadow.x - 40, this.shadow.y, 36, 48);
    this.physics.add.existing(this.shadowMaceHitbox, false);
    this.shadowMaceHitbox.body.setAllowGravity(false);
    this.shadowMaceHitbox.setVisible(false);
    this.shadowMaceHitbox.body.enable = false;

    // Boss state
    this.bossHealth = 15;
    this.bossMaxHealth = 15;
    this.bossInvincible = false;
    this.shadowState = 'idle'; // idle, charging, attacking, windUp
    this.shadowFacingRight = false;

    // Position history for mirroring (stores player pos every frame)
    this.positionHistory = [];
    this.MIRROR_DELAY_MS = 1000; // 1-second delay
    this.historyTimestamp = 0;

    // Boss AI timers
    this.attackCooldown = 0;
    this.chargeCooldown = 0;
    this.windUpTimer = 0;

    // --- Boss health bar ---
    this.bossBarBg = this.add.rectangle(GAME_WIDTH / 2, 30, 300, 16, 0x333333)
      .setScrollFactor(0).setDepth(100);
    this.bossBar = this.add.rectangle(GAME_WIDTH / 2 - 150, 30, 300, 16, 0x9933CC)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.bossBarBorder = this.add.rectangle(GAME_WIDTH / 2, 30, 300, 16)
      .setScrollFactor(0).setDepth(102).setStrokeStyle(2, 0x660066);
    this.add.text(GAME_WIDTH / 2, 12, 'THE SHADOW SELF', {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#CC88FF', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // --- Collisions ---
    // Player mace hits shadow
    this.physics.add.overlap(this.player.maceHitbox, this.shadow, () => this.hitBoss());
    // Shadow touches player
    this.physics.add.overlap(this.player.sprite, this.shadow, () => {
      if (this.bossActive && !this.bossDefeated && this.shadowState === 'charging') {
        if (this.combatFeel) this.combatFeel.damageFlash();
        this.player.takeDamage(1);
      }
    });
    // Shadow mace hits player
    this.physics.add.overlap(this.shadowMaceHitbox, this.player.sprite, () => {
      if (this.shadowMaceHitbox.body.enable) {
        if (this.combatFeel) this.combatFeel.damageFlash();
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

    // --- Boss entrance ---
    this.showBossIntro();
  }

  // ── BOSS INTRO ──
  showBossIntro() {
    // Shadow materializes from darkness
    this.shadow.setAlpha(0);

    const introText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'Face your shadow...', {
        fontSize: '28px', fontFamily: 'Georgia, serif',
        color: '#CC88FF', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(200).setAlpha(0);

    const subText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
      'THE SHADOW SELF', {
        fontSize: '20px', fontFamily: 'Georgia, serif',
        color: '#FFD700', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(200).setAlpha(0);

    // Fade in intro text
    this.tweens.add({
      targets: introText, alpha: 1, duration: 800,
      yoyo: true, hold: 1200,
      onComplete: () => introText.destroy(),
    });
    this.tweens.add({
      targets: subText, alpha: 1, duration: 800, delay: 400,
      yoyo: true, hold: 1000,
      onComplete: () => subText.destroy(),
    });

    // Shadow materializes
    this.tweens.add({
      targets: this.shadow, alpha: 0.85, duration: 1500, delay: 500,
    });

    // Activate boss after intro
    this.time.delayedCall(3000, () => {
      this.bossActive = true;
    });
  }

  // ── HIT BOSS ──
  hitBoss() {
    if (this.bossInvincible || this.bossDefeated || !this.player.isAttacking) return;

    if (this.combatFeel) this.combatFeel.maceImpact(this.shadow, 1.0);

    // Only takes 2 damage from mace
    this.bossHealth -= 2;
    this.bossInvincible = true;

    // Update health bar
    const healthPct = Math.max(0, this.bossHealth / this.bossMaxHealth);
    this.bossBar.width = healthPct * 300;

    // Flash purple-white on hit
    this.shadow.setTintFill(0xFFFFFF);
    this.cameras.main.shake(150, 0.012);

    // Hit particles — dark purple burst
    const particles = this.add.particles(this.shadow.x, this.shadow.y, 'particle', {
      speed: { min: 80, max: 200 },
      tint: [0xCC88FF, 0x660066, 0xFF44FF, 0xFFFFFF],
      scale: { start: 1.2, end: 0 },
      lifespan: 400,
      quantity: 10,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    particles.explode();
    this.time.delayedCall(500, () => particles.destroy());

    // Knockback shadow
    const knockDir = this.shadow.x > this.player.sprite.x ? 1 : -1;
    this.shadow.body.setVelocity(knockDir * 200, -150);

    // Vulnerability window text (hint player is doing it right)
    if (this.shadowState === 'windUp') {
      const critText = this.add.text(this.shadow.x, this.shadow.y - 40, 'CRITICAL!', {
        fontSize: '18px', fontFamily: 'Georgia, serif',
        color: '#FF44FF', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(200);
      this.tweens.add({
        targets: critText, y: critText.y - 30, alpha: 0,
        duration: 800, onComplete: () => critText.destroy(),
      });
    }

    this.time.delayedCall(500, () => {
      this.bossInvincible = false;
      if (!this.bossDefeated && this.shadow && this.shadow.active) {
        this.shadow.setTint(0x330033);
      }
    });

    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  // ── SHADOW AI ──
  updateShadowAI(time, delta) {
    if (!this.bossActive || this.bossDefeated) return;

    const dt = delta / 1000;
    const pp = this.player.getPosition();
    const sx = this.shadow.x;
    const sy = this.shadow.y;
    const dist = Phaser.Math.Distance.Between(sx, sy, pp.x, pp.y);

    // Store player position history for mirroring
    this.positionHistory.push({
      x: pp.x, y: pp.y, time: time,
      velX: this.player.sprite.body.velocity.x,
      velY: this.player.sprite.body.velocity.y,
    });

    // Trim old history (keep 3 seconds max)
    while (this.positionHistory.length > 0 && this.positionHistory[0].time < time - 3000) {
      this.positionHistory.shift();
    }

    // Timers
    this.attackCooldown -= delta;
    this.chargeCooldown -= delta;

    // Face player
    this.shadowFacingRight = pp.x > sx;
    this.shadow.setFlipX(!this.shadowFacingRight);

    switch (this.shadowState) {
      case 'idle':
        this.updateShadowIdle(time, delta, pp, dist);
        break;
      case 'mirroring':
        this.updateShadowMirror(time, delta);
        break;
      case 'windUp':
        this.updateShadowWindUp(time, delta);
        break;
      case 'charging':
        this.updateShadowCharge(time, delta, pp);
        break;
      case 'attacking':
        this.updateShadowAttack(time, delta);
        break;
      case 'recovering':
        // Just wait for recovery to end (handled by timer)
        break;
    }

    // Update shadow aura position
    this.shadowAura.setPosition(this.shadow.x, this.shadow.y);

    // Update shadow mace hitbox position
    const maceOffsetX = this.shadowFacingRight ? 44 : -44;
    this.shadowMaceHitbox.setPosition(this.shadow.x + maceOffsetX, this.shadow.y);
  }

  updateShadowIdle(time, delta, pp, dist) {
    // Mirror player movements with 1-second delay
    const delayedEntry = this.getDelayedPosition(time);

    if (delayedEntry) {
      // Move toward the player's delayed position
      const dx = delayedEntry.x - this.shadow.x;
      if (Math.abs(dx) > 20) {
        this.shadow.body.setVelocityX(Math.sign(dx) * 160);
      } else {
        this.shadow.body.setVelocityX(0);
      }

      // Mirror jumping
      if (delayedEntry.velY < -100 && this.shadow.body.blocked.down) {
        this.shadow.body.setVelocityY(-380);
      }
    }

    // Decide to attack
    if (this.attackCooldown <= 0 && dist < 350) {
      // Start wind-up (player's window to attack)
      this.shadowState = 'windUp';
      this.windUpTimer = 800; // 800ms wind-up
      this.attackCooldown = 3000;
      this.shadow.setTexture('hanuman-idle');

      // Warning flash
      this.shadow.setTint(0xFF0066);
    }

    // Decide to charge
    if (this.chargeCooldown <= 0 && dist > 200) {
      this.shadowState = 'windUp';
      this.windUpTimer = 600;
      this.chargeCooldown = 4000;
      this.shadowChargeTarget = { x: pp.x, y: pp.y };
      this.shadowNextAction = 'charge';
      this.shadow.setTint(0xFF0066);
    }
  }

  updateShadowWindUp(time, delta) {
    this.windUpTimer -= delta;

    // Pulsing warning effect
    const pulse = Math.sin(time * 0.015) * 0.3 + 0.7;
    this.shadow.setAlpha(pulse);

    // Shaking in place
    this.shadow.x += Math.sin(time * 0.05) * 1.5;

    if (this.windUpTimer <= 0) {
      this.shadow.setAlpha(0.85);

      if (this.shadowNextAction === 'charge') {
        this.shadowState = 'charging';
        this.shadowNextAction = null;
      } else {
        this.shadowState = 'attacking';
        this.startShadowAttack();
      }
    }
  }

  updateShadowCharge(time, delta, pp) {
    // Charge at player's position
    const target = this.shadowChargeTarget || pp;
    const dx = target.x - this.shadow.x;
    const dist = Math.abs(dx);

    this.shadow.body.setVelocityX(Math.sign(dx) * 400);
    this.shadow.setTexture('hanuman-fly');
    this.shadow.setTint(0x660033);

    // Dark trail during charge
    if (Math.random() > 0.5) {
      const trail = this.add.circle(this.shadow.x, this.shadow.y, 8, 0x660066, 0.4);
      trail.setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: trail, alpha: 0, scale: 0.1, duration: 300,
        onComplete: () => trail.destroy(),
      });
    }

    // Stop charging after reaching target or a wall
    if (dist < 30 || this.shadow.body.blocked.left || this.shadow.body.blocked.right) {
      this.shadow.body.setVelocityX(0);
      this.shadowState = 'recovering';
      this.shadow.setTint(0x330033);
      this.shadow.setTexture('hanuman-idle');

      // Recovery window — vulnerable for 1 second
      this.time.delayedCall(1000, () => {
        if (!this.bossDefeated) {
          this.shadowState = 'idle';
          this.attackCooldown = 2000;
        }
      });
    }
  }

  startShadowAttack() {
    // Shadow mace swing — mirrors player's attack
    this.shadow.setTexture('hanuman-attack');
    this.shadow.setTint(0x660033);
    this.shadowMaceHitbox.body.enable = true;

    // Mace swing visual
    const maceX = this.shadowFacingRight ? this.shadow.x + 44 : this.shadow.x - 44;
    const hitEffect = this.add.sprite(maceX, this.shadow.y, 'mace-hit');
    hitEffect.setScale(0.8).setAlpha(0.6).setDepth(11);
    hitEffect.setTint(0x660066);
    hitEffect.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: hitEffect, scale: 1.5, alpha: 0,
      duration: 250, onComplete: () => hitEffect.destroy(),
    });

    // End attack after duration
    this.time.delayedCall(300, () => {
      this.shadowMaceHitbox.body.enable = false;
      this.shadowState = 'recovering';
      this.shadow.setTexture('hanuman-idle');
      this.shadow.setTint(0x330033);

      this.time.delayedCall(800, () => {
        if (!this.bossDefeated) {
          this.shadowState = 'idle';
        }
      });
    });
  }

  updateShadowAttack(time, delta) {
    // Attack is handled by timers in startShadowAttack
    // Keep facing player during attack
  }

  getDelayedPosition(currentTime) {
    const targetTime = currentTime - this.MIRROR_DELAY_MS;
    // Find the closest entry to the delayed time
    for (let i = this.positionHistory.length - 1; i >= 0; i--) {
      if (this.positionHistory[i].time <= targetTime) {
        return this.positionHistory[i];
      }
    }
    return this.positionHistory.length > 0 ? this.positionHistory[0] : null;
  }

  // ── BOSS DEFEAT ──
  defeatBoss() {
    this.bossDefeated = true;
    this.levelComplete = true;
    this.bossActive = false;

    // Freeze player
    this.player.sprite.body.setVelocity(0, 0);

    // Shadow death sequence
    this.cameras.main.shake(500, 0.02);

    // Dark explosion particles
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 200, () => {
        const p = this.add.particles(
          this.shadow.x + Phaser.Math.Between(-30, 30),
          this.shadow.y + Phaser.Math.Between(-30, 30),
          'particle', {
            speed: { min: 100, max: 250 },
            tint: [0xCC88FF, 0x660066, 0xFF44FF, 0x330033],
            scale: { start: 1.5, end: 0 },
            lifespan: 600,
            quantity: 15,
            emitting: false,
            blendMode: Phaser.BlendModes.ADD,
          }
        );
        p.explode();
        this.time.delayedCall(700, () => p.destroy());
      });
    }

    // Shadow dissolves
    this.tweens.add({
      targets: [this.shadow, this.shadowAura],
      alpha: 0, scale: 0.3,
      duration: 1500, delay: 600,
    });

    // --- Golden flash: "Meeting Ram" cutscene ---
    this.time.delayedCall(2500, () => {
      // Screen flashes golden
      this.cameras.main.flash(1500, 255, 215, 0);

      // Golden overlay
      const goldenOverlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0xFFD700, 0.4
      ).setDepth(250).setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: goldenOverlay,
        alpha: 0, duration: 3000, delay: 1000,
        onComplete: () => goldenOverlay.destroy(),
      });

      // "Your powers are restored!" text
      const restoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
        'Ram speaks to Hanuman...', {
          fontSize: '18px', fontFamily: 'Georgia, serif',
          color: '#FFCC88', stroke: '#000', strokeThickness: 3,
          fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(300).setAlpha(0);

      const powerText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
        'Your powers are restored!', {
          fontSize: '32px', fontFamily: 'Georgia, serif',
          color: '#FFD700', stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(300).setAlpha(0);

      const flyText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
        'Fly once more, Son of the Wind.', {
          fontSize: '16px', fontFamily: 'Georgia, serif',
          color: '#FFCC88', stroke: '#000', strokeThickness: 2,
          fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(300).setAlpha(0);

      // Sequential text reveal
      this.tweens.add({ targets: restoreText, alpha: 1, duration: 800 });
      this.tweens.add({ targets: powerText, alpha: 1, duration: 800, delay: 800 });
      this.tweens.add({ targets: flyText, alpha: 1, duration: 800, delay: 1600 });

      // Restore player flight
      this.time.delayedCall(1500, () => {
        this.player.canFly = true;

        // Player glows bright gold
        this.player.glow.setAlpha(0.8);
        this.player.glow.setScale(3);
        this.tweens.add({
          targets: this.player.glow,
          alpha: 0.12, scale: 1,
          duration: 2000, ease: 'Power2',
        });

        // Divine particle burst around player
        const divineBurst = this.add.particles(this.player.sprite.x, this.player.sprite.y, 'particle', {
          speed: { min: 80, max: 250 },
          scale: { start: 1, end: 0 },
          tint: [0xFFD700, 0xFFCC44, 0xFFFFFF, 0xFF8800],
          lifespan: 1000,
          quantity: 30,
          emitting: false,
          blendMode: Phaser.BlendModes.ADD,
        });
        divineBurst.explode();
        this.time.delayedCall(1200, () => divineBurst.destroy());
      });
    });

    // Save progress and transition
    this.time.delayedCall(7000, () => {
      ScoreManager.saveProgress(2, 3);

      this.scene.start('ChalisaTransition', {
        couplet: 'boss', act: 2, nextScene: 'Act3Level1',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1000, () => {
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
        .setDepth(200);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
        'The shadow consumes you...', {
          fontSize: '24px', fontFamily: 'Georgia, serif', color: '#CC88FF',
          stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(201);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
        'Sankat se Hanuman chhudave', {
          fontSize: '16px', fontFamily: 'Georgia, serif', color: '#FFD700',
          fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(201);

      const rt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
        '[ SPACE to retry ]', {
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
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };

    // Jump from ground (no flight in this fight)
    const body = this.player.sprite.body;
    const onGround = body.blocked.down || body.touching.down;
    if (onGround && vc.up.isDown) {
      body.setVelocityY(-420);
    }

    this.player.update(vc, this.attackKey, delta);

    if (this.touchState.attack) {
      this.touchState.attack = false;
      if (!this.player.isAttacking) this.player.startAttack();
    }

    // Update shadow AI
    this.updateShadowAI(time, delta);

    // Subtle background scroll
    this.skyBg.tilePositionX += 0.1;
  }
}
