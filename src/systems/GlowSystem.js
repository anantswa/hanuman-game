// GlowSystem.js — Additive blend sprite-based lighting
// NOT Light2D — uses the Ori approach of "sprite-centric lighting cheats"
// Proper radial gradient glow textures with additive blending

import Phaser from 'phaser';

export default class GlowSystem {
  constructor(scene) {
    this.scene = scene;
    this.glows = [];
  }

  // Generate radial gradient glow textures (call once in Boot scene)
  static generateTextures(scene) {
    // Golden glow (Hanuman aura, sun, divine objects)
    GlowSystem.createGlowTexture(scene, 'glow-golden', 0xFFD700, 64);
    // White glow (stars, generic light)
    GlowSystem.createGlowTexture(scene, 'glow-white', 0xFFFFFF, 64);
    // Saffron glow (fire, Lanka, ember)
    GlowSystem.createGlowTexture(scene, 'glow-saffron', 0xFF6600, 64);
    // Blue glow (Ram, divine blue)
    GlowSystem.createGlowTexture(scene, 'glow-blue', 0x4488CC, 64);
    // Pink glow (lotus, Sita)
    GlowSystem.createGlowTexture(scene, 'glow-pink', 0xFF88AA, 48);
    // Red glow (enemy, danger)
    GlowSystem.createGlowTexture(scene, 'glow-red', 0xFF2200, 48);
    // Large sun corona
    GlowSystem.createGlowTexture(scene, 'glow-sun', 0xFFAA00, 128);
  }

  // Create a single radial gradient glow texture
  static createGlowTexture(scene, key, color, radius) {
    if (scene.textures.exists(key)) return;

    const size = radius * 2;
    const g = scene.make.graphics({ add: false });

    // Draw concentric circles with decreasing alpha for gaussian-like falloff
    const r = (color >> 16) & 0xFF;
    const gv = (color >> 8) & 0xFF;
    const b = color & 0xFF;

    const steps = Math.floor(radius / 2);
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const currentRadius = radius * (1 - t);
      // Gaussian-ish falloff
      const alpha = Math.pow(1 - t, 2) * 0.3;
      g.fillStyle(color, alpha);
      g.fillCircle(radius, radius, currentRadius);
    }

    // Bright center
    g.fillStyle(color, 0.5);
    g.fillCircle(radius, radius, radius * 0.15);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  // Add a glow at a position (returns the glow sprite for manual control)
  addGlow(x, y, type = 'golden', options = {}) {
    const key = `glow-${type}`;
    if (!this.scene.textures.exists(key)) return null;

    const glow = this.scene.add.image(x, y, key);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setScale(options.scale || 2);
    glow.setAlpha(options.alpha || 0.3);
    glow.setDepth(options.depth || -1);

    if (options.pulse) {
      this.scene.tweens.add({
        targets: glow,
        alpha: (options.alpha || 0.3) * 1.5,
        scale: (options.scale || 2) * 1.15,
        duration: options.pulseDuration || 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.glows.push(glow);
    return glow;
  }

  // Attach glow to follow a sprite
  attachGlow(sprite, type = 'golden', options = {}) {
    const glow = this.addGlow(sprite.x, sprite.y, type, options);
    if (!glow) return null;

    // Store reference for update
    glow._followTarget = sprite;
    return glow;
  }

  // Call each frame to update attached glows
  update() {
    for (let i = this.glows.length - 1; i >= 0; i--) {
      const glow = this.glows[i];
      if (!glow || !glow.active) {
        this.glows.splice(i, 1);
        continue;
      }
      if (glow._followTarget) {
        if (glow._followTarget.active) {
          glow.setPosition(glow._followTarget.x, glow._followTarget.y);
        } else {
          glow.destroy();
          this.glows.splice(i, 1);
        }
      }
    }
  }

  // Update all glow intensities based on devotion (0-1)
  updateDevotionIntensity(devotionNorm) {
    // Scale glow brightness with devotion
    const multiplier = 1 + devotionNorm * 0.8;
    for (const glow of this.glows) {
      if (glow && glow.active && glow._baseAlpha !== undefined) {
        glow.setAlpha(glow._baseAlpha * multiplier);
      }
    }
  }

  destroy() {
    this.glows.forEach(g => { if (g && g.active) g.destroy(); });
    this.glows = [];
  }
}
