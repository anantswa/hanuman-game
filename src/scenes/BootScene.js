import { generateAssets } from '../utils/AssetGenerator.js';
import GlowSystem from '../systems/GlowSystem.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
    this.bootTimer = 0;
    this.transitioned = false;
  }

  preload() {
    // Load the Hanuman sprite image
    this.load.image('hanuman-sprite', './hanuman.png');

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

    // If the hanuman sprite image loaded, override the procedural textures
    if (this.textures.exists('hanuman-sprite')) {
      // Use the loaded image for all Hanuman states
      // We'll use the same image but Phaser allows re-keying
      const srcTexture = this.textures.get('hanuman-sprite');
      const frame = srcTexture.get();

      // Remove old procedural textures and replace with the loaded image
      ['hanuman-idle', 'hanuman-fly', 'hanuman-attack'].forEach((key) => {
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }
        // Add the loaded image under each key
        this.textures.addImage(key, srcTexture.source[0].image);
      });
      console.log('[Boot] Hanuman sprite image loaded and applied');
    } else {
      console.log('[Boot] No hanuman sprite image found, using procedural sprites');
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

  // update() runs every frame — if the game loop IS active, this transitions faster
  update(time, delta) {
    if (this.transitioned) return;
    this.bootTimer += delta;
    if (this.bootTimer >= 2000) {
      this.transitioned = true;
      this.scene.start('Title');
    }
  }
}
