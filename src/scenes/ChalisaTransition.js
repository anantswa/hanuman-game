import { GAME_WIDTH, GAME_HEIGHT, CHALISA } from '../config.js';

export default class ChalisaTransition extends Phaser.Scene {
  constructor() {
    super('ChalisaTransition');
  }

  init(data) {
    this.coupletKey = data.couplet || 'intro';
    this.act = data.act || 1;
    this.nextScene = data.nextScene || 'Act1Level1';
    this.nextSceneData = data.nextSceneData || {};
  }

  create() {
    console.log('[Chalisa] Creating transition, couplet:', this.coupletKey, '→ next:', this.nextScene);
    // Look up couplet — check act-specific first, then top-level (victory, epilogue, death)
    let couplet = null;
    const actData = CHALISA[`act${this.act}`];
    if (actData && actData[this.coupletKey]) {
      couplet = actData[this.coupletKey];
    } else if (CHALISA[this.coupletKey]) {
      couplet = CHALISA[this.coupletKey];
    }
    if (!couplet) {
      console.warn('[Chalisa] No couplet found for', this.act, this.coupletKey, '— skipping to', this.nextScene);
      this.scene.start(this.nextScene, this.nextSceneData);
      return;
    }

    // Dark ornate background
    this.cameras.main.setBackgroundColor('#0A0A14');
    this.cameras.main.fadeIn(800);

    // Decorative border
    const g = this.add.graphics();
    g.lineStyle(2, 0xD4A843, 0.6);
    g.strokeRoundedRect(40, 40, GAME_WIDTH - 80, GAME_HEIGHT - 80, 12);
    g.lineStyle(1, 0xD4A843, 0.3);
    g.strokeRoundedRect(50, 50, GAME_WIDTH - 100, GAME_HEIGHT - 100, 8);

    // Corner ornaments
    const cornerSize = 20;
    const corners = [
      [55, 55], [GAME_WIDTH - 55, 55],
      [55, GAME_HEIGHT - 55], [GAME_WIDTH - 55, GAME_HEIGHT - 55]
    ];
    corners.forEach(([cx, cy]) => {
      g.fillStyle(0xD4A843, 0.4);
      // Diamond ornament instead of star (fillStar not available)
      g.beginPath();
      g.moveTo(cx, cy - cornerSize);
      g.lineTo(cx + cornerSize / 2, cy);
      g.lineTo(cx, cy + cornerSize);
      g.lineTo(cx - cornerSize / 2, cy);
      g.closePath();
      g.fill();
    });

    // Act indicator
    this.add.text(GAME_WIDTH / 2, 80, `✦ ACT ${this.act} ✦`, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#8B7355',
      letterSpacing: 8,
    }).setOrigin(0.5);

    // Decorative Om/divider
    this.add.text(GAME_WIDTH / 2, 120, '☙ ॐ ❧', {
      fontSize: '28px',
      color: '#D4A843',
    }).setOrigin(0.5).setAlpha(0.6);

    // Devanagari couplet (main)
    const devText = this.add.text(GAME_WIDTH / 2, 190, couplet.devanagari, {
      fontSize: '26px',
      color: '#FFD700',
      wordWrap: { width: GAME_WIDTH - 160 },
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    // Transliteration
    const transText = this.add.text(GAME_WIDTH / 2, 260, couplet.transliteration, {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#CCAA77',
      fontStyle: 'italic',
      wordWrap: { width: GAME_WIDTH - 160 },
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    // English meaning
    const engText = this.add.text(GAME_WIDTH / 2, 310, `"${couplet.english}"`, {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#FFFFFF',
      wordWrap: { width: GAME_WIDTH - 160 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Divider
    const divider = this.add.graphics();
    divider.lineStyle(1, 0xD4A843, 0.4);
    divider.beginPath();
    divider.moveTo(200, 370);
    divider.lineTo(600, 370);
    divider.strokePath();
    divider.setAlpha(0);

    // Narrative text
    const narrativeText = this.add.text(GAME_WIDTH / 2, 420, couplet.narrative, {
      fontSize: '15px',
      fontFamily: 'Georgia, serif',
      color: '#AAAAAA',
      wordWrap: { width: GAME_WIDTH - 200 },
      align: 'center',
      lineSpacing: 6,
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    // Animate text appearing sequentially
    this.tweens.add({
      targets: devText,
      alpha: 1,
      duration: 1000,
      delay: 300,
    });

    this.tweens.add({
      targets: transText,
      alpha: 1,
      duration: 800,
      delay: 1200,
    });

    this.tweens.add({
      targets: engText,
      alpha: 1,
      duration: 800,
      delay: 2000,
    });

    this.tweens.add({
      targets: divider,
      alpha: 1,
      duration: 500,
      delay: 2600,
    });

    this.tweens.add({
      targets: narrativeText,
      alpha: 1,
      duration: 800,
      delay: 2800,
    });

    // Continue prompt (appears after all text)
    const continueText = this.add.text(GAME_WIDTH / 2, 530, '— Tap or press SPACE to continue —', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#666666',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: continueText,
      alpha: 0.8,
      duration: 500,
      delay: 3600,
      onComplete: () => {
        // Pulse
        this.tweens.add({
          targets: continueText,
          alpha: 0.3,
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      },
    });

    // Allow continue after a brief moment
    this.canContinue = false;
    this.time.delayedCall(1000, () => {
      this.canContinue = true;
      console.log('[Chalisa] canContinue = true (delayedCall)');
    });
    setTimeout(() => {
      this.canContinue = true;
      console.log('[Chalisa] canContinue = true (setTimeout)');
    }, 1200);

    // Keyboard input
    this.input.keyboard.on('keydown', (event) => {
      console.log('[Chalisa] keydown:', event.key, 'canContinue:', this.canContinue);
      this.continueToNext();
    });
    // Pointer input
    this.input.on('pointerdown', () => {
      console.log('[Chalisa] pointerdown, canContinue:', this.canContinue);
      this.continueToNext();
    });

    // FALLBACK: Also listen at the document level in case Phaser input isn't capturing
    this._docHandler = () => {
      console.log('[Chalisa] document click fallback, canContinue:', this.canContinue);
      this.continueToNext();
    };
    document.addEventListener('click', this._docHandler);
    document.addEventListener('keydown', this._docHandler);
  }

  continueToNext() {
    if (!this.canContinue) {
      console.log('[Chalisa] continueToNext called but canContinue is false');
      return;
    }
    this.canContinue = false;
    console.log('[Chalisa] → Continuing to', this.nextScene);

    // Clean up document-level listeners
    if (this._docHandler) {
      document.removeEventListener('click', this._docHandler);
      document.removeEventListener('keydown', this._docHandler);
    }

    try {
      this.scene.start(this.nextScene, this.nextSceneData);
    } catch (e) {
      console.error('[Chalisa] Scene start failed:', e);
      // Re-enable so user can try again
      this.canContinue = true;
    }
  }
}
