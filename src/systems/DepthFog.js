// DepthFog.js — Biome-tinted fog overlays per parallax layer
// Cheapest path to Ori atmosphere (from ChatGPT research)
// Far layers: more fog. Near layers: less. Warm biomes: amber. Cool: indigo.

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// Biome fog presets
const BIOMES = {
  forest: { color: 0xFFAA33, alpha: 0.06, name: 'Sacred Forest' },
  clouds: { color: 0xCCDDFF, alpha: 0.04, name: 'Cloud Realm' },
  cosmic: { color: 0x1A0A2E, alpha: 0.08, name: 'Cosmic Void' },
  sun: { color: 0xFFD700, alpha: 0.12, name: 'Solar Realm' },
  ocean: { color: 0x1A3355, alpha: 0.07, name: 'Ocean Depths' },
  lanka: { color: 0x2A1A0A, alpha: 0.09, name: 'Lanka' },
  lankaFire: { color: 0xFF4400, alpha: 0.10, name: 'Lanka Burns' },
  battlefield: { color: 0x553322, alpha: 0.06, name: 'Battlefield' },
  mountain: { color: 0xCCDDEE, alpha: 0.05, name: 'Himalayas' },
  ayodhya: { color: 0xFFCC44, alpha: 0.04, name: 'Ayodhya' },
};

export default class DepthFog {
  constructor(scene) {
    this.scene = scene;
    this.fogLayers = [];
    this.currentBiome = null;
    this.targetBiome = null;
    this.transitionProgress = 1; // 1 = fully transitioned
  }

  // Create fog overlay for the scene
  // depthLayers: array of { depth, scrollFactor } for each parallax layer
  init(biomeKey = 'forest', depthLayers = []) {
    const biome = BIOMES[biomeKey] || BIOMES.forest;
    this.currentBiome = biome;

    // Main atmosphere overlay (affects everything)
    this.mainFog = this.scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      biome.color, biome.alpha
    ).setScrollFactor(0).setDepth(40).setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Per-layer fog overlays (far layers get more fog)
    for (const layer of depthLayers) {
      const layerFogAlpha = biome.alpha * (1 - layer.scrollFactor); // more fog for distant layers
      if (layerFogAlpha > 0.01) {
        const fog = this.scene.add.rectangle(
          GAME_WIDTH / 2, GAME_HEIGHT / 2,
          GAME_WIDTH, GAME_HEIGHT,
          biome.color, layerFogAlpha
        ).setScrollFactor(0).setDepth(layer.depth + 1);
        this.fogLayers.push({ rect: fog, baseAlpha: layerFogAlpha, scrollFactor: layer.scrollFactor });
      }
    }
  }

  // Transition to a new biome smoothly
  transitionTo(biomeKey, duration = 2000) {
    const biome = BIOMES[biomeKey];
    if (!biome || biome === this.currentBiome) return;

    this.targetBiome = biome;

    // Tween the main fog color and alpha
    if (this.mainFog) {
      this.scene.tweens.add({
        targets: this.mainFog,
        alpha: biome.alpha,
        duration,
        ease: 'Sine.easeInOut',
      });

      // Color transition using a separate overlay
      const newFog = this.scene.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT,
        biome.color, 0
      ).setScrollFactor(0).setDepth(41).setBlendMode(Phaser.BlendModes.MULTIPLY);

      this.scene.tweens.add({
        targets: newFog,
        alpha: biome.alpha,
        duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Swap: destroy old main fog, promote new one
          if (this.mainFog) this.mainFog.destroy();
          this.mainFog = newFog;
          this.mainFog.setDepth(40);
          this.currentBiome = biome;
        },
      });

      // Fade out old main fog
      this.scene.tweens.add({
        targets: this.mainFog,
        alpha: 0,
        duration,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // Update fog intensity based on devotion level (0-1)
  // Higher devotion = world glows brighter = less fog
  updateDevotionIntensity(devotionNorm) {
    if (!this.mainFog || !this.currentBiome) return;
    const baseAlpha = this.currentBiome.alpha;
    // Devotion reduces fog (world becomes more divine/clear)
    const adjustedAlpha = baseAlpha * (1 - devotionNorm * 0.5);
    this.mainFog.setAlpha(adjustedAlpha);
  }

  // Set fog alpha directly (for altitude-based transitions)
  setAlpha(alpha) {
    if (this.mainFog) this.mainFog.setAlpha(alpha);
  }

  // Set fog color directly
  setColor(color) {
    if (this.mainFog) this.mainFog.fillColor = color;
  }

  destroy() {
    if (this.mainFog) this.mainFog.destroy();
    this.fogLayers.forEach(f => f.rect.destroy());
    this.fogLayers = [];
  }
}

export { BIOMES };
