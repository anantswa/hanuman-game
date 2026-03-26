import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class ActComplete extends Phaser.Scene {
  constructor() {
    super('ActComplete');
  }

  init(data) {
    this.act = data.act || 1;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0A0A12');

    // Decorative double border
    const g = this.add.graphics();
    g.lineStyle(2, 0xD4A843, 0.4);
    g.strokeRoundedRect(50, 50, GAME_WIDTH - 100, GAME_HEIGHT - 100, 10);
    g.lineStyle(1, 0xD4A843, 0.2);
    g.strokeRoundedRect(58, 58, GAME_WIDTH - 116, GAME_HEIGHT - 116, 8);

    // Act complete header
    this.add.text(GAME_WIDTH / 2, 110, '✦ ACT I COMPLETE ✦', {
      fontSize: '30px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // The Child God
    this.add.text(GAME_WIDTH / 2, 155, 'The Child God', {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      color: '#FFCC88',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Divider
    this.add.text(GAME_WIDTH / 2, 190, '─────── ☙ ❧ ───────', {
      fontSize: '14px',
      color: '#D4A843',
    }).setOrigin(0.5).setAlpha(0.4);

    // Narrative summary — drawn from the comic's own words
    this.add.text(GAME_WIDTH / 2, 275,
      'To him, the sun was a sweet fruit.\n\nBut Indra and the Gods protected the Sun,\nand Hanuman fell from the heavens.\n\nTo make amends for the battle,\nthe Gods placed thunder in his hands.\n\nAnd the Three Worlds trembled\nat his joyful laughter.', {
        fontSize: '15px',
        fontFamily: 'Georgia, serif',
        color: '#BBAA88',
        align: 'center',
        lineSpacing: 6,
        fontStyle: 'italic',
      }).setOrigin(0.5);

    // Couplet
    this.add.text(GAME_WIDTH / 2, 430,
      'बल समय रवि भक्षि लियो\nताहि मधुर फल जानी', {
        fontSize: '18px',
        color: '#FFD700',
        align: 'center',
        lineSpacing: 4,
      }).setOrigin(0.5);

    // Next act teaser — drawn from comic's narrative
    this.add.text(GAME_WIDTH / 2, 490,
      'Next: ACT II — The Apprentice\n"But strength was not his only gift.\nTaught by the Sages, he became full of virtue..."', {
        fontSize: '12px',
        fontFamily: 'Georgia, serif',
        color: '#776655',
        fontStyle: 'italic',
        align: 'center',
        lineSpacing: 4,
      }).setOrigin(0.5);

    // Continue
    const ct = this.add.text(GAME_WIDTH / 2, 545, '— Press SPACE to return to title —', {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: '#554433',
    }).setOrigin(0.5);
    this.tweens.add({ targets: ct, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    const goTitle = () => {
      this.scene.start('Title');
    };
    this.input.keyboard.on('keydown-SPACE', goTitle);
    this.input.on('pointerdown', goTitle);
  }
}
