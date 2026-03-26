import Phaser from 'phaser';
import { PLAYER, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// === FINITE STATE MACHINE ===
const STATES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  FLYING: 'FLYING',
  DASHING: 'DASHING',
  ATTACKING: 'ATTACKING',
  HURT: 'HURT',
  DEAD: 'DEAD',
  KNEELING: 'KNEELING',
};

// Movement constants (tuned for divine monkey feel)
const MOVE = {
  maxSpeed: 240,
  accelTime: 0.25,       // seconds to reach max speed
  decelTime: 0.15,       // seconds to stop
  flyUpSpeed: -380,       // upward velocity when holding UP
  flyAccel: -900,         // upward acceleration
  gentleGravity: 200,     // soft float when not flying (not plummeting)
  fullGravity: 600,       // normal gravity for grounded acts
  airControl: 1.0,        // full control in air
  coyoteTime: 150,        // ms grace period (150ms per research)
  jumpBuffer: 100,        // ms — register jump pressed before landing
  cornerCorrection: 4,    // px — nudge through tile clips
  halfGravityThreshold: 50, // velocity threshold for apex half-gravity
  // Dash
  dashSpeed: 720,         // 3x normal
  dashDuration: 300,      // ms
  dashCooldown: 1500,     // ms
  dashGhosts: 4,          // number of afterimage sprites
  // Attack
  attackDuration: 250,
  hitStopDuration: 50,    // ms — physics freeze on hit
  // Damage
  knockbackX: 200,
  knockbackY: -250,
  invincibleDuration: 2000,
  invincibleFlashRate: 80, // ms per flash cycle
  // Devotion
  devotionMax: 100,
  devotionPerLotus: 5,
  devotionPerKill: 10,
  devotionPassiveRate: 1,  // per second without damage
  devotionDamageLoss: 20,
};

export default class Player {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.health = PLAYER.health;
    this.maxHealth = PLAYER.health;
    this.isDead = false;
    this.facingRight = true;
    this.canFly = options.canFly !== false; // Acts can disable flight

    // FSM
    this.state = STATES.IDLE;
    this.prevState = null;
    this.stateTime = 0;

    // Velocity tracking (acceleration model)
    this.velX = 0;
    this.velY = 0;

    // Dash state
    this.dashCooldownTimer = 0;
    this.dashDirection = 1;
    this.isDashing = false;
    this.dashGhosts = [];

    // Attack state
    this.isAttacking = false;
    this.attackHitConnected = false;

    // Invincibility
    this.isInvincible = false;
    this.invincibleTimer = 0;

    // Devotion meter
    this.devotion = 0;
    this.timeSinceLastDamage = 0;

    // Jump buffering
    this.jumpBufferedTime = 0; // time when jump was last pressed

    // Coyote time
    this.lastGroundedTime = 0;

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'hanuman-idle');
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setDepth(10);

    // Scale based on real image vs procedural sprite
    // Real PNGs are 1024x1536 — scale to ~120px tall on screen
    const texFrame = scene.textures.getFrame('hanuman-idle');
    if (texFrame && texFrame.width > 100) {
      const imgScale = 120 / texFrame.height;
      this.sprite.setScale(imgScale);
      this.sprite.body.setSize(texFrame.width * 0.5, texFrame.height * 0.55);
      this.sprite.body.setOffset(texFrame.width * 0.25, texFrame.height * 0.25);
    } else {
      this.sprite.setScale(2.2);
      this.sprite.body.setSize(20, 28);
      this.sprite.body.setOffset(14, 14);
    }

    // Mace hitbox
    this.maceHitbox = scene.add.rectangle(x + 40, y, 36, 48);
    scene.physics.add.existing(this.maceHitbox, false);
    this.maceHitbox.body.setAllowGravity(false);
    this.maceHitbox.setVisible(false);
    this.maceHitbox.body.enable = false;

    // Divine glow
    this.glow = scene.add.circle(x, y, 32, 0xFFDD44, 0.12);
    this.glow.setDepth(9);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);

    // Trail particles
    this.trailParticles = scene.add.particles(0, 0, 'divine-glow', {
      follow: this.sprite,
      followOffset: { x: 0, y: 10 },
      speed: { min: 20, max: 60 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: 0xFFD700,
      lifespan: 400,
      frequency: 60,
      emitting: false,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.trailParticles.setDepth(8);

    // Dash key
    this.shiftKey = scene.input.keyboard.addKey('SHIFT');
    this.qKey = scene.input.keyboard.addKey('Q');
  }

  // ── FSM TRANSITION ──
  changeState(newState) {
    if (this.state === newState) return;
    this.prevState = this.state;
    this.state = newState;
    this.stateTime = 0;
  }

  // ── MAIN UPDATE ──
  update(cursors, attackKey, delta) {
    if (this.isDead) return;

    const dt = (delta || 16.67) / 1000; // seconds
    this.stateTime += delta || 16.67;

    // Track grounded
    const body = this.sprite.body;
    const onGround = body.blocked.down || body.touching.down;
    if (onGround) this.lastGroundedTime = this.scene.time.now;

    // Invincibility timer
    if (this.isInvincible) {
      this.invincibleTimer -= delta || 16.67;
      // Gentle alpha pulse
      const flash = Math.sin(this.scene.time.now / MOVE.invincibleFlashRate * Math.PI);
      this.sprite.setAlpha(0.5 + 0.5 * Math.abs(flash));
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.sprite.setAlpha(1);
        this.sprite.clearTint();
      }
    }

    // Devotion passive gain (when not taking damage)
    this.timeSinceLastDamage += dt;
    if (this.timeSinceLastDamage > 2) { // after 2 seconds of no damage
      this.addDevotion(MOVE.devotionPassiveRate * dt);
    }

    // Dash cooldown
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta || 16.67;
    }

    // ── State machine ──
    switch (this.state) {
      case STATES.IDLE:
      case STATES.RUNNING:
      case STATES.FLYING:
      case STATES.JUMPING:
        this.updateMovement(cursors, attackKey, dt, onGround);
        break;
      case STATES.DASHING:
        this.updateDash(dt);
        break;
      case STATES.ATTACKING:
        this.updateAttack(cursors, dt);
        break;
      case STATES.HURT:
        if (this.stateTime > 300) {
          this.changeState(onGround ? STATES.IDLE : STATES.FLYING);
        }
        break;
      case STATES.DEAD:
        return;
    }

    // Update mace hitbox position
    const maceOffsetX = this.facingRight ? 44 : -44;
    this.maceHitbox.setPosition(this.sprite.x + maceOffsetX, this.sprite.y);

    // Update glow
    this.glow.setPosition(this.sprite.x, this.sprite.y);

    // Update dash ghosts
    this.updateDashGhosts(dt);

    // Trail particles when moving fast
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    this.trailParticles.emitting = speed > 180;

    // Glow intensity based on devotion
    const devotionNorm = this.devotion / MOVE.devotionMax;
    this.glow.setAlpha(0.12 + devotionNorm * 0.3);
    this.glow.setScale(1 + devotionNorm * 0.5);
  }

  // ── MOVEMENT (handles IDLE, RUNNING, FLYING, JUMPING states) ──
  updateMovement(cursors, attackKey, dt, onGround) {
    const body = this.sprite.body;

    // -- Horizontal movement with acceleration curves --
    const accelRate = MOVE.maxSpeed / MOVE.accelTime;
    const decelRate = MOVE.maxSpeed / MOVE.decelTime;

    let targetVelX = 0;
    if (cursors.left.isDown) {
      targetVelX = -MOVE.maxSpeed;
      this.facingRight = false;
      this.sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
      targetVelX = MOVE.maxSpeed;
      this.facingRight = true;
      this.sprite.setFlipX(false);
    }

    // Smooth acceleration / deceleration
    if (targetVelX !== 0) {
      // Accelerate toward target
      if (Math.abs(this.velX) < Math.abs(targetVelX)) {
        this.velX += Math.sign(targetVelX) * accelRate * dt;
        if (Math.abs(this.velX) > MOVE.maxSpeed) this.velX = targetVelX;
      } else {
        this.velX = targetVelX;
      }
    } else {
      // Decelerate to stop (slide)
      if (Math.abs(this.velX) > 5) {
        this.velX -= Math.sign(this.velX) * decelRate * dt;
      } else {
        this.velX = 0;
      }
    }
    body.setVelocityX(this.velX);

    // -- Vertical: flying or gravity --
    if (this.canFly && cursors.up.isDown) {
      // Accelerate upward
      this.velY += MOVE.flyAccel * dt;
      if (this.velY < MOVE.flyUpSpeed) this.velY = MOVE.flyUpSpeed;
      body.setVelocityY(this.velY);
      this.changeState(STATES.FLYING);
    } else {
      // HALF-GRAVITY JUMP PEAK: divine weightlessness at apex
      // When rising slowly and UP is held (or recently released), halve gravity
      // This makes Hanuman's flight feel cosmic and suspended
      if (!onGround && Math.abs(body.velocity.y) < MOVE.halfGravityThreshold) {
        body.setGravityY(-MOVE.gentleGravity * 0.5); // counteract half the gravity
      } else {
        body.setGravityY(0); // let world gravity handle it normally
      }
      // Gentle gravity (floaty, not plummeting)
      this.velY = body.velocity.y; // let Phaser gravity handle it
    }

    // -- Determine visual state --
    if (this.state !== STATES.ATTACKING) {
      if (cursors.up.isDown && this.canFly) {
        this.sprite.setTexture('hanuman-fly');
      } else if (onGround) {
        if (Math.abs(this.velX) > 10) {
          this.sprite.setTexture('hanuman-fly'); // use fly as run placeholder
          this.changeState(STATES.RUNNING);
        } else {
          this.sprite.setTexture('hanuman-idle');
          this.changeState(STATES.IDLE);
        }
      } else {
        this.sprite.setTexture('hanuman-fly');
        if (this.state !== STATES.FLYING) this.changeState(STATES.JUMPING);
      }
    }

    // -- Dash (SHIFT key) --
    if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.dashCooldownTimer <= 0) {
      this.startDash();
      return;
    }

    // -- Attack (SPACE) --
    if (Phaser.Input.Keyboard.JustDown(attackKey) && this.state !== STATES.ATTACKING) {
      this.startAttack();
      return;
    }

    // -- Devotion special (Q key) --
    if (Phaser.Input.Keyboard.JustDown(this.qKey) && this.devotion >= MOVE.devotionMax) {
      this.triggerDevotionSpecial();
    }
  }

  // ── DASH ──
  startDash() {
    this.changeState(STATES.DASHING);
    this.isDashing = true;
    this.dashCooldownTimer = MOVE.dashCooldown;
    this.dashDirection = this.facingRight ? 1 : -1;
    this.isInvincible = true;
    this.invincibleTimer = MOVE.dashDuration;

    // Set dash velocity
    this.sprite.body.setVelocityX(this.dashDirection * MOVE.dashSpeed);
    this.sprite.body.setVelocityY(0);
    this.sprite.body.setAllowGravity(false);

    // Spawn ghost sprites
    this.spawnDashGhost();
    this.scene.time.delayedCall(75, () => this.spawnDashGhost());
    this.scene.time.delayedCall(150, () => this.spawnDashGhost());
    this.scene.time.delayedCall(225, () => this.spawnDashGhost());

    // Golden particle trail
    const trailEmitter = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      follow: this.sprite,
      speed: { min: 30, max: 80 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: [0xFFD700, 0xFF6600],
      lifespan: 400,
      frequency: 20,
      blendMode: Phaser.BlendModes.ADD,
    });
    trailEmitter.setDepth(9);

    // End dash
    this.scene.time.delayedCall(MOVE.dashDuration, () => {
      this.isDashing = false;
      this.sprite.body.setAllowGravity(true);
      trailEmitter.emitting = false;
      this.scene.time.delayedCall(500, () => trailEmitter.destroy());

      // Restore normal velocity
      this.velX = this.dashDirection * MOVE.maxSpeed * 0.5;
      this.sprite.body.setVelocityX(this.velX);
      this.changeState(STATES.FLYING);
    });
  }

  spawnDashGhost() {
    if (!this.sprite || !this.sprite.active) return;
    const ghost = this.scene.add.sprite(this.sprite.x, this.sprite.y, this.sprite.texture.key);
    ghost.setScale(this.sprite.scaleX, this.sprite.scaleY);
    ghost.setFlipX(this.sprite.flipX);
    ghost.setTint(0xFF6600); // saffron tint
    ghost.setAlpha(0.6);
    ghost.setDepth(8);
    ghost.setBlendMode(Phaser.BlendModes.ADD);

    this.dashGhosts.push({ sprite: ghost, life: 500 });
  }

  updateDashGhosts(dt) {
    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      const ghost = this.dashGhosts[i];
      ghost.life -= dt * 1000;
      ghost.sprite.setAlpha(Math.max(0, ghost.life / 500 * 0.6));
      if (ghost.life <= 0) {
        ghost.sprite.destroy();
        this.dashGhosts.splice(i, 1);
      }
    }
  }

  updateDash(dt) {
    // Dash is handled by the timed callback
    // Just keep texture right
    this.sprite.setTexture('hanuman-fly');
  }

  // ── ATTACK ──
  startAttack() {
    this.changeState(STATES.ATTACKING);
    this.isAttacking = true;
    this.attackHitConnected = false;
    this.sprite.setTexture('hanuman-attack');
    if (!this.facingRight) this.sprite.setFlipX(true);

    // Enable mace hitbox
    this.maceHitbox.body.enable = true;

    // Mace swing visual
    const maceX = this.facingRight ? this.sprite.x + 44 : this.sprite.x - 44;
    const hitEffect = this.scene.add.sprite(maceX, this.sprite.y, 'mace-hit');
    hitEffect.setScale(0.8);
    hitEffect.setAlpha(0.8);
    hitEffect.setDepth(11);
    hitEffect.setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: hitEffect,
      scale: 1.8,
      alpha: 0,
      duration: 250,
      onComplete: () => hitEffect.destroy(),
    });

    // End attack
    this.scene.time.delayedCall(MOVE.attackDuration, () => {
      this.isAttacking = false;
      this.maceHitbox.body.enable = false;
      this.changeState(STATES.IDLE);
    });
  }

  updateAttack(cursors, dt) {
    // Allow movement during attack (Ori-style, don't freeze player)
    const body = this.sprite.body;
    if (cursors.left.isDown) {
      body.setVelocityX(-MOVE.maxSpeed * 0.6);
    } else if (cursors.right.isDown) {
      body.setVelocityX(MOVE.maxSpeed * 0.6);
    }
  }

  // ── HIT-STOP (called externally when mace connects) ──
  onMaceConnected(enemyX, enemyY) {
    if (this.attackHitConnected) return; // only once per swing
    this.attackHitConnected = true;

    // Use CombatFeel system if available (timeScale=0.01 keeps shaders alive)
    if (this.scene.combatFeel) {
      this.scene.combatFeel.maceImpact(
        { x: enemyX, y: enemyY, active: true, setTintFill: () => {}, clearTint: () => {} },
        1.0
      );
    } else {
      // Fallback: direct physics timeScale freeze
      this.scene.physics.world.timeScale = 100;
      setTimeout(() => { this.scene.physics.world.timeScale = 1; }, MOVE.hitStopDuration);
    }

    // Screen shake
    this.scene.cameras.main.shake(80, 0.012);

    // Enemy flashes white (handled by Enemy.takeDamage)

    // Golden starburst at impact point
    if (this.scene.particleManager) {
      this.scene.particleManager.burstAt('maceImpact', enemyX, enemyY);
    }
  }

  // ── TAKE DAMAGE ──
  takeDamage(amount = 1) {
    if (this.isInvincible || this.isDead) return;

    this.health -= amount;
    this.isInvincible = true;
    this.invincibleTimer = MOVE.invincibleDuration;
    this.timeSinceLastDamage = 0;
    this.changeState(STATES.HURT);

    // Golden flicker (not crude red — divine hero)
    this.sprite.setTexture('hanuman-hurt');
    this.sprite.setTintFill(0xFFD700);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.sprite.clearTint();
    });

    // Knockback
    const knockDir = this.facingRight ? -1 : 1;
    this.sprite.body.setVelocity(knockDir * MOVE.knockbackX, MOVE.knockbackY);
    this.velX = knockDir * MOVE.knockbackX;

    // Light screen shake
    this.scene.cameras.main.shake(60, 0.008);

    // Devotion loss
    this.devotion = Math.max(0, this.devotion - MOVE.devotionDamageLoss);

    if (this.health <= 0) {
      this.die();
    }

    this.scene.events.emit('playerDamaged', this.health);
  }

  // ── DEVOTION SYSTEM ──
  addDevotion(amount) {
    this.devotion = Math.min(MOVE.devotionMax, this.devotion + amount);
    this.scene.events.emit('devotionChanged', this.devotion, MOVE.devotionMax);
  }

  triggerDevotionSpecial() {
    // "JAI HANUMAN!" special attack
    this.devotion = 0;
    this.scene.events.emit('devotionChanged', 0, MOVE.devotionMax);

    // Golden flash overlay
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.scrollX + GAME_WIDTH / 2,
      this.scene.cameras.main.scrollY + GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0xFFD700, 0.6
    ).setDepth(300).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy(),
    });

    // "JAI HANUMAN" text
    const text = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      '🙏 JAI HANUMAN! 🙏', {
        fontSize: '42px',
        fontFamily: 'Georgia, serif',
        color: '#FFD700',
        stroke: '#8B4513',
        strokeThickness: 5,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 60,
      alpha: 0,
      scale: 1.5,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });

    // Camera zoom out briefly
    this.scene.cameras.main.zoomTo(0.85, 300);
    this.scene.time.delayedCall(600, () => {
      this.scene.cameras.main.zoomTo(1, 400);
    });

    // Kill all enemies on screen
    this.scene.events.emit('devotionSpecial');

    // Score bonus
    this.scene.events.emit('devotionBonus', 5000);

    // Brief invincibility
    this.isInvincible = true;
    this.invincibleTimer = 1500;
  }

  // ── HEAL ──
  heal(amount = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.scene.events.emit('playerDamaged', this.health);

    // Healing glow burst
    this.glow.setAlpha(0.6);
    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0.12,
      duration: 500,
      ease: 'Power2',
    });

    // Lotus particle burst
    if (this.scene.particleManager) {
      this.scene.particleManager.burstAt('lotusPickup', this.sprite.x, this.sprite.y);
    }

    this.addDevotion(MOVE.devotionPerLotus);
  }

  // ── DEATH ──
  die() {
    this.isDead = true;
    this.changeState(STATES.DEAD);

    // Slow motion effect
    this.scene.time.timeScale = 0.3;
    this.scene.time.delayedCall(1000, () => {
      this.scene.time.timeScale = 1;
    });

    this.sprite.setTexture('hanuman-hurt');
    this.sprite.body.setVelocity(0, -200);
    this.trailParticles.emitting = false;

    // Desaturate (sepia tint)
    this.scene.cameras.main.setPostPipeline && (() => {
      // Phaser doesn't have built-in sepia, so we fade to dark
      this.scene.cameras.main.fade(2000, 20, 10, 5);
    })();

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        this.scene.events.emit('playerDied');
      },
    });
  }

  // ── RESET ──
  reset(x, y) {
    this.health = this.maxHealth;
    this.isDead = false;
    this.isInvincible = true; // brief spawn invincibility
    this.invincibleTimer = 3000;
    this.isAttacking = false;
    this.isDashing = false;
    this.devotion = 0;
    this.velX = 0;
    this.velY = 0;
    this.changeState(STATES.IDLE);
    this.sprite.setPosition(x, y);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.sprite.body.setVelocity(0, 0);
    this.sprite.body.setAllowGravity(true);

    // Golden glow burst on respawn
    const burstGlow = this.scene.add.circle(x, y, 50, 0xFFD700, 0.5);
    burstGlow.setDepth(11).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: burstGlow,
      scale: 3,
      alpha: 0,
      duration: 600,
      onComplete: () => burstGlow.destroy(),
    });

    this.scene.events.emit('playerDamaged', this.health);
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  // Get dash cooldown normalized (0 = ready, 1 = on cooldown)
  getDashCooldown() {
    return Math.max(0, this.dashCooldownTimer / MOVE.dashCooldown);
  }

  getDevotionPercent() {
    return this.devotion / MOVE.devotionMax;
  }

  destroy() {
    this.dashGhosts.forEach(g => g.sprite.destroy());
    this.dashGhosts = [];
    if (this.trailParticles) this.trailParticles.destroy();
    if (this.glow) this.glow.destroy();
    if (this.maceHitbox) this.maceHitbox.destroy();
    if (this.sprite) this.sprite.destroy();
  }
}

export { STATES, MOVE };
