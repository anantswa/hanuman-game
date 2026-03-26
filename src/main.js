import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import ChalisaTransition from './scenes/ChalisaTransition.js';
import Act1Level1 from './scenes/Act1Level1.js';
import Act1Level2 from './scenes/Act1Level2.js';
import Act1Boss from './scenes/Act1Boss.js';
import Act2Level1 from './scenes/Act2Level1.js';
import Act2Boss from './scenes/Act2Boss.js';
import Act3Level1 from './scenes/Act3Level1.js';
import Act3Boss from './scenes/Act3Boss.js';
import Act4Level1 from './scenes/Act4Level1.js';
import Act4Level2 from './scenes/Act4Level2.js';
import Act5Level1 from './scenes/Act5Level1.js';
import Act5Level2 from './scenes/Act5Level2.js';
import Act5Boss from './scenes/Act5Boss.js';
import Epilogue from './scenes/Epilogue.js';
import ActComplete from './scenes/ActComplete.js';

// Destroy previous game instance on HMR
if (window.__PHASER_GAME__) {
  window.__PHASER_GAME__.destroy(true);
  window.__PHASER_GAME__ = null;
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  backgroundColor: '#0a0a0a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    TitleScene,
    ChalisaTransition,
    Act1Level1,
    Act1Level2,
    Act1Boss,
    Act2Level1,
    Act2Boss,
    Act3Level1,
    Act3Boss,
    Act4Level1,
    Act4Level2,
    Act5Level1,
    Act5Level2,
    Act5Boss,
    Epilogue,
    ActComplete,
  ],
};

const game = new Phaser.Game(config);
window.__PHASER_GAME__ = game;

// CRITICAL FIX: Override the visibility handler to keep game running
// even when tab/window loses focus. Phaser 3 uses Page Visibility API
// which pauses the game loop. We override this for dev and remote testing.
game.events.on('ready', () => {
  // Prevent Phaser from pausing on visibility change
  document.removeEventListener('visibilitychange', game.onVisibilityChange);
  document.removeEventListener('blur', game.onBlur);
  document.removeEventListener('focus', game.onFocus);

  // Force-resume the game loop if it ever gets paused
  setInterval(() => {
    if (!game.loop.running) {
      game.loop.wake();
    }
    if (game.isPaused) {
      game.resume();
    }
  }, 500);
});

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}
