import { generateAssets } from '../utils/AssetGenerator.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
    this.bootTimer = 0;
    this.transitioned = false;
  }

  create() {
    // Generate all procedural assets
    generateAssets(this);

    // Loading text
    this.add.text(400, 300, 'Jai Hanuman...', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: '#D4A843',
    }).setOrigin(0.5);

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
