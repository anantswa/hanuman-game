import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS, CHALISA } from '../config.js';
import Player from '../entities/Player.js';
import ScoreManager from '../systems/ScoreManager.js';
import CombatFeel from '../systems/CombatFeel.js';
import DepthFog from '../systems/DepthFog.js';
import GlowSystem from '../systems/GlowSystem.js';
import SiddhiSystem from '../systems/SiddhiSystem.js';

export default class Act5Boss extends Phaser.Scene {
  constructor() {
    super('Act5Boss');
  }

  create() {
    console.log('[Act5Boss] Creating boss...');
    try {
      this._create();
      console.log('[Act5Boss] Boss created successfully!');
    } catch (e) {
      console.error('[Act5Boss] CRASH:', e);
      this.add.text(400, 300, 'Boss failed to load!\n' + e.message, {
        fontSize: '18px', color: '#FF4444', align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setDepth(999);
    }
  }

  _create() {
    this.levelComplete = false;
    this.bossDefeated = false;

    // --- Systems ---
    this.scoreManager = new ScoreManager(this);
    this.combatFeel = new CombatFeel(this);
    this.glowSystem = new GlowSystem(this);
    this.depthFog = new DepthFog(this);
    this.depthFog.init('lankaFire');

    // --- Arena setup ---
    const ARENA_WIDTH = 1000;
    this.arenaWidth = ARENA_WIDTH;
    this.physics.world.setBounds(0, 0, ARENA_WIDTH, GAME_HEIGHT);
    this.physics.world.gravity.y = 300;

    // --- Dark cavern background ---
    this.add.rectangle(ARENA_WIDTH / 2, GAME_HEIGHT / 2, ARENA_WIDTH, GAME_HEIGHT, 0x0A0505)
      .setDepth(-100);

    // Fire glow particles (ambient)
    this.fireParticles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: ARENA_WIDTH },
      y: GAME_HEIGHT,
      speed: { min: 20, max: 60 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: [0xFF4400, 0xFF6600, 0xFFAA00, 0xFF2200],
      lifespan: { min: 1500, max: 3000 },
      frequency: 100,
      emitting: true,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.fireParticles.setDepth(-50);

    // Fire glow at bottom
    this.add.rectangle(ARENA_WIDTH / 2, GAME_HEIGHT - 10, ARENA_WIDTH, 40, 0xFF2200, 0.15)
      .setDepth(-49).setBlendMode(Phaser.BlendModes.ADD);

    // Ground
    this.ground = this.add.rectangle(ARENA_WIDTH / 2, GAME_HEIGHT - 30, ARENA_WIDTH, 40, 0x1A0808);
    this.physics.add.existing(this.ground, true);
    this.ground.setDepth(3);

    // Arena side walls (invisible)
    const leftWall = this.add.rectangle(0, GAME_HEIGHT / 2, 10, GAME_HEIGHT);
    this.physics.add.existing(leftWall, true);
    const rightWall = this.add.rectangle(ARENA_WIDTH, GAME_HEIGHT / 2, 10, GAME_HEIGHT);
    this.physics.add.existing(rightWall, true);

    // --- Player ---
    this.player = new Player(this, 100, GAME_HEIGHT - 100);
    this.player.sprite.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.ground);

    // --- Camera ---
    const cam = this.cameras.main;
    cam.startFollow(this.player.sprite, true, 0.08, 0.12);
    cam.setBounds(0, 0, ARENA_WIDTH, GAME_HEIGHT);

    // --- AHIRAVANA BOSS ---
    this.boss = this.physics.add.sprite(ARENA_WIDTH - 150, 150, 'indra-boss');
    this.boss.setScale(2);
    this.boss.setTint(0x880000);
    this.boss.body.setAllowGravity(false);
    this.boss.body.setImmovable(true);
    this.boss.setDepth(8);

    this.bossHealth = 25;
    this.bossMaxHealth = 25;
    this.bossPhase = 1;
    this.bossInvincible = false;
    this.bossActive = false;

    // Projectile group
    this.projectiles = this.physics.add.group();

    // Shadow clones (Phase 2+)
    this.clones = [];
    this.cloneRespawnTimers = [];

    // Ritual flames (Phase 3)
    this.ritualFlames = [];
    this.flamesExtinguished = 0;
    this.ritualFlameGroup = this.physics.add.group();

    // --- Collisions ---
    this.physics.add.overlap(this.player.maceHitbox, this.boss, () => this.hitBoss());
    this.physics.add.overlap(this.player.sprite, this.boss, () => {
      if (this.combatFeel) this.combatFeel.damageFlash();
      this.player.takeDamage(1);
    });
    this.physics.add.overlap(this.player.sprite, this.projectiles, (ps, proj) => {
      if (this.combatFeel) this.combatFeel.damageFlash();
      this.player.takeDamage(1);
      proj.destroy();
    });
    this.physics.add.overlap(this.player.maceHitbox, this.ritualFlameGroup, (mace, flameSprite) => {
      this.extinguishFlame(flameSprite);
    });

    // --- Boss health bar ---
    this.bossBarBg = this.add.rectangle(ARENA_WIDTH / 2, 50, 300, 16, 0x333333)
      .setScrollFactor(0).setDepth(100);
    this.bossBar = this.add.rectangle(ARENA_WIDTH / 2 - 150, 50, 300, 16, 0xFF2222)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.bossNameText = this.add.text(ARENA_WIDTH / 2, 32, 'AHIRAVANA \u2014 Underworld Demon King', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#FF6644',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // Flame counter (Phase 3)
    this.flameCounterText = this.add.text(ARENA_WIDTH / 2, 70, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#FF8844',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    // --- HUD ---
    this.hearts = [];
    for (let i = 0; i < this.player.maxHealth; i++) {
      this.hearts.push(
        this.add.image(30 + i * 28, GAME_HEIGHT - 30, 'heart').setScrollFactor(0).setDepth(100)
      );
    }

    // Score
    this.scoreManager.scoreText = this.add.text(ARENA_WIDTH - 20, GAME_HEIGHT - 30, 'Score: 0', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);

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

    // --- Boss attack timer ---
    this.attackTimer = 0;

    // --- Boss entrance ---
    this.showBossIntro();
  }

  showBossIntro() {
    const introText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'AHIRAVANA AWAKENS', {
      fontSize: '28px', fontFamily: 'Georgia, serif',
      color: '#FF4444', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0).setAlpha(0);

    this.tweens.add({
      targets: introText,
      alpha: 1, duration: 800,
      yoyo: true, hold: 1200,
      onComplete: () => {
        introText.destroy();
        this.bossActive = true;
        this.startBossPattern();
      },
    });

    // Boss entrance — fade in from shadows
    this.boss.setAlpha(0);
    this.tweens.add({
      targets: this.boss,
      alpha: 1, duration: 2000,
    });
  }

  startBossPattern() {
    this.bossTeleportLoop();
  }

  bossTeleportLoop() {
    if (this.bossDefeated || !this.bossActive) return;

    // Teleport speed depends on phase
    const teleDelay = this.bossPhase === 3 ? 1500 : this.bossPhase === 2 ? 2500 : 3500;

    this.time.delayedCall(teleDelay, () => {
      if (this.bossDefeated) return;
      this.teleportBoss();
      this.bossTeleportLoop();
    });
  }

  teleportBoss() {
    if (this.bossDefeated) return;

    // Fade out
    this.tweens.add({
      targets: this.boss,
      alpha: 0, duration: 200,
      onComplete: () => {
        if (this.bossDefeated) return;
        // Reappear at random position
        const newX = 100 + Math.random() * (this.arenaWidth - 200);
        const newY = 80 + Math.random() * (GAME_HEIGHT - 250);
        this.boss.setPosition(newX, newY);

        // Dark smoke at new position
        const smoke = this.add.particles(newX, newY, 'particle', {
          speed: { min: 40, max: 100 },
          tint: [0x440000, 0x880000, 0x220000],
          scale: { start: 1, end: 0 },
          lifespan: 400,
          quantity: 10,
          emitting: false,
          blendMode: Phaser.BlendModes.ADD,
        });
        smoke.explode();
        this.time.delayedCall(500, () => smoke.destroy());

        // Fade in
        this.tweens.add({
          targets: this.boss,
          alpha: 1, duration: 200,
        });
      },
    });
  }

  shootProjectiles() {
    if (this.bossDefeated || !this.bossActive) return;

    const count = this.bossPhase === 3 ? 5 : 3;
    const pp = this.player.getPosition();
    const baseAngle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, pp.x, pp.y);
    const spreadStep = 0.25; // radians between each projectile
    const startAngle = baseAngle - ((count - 1) / 2) * spreadStep;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spreadStep;
      const proj = this.projectiles.create(this.boss.x, this.boss.y, 'vajra');
      proj.setTint(0x880000);
      proj.setScale(1.2);
      proj.body.setAllowGravity(false);
      proj.setDepth(7);
      const speed = 180 + this.bossPhase * 30;
      proj.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      proj.setRotation(angle + Math.PI / 2);

      // Auto-destroy
      this.time.delayedCall(3500, () => {
        if (proj && proj.active) proj.destroy();
      });
    }

    // Flash warning
    this.boss.setTint(0xFF0000);
    this.time.delayedCall(150, () => {
      if (!this.bossDefeated) this.boss.setTint(0x880000);
    });
  }

  spawnClones() {
    // Spawn 2 shadow clones
    for (let i = 0; i < 2; i++) {
      this.spawnSingleClone(i);
    }
  }

  spawnSingleClone(index) {
    const x = 200 + Math.random() * (this.arenaWidth - 400);
    const y = 100 + Math.random() * 300;

    const clone = this.physics.add.sprite(x, y, 'indra-boss');
    clone.setScale(1.5);
    clone.setTint(0x440022);
    clone.setAlpha(0.7);
    clone.body.setAllowGravity(false);
    clone.body.setImmovable(true);
    clone.setDepth(7);

    // Clone data
    clone.cloneHealth = 3;
    clone.cloneIndex = index;
    clone.cloneRef = clone;

    this.clones[index] = clone;

    // Collision: mace hits clone
    this.physics.add.overlap(this.player.maceHitbox, clone, () => {
      if (!this.player.isAttacking) return;
      this.hitClone(clone);
    });

    // Collision: player touches clone
    this.physics.add.overlap(this.player.sprite, clone, () => {
      this.player.takeDamage(1);
    });

    // Clone movement
    this.tweens.add({
      targets: clone,
      x: x + (Math.random() > 0.5 ? 120 : -120),
      y: y + (Math.random() > 0.5 ? 60 : -60),
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  hitClone(clone) {
    if (!clone || !clone.active) return;

    clone.cloneHealth--;
    clone.setTintFill(0xFFFFFF);
    this.time.delayedCall(80, () => {
      if (clone && clone.active) clone.setTint(0x440022);
    });

    if (clone.cloneHealth <= 0) {
      const idx = clone.cloneIndex;
      // Death particles
      const p = this.add.particles(clone.x, clone.y, 'particle', {
        speed: { min: 60, max: 150 },
        tint: [0x880000, 0x440022, 0xFF2200],
        scale: { start: 0.8, end: 0 },
        lifespan: 500,
        quantity: 12,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      });
      p.explode();
      this.time.delayedCall(600, () => p.destroy());

      clone.destroy();
      this.clones[idx] = null;

      // Score
      this.scoreManager.addPoints('guardKill', { x: clone.x, y: clone.y });

      // Respawn after 8 seconds
      this.time.delayedCall(8000, () => {
        if (!this.bossDefeated && this.bossPhase >= 2) {
          this.spawnSingleClone(idx);
        }
      });
    }
  }

  spawnRitualFlames() {
    // 5 ritual flames around the arena
    const positions = [
      { x: 150, y: 450 },
      { x: 350, y: 200 },
      { x: 500, y: 500 },
      { x: 700, y: 250 },
      { x: 850, y: 450 },
    ];

    this.flamesExtinguished = 0;
    this.flameCounterText.setAlpha(1);
    this.updateFlameCounter();

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];

      // Flame circle
      const flame = this.add.circle(pos.x, pos.y, 18, 0xFF4400, 0.8);
      flame.setDepth(6);

      // Flame glow
      const glow = this.add.circle(pos.x, pos.y, 30, 0xFF6600, 0.3);
      glow.setDepth(5).setBlendMode(Phaser.BlendModes.ADD);

      // Pulse
      this.tweens.add({
        targets: [flame, glow],
        scale: 1.3, alpha: '-=0.2',
        duration: 600 + i * 100,
        yoyo: true, repeat: -1,
      });

      // Physics body for mace hit
      const flameBody = this.physics.add.sprite(pos.x, pos.y, 'particle');
      flameBody.setAlpha(0.01);
      flameBody.body.setAllowGravity(false);
      flameBody.body.setImmovable(true);
      flameBody.body.setSize(36, 36);
      flameBody.setDepth(6);
      flameBody._flameVisual = flame;
      flameBody._flameGlow = glow;
      flameBody._flameActive = true;

      this.ritualFlameGroup.add(flameBody);
      this.ritualFlames.push(flameBody);
    }
  }

  extinguishFlame(flameSprite) {
    if (!flameSprite._flameActive || !this.player.isAttacking) return;
    flameSprite._flameActive = false;
    this.flamesExtinguished++;

    // Destroy visuals
    if (flameSprite._flameVisual) {
      this.tweens.add({
        targets: [flameSprite._flameVisual, flameSprite._flameGlow],
        alpha: 0, scale: 0.3,
        duration: 300,
        onComplete: () => {
          flameSprite._flameVisual.destroy();
          flameSprite._flameGlow.destroy();
        },
      });
    }
    flameSprite.destroy();

    // Ahiravana takes damage from extinguished flame
    this.bossHealth -= 2;
    this.updateBossHealthBar();

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    // Update counter
    this.updateFlameCounter();

    // Score
    this.scoreManager.addPoints('bossHit', { x: flameSprite.x, y: flameSprite.y });

    // Boss screams
    this.boss.setTint(0xFF0000);
    this.time.delayedCall(300, () => {
      if (!this.bossDefeated) this.boss.setTint(0x880000);
    });

    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  updateFlameCounter() {
    const remaining = 5 - this.flamesExtinguished;
    this.flameCounterText.setText(`Ritual Flames: ${remaining}/5`);
  }

  hitBoss() {
    if (this.bossInvincible || this.bossDefeated || !this.player.isAttacking) return;

    if (this.combatFeel) this.combatFeel.maceImpact(this.boss, 1.0);

    this.bossHealth--;
    this.bossInvincible = true;

    this.updateBossHealthBar();

    // Flash
    this.boss.setTint(0xFF4444);
    this.cameras.main.shake(150, 0.01);

    // Hit particles
    const particles = this.add.particles(this.boss.x, this.boss.y, 'particle', {
      speed: { min: 80, max: 200 },
      tint: [0xFF0000, 0xFF4400, 0xFFAA00],
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 8,
      emitting: false,
    });
    particles.explode();
    this.time.delayedCall(500, () => particles.destroy());

    // Hit-stop
    this.player.onMaceConnected(this.boss.x, this.boss.y);

    // Score
    this.scoreManager.addPoints('bossHit', { x: this.boss.x, y: this.boss.y });

    this.time.delayedCall(400, () => {
      this.bossInvincible = false;
      if (!this.bossDefeated) this.boss.setTint(0x880000);
    });

    // Phase transitions
    if (this.bossHealth <= 18 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.showPhaseText('Ahiravana summons his shadows!');
      this.spawnClones();
    } else if (this.bossHealth <= 10 && this.bossPhase === 2) {
      this.bossPhase = 3;
      this.showPhaseText('The ritual flames appear!\nDestroy them to weaken Ahiravana!');
      this.spawnRitualFlames();
    }

    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  updateBossHealthBar() {
    this.bossBar.width = Math.max(0, (this.bossHealth / this.bossMaxHealth) * 300);
  }

  showPhaseText(msg) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
      fontSize: '22px', fontFamily: 'Georgia, serif',
      color: '#FF6644', stroke: '#000', strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);
    this.tweens.add({
      targets: t,
      y: t.y - 30, alpha: 0,
      duration: 2000, delay: 1000,
      onComplete: () => t.destroy(),
    });
  }

  defeatBoss() {
    this.bossDefeated = true;
    this.levelComplete = true;
    this.bossActive = false;

    // Clear projectiles
    this.projectiles.clear(true, true);

    // Clear surviving clones
    for (const clone of this.clones) {
      if (clone && clone.active) clone.destroy();
    }
    this.clones = [];

    // Golden flash
    this.cameras.main.flash(1000, 255, 215, 0);
    this.cameras.main.shake(600, 0.025);

    // Boss death explosions
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 300, () => {
        const p = this.add.particles(
          this.boss.x + Phaser.Math.Between(-40, 40),
          this.boss.y + Phaser.Math.Between(-40, 40),
          'particle', {
            speed: { min: 100, max: 300 },
            tint: [0xFF4400, 0xFFAA00, 0xFFFF00, 0xFFFFFF],
            scale: { start: 2, end: 0 },
            lifespan: 800,
            quantity: 20,
            emitting: false,
          }
        );
        p.explode();
      });
    }

    // Boss fades
    this.tweens.add({
      targets: this.boss,
      alpha: 0, scale: 0.5,
      duration: 1500, delay: 500,
    });

    // Victory text
    this.time.delayedCall(1500, () => {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
        'RAM AND LAKSHMANA ARE FREED!', {
          fontSize: '28px', fontFamily: 'Georgia, serif',
          color: '#FFD700', stroke: '#000', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

      // Chalisa verse
      const verse = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
        CHALISA.act5.boss.transliteration, {
          fontSize: '16px', fontFamily: 'Georgia, serif',
          color: '#FFCC88', fontStyle: 'italic', align: 'center',
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: verse, alpha: 1, duration: 1000, delay: 500 });

      const english = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
        CHALISA.act5.boss.english, {
          fontSize: '13px', fontFamily: 'Georgia, serif',
          color: '#AA8866', align: 'center',
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: english, alpha: 0.8, duration: 1000, delay: 1000 });
    });

    // Save progress
    ScoreManager.saveProgress(5, 4);
    ScoreManager.saveBest('act5_boss', this.scoreManager.score,
      this.scoreManager.getGrade(20000));

    // Transition
    this.time.delayedCall(6000, () => {
      this.cleanup();
      this.scene.start('ChalisaTransition', {
        couplet: 'epilogue', act: 5, nextScene: 'Epilogue',
      });
    });
  }

  onPlayerDied() {
    this.time.delayedCall(1000, () => {
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
        .setDepth(200).setScrollFactor(0);
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Hanuman Falls...', {
        fontSize: '32px', fontFamily: 'Georgia, serif', color: '#FF6644',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
      const rt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, '[ SPACE to retry ]', {
        fontSize: '16px', fontFamily: 'Georgia, serif', color: '#CCC',
      }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
      this.tweens.add({ targets: rt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
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
    if (this.combatFeel) this.combatFeel.destroy();
    if (this.depthFog) this.depthFog.destroy();
    if (this.glowSystem) this.glowSystem.destroy();
  }

  update(time, delta) {
    if (this.levelComplete) return;

    // Controls
    const vc = {
      left: { isDown: this.cursors.left.isDown || this.keyA.isDown || this.touchState.left },
      right: { isDown: this.cursors.right.isDown || this.keyD.isDown || this.touchState.right },
      up: { isDown: this.cursors.up.isDown || this.keyW.isDown || this.touchState.up },
    };
    this.player.update(vc, this.attackKey, delta);

    if (this.touchState.attack) {
      this.touchState.attack = false;
      if (!this.player.isAttacking) this.player.startAttack();
    }

    // Boss attack patterns
    if (this.bossActive && !this.bossDefeated) {
      this.attackTimer += delta;

      const attackInterval = this.bossPhase === 1 ? 2500
        : this.bossPhase === 2 ? 1800
        : 1200;

      if (this.attackTimer >= attackInterval) {
        this.attackTimer = 0;
        this.shootProjectiles();
      }
    }

    // Boss faces player
    if (this.boss && this.boss.active && !this.bossDefeated) {
      this.boss.setFlipX(this.player.sprite.x < this.boss.x);
    }
  }
}
