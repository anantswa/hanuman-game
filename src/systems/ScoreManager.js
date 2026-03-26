// ScoreManager.js — handles points, combos, grades, persistent scores

export default class ScoreManager {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = null;
    this.maxCombo = 0;
    this.levelStartTime = Date.now();

    // Point values
    this.POINTS = {
      lotus: 100,
      demonKill: 200,
      guardKill: 500,
      bossHit: 1000,
      zoneComplete: 1000,
      noHitZone: 2000,
      devotionSpecial: 5000,
    };

    // Combo tracking - kills within 3 seconds multiply score
    this.COMBO_WINDOW = 3000; // 3 seconds
    this.MAX_MULTIPLIER = 4;

    // UI elements (created by scene)
    this.scoreText = null;
    this.comboText = null;
  }

  // Add points (auto-applies combo multiplier for kills)
  addPoints(type, position = null) {
    const base = this.POINTS[type] || 0;
    const isKill = ['demonKill', 'guardKill', 'bossHit'].includes(type);

    if (isKill) {
      this.incrementCombo();
    }

    const points = base * (isKill ? this.comboMultiplier : 1);
    this.score += points;

    // Floating score text at position
    if (position && this.scene) {
      const label = isKill && this.comboMultiplier > 1
        ? `+${points} x${this.comboMultiplier}`
        : `+${points}`;
      this.showFloatingScore(position.x, position.y, label, isKill && this.comboMultiplier > 1);
    }

    this.updateUI();
    return points;
  }

  incrementCombo() {
    this.comboCount++;
    this.comboMultiplier = Math.min(this.comboCount, this.MAX_MULTIPLIER);
    this.maxCombo = Math.max(this.maxCombo, this.comboMultiplier);

    // Reset/restart combo timer
    if (this.comboTimer) this.comboTimer.remove();
    this.comboTimer = this.scene.time.delayedCall(this.COMBO_WINDOW, () => {
      this.comboCount = 0;
      this.comboMultiplier = 1;
      this.hideComboUI();
    });

    // Show combo multiplier on screen
    this.showComboUI();
  }

  showFloatingScore(x, y, text, isCombo) {
    const color = isCombo ? '#FF6600' : '#FFD700';
    const fontSize = isCombo ? '20px' : '16px';
    const scoreText = this.scene.add.text(x, y - 20, text, {
      fontSize, fontFamily: 'Georgia, serif', color,
      stroke: '#000', strokeThickness: 2,
    }).setDepth(200).setOrigin(0.5);

    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => scoreText.destroy(),
    });
  }

  showComboUI() {
    if (this.comboMultiplier <= 1) return;

    if (!this.comboText) {
      this.comboText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 - 80,
        '', {
          fontSize: '36px', fontFamily: 'Georgia, serif',
          color: '#FF6600', stroke: '#000', strokeThickness: 4,
          align: 'center',
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);
    }

    this.comboText.setText(`x${this.comboMultiplier} COMBO!`);
    this.comboText.setAlpha(1);
    this.comboText.setScale(1.5);

    this.scene.tweens.add({
      targets: this.comboText,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  hideComboUI() {
    if (this.comboText) {
      this.scene.tweens.add({
        targets: this.comboText,
        alpha: 0,
        duration: 300,
      });
    }
  }

  updateUI() {
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }

  // Get level grade based on percentage of theoretical max
  getGrade(maxPossible) {
    const pct = this.score / maxPossible;
    if (pct >= 0.9) return 'S';
    if (pct >= 0.7) return 'A';
    if (pct >= 0.5) return 'B';
    return 'C';
  }

  // Save best scores to localStorage
  static saveBest(actLevel, score, grade) {
    const key = `hanuman_best_${actLevel}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    if (!existing.score || score > existing.score) {
      localStorage.setItem(key, JSON.stringify({ score, grade, date: Date.now() }));
    }
  }

  static getBest(actLevel) {
    const key = `hanuman_best_${actLevel}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  // Save/load act unlock progress
  static getProgress() {
    return JSON.parse(localStorage.getItem('hanuman_progress') || '{"highestAct":1,"highestLevel":1}');
  }

  static saveProgress(act, level) {
    const current = ScoreManager.getProgress();
    if (act > current.highestAct || (act === current.highestAct && level > current.highestLevel)) {
      localStorage.setItem('hanuman_progress', JSON.stringify({ highestAct: act, highestLevel: level }));
    }
  }

  reset() {
    this.score = 0;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.maxCombo = 0;
    this.levelStartTime = Date.now();
    if (this.comboTimer) this.comboTimer.remove();
    this.updateUI();
  }

  destroy() {
    if (this.comboTimer) this.comboTimer.remove();
    if (this.comboText) this.comboText.destroy();
  }
}
