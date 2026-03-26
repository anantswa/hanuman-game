# Hanuman — Journey of the Divine
## Game Design & Asset Requirements Document

### Overview
A 2D side-scrolling game based on the life of Hanuman and the Hanuman Chalisa.
Built with **Phaser 3 + Vite**. Each act corresponds to verses from the Chalisa.

**Repo:** github.com/anantswa/hanuman-game
**Stack:** Phaser 3.90, Vite 8, vanilla JS (no framework)
**Resolution:** 800x600 (scales to fit screen)

---

## Game Structure

### Act 1 — "Flight to the Sun" (CODED & WORKING)
**Chalisa verse:** "Bal samay ravi bhakshi liyo, tahi madhur phal jani"
(In childhood, He swallowed the sun, thinking it a sweet fruit)

**Gameplay:** Vertical flight — baby Hanuman flies upward from earth through clouds,
past demons and celestial guards, to reach the blazing sun at the top.
- Player starts on ground, flies UP (core mechanic)
- Parallax backgrounds: ground → clouds → cosmic space
- Enemies: cloud demons (patrol), celestial guards (chase/swoop)
- Obstacles: asteroids, drifting clouds
- Collectibles: health pickups (sacred lotus)
- Goal: reach the sun at altitude 9000m

### Act 1 Level 2 — "Higher and Higher" (CODED)
**Chalisa verse:** "Jug sahastra jojan par bhanu, leelyo tahi madhur phal janu"
Continuation of the ascent, harder enemies, more obstacles.

### Act 1 Boss — "Indra's Wrath" (CODED)
**Chalisa verse:** "Jag chari jug partap tumhara, hai parsiddh jagat ujiyara"
Boss fight against Indra who wields the vajra (thunderbolt).

### Between Levels — Chalisa Transition Screens
Beautiful ornate screens showing the Chalisa verse in:
- Devanagari (Hindi script)
- Transliteration
- English translation
- Narrative context

---

## Current Visual State

ALL visuals are currently **procedural** (drawn with Phaser graphics API).
They work but look like early-80s Atari. We need illustrated game art.

---

## Art Style Guide

**Reference:** The Hanuman graphic novel by Anant Swarup (DharmaWeave)
- Warm oil-painting luminosity
- Golden ambers, cosmic indigos, sacred fire tones
- Comic book meets Indian miniature painting
- Heroic, reverent, not cartoonish

**Color palette:**
- Hanuman skin: grey-blue fur with warm undertones
- Ornaments: rich gold (#FFD700, #D4A843)
- Saffron cloth: deep orange-red (#FF6600, #FF7722)
- Dawn sky: amber/gold horizon → purple-blue top
- Cosmic: deep indigo (#1A0A2E) with warm-tinted stars
- Demons: dark purple-black smoke with red eyes
- Divine beings: blue-armored, silver-white glow

---

## ASSET LIST — What We Need

All assets should be:
- PNG with **transparent background** (or solid black — we can remove it)
- **Facing RIGHT** (game flips horizontally for left-facing)
- High resolution (512-1024px) — game will scale down

### TIER 1: HANUMAN (Player Character) — HIGHEST PRIORITY

These 4 images define the entire game feel. Same character, same style, 4 poses.

| # | Asset | Filename | Description | Size |
|---|-------|----------|-------------|------|
| 1 | **Idle** | `hanuman-idle.png` | Standing heroically, mace at side, calm confident expression, tail curled up | ~512px tall |
| 2 | **Flying** | `hanuman-fly.png` | Superman flying pose — fist forward, saffron cloth streaming behind, determined face, tail trailing | ~512px tall |
| 3 | **Attack** | `hanuman-attack.png` | Swinging golden gada (mace) overhead, fierce warrior expression, saffron whipping with motion | ~512px tall |
| 4 | **Hurt** | `hanuman-hurt.png` | Recoiling from impact, arms up defensively, pained expression | ~512px tall |

**Character details for consistency:**
- Young/powerful Hanuman (not baby, not elderly)
- Grey-blue fur, muscular build
- Golden mukut (crown) with red jewel
- Golden arm bands, necklace, belt
- Saffron dhoti and flowing sash/uttariya
- Vermillion tilak on forehead
- Long tail with golden tip
- Golden gada (mace) — large spherical head, wooden handle

**DALL-E prompt template:**
> "2D side-scrolling game character art of Hanuman (Hindu monkey god). [POSE DESCRIPTION]. Grey-blue fur, muscular build, golden crown with red jewel, golden ornaments (arm bands, necklace, belt), saffron dhoti and flowing sash, vermillion tilak on forehead, long curled tail. Heroic comic book illustration style. Side view facing right. Transparent background. Clean edges, game-ready sprite."

### TIER 2: BACKGROUNDS — 4 parallax layers

These layer on top of each other for depth. Should be **horizontally tileable**.

| # | Asset | Filename | Description | Size |
|---|-------|----------|-------------|------|
| 5 | **Dawn Sky** | `bg-sky-dawn.png` | Warm gradient: deep blue-purple at top → golden amber at horizon. No objects, just sky. | 1600x600 |
| 6 | **Cosmic Sky** | `bg-sky-cosmic.png` | Deep indigo-purple with scattered warm-tinted stars, subtle nebula glow. Spiritual cosmos, not cold NASA space. | 1600x600 |
| 7 | **Mountains** | `bg-mountains.png` | Layered mountain silhouettes in warm dark purple-brown tones. Semi-transparent. Indian landscape feel (Western Ghats or Himalayas). | 1600x600 |
| 8 | **Clouds** | `bg-clouds.png` | Scattered dawn-tinted clouds (golden-pink-white). Semi-transparent, airy. | 1600x600 |

### TIER 3: ENEMIES — 3 types

| # | Asset | Filename | Description | Size |
|---|-------|----------|-------------|------|
| 9 | **Cloud Demon** | `enemy-demon.png` | Dark smoky asura made of black-purple cloud. Red glowing eyes, sharp fangs, wispy edges. Menacing but not gory. | ~256px |
| 10 | **Celestial Guard** | `enemy-guard.png` | Divine warrior (deva). Blue-silver armor, ornate helmet with plume, holding a spear. Noble but opposing. | ~256px |
| 11 | **Indra (Boss)** | `enemy-indra.png` | King of gods. Elaborate golden crown (5-pointed), royal blue armor, red cape, wielding the vajra (golden thunderbolt). Powerful, divine, imposing. Larger than other enemies. | ~400px |

### TIER 4: OBJECTS & PICKUPS

| # | Asset | Filename | Description | Size |
|---|-------|----------|-------------|------|
| 12 | **Sun** | `sun.png` | Blazing, radiant sun with golden rays and warm corona. This is the GOAL — should look magnificent and magnetic. | ~256px |
| 13 | **Health Pickup** | `pickup-health.png` | Sacred pink lotus flower with golden center, glowing softly. | ~64px |
| 14 | **Vajra Projectile** | `vajra.png` | Small golden thunderbolt — Indra's projectile weapon. Electric violet-white crackling. | ~64px |
| 15 | **Mace Hit Effect** | `mace-hit.png` | Golden starburst/impact flash — appears when Hanuman's mace connects. | ~64px |

### TIER 5: UI ELEMENTS

| # | Asset | Filename | Description | Size |
|---|-------|----------|-------------|------|
| 16 | **Heart Full** | `ui-heart.png` | Ornate golden-red heart or Om symbol for health display | ~32px |
| 17 | **Heart Empty** | `ui-heart-empty.png` | Same shape as above but hollow/dark | ~32px |

### NICE TO HAVE: ANIMATED SPRITES (Kling video → spritesheet)

| # | Asset | Description |
|---|-------|-------------|
| A | **Hanuman flying loop** | 2-3 sec loop: hair flowing, saffron billowing, subtle body movement |
| B | **Hanuman idle breathing** | 2-3 sec loop: chest rise, tail sway, cloth flutter |
| C | **Hanuman mace swing** | 1 sec: full attack arc animation |
| D | **Cloud demon hovering** | 2 sec loop: smoky tendrils swirling |

For these, generate a short video in Kling, then I'll extract frames into a spritesheet.

---

## File Structure

All assets go in: `/Users/anantswarup/hanuman-game/public/`

```
public/
  hanuman-idle.png
  hanuman-fly.png
  hanuman-attack.png
  hanuman-hurt.png
  bg-sky-dawn.png
  bg-sky-cosmic.png
  bg-mountains.png
  bg-clouds.png
  enemy-demon.png
  enemy-guard.png
  enemy-indra.png
  sun.png
  pickup-health.png
  vajra.png
  mace-hit.png
  ui-heart.png
  ui-heart-empty.png
```

---

## Code Architecture (for reference)

```
src/
  main.js          — Phaser game config, scene list, HMR setup
  config.js        — Constants: dimensions, colors, player stats, Chalisa text
  scenes/
    BootScene.js   — Asset loading (preload) + procedural generation
    TitleScene.js   — Title screen with Chalisa verse, "Press SPACE"
    ChalisaTransition.js — Between-level verse display
    Act1Level1.js  — Main gameplay: vertical flight to the sun
    Act1Level2.js  — Harder continuation
    Act1Boss.js    — Indra boss fight
    ActComplete.js — Victory screen
  entities/
    Player.js      — Hanuman: movement, flying, attack, health, particles
    Enemy.js       — Enemy AI: patrol, chase, float, swoop behaviors
  utils/
    AssetGenerator.js — Procedural sprite generation (will be replaced by real art)
```

**How assets are loaded:**
- BootScene.preload() loads PNGs from /public/
- If a PNG exists, it overrides the procedural texture
- If not found, falls back to procedural (game still works)

**How to integrate new assets:**
1. Drop PNG files into /public/ with the correct filenames
2. I'll update BootScene.preload() to load them all
3. Adjust sprite scale/hitbox sizes to match new art proportions
4. Done — Vite HMR will hot-reload

---

## Current Bugs Fixed
- [x] enemyGroup/obstacleGroup created after use (crash on level start)
- [x] Flying force too weak to overcome gravity
- [x] Enemy tween/velocity conflict causing flashing
- [x] Sky tileSprite wrapping causing orange screen glitch

## Known Remaining Work
- [ ] Replace all procedural art with illustrated assets
- [ ] Add animated spritesheets for fluid character movement
- [ ] Sound effects and music (Chalisa chanting during transitions?)
- [ ] Act 1 Level 2 and Boss need testing after fixes
- [ ] Mobile touch controls need refinement
- [ ] Score/progression system between levels
