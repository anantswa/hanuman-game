export default class Enemy {
  constructor(scene, x, y, type = 'demon-cloud', config = {}) {
    this.scene = scene;
    this.type = type;
    this.health = config.health || 2;
    this.speed = config.speed || 80;
    this.damage = config.damage || 1;
    this.scoreValue = config.scoreValue || 100;
    this.isDead = false;
    this.behavior = config.behavior || 'patrol'; // patrol, chase, float, swoop

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
    this.elapsed = Math.random() * Math.PI * 2; // Random phase offset

    // Floating bob animation
    if (this.behavior === 'float' || this.behavior === 'patrol') {
      scene.tweens.add({
        targets: this.sprite,
        y: y + 15,
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
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

    // Face player direction
    if (playerPos) {
      this.sprite.setFlipX(playerPos.x < this.sprite.x);
    }
  }

  updatePatrol() {
    if (this.movingRight) {
      this.sprite.body.setVelocityX(this.speed);
      if (this.sprite.x > this.startX + this.patrolRange) {
        this.movingRight = false;
      }
    } else {
      this.sprite.body.setVelocityX(-this.speed);
      if (this.sprite.x < this.startX - this.patrolRange) {
        this.movingRight = true;
      }
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
      // Swoop toward player
      this.sprite.body.setVelocityX((dx / dist) * this.speed * 1.5);
      this.sprite.body.setVelocityY((dy / dist) * this.speed * 1.5);
    } else {
      // Circle above
      this.sprite.body.setVelocityX(Math.sin(this.elapsed) * this.speed);
      this.sprite.body.setVelocityY(Math.cos(this.elapsed * 0.5) * this.speed * 0.3);
    }
  }

  takeDamage(amount = 1) {
    if (this.isDead) return;

    this.health -= amount;

    // Flash red
    this.sprite.setTint(0xFF0000);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;

    // Death particles
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      tint: [0xFF4444, 0xFF8800, 0xFFCC00],
      lifespan: 500,
      quantity: 12,
      emitting: false,
    });
    particles.explode();
    this.scene.time.delayedCall(600, () => particles.destroy());

    // Score popup
    const scoreText = this.scene.add.text(this.sprite.x, this.sprite.y - 20, `+${this.scoreValue}`, {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 2,
    }).setDepth(20);

    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => scoreText.destroy(),
    });

    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => {
        this.sprite.destroy();
        this.scene.events.emit('enemyKilled', this.scoreValue);
      },
    });
  }

  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}
