import Phaser from 'phaser';

export default class Enemy {
  constructor(scene, x, y, type = 'demon-cloud', config = {}) {
    this.scene = scene;
    this.type = type;
    this.health = config.health || 2;
    this.maxHealth = config.health || 2;
    this.speed = config.speed || 80;
    this.damage = config.damage || 1;
    this.scoreValue = config.scoreValue || 100;
    this.isDead = false;
    this.behavior = config.behavior || 'patrol';
    this.scoreType = config.scoreType || 'demonKill'; // for ScoreManager

    this.sprite = scene.physics.add.sprite(x, y, type);
    this.sprite.setScale(config.scale || 1.2);
    this.sprite.setDepth(8);
    this.sprite.body.setAllowGravity(config.gravity !== undefined ? config.gravity : false);
    this.sprite.body.setSize(
      this.sprite.width * 0.7,
      this.sprite.height * 0.7
    );

    // Reference back to this enemy from the sprite
    this.sprite.enemyRef = this;

    // Movement pattern setup
    this.startX = x;
    this.startY = y;
    this.patrolRange = config.patrolRange || 100;
    this.movingRight = Math.random() > 0.5;
    this.elapsed = Math.random() * Math.PI * 2;

    // Bob offset
    this.bobAmplitude = (this.behavior === 'float' || this.behavior === 'patrol') ? 15 : 0;
    this.bobSpeed = 0.002 + Math.random() * 0.001;
  }

  update(time, playerPos) {
    if (this.isDead) return;

    this.elapsed += 0.02;

    switch (this.behavior) {
      case 'patrol':
        this.updatePatrol();
        break;
      case 'chase':
        this.updateChase(playerPos);
        break;
      case 'float':
        this.updateFloat();
        break;
      case 'swoop':
        this.updateSwoop(playerPos);
        break;
    }

    // Smooth vertical bobbing
    if (this.bobAmplitude > 0) {
      this.sprite.y = this.startY + Math.sin(time * this.bobSpeed) * this.bobAmplitude;
    }

    // Face player direction
    if (playerPos) {
      this.sprite.setFlipX(playerPos.x < this.sprite.x);
    }
  }

  updatePatrol() {
    if (this.movingRight) {
      this.sprite.body.setVelocityX(this.speed);
      if (this.sprite.x > this.startX + this.patrolRange) this.movingRight = false;
    } else {
      this.sprite.body.setVelocityX(-this.speed);
      if (this.sprite.x < this.startX - this.patrolRange) this.movingRight = true;
    }
  }

  updateChase(playerPos) {
    if (!playerPos) return;
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 300 && dist > 30) {
      this.sprite.body.setVelocityX((dx / dist) * this.speed);
      this.sprite.body.setVelocityY((dy / dist) * this.speed);
    } else if (dist >= 300) {
      this.updatePatrol();
    }
  }

  updateFloat() {
    this.sprite.body.setVelocityX(Math.sin(this.elapsed) * this.speed * 0.5);
  }

  updateSwoop(playerPos) {
    if (!playerPos) return;
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 250) {
      this.sprite.body.setVelocityX((dx / dist) * this.speed * 1.5);
      this.sprite.body.setVelocityY((dy / dist) * this.speed * 1.5);
    } else {
      this.sprite.body.setVelocityX(Math.sin(this.elapsed) * this.speed);
      this.sprite.body.setVelocityY(Math.cos(this.elapsed * 0.5) * this.speed * 0.3);
    }
  }

  takeDamage(amount = 1) {
    if (this.isDead) return;

    this.health -= amount;

    // Flash WHITE on hit (divine light, not red)
    this.sprite.setTintFill(0xFFFFFF);
    this.scene.time.delayedCall(80, () => {
      if (!this.isDead && this.sprite && this.sprite.active) {
        this.sprite.clearTint();
      }
    });

    // Brief knockback
    const playerPos = this.scene.player ? this.scene.player.getPosition() : null;
    if (playerPos) {
      const dx = this.sprite.x - playerPos.x;
      const dy = this.sprite.y - playerPos.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      this.sprite.body.setVelocity(
        (dx / dist) * 150,
        (dy / dist) * 100
      );
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;

    // Death particles — golden divine burst, not crude red
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.8, end: 0 },
      tint: [0xFFD700, 0xFF8800, 0xFFCC44, 0xFFAA00],
      lifespan: 600,
      quantity: 15,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    particles.explode();
    this.scene.time.delayedCall(700, () => particles.destroy());

    // Emit kill event with score info
    this.scene.events.emit('enemyKilled', {
      scoreValue: this.scoreValue,
      scoreType: this.scoreType,
      x: this.sprite.x,
      y: this.sprite.y,
    });

    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.3,
      duration: 300,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}
