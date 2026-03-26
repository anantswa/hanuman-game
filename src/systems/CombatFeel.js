// CombatFeel.js — Hit-stop, camera punch, screen effects
// Uses timeScale = 0.01 (NOT 0) to keep shaders alive during freeze
// From research: Ori/Celeste style "juice" for divine combat

import Phaser from 'phaser';

export default class CombatFeel {
  constructor(scene) {
    this.scene = scene;
    this.isHitStopped = false;
    this.hitStopTimer = null;
    this.originalTimeScale = 1;
  }

  // === HIT-STOP ===
  // Freezes physics for `duration` ms while keeping rendering alive
  // magnitude: 0.5 (light) to 2.0 (devastating)
  hitStop(duration = 60, magnitude = 1.0) {
    if (this.isHitStopped) return;
    this.isHitStopped = true;

    // Use 0.01 not 0 — keeps post-processing shaders alive
    this.originalTimeScale = this.scene.physics.world.timeScale;
    this.scene.physics.world.timeScale = 100; // effectively 100x slower = frozen

    // Camera shake scaled to magnitude
    this.scene.cameras.main.shake(
      Math.floor(duration * 0.8),
      0.006 * magnitude
    );

    // Restore after duration (use real setTimeout, not Phaser timer which is affected by timeScale)
    if (this.hitStopTimer) clearTimeout(this.hitStopTimer);
    this.hitStopTimer = setTimeout(() => {
      this.scene.physics.world.timeScale = 1;
      this.isHitStopped = false;
    }, duration);
  }

  // === CAMERA PUNCH ===
  // Rapid zoom toward impact, non-linear recovery (Back.easeOut)
  cameraPunch(intensity = 0.03) {
    const cam = this.scene.cameras.main;
    cam.zoom += intensity;
    this.scene.tweens.add({
      targets: cam,
      zoom: cam.zoom - intensity,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  // === MACE IMPACT ===
  // Full juice combo: hit-stop + shake + punch + flash + particles
  maceImpact(enemySprite, magnitude = 1.0) {
    // Hit-stop
    this.hitStop(50 + magnitude * 20, magnitude);

    // Camera punch toward enemy
    this.cameraPunch(0.02 * magnitude);

    // Flash enemy white
    if (enemySprite && enemySprite.active) {
      enemySprite.setTintFill(0xFFFFFF);
      setTimeout(() => {
        if (enemySprite && enemySprite.active) {
          enemySprite.clearTint();
        }
      }, 80);
    }

    // Golden starburst particles at impact point
    if (enemySprite && enemySprite.active) {
      const burst = this.scene.add.particles(enemySprite.x, enemySprite.y, 'particle', {
        speed: { min: 80, max: 250 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0xFFD700, 0xFFAA00, 0xFFFFCC, 0xFF8800],
        lifespan: 400,
        quantity: Math.floor(12 * magnitude),
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      });
      burst.setDepth(15);
      burst.explode();
      setTimeout(() => burst.destroy(), 500);
    }
  }

  // === DAMAGE RECEIVED ===
  // Golden flash (not red — divine hero), knockback, invincibility
  damageFlash() {
    // Brief chromatic aberration effect using screen tint
    const flash = this.scene.add.rectangle(
      0, 0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xFFD700, 0.2
    ).setOrigin(0).setScrollFactor(0).setDepth(300).setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // Screen shake
    this.scene.cameras.main.shake(80, 0.008);
  }

  // === BOSS ENTRANCE ===
  // Dramatic zoom + shake for boss intro
  bossEntrance(bossName, duration = 2000) {
    const cam = this.scene.cameras.main;

    // Zoom in slightly
    this.scene.tweens.add({
      targets: cam,
      zoom: 1.1,
      duration: 600,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    // Heavy shake
    cam.shake(400, 0.015);
  }

  // === DEVOTION SPECIAL ===
  // Screen-clearing golden wave
  devotionWave() {
    const cam = this.scene.cameras.main;

    // Golden flash overlay
    const flash = this.scene.add.rectangle(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2,
      cam.width, cam.height,
      0xFFD700, 0.6
    ).setDepth(300).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy(),
    });

    // Camera zoom out and back
    cam.zoomTo(0.85, 300);
    this.scene.time.delayedCall(600, () => {
      cam.zoomTo(1, 400, 'Back.easeOut');
    });

    // Shake
    cam.shake(300, 0.02);
  }

  destroy() {
    if (this.hitStopTimer) clearTimeout(this.hitStopTimer);
  }
}
