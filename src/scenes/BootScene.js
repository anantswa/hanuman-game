import { generateAssets } from '../utils/AssetGenerator.js';
import GlowSystem from '../systems/GlowSystem.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
    this.bootTimer = 0;
    this.transitioned = false;
  }

  preload() {
    // Load all 4 Hanuman character sprites
    this.load.image('hanuman-idle-png', './hanuman-idle.png');
    this.load.image('hanuman-fly-png', './hanuman-fly.png');
    this.load.image('hanuman-attack-png', './hanuman-attack.png');
    this.load.image('hanuman-hurt-png', './hanuman-hit.png');

    // Loading text
    this.add.text(400, 300, 'Jai Hanuman...', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: '#D4A843',
    }).setOrigin(0.5);
  }

  create() {
    // Generate all procedural assets (backgrounds, enemies, UI, etc.)
    generateAssets(this);

    // Generate glow textures (additive radial gradients — Ori-style lighting)
    GlowSystem.generateTextures(this);

    // Override procedural Hanuman sprites with real art if loaded
    const spriteMap = {
      'hanuman-idle': 'hanuman-idle-png',
      'hanuman-fly': 'hanuman-fly-png',
      'hanuman-attack': 'hanuman-attack-png',
      'hanuman-hurt': 'hanuman-hurt-png',
    };

    let loadedCount = 0;
    for (const [gameKey, loadKey] of Object.entries(spriteMap)) {
      if (this.textures.exists(loadKey)) {
        const srcTexture = this.textures.get(loadKey);
        // Remove the procedural placeholder
        if (this.textures.exists(gameKey)) {
          this.textures.remove(gameKey);
        }
        // Replace with the real art
        this.textures.addImage(gameKey, srcTexture.source[0].image);
        loadedCount++;
      }
    }

    if (loadedCount > 0) {
      console.log(`[Boot] ${loadedCount} Hanuman sprites loaded from PNGs`);
    } else {
      console.log('[Boot] No Hanuman PNGs found, using procedural sprites');
    }

    this.bootTimer = 0;
    this.transitioned = false;

    // Fallback: raw setTimeout in case Phaser update loop is frozen
    const self = this;
    setTimeout(() => {
      if (!self.transitioned && self.scene.isActive('Boot')) {
        self.transitioned = true;
        self.scene.start('Title');
      }
    }, 2500);
  }

  update(time, delta) {
    if (this.transitioned) return;
    this.bootTimer += delta;
    if (this.bootTimer >= 2000) {
      this.transitioned = true;
      this.scene.start('Title');
    }
  }
}
