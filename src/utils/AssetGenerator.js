// Generates placeholder sprite assets using Phaser graphics
// Visual style: warm oil-painting luminosity from Anant Swarup's Hanuman graphic novel
// Golden ambers, cosmic indigos, sacred fire — reverent and heroic
import { COLORS } from '../config.js';

// Helper: draw a star shape
function drawStar(graphics, cx, cy, points, outerRadius, innerRadius) {
  const step = Math.PI / points;
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) graphics.moveTo(x, y);
    else graphics.lineTo(x, y);
  }
  graphics.closePath();
  graphics.fill();
}

export function generateAssets(scene) {
  generateHanumanSprites(scene);
  generateEnemySprites(scene);
  generateObstacleSprites(scene);
  generateBackgroundLayers(scene);
  generateProjectiles(scene);
  generateEffects(scene);
  generateUIAssets(scene);
}

function generateHanumanSprites(scene) {
  // === Baby Hanuman — idle ===
  // Inspired by pages 3-4: round face, golden jewelry, warm skin, large eyes
  const g = scene.make.graphics({ add: false });
  const W = 48, H = 48;

  // Divine glow behind (subtle golden aura like the comic)
  g.fillStyle(0xFFDD44, 0.12);
  g.fillCircle(24, 24, 22);

  // Body (warm golden-brown, like the comic's Hanuman skin tone)
  g.fillStyle(0xC8944A);
  g.fillRoundedRect(12, 16, 24, 24, 5);

  // Saffron dhoti
  g.fillStyle(0xFF7722);
  g.fillRoundedRect(13, 32, 22, 10, 3);

  // Head (rounder, more childlike — matches baby Hanuman in comic)
  g.fillStyle(0xD4A05A);
  g.fillCircle(24, 12, 11);

  // Ears
  g.fillStyle(0xC8944A);
  g.fillCircle(13, 10, 4);
  g.fillCircle(35, 10, 4);
  g.fillStyle(0xE8B87A);
  g.fillCircle(13, 10, 2);
  g.fillCircle(35, 10, 2);

  // Eyes (large, expressive — key trait from comic)
  g.fillStyle(0xFFFFFF);
  g.fillCircle(20, 10, 3.5);
  g.fillCircle(28, 10, 3.5);
  g.fillStyle(0x442200);
  g.fillCircle(21, 10, 2);
  g.fillCircle(29, 10, 2);
  g.fillStyle(0x000000);
  g.fillCircle(21.5, 10, 1);
  g.fillCircle(29.5, 10, 1);

  // Tilak (vermillion mark)
  g.fillStyle(0xCC2200);
  g.fillRoundedRect(22, 3, 4, 4, 1);

  // Golden crown/mukut (ornament on head — prominent in comic)
  g.fillStyle(0xFFD700);
  g.fillTriangle(24, -2, 18, 4, 30, 4);
  g.fillStyle(0xCC8800);
  g.fillRect(19, 3, 10, 2);
  // Jewel in crown
  g.fillStyle(0xFF2200);
  g.fillCircle(24, 1, 2);

  // Golden arm bands
  g.fillStyle(0xFFD700);
  g.fillRect(10, 20, 4, 3);
  g.fillRect(34, 20, 4, 3);

  // Tail (curved upward gracefully)
  g.lineStyle(3, 0xC8944A);
  g.beginPath();
  g.moveTo(13, 34);
  g.lineTo(8, 28);
  g.lineTo(5, 18);
  g.lineTo(8, 12);
  g.strokePath();
  // Tail tip
  g.fillStyle(0xC8944A);
  g.fillCircle(8, 12, 2);

  // Smile (joyful — matches child Hanuman's expression in comic)
  g.lineStyle(1.5, 0x663300);
  g.beginPath();
  g.arc(24, 13, 4, 0.2, Math.PI - 0.2);
  g.strokePath();

  g.generateTexture('hanuman-idle', W, H);
  g.destroy();

  // === Hanuman flying ===
  // Inspired by pages 22-23: dynamic leap, arms forward, tail streaming
  const gf = scene.make.graphics({ add: false });

  // Aura trail
  gf.fillStyle(0xFFDD44, 0.08);
  gf.fillCircle(24, 24, 20);

  // Body angled forward
  gf.fillStyle(0xC8944A);
  gf.fillRoundedRect(14, 16, 22, 22, 5);

  // Saffron dhoti
  gf.fillStyle(0xFF7722);
  gf.fillRoundedRect(15, 30, 20, 8, 3);

  // Head
  gf.fillStyle(0xD4A05A);
  gf.fillCircle(24, 12, 11);

  // Eyes (determined)
  gf.fillStyle(0xFFFFFF);
  gf.fillCircle(20, 10, 3);
  gf.fillCircle(28, 10, 3);
  gf.fillStyle(0x442200);
  gf.fillCircle(21, 9.5, 2);
  gf.fillCircle(29, 9.5, 2);

  // Tilak
  gf.fillStyle(0xCC2200);
  gf.fillRoundedRect(22, 3, 4, 4, 1);

  // Crown
  gf.fillStyle(0xFFD700);
  gf.fillTriangle(24, -2, 18, 4, 30, 4);

  // Arms stretched forward (flying pose)
  gf.fillStyle(0xD4A05A);
  gf.fillRoundedRect(34, 14, 14, 5, 2);  // right arm forward
  gf.fillRoundedRect(0, 18, 14, 5, 2);   // left arm back

  // Tail streaming behind and up
  gf.lineStyle(3, 0xC8944A);
  gf.beginPath();
  gf.moveTo(14, 34);
  gf.lineTo(6, 38);
  gf.lineTo(0, 42);
  gf.lineTo(-2, 38);
  gf.strokePath();

  // Wind lines
  gf.lineStyle(1, 0xFFFFFF, 0.3);
  gf.beginPath();
  gf.moveTo(6, 22); gf.lineTo(0, 22);
  gf.strokePath();
  gf.beginPath();
  gf.moveTo(8, 28); gf.lineTo(2, 28);
  gf.strokePath();

  gf.generateTexture('hanuman-fly', W, H);
  gf.destroy();

  // === Hanuman attack (mace swing) ===
  // Inspired by pages 8-9, 33: Gada held high, fierce expression, warrior energy
  const ga = scene.make.graphics({ add: false });

  // Power burst glow
  ga.fillStyle(0xFFAA00, 0.15);
  ga.fillCircle(24, 24, 24);

  // Body
  ga.fillStyle(0xC8944A);
  ga.fillRoundedRect(10, 16, 22, 22, 5);

  // Saffron dhoti
  ga.fillStyle(0xFF7722);
  ga.fillRoundedRect(11, 30, 20, 8, 3);

  // Head
  ga.fillStyle(0xD4A05A);
  ga.fillCircle(21, 12, 11);

  // Fierce eyes (brows angled)
  ga.fillStyle(0xFFFFFF);
  ga.fillCircle(17, 10, 3);
  ga.fillCircle(25, 10, 3);
  ga.fillStyle(0x442200);
  ga.fillCircle(18, 10, 2);
  ga.fillCircle(26, 10, 2);
  // Furrowed brows
  ga.lineStyle(1.5, 0x663300);
  ga.beginPath();
  ga.moveTo(14, 7); ga.lineTo(19, 6);
  ga.strokePath();
  ga.beginPath();
  ga.moveTo(23, 6); ga.lineTo(28, 7);
  ga.strokePath();

  // Tilak
  ga.fillStyle(0xCC2200);
  ga.fillRoundedRect(19, 3, 4, 4, 1);

  // Crown
  ga.fillStyle(0xFFD700);
  ga.fillTriangle(21, -2, 15, 4, 27, 4);

  // Mace (Gada) — golden top, wooden handle — raised to strike
  // Handle
  ga.fillStyle(0x8B6914);
  ga.fillRect(34, 2, 4, 24);
  // Golden mace head (large, ornate)
  ga.fillStyle(0xFFD700);
  ga.fillCircle(36, 0, 7);
  ga.fillStyle(0xCC8800);
  ga.fillCircle(36, 0, 4);
  ga.fillStyle(0xFFEE44);
  ga.fillCircle(36, -1, 2);

  // Arm holding mace
  ga.fillStyle(0xD4A05A);
  ga.fillRoundedRect(28, 10, 10, 5, 2);

  // Tail raised high (power pose)
  ga.lineStyle(3, 0xC8944A);
  ga.beginPath();
  ga.moveTo(10, 32);
  ga.lineTo(4, 24);
  ga.lineTo(2, 14);
  ga.lineTo(6, 8);
  ga.strokePath();

  ga.generateTexture('hanuman-attack', W, H);
  ga.destroy();

  // === Hurt sprite ===
  const gh = scene.make.graphics({ add: false });
  gh.fillStyle(0xC8944A, 0.6);
  gh.fillRoundedRect(12, 16, 24, 24, 5);
  gh.fillStyle(0xD4A05A, 0.6);
  gh.fillCircle(24, 12, 11);
  // Pained eyes
  gh.lineStyle(2, 0x663300);
  gh.beginPath();
  gh.moveTo(17, 8); gh.lineTo(21, 12);
  gh.moveTo(21, 8); gh.lineTo(17, 12);
  gh.moveTo(27, 8); gh.lineTo(31, 12);
  gh.moveTo(31, 8); gh.lineTo(27, 12);
  gh.strokePath();
  // Saffron dhoti
  gh.fillStyle(0xFF7722, 0.6);
  gh.fillRoundedRect(13, 32, 22, 10, 3);
  gh.generateTexture('hanuman-hurt', W, H);
  gh.destroy();
}

function generateEnemySprites(scene) {
  // === Cloud demon (asura in the sky) ===
  // Dark, smoky, with red eyes — the comic's demons are shadow-like
  const g = scene.make.graphics({ add: false });
  // Smoky body
  g.fillStyle(0x2A0A2A, 0.8);
  g.fillCircle(20, 20, 16);
  g.fillStyle(0x3A1A3A, 0.6);
  g.fillCircle(12, 16, 10);
  g.fillCircle(28, 16, 10);
  g.fillStyle(0x1A001A, 0.7);
  g.fillCircle(20, 24, 12);
  // Glowing red eyes
  g.fillStyle(0xFF2200);
  g.fillCircle(14, 17, 3);
  g.fillCircle(26, 17, 3);
  g.fillStyle(0xFF6644);
  g.fillCircle(14, 17, 1.5);
  g.fillCircle(26, 17, 1.5);
  // Fangs
  g.fillStyle(0xDDDDDD);
  g.fillTriangle(16, 25, 18, 31, 20, 25);
  g.fillTriangle(22, 25, 24, 31, 26, 25);
  g.generateTexture('demon-cloud', 40, 40);
  g.destroy();

  // === Celestial guard (deva warrior) ===
  // Inspired by the divine beings in the comic — armored, blue-tinted
  const gc = scene.make.graphics({ add: false });
  // Armor body
  gc.fillStyle(0x3A6EA5);
  gc.fillRoundedRect(8, 8, 24, 28, 5);
  // Chest plate
  gc.fillStyle(0x4A88CC);
  gc.fillRoundedRect(10, 10, 20, 14, 3);
  // Helmet
  gc.fillStyle(0xBBBBCC);
  gc.fillRoundedRect(10, 0, 20, 14, 6);
  gc.fillStyle(0xDDDDEE);
  gc.fillTriangle(20, -4, 16, 2, 24, 2);
  // Spear
  gc.fillStyle(0x888899);
  gc.fillRect(34, 6, 3, 30);
  gc.fillStyle(0xCCCCDD);
  gc.fillTriangle(35.5, 2, 32, 8, 39, 8);
  // Eyes
  gc.fillStyle(0xFFFFFF);
  gc.fillCircle(16, 10, 3);
  gc.fillCircle(24, 10, 3);
  gc.fillStyle(0x2244AA);
  gc.fillCircle(17, 10, 2);
  gc.fillCircle(25, 10, 2);
  gc.generateTexture('celestial-guard', 40, 40);
  gc.destroy();

  // === Indra boss ===
  // Page 6 of comic: divine, crowned, wielding the vajra, surrounded by lightning
  const gi = scene.make.graphics({ add: false });
  const BW = 64, BH = 72;

  // Divine glow
  gi.fillStyle(0xCCAAFF, 0.1);
  gi.fillCircle(32, 36, 34);

  // Royal cape
  gi.fillStyle(0x660022, 0.7);
  gi.fillTriangle(14, 26, 4, 68, 22, 68);
  gi.fillTriangle(50, 26, 60, 68, 42, 68);

  // Body (divine blue armor — like devas in the comic)
  gi.fillStyle(0x2244AA);
  gi.fillRoundedRect(16, 26, 32, 38, 6);
  // Armor detail
  gi.fillStyle(0x3366CC);
  gi.fillRoundedRect(18, 28, 28, 16, 4);
  gi.lineStyle(1, 0xFFD700, 0.5);
  gi.strokeRoundedRect(18, 28, 28, 16, 4);

  // Head (golden skin, divine)
  gi.fillStyle(0xE8C860);
  gi.fillCircle(32, 18, 14);

  // Crown (elaborate, golden — multi-pointed like Indra's)
  gi.fillStyle(0xFFD700);
  gi.fillRoundedRect(20, 2, 24, 8, 3);
  gi.fillTriangle(26, -4, 24, 4, 28, 4);
  gi.fillTriangle(32, -6, 30, 4, 34, 4);
  gi.fillTriangle(38, -4, 36, 4, 40, 4);
  // Crown jewel
  gi.fillStyle(0xFF0044);
  gi.fillCircle(32, 2, 3);
  gi.fillStyle(0x00AAFF);
  gi.fillCircle(26, 4, 2);
  gi.fillCircle(38, 4, 2);

  // Eyes (fierce, divine)
  gi.fillStyle(0xFFFFFF);
  gi.fillCircle(26, 16, 4);
  gi.fillCircle(38, 16, 4);
  gi.fillStyle(0x1122AA);
  gi.fillCircle(27, 16, 2.5);
  gi.fillCircle(39, 16, 2.5);
  // Angry brows
  gi.lineStyle(2, 0xAA8800);
  gi.beginPath();
  gi.moveTo(22, 12); gi.lineTo(28, 11);
  gi.strokePath();
  gi.beginPath();
  gi.moveTo(36, 11); gi.lineTo(42, 12);
  gi.strokePath();

  // Vajra (thunderbolt) in hand — electric, crackling
  gi.fillStyle(0xFFFF00);
  gi.fillRect(50, 22, 5, 22);
  gi.fillStyle(0xFFDD00);
  gi.fillTriangle(52.5, 18, 48, 24, 57, 24);
  gi.fillTriangle(52.5, 48, 48, 42, 57, 42);
  // Lightning crackle around vajra
  gi.lineStyle(1, 0xCCAAFF, 0.6);
  gi.beginPath();
  gi.moveTo(48, 30); gi.lineTo(44, 28); gi.lineTo(46, 34);
  gi.strokePath();
  gi.beginPath();
  gi.moveTo(57, 36); gi.lineTo(61, 34); gi.lineTo(59, 40);
  gi.strokePath();

  // Golden belt
  gi.fillStyle(0xFFD700);
  gi.fillRect(16, 44, 32, 3);

  gi.generateTexture('indra-boss', BW, BH);
  gi.destroy();
}

function generateObstacleSprites(scene) {
  // Cloud — warm-tinted, dawn-lit (not pure white)
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0xFFEEDD, 0.7);
  g.fillCircle(30, 20, 18);
  g.fillCircle(50, 22, 14);
  g.fillCircle(14, 22, 12);
  g.fillCircle(40, 16, 16);
  g.fillStyle(0xFFDDCC, 0.5);
  g.fillCircle(30, 24, 14);
  // Dawn tint on top
  g.fillStyle(0xFFCC88, 0.3);
  g.fillCircle(32, 14, 12);
  g.generateTexture('cloud', 64, 36);
  g.destroy();

  // Star (celestial light)
  const gs = scene.make.graphics({ add: false });
  gs.fillStyle(0xFFF8E7);
  drawStar(gs, 12, 12, 5, 12, 6);
  gs.fillStyle(0xFFFFDD);
  drawStar(gs, 12, 12, 5, 8, 4);
  gs.generateTexture('star', 24, 24);
  gs.destroy();

  // Asteroid (darker, rocky)
  const ga = scene.make.graphics({ add: false });
  ga.fillStyle(0x554433);
  ga.fillCircle(16, 16, 14);
  ga.fillStyle(0x443322);
  ga.fillCircle(10, 10, 5);
  ga.fillCircle(20, 18, 4);
  ga.fillStyle(0x332211);
  ga.fillCircle(18, 8, 3);
  // Lava crack
  ga.lineStyle(1, 0xFF6600, 0.4);
  ga.beginPath();
  ga.moveTo(8, 14); ga.lineTo(16, 16); ga.lineTo(24, 12);
  ga.strokePath();
  ga.generateTexture('asteroid', 32, 32);
  ga.destroy();

  // Sun (goal) — inspired by page 4: blazing, radiant, magnetic
  const sun = scene.make.graphics({ add: false });
  // Outer glow
  sun.fillStyle(0xFFDD44, 0.15);
  sun.fillCircle(48, 48, 46);
  sun.fillStyle(0xFFAA00, 0.25);
  sun.fillCircle(48, 48, 40);
  sun.fillStyle(0xFF8800, 0.35);
  sun.fillCircle(48, 48, 34);
  // Core fire
  sun.fillStyle(0xFF6600);
  sun.fillCircle(48, 48, 28);
  sun.fillStyle(0xFFAA00);
  sun.fillCircle(48, 48, 22);
  sun.fillStyle(0xFFCC44);
  sun.fillCircle(48, 48, 16);
  sun.fillStyle(0xFFFF88);
  sun.fillCircle(48, 48, 10);
  // Rays
  sun.lineStyle(3, 0xFFDD44, 0.5);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const innerR = 30;
    const outerR = 42 + (i % 2) * 4;
    sun.beginPath();
    sun.moveTo(48 + Math.cos(angle) * innerR, 48 + Math.sin(angle) * innerR);
    sun.lineTo(48 + Math.cos(angle) * outerR, 48 + Math.sin(angle) * outerR);
    sun.strokePath();
  }
  sun.generateTexture('sun', 96, 96);
  sun.destroy();
}

function generateBackgroundLayers(scene) {
  // === Dawn sky — inspired by comic cover (page 1) ===
  // Warm amber/gold at horizon, transitioning to soft blue-purple at top
  const sky = scene.make.graphics({ add: false });
  for (let y = 0; y < 600; y++) {
    const t = y / 600;
    // Top: deep blue-purple → Bottom: warm golden-orange
    const r = Math.floor(20 + t * 235);
    const g = Math.floor(15 + t * 135);
    const b = Math.floor(60 + (1 - t) * 140);
    sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
    sky.fillRect(0, y, 800, 1);
  }
  sky.generateTexture('sky-dawn', 800, 600);
  sky.destroy();

  // === Cosmic sky — inspired by pages 4-5, 40 ===
  // Deep indigo with warm star scatter, not cold space — spiritual cosmos
  const cosmic = scene.make.graphics({ add: false });
  for (let y = 0; y < 600; y++) {
    const t = y / 600;
    const r = Math.floor(26 + t * 12);
    const g = Math.floor(10 + t * 18);
    const b = Math.floor(46 + t * 30);
    cosmic.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
    cosmic.fillRect(0, y, 800, 1);
  }
  // Stars — warm tinted (not cold white) to match comic's spiritual cosmos
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const size = Math.random() * 2 + 0.5;
    const warmth = Math.random();
    if (warmth > 0.7) {
      cosmic.fillStyle(0xFFEECC); // warm star
    } else if (warmth > 0.4) {
      cosmic.fillStyle(0xFFFFEE); // neutral star
    } else {
      cosmic.fillStyle(0xCCDDFF); // cool star
    }
    cosmic.fillCircle(x, y, size);
  }
  // Subtle nebula glow
  cosmic.fillStyle(0x4422AA, 0.08);
  cosmic.fillCircle(200, 300, 120);
  cosmic.fillStyle(0xAA4422, 0.06);
  cosmic.fillCircle(600, 200, 100);
  cosmic.generateTexture('sky-cosmic', 800, 600);
  cosmic.destroy();

  // === Cloud layer (mid parallax) — dawn-tinted ===
  const clouds = scene.make.graphics({ add: false });
  for (let i = 0; i < 6; i++) {
    const x = i * 140 + Math.random() * 40;
    const y = 100 + Math.random() * 400;
    // Golden-tinted clouds (dawn light)
    clouds.fillStyle(0xFFEEDD, 0.35);
    clouds.fillCircle(x, y, 30 + Math.random() * 20);
    clouds.fillStyle(0xFFDDBB, 0.25);
    clouds.fillCircle(x + 20, y - 10, 20 + Math.random() * 15);
    clouds.fillStyle(0xFFCCAA, 0.3);
    clouds.fillCircle(x - 15, y + 5, 25 + Math.random() * 10);
  }
  clouds.generateTexture('clouds-layer', 800, 600);
  clouds.destroy();

  // === Mountain silhouettes — warm-toned (not cold grey) ===
  const mtns = scene.make.graphics({ add: false });
  mtns.fillStyle(0x2A1A28, 0.5);
  mtns.beginPath();
  mtns.moveTo(0, 600);
  mtns.lineTo(0, 400);
  mtns.lineTo(80, 320);
  mtns.lineTo(160, 380);
  mtns.lineTo(260, 280);
  mtns.lineTo(360, 340);
  mtns.lineTo(480, 250);
  mtns.lineTo(580, 330);
  mtns.lineTo(680, 270);
  mtns.lineTo(800, 350);
  mtns.lineTo(800, 600);
  mtns.closePath();
  mtns.fill();
  // Distant range (lighter)
  mtns.fillStyle(0x3A2A38, 0.3);
  mtns.beginPath();
  mtns.moveTo(0, 600);
  mtns.lineTo(0, 440);
  mtns.lineTo(120, 360);
  mtns.lineTo(240, 410);
  mtns.lineTo(380, 340);
  mtns.lineTo(520, 390);
  mtns.lineTo(660, 330);
  mtns.lineTo(800, 380);
  mtns.lineTo(800, 600);
  mtns.closePath();
  mtns.fill();
  mtns.generateTexture('mountains', 800, 600);
  mtns.destroy();
}

function generateProjectiles(scene) {
  // === Vajra (Indra's thunderbolt) — page 6: electric violet-white lightning ===
  const g = scene.make.graphics({ add: false });
  // Core
  g.fillStyle(0xFFFF44);
  g.fillRect(3, 2, 6, 22);
  // Points
  g.fillStyle(0xFFEE00);
  g.fillTriangle(6, -2, 1, 4, 11, 4);
  g.fillTriangle(6, 28, 1, 22, 11, 22);
  // Electric glow
  g.fillStyle(0xCCAAFF, 0.35);
  g.fillRect(1, 0, 10, 26);
  // Lightning sparks
  g.lineStyle(1, 0xDDCCFF, 0.6);
  g.beginPath();
  g.moveTo(0, 8); g.lineTo(-2, 12); g.lineTo(1, 14);
  g.strokePath();
  g.beginPath();
  g.moveTo(12, 14); g.lineTo(14, 18); g.lineTo(11, 20);
  g.strokePath();
  g.generateTexture('vajra', 14, 30);
  g.destroy();

  // Mace hit effect — golden burst
  const mh = scene.make.graphics({ add: false });
  mh.fillStyle(0xFFAA00, 0.7);
  drawStar(mh, 16, 16, 6, 16, 8);
  mh.fillStyle(0xFFDD44, 0.5);
  drawStar(mh, 16, 16, 6, 10, 5);
  mh.fillStyle(0xFFFF88, 0.4);
  mh.fillCircle(16, 16, 4);
  mh.generateTexture('mace-hit', 32, 32);
  mh.destroy();
}

function generateEffects(scene) {
  // Particle (generic — warm white)
  const p = scene.make.graphics({ add: false });
  p.fillStyle(0xFFF8E7);
  p.fillCircle(4, 4, 4);
  p.generateTexture('particle', 8, 8);
  p.destroy();

  // Divine glow particle (golden — Hanuman's aura)
  const dg = scene.make.graphics({ add: false });
  dg.fillStyle(0xFFCC44, 0.5);
  dg.fillCircle(8, 8, 8);
  dg.fillStyle(0xFFEE88, 0.3);
  dg.fillCircle(8, 8, 5);
  dg.fillStyle(0xFFFFC0, 0.2);
  dg.fillCircle(8, 8, 3);
  dg.generateTexture('divine-glow', 16, 16);
  dg.destroy();

  // Health pickup (sacred lotus instead of heart — more Indian)
  const hp = scene.make.graphics({ add: false });
  // Lotus petals (pink-gold)
  hp.fillStyle(0xFF8899);
  hp.fillCircle(12, 8, 5);
  hp.fillCircle(6, 12, 5);
  hp.fillCircle(18, 12, 5);
  hp.fillCircle(8, 18, 5);
  hp.fillCircle(16, 18, 5);
  // Center
  hp.fillStyle(0xFFDD44);
  hp.fillCircle(12, 13, 4);
  hp.generateTexture('health-pickup', 24, 24);
  hp.destroy();
}

function generateUIAssets(scene) {
  // Heart (health) — Om symbol style glow
  const h = scene.make.graphics({ add: false });
  h.fillStyle(0xFF4422);
  h.fillCircle(8, 6, 6);
  h.fillCircle(16, 6, 6);
  h.fillTriangle(2, 8, 22, 8, 12, 20);
  // Inner glow
  h.fillStyle(0xFF8866, 0.5);
  h.fillCircle(12, 8, 4);
  h.generateTexture('heart', 24, 22);
  h.destroy();

  // Empty heart
  const eh = scene.make.graphics({ add: false });
  eh.lineStyle(2, 0x884422, 0.5);
  eh.strokeCircle(8, 6, 6);
  eh.strokeCircle(16, 6, 6);
  eh.lineStyle(1, 0x884422, 0.3);
  eh.beginPath();
  eh.moveTo(2, 8); eh.lineTo(12, 20); eh.lineTo(22, 8);
  eh.strokePath();
  eh.generateTexture('heart-empty', 24, 22);
  eh.destroy();
}
