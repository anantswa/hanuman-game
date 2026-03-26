// ParticleManager.js — manages atmospheric particle effects
// Creates the "Ori and the Blind Forest" feel with divine motes, altitude-based effects

export default class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.emitters = {};
    this.currentAltitudeZone = null;
  }

  // Initialize all particle systems for a level
  init(options = {}) {
    const { width = 800, height = 600 } = options;

    // Divine motes — tiny golden-white dots floating upward, always running
    this.emitters.divineMotes = this.scene.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 5, max: 20 },
      angle: { min: 260, max: 280 }, // mostly upward
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [0xFFDD88, 0xFFFFCC, 0xFFD700],
      lifespan: { min: 2000, max: 4000 },
      frequency: 200,
      emitting: true,
      blendMode: 'ADD',
    });
    this.emitters.divineMotes.setScrollFactor(0);
    this.emitters.divineMotes.setDepth(15);

    // Movement trail — golden streaks when player moves fast
    this.emitters.movementTrail = this.scene.add.particles(0, 0, 'divine-glow', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: 0xFFD700,
      lifespan: 300,
      frequency: 40,
      emitting: false,
      blendMode: 'ADD',
    });
    this.emitters.movementTrail.setDepth(9);

    // Lotus pickup burst — pink-gold petals spiraling inward
    this.emitters.lotusPickup = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 120 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xFF88AA, 0xFFBBCC, 0xFFD700, 0xFFAACC],
      lifespan: 600,
      quantity: 15,
      emitting: false,
      blendMode: 'ADD',
    });
    this.emitters.lotusPickup.setDepth(12);

    // Mace impact — golden starburst at collision point
    this.emitters.maceImpact = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xFFD700, 0xFFAA00, 0xFFFFCC],
      lifespan: 400,
      quantity: 20,
      emitting: false,
      blendMode: 'ADD',
    });
    this.emitters.maceImpact.setDepth(12);

    // Altitude-based: leaves (low altitude)
    this.emitters.altitudeLeaves = this.scene.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speedX: { min: -30, max: 30 },
      speedY: { min: 10, max: 30 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.5, end: 0 },
      tint: [0x88AA44, 0xAACC66, 0xCCDD88],
      lifespan: 3000,
      frequency: 400,
      emitting: false,
      rotate: { min: 0, max: 360 },
    });
    this.emitters.altitudeLeaves.setScrollFactor(0);
    this.emitters.altitudeLeaves.setDepth(14);

    // Altitude-based: cloud wisps (mid altitude)
    this.emitters.altitudeClouds = this.scene.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speedX: { min: -20, max: 20 },
      speedY: { min: -5, max: 5 },
      scale: { start: 1.5, end: 0.5 },
      alpha: { start: 0.15, end: 0 },
      tint: 0xFFFFFF,
      lifespan: 4000,
      frequency: 600,
      emitting: false,
    });
    this.emitters.altitudeClouds.setScrollFactor(0);
    this.emitters.altitudeClouds.setDepth(6);

    // Altitude-based: stars (high altitude)
    this.emitters.altitudeStars = this.scene.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: 0,
      scale: { start: 0.2, end: 0.4 },
      alpha: { start: 0, end: 0.7, ease: 'Sine.easeInOut' },
      tint: [0xFFEECC, 0xFFFFFF, 0xFFDDAA],
      lifespan: { min: 1000, max: 2000 },
      frequency: 300,
      emitting: false,
      blendMode: 'ADD',
    });
    this.emitters.altitudeStars.setScrollFactor(0);
    this.emitters.altitudeStars.setDepth(2);

    // Altitude-based: embers (near sun)
    this.emitters.altitudeEmbers = this.scene.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: height,
      speed: { min: 30, max: 80 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xFFAA00, 0xFF6600, 0xFFDD44],
      lifespan: { min: 1500, max: 3000 },
      frequency: 150,
      emitting: false,
      blendMode: 'ADD',
    });
    this.emitters.altitudeEmbers.setScrollFactor(0);
    this.emitters.altitudeEmbers.setDepth(14);
  }

  // Update altitude-based particles based on player position
  // altitudeNorm: 0 = ground, 1 = sun (9000m)
  updateAltitude(altitudeNorm) {
    let zone;
    if (altitudeNorm < 0.22) zone = 'forest';       // 0-2000m
    else if (altitudeNorm < 0.56) zone = 'clouds';   // 2000-5000m
    else if (altitudeNorm < 0.89) zone = 'cosmic';   // 5000-8000m
    else zone = 'sun';                                 // 8000-9000m

    if (zone === this.currentAltitudeZone) return;
    this.currentAltitudeZone = zone;

    // Turn off all altitude emitters
    this.emitters.altitudeLeaves.emitting = false;
    this.emitters.altitudeClouds.emitting = false;
    this.emitters.altitudeStars.emitting = false;
    this.emitters.altitudeEmbers.emitting = false;

    // Turn on the right one
    switch (zone) {
      case 'forest':
        this.emitters.altitudeLeaves.emitting = true;
        break;
      case 'clouds':
        this.emitters.altitudeClouds.emitting = true;
        break;
      case 'cosmic':
        this.emitters.altitudeStars.emitting = true;
        break;
      case 'sun':
        this.emitters.altitudeStars.emitting = true;
        this.emitters.altitudeEmbers.emitting = true;
        break;
    }
  }

  // Burst at position (for pickups, impacts)
  burstAt(type, x, y) {
    const emitter = this.emitters[type];
    if (emitter) {
      emitter.emitParticleAt(x, y);
    }
  }

  // Follow a sprite (for movement trail)
  followSprite(sprite, isMovingFast) {
    if (this.emitters.movementTrail) {
      this.emitters.movementTrail.setPosition(sprite.x, sprite.y);
      this.emitters.movementTrail.emitting = isMovingFast;
    }
  }

  // Update divine motes frequency based on context
  setMotesIntensity(intensity) {
    // intensity: 'low' | 'normal' | 'high' | 'divine'
    const freq = { low: 500, normal: 200, high: 100, divine: 40 };
    if (this.emitters.divineMotes) {
      this.emitters.divineMotes.frequency = freq[intensity] || 200;
    }
  }

  destroy() {
    Object.values(this.emitters).forEach(e => {
      if (e && e.destroy) e.destroy();
    });
    this.emitters = {};
  }
}
