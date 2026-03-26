import { PLAYER, COLORS } from '../config.js';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.health = PLAYER.health;
    this.maxHealth = PLAYER.health;
    this.isAttacking = false;
    this.isInvincible = false;
    this.isDead = false;
    this.facingRight = true;

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'hanuman-idle');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(2.2);
    this.sprite.setDepth(10);
    this.sprite.body.setSize(20, 28);
    this.sprite.body.setOffset(14, 14);

    // Mace hitbox (invisible, activated on attack)
    this.maceHitbox = scene.add.rectangle(x + 40, y, 30, 40);
    scene.physics.add.existing(this.maceHitbox, false);
    this.maceHitbox.body.setAllowGravity(false);
    this.maceHitbox.setVisible(false);
    this.maceHitbox.body.enable = false;

    // Divine glow effect
    this.glow = scene.add.circle(x, y, 28, 0xFFDD44, 0.15);
    this.glow.setDepth(9);

    // Trail particles for flying
    this.trailParticles = scene.add.particles(0, 0, 'divine-glow', {
      follow: this.sprite,
      followOffset: { x: 0, y: 10 },
      speed: { min: 20, max: 60 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 400,
      frequency: 80,
      emitting: false,
    });
    this.trailParticles.setDepth(8);
  }

  update(cursors, attackKey) {
    if (this.isDead) return;

    const { sprite } = this;
    const body = sprite.body;

    // Horizontal movement
    if (cursors.left.isDown) {
      body.setVelocityX(-PLAYER.speed);
      this.facingRight = false;
      sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
      body.setVelocityX(PLAYER.speed);
      this.facingRight = true;
      sprite.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Flying (core mechanic — Hanuman can fly!)
    if (cursors.up.isDown) {
      body.setVelocityY(Math.max(body.velocity.y + PLAYER.flySpeed * this.scene.game.loop.delta / 1000, PLAYER.maxFlyVelocity));
      sprite.setTexture('hanuman-fly');
      this.trailParticles.emitting = true;
    } else {
      this.trailParticles.emitting = false;
      if (body.blocked.down || body.touching.down) {
        sprite.setTexture('hanuman-idle');
      } else {
        sprite.setTexture('hanuman-fly');
      }
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(attackKey) && !this.isAttacking) {
      this.attack();
    }

    // Update mace hitbox position
    const maceOffsetX = this.facingRight ? 40 : -40;
    this.maceHitbox.setPosition(sprite.x + maceOffsetX, sprite.y);

    // Update glow
    this.glow.setPosition(sprite.x, sprite.y);
  }

  attack() {
    this.isAttacking = true;
    this.sprite.setTexture('hanuman-attack');
    if (!this.facingRight) this.sprite.setFlipX(true);

    // Enable mace hitbox
    this.maceHitbox.body.enable = true;

    // Screen shake for impact feel
    this.scene.cameras.main.shake(100, 0.005);

    // Mace swing effect
    const maceX = this.facingRight ? this.sprite.x + 40 : this.sprite.x - 40;
    const hitEffect = this.scene.add.sprite(maceX, this.sprite.y, 'mace-hit');
    hitEffect.setScale(0.8);
    hitEffect.setAlpha(0.8);
    hitEffect.setDepth(11);
    this.scene.tweens.add({
      targets: hitEffect,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => hitEffect.destroy(),
    });

    // End attack after duration
    this.scene.time.delayedCall(PLAYER.attackDuration, () => {
      this.isAttacking = false;
      this.maceHitbox.body.enable = false;
      this.sprite.setTexture('hanuman-idle');
    });
  }

  takeDamage(amount = 1) {
    if (this.isInvincible || this.isDead) return;

    this.health -= amount;
    this.isInvincible = true;

    // Hurt visual
    this.sprite.setTexture('hanuman-hurt');
    this.sprite.setTint(0xFF4444);

    // Flash/blink effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.sprite.clearTint();
        this.isInvincible = false;
      },
    });

    // Knockback
    const knockDir = this.facingRight ? -1 : 1;
    this.sprite.body.setVelocity(knockDir * 150, -200);

    if (this.health <= 0) {
      this.die();
    }

    // Emit event for HUD update
    this.scene.events.emit('playerDamaged', this.health);
  }

  heal(amount = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.scene.events.emit('playerDamaged', this.health);

    // Healing glow
    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
    });
  }

  die() {
    this.isDead = true;
    this.sprite.body.setVelocity(0, -300);
    this.sprite.setTexture('hanuman-hurt');
    this.trailParticles.emitting = false;

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.scene.events.emit('playerDied');
      },
    });
  }

  reset(x, y) {
    this.health = this.maxHealth;
    this.isDead = false;
    this.isInvincible = false;
    this.isAttacking = false;
    this.sprite.setPosition(x, y);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.sprite.body.setVelocity(0, 0);
    this.scene.events.emit('playerDamaged', this.health);
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }
}
