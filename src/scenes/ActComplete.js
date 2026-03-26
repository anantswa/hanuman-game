import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, CHALISA } from '../config.js';
import ScoreManager from '../systems/ScoreManager.js';

const ACT_DATA = {
  1: {
    title: 'ACT I COMPLETE',
    subtitle: 'The Child God',
    narrative: 'To him, the sun was a sweet fruit.\n\nBut Indra and the Gods protected the Sun,\nand Hanuman fell from the heavens.\n\nTo make amends for the battle,\nthe Gods placed thunder in his hands.',
    nextTitle: 'ACT II — The Awakening',
    nextTeaser: '"Taught by the Sages, he became\nfull of virtue and wisdom..."',
    nextScene: 'ChalisaTransition',
    nextData: { couplet: 'intro', act: 2, nextScene: 'Act2Level1' },
  },
  2: {
    title: 'ACT II COMPLETE',
    subtitle: 'The Awakening',
    narrative: 'In the sacred forest, he learned humility.\n\nThe sages tested his patience,\nhis courage, his heart.\n\nAnd when he looked into the Lord\'s eyes,\nhis powers were restored.',
    nextTitle: 'ACT III — The Ocean Crossing',
    nextTeaser: '"Placing the Lord\'s ring in his mouth,\ncrossing the ocean was no surprise..."',
    nextScene: 'ChalisaTransition',
    nextData: { couplet: 'intro', act: 3, nextScene: 'Act3Level1' },
  },
  3: {
    title: 'ACT III COMPLETE',
    subtitle: 'The Ocean Crossing',
    narrative: 'Across the vast ocean he leapt.\n\nSurasa, Simhika, and Lankini —\neach guardian fell before his devotion.\n\nThe gates of Lanka opened.',
    nextTitle: 'ACT IV — Lanka',
    nextTeaser: '"In tiny form he appeared to Sita,\nin terrible form he burned Lanka..."',
    nextScene: 'ChalisaTransition',
    nextData: { couplet: 'intro', act: 4, nextScene: 'Act4Level1' },
  },
  4: {
    title: 'ACT IV COMPLETE',
    subtitle: 'Lanka Burns',
    narrative: 'In the Ashoka Garden, he found Sita.\n\nAnd when they set his tail ablaze,\nLanka burned.\n\nRighteous fury, unleashed.',
    nextTitle: 'ACT V — The Great War',
    nextTeaser: '"Taking fierce form he destroyed the demons,\ncompleting Ram\'s mission..."',
    nextScene: 'ChalisaTransition',
    nextData: { couplet: 'intro', act: 5, nextScene: 'Act5Level1' },
  },
  5: {
    title: 'ACT V COMPLETE',
    subtitle: 'The Great War',
    narrative: 'He brought Sanjeevani and revived Lakshmana.\nHe defeated Ahiravana in the underworld.\n\nAnd when Ravana fell before Ram\'s arrow,\nHanuman witnessed dharma\'s triumph.',
    nextTitle: 'EPILOGUE — Return to Ayodhya',
    nextTeaser: '"And so the story lives on,\nin every heart that calls his name..."',
    nextScene: 'Epilogue',
    nextData: {},
  },
};

export default class ActComplete extends Phaser.Scene {
  constructor() {
    super('ActComplete');
  }

  init(data) {
    this.act = data.act || 1;
    this.finalScore = data.score || 0;
    this.isEpilogue = data.isEpilogue || false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0A0A12');

    if (this.isEpilogue) {
      this.showEpilogueComplete();
      return;
    }

    const actInfo = ACT_DATA[this.act] || ACT_DATA[1];

    // Decorative border
    const g = this.add.graphics();
    g.lineStyle(2, 0xD4A843, 0.4);
    g.strokeRoundedRect(50, 50, GAME_WIDTH - 100, GAME_HEIGHT - 100, 10);
    g.lineStyle(1, 0xD4A843, 0.2);
    g.strokeRoundedRect(58, 58, GAME_WIDTH - 116, GAME_HEIGHT - 116, 8);

    // Header
    this.add.text(GAME_WIDTH / 2, 100, `✦ ${actInfo.title} ✦`, {
      fontSize: '28px', fontFamily: 'Georgia, serif',
      color: '#FFD700', letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 140, actInfo.subtitle, {
      fontSize: '20px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    // Divider
    this.add.text(GAME_WIDTH / 2, 170, '─────── ☙ ❧ ───────', {
      fontSize: '14px', color: '#D4A843',
    }).setOrigin(0.5).setAlpha(0.4);

    // Narrative
    this.add.text(GAME_WIDTH / 2, 270, actInfo.narrative, {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#BBAA88', align: 'center',
      lineSpacing: 6, fontStyle: 'italic',
    }).setOrigin(0.5);

    // Score
    if (this.finalScore > 0) {
      this.add.text(GAME_WIDTH / 2, 390, `Score: ${this.finalScore}`, {
        fontSize: '22px', fontFamily: 'Georgia, serif',
        color: '#FFD700',
      }).setOrigin(0.5);
    }

    // Next act teaser
    this.add.text(GAME_WIDTH / 2, 440, `Next: ${actInfo.nextTitle}`, {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: '#FFCC88',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 470, actInfo.nextTeaser, {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#776655', fontStyle: 'italic', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    // Continue prompt
    const ct = this.add.text(GAME_WIDTH / 2, 540, '— Press SPACE to continue —', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#554433',
    }).setOrigin(0.5);
    this.tweens.add({ targets: ct, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    // Save progress
    ScoreManager.saveProgress(this.act + 1, 1);

    const goNext = () => {
      this.scene.start(actInfo.nextScene, actInfo.nextData);
    };
    this.input.keyboard.on('keydown-SPACE', goNext);
    this.input.on('pointerdown', goNext);
  }

  showEpilogueComplete() {
    // Final game complete screen
    const g = this.add.graphics();
    g.lineStyle(3, 0xD4A843, 0.6);
    g.strokeRoundedRect(40, 40, GAME_WIDTH - 80, GAME_HEIGHT - 80, 12);

    this.add.text(GAME_WIDTH / 2, 120, '🙏 JAI HANUMAN 🙏', {
      fontSize: '36px', fontFamily: 'Georgia, serif',
      color: '#FFD700', letterSpacing: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, 'Journey of the Divine', {
      fontSize: '20px', fontFamily: 'Georgia, serif',
      color: '#FFCC88', fontStyle: 'italic',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 250,
      'Pavan tanay sankat haran,\nMangal murti roop.\n\nSon of the Wind, destroyer of sorrow,\nembodiment of auspiciousness.', {
        fontSize: '16px', fontFamily: 'Georgia, serif',
        color: '#BBAA88', align: 'center', lineSpacing: 8, fontStyle: 'italic',
      }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 380, 'A DharmaWeave Game', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#776655',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 410, 'dharmaweave.com', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#554433',
    }).setOrigin(0.5);

    if (this.finalScore > 0) {
      this.add.text(GAME_WIDTH / 2, 450, `Final Score: ${this.finalScore}`, {
        fontSize: '22px', fontFamily: 'Georgia, serif', color: '#FFD700',
      }).setOrigin(0.5);
    }

    const ct = this.add.text(GAME_WIDTH / 2, 540, '— Press SPACE to return to title —', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#554433',
    }).setOrigin(0.5);
    this.tweens.add({ targets: ct, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('Title'));
    this.input.on('pointerdown', () => this.scene.start('Title'));
  }
}
