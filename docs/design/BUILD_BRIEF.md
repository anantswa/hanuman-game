# HANUMAN GAME — Claude Code Build Brief
## Autonomous Coding Session: Full Game Build
## March 26, 2026

---

## CONTEXT

You are working on a Phaser 3 + Vite game called "Hanuman — Journey of the Divine."
Repo: github.com/anantswa/hanuman-game
Stack: Phaser 3.90, Vite 8, vanilla JS (no React, no framework)
Resolution: 800x600 (scales to fit)

The game currently has Act 1 coded (3 levels: Level 1, Level 2, Boss) with procedural 
placeholder art. The game works but looks like early-80s Atari. We are upgrading it to 
feel like Ori and the Blind Forest — painterly, atmospheric, fluid, beautiful.

The game follows the Hanuman Chalisa narrative. Baby Hanuman flies upward to swallow 
the sun, fights Indra, and eventually grows into the full divine warrior across 5 acts.

Asset files will be dropped into /public/ as they are generated. The game should 
gracefully fall back to procedural art when a PNG doesn't exist yet.

## YOUR MISSION

Build the FULL GAME — all 5 acts + epilogue — in a single autonomous session.
Each act should be playable with procedural placeholder art. As real PNGs arrive 
in /public/, they automatically override the placeholders.

Prioritize: game feel > content quantity > visual polish.
Make it FUN. Make movement feel incredible. Make combat satisfying.
Keep difficulty on the EASY side — generous health, forgiving hitboxes, frequent checkpoints.

---

## PHASE 1: CORE ENGINE UPGRADES (Do these FIRST, they affect everything)

### 1A. Player FSM Refactor
Refactor Player.js to use a clean Finite State Machine:
- States: IDLE, RUNNING, JUMPING, FLYING, DASHING, ATTACKING, HURT, DEAD, KNEELING
- Each state has: enter(), update(), exit() methods
- State transitions are explicit (e.g., can only DASH from FLYING or RUNNING)
- All state-specific logic lives in the state, not in sprawling if/else

### 1B. Movement Physics
Make Hanuman feel like a divine monkey — agile, buoyant, powerful:
- Acceleration curves: ramp to max speed over ~0.3 seconds (not instant)
- Deceleration slide: velocity decays over ~0.2 seconds when input released
- Gravity: gentle downward pull when not flying (he floats, doesn't plummet)
- Air control: full directional control while airborne
- COYOTE TIME: 100ms grace period on all action inputs (secretly forgiving)

### 1C. Vayu-Dash
- SHIFT key triggers dash in facing direction
- 3x normal velocity for 0.3 seconds
- 1.5 second cooldown (show cooldown on UI subtly)
- Invincibility frames during dash (0.3 sec)
- GHOSTING EFFECT: spawn 3-4 copies of current sprite behind player 
  at opacity 0.6, 0.4, 0.2, 0.1 — each tinted saffron (0xFF6600)
  Fade out over 0.5 seconds using tweens
- Golden particle trail during dash

### 1D. Combat Feel
- MACE ATTACK (SPACE):
  - Short range, wide arc
  - HIT-STOP: When mace connects, set this.scene.physics.world.timeScale = 0 
    for 50ms, then restore. This is the #1 feel improvement.
  - Screen shake: camera.shake(50, 0.01)
  - Particle burst: golden starburst at impact point
  - Enemy flashes white on hit
  
- DAMAGE RECEIVED:
  - Golden flicker (not crude blink) — setTintFill(0xFFD700) for 100ms
  - Brief knockback impulse opposite to damage source
  - 2 second invincibility with gentle alpha pulse (0.5 to 1.0 loop)
  - Light screen shake

- DEVOTION METER:
  - Fills from: lotus pickup (+5%), enemy kill (+10%), time without damage (+1%/sec)
  - Drains: taking damage (-20%)
  - When full: Q key = "Jai Hanuman" special
  - Special: screen flashes gold (additive overlay), all enemies on screen take 999 damage,
    5000 bonus points, camera zoom out briefly, meter resets
  - Display as ornate bar below health hearts

### 1E. Scoring System
```
src/systems/ScoreManager.js:
- Points: Lotus = 100, Demon kill = 200, Guard kill = 500, Boss hit = 1000
- Combo: Kills within 3 seconds multiply (x2, x3, x4 max). Show floating multiplier.
- Zone completion bonus: 1000 per zone
- No-hit zone bonus: 2000
- Level grade: S (>90% of max) / A (>70%) / B (>50%) / C (rest)
- Persistent across levels within an act, resets between acts
- Display: top-right corner, combo multiplier appears center-screen when active
```

### 1F. Camera System
- Smooth follow with CAMERA LEAD: offset = velocity * 0.3, lerp at 0.08
- Velocity zoom: faster movement = slight zoom out (5-10%)
- Boss zoom: slight zoom in during boss fights
- Screen shake function: shake(duration, intensity) reusable
- Altitude tint overlay for Act 1:
  - 0-2000m: warm amber (0.1 opacity overlay)
  - 2000-5000m: neutral
  - 5000-8000m: cool indigo (0.1 opacity)
  - 8000-9000m: intensifying golden glow

### 1G. Particle Manager
```
src/systems/ParticleManager.js:
Create and manage these persistent particle systems:
- divineMotes: tiny golden-white dots floating upward, always running
- movementTrail: triggers when player velocity > threshold, golden streaks
- lotusPickup: burst of pink-gold petals spiraling inward to player
- maceImpact: golden starburst at collision point
- dashGhost: handled in Player dash state (sprite copies, not particles)
- altitudeLeaves: green-gold leaves at low altitude
- altitudeClouds: white wisps at mid altitude  
- altitudeStars: warm-tinted star twinkles at high altitude
- altitudeEmbers: rising golden sparks near the sun

Switch active altitude particles based on player.y position.
Use Phaser particle emitter manager — createEmitter() for each.
```

---

## PHASE 2: PARALLAX & ATMOSPHERE SYSTEM

### 2A. Deep Parallax (8-10 layers)
Replace existing background system with layered parallax:

```javascript
// Layer order (back to front) with scroll multipliers:
const PARALLAX_LAYERS = [
  { key: 'bg-sky-dawn', scrollFactor: 0.0, depth: -100 },      // static sky
  { key: 'bg-sky-cosmic', scrollFactor: 0.0, depth: -99 },      // fades in at altitude
  { key: 'bg-mountains-far', scrollFactor: 0.1, depth: -80 },
  { key: 'bg-mountains-near', scrollFactor: 0.2, depth: -70 },
  { key: 'bg-clouds-far', scrollFactor: 0.3, depth: -60 },
  { key: 'bg-clouds-near', scrollFactor: 0.5, depth: -50 },
  // === GAMEPLAY LAYER (depth 0) ===
  { key: 'bg-foreground-leaves', scrollFactor: 1.2, depth: 50 }, // parallax foreground
];
```

Each layer is a TileSprite that scrolls at its multiplier.
The cosmic sky layer should crossfade IN (alpha 0→1) as altitude increases past 6000m.
The forest/mountain layers should crossfade OUT as altitude passes 3000m.

For now, generate procedural gradient textures for each layer if PNGs don't exist.
Use canvas graphics to create convincing placeholder skies and clouds.

### 2B. Glow Effects (Additive Blend)
Do NOT use Phaser Light2D. Instead:
- Create soft-edge radial gradient sprites (circle with gaussian falloff)
- Place behind golden objects with blendMode: Phaser.BlendModes.ADD
- Sun: 3 overlapping glow sprites at different sizes for corona effect
- Mace: small golden glow parented to weapon sprite
- Lotus pickup: soft pink-white glow, pulse scale tween
- Vajra projectile: violet-white glow

---

## PHASE 3: ALL 5 ACTS + EPILOGUE

Build ALL acts with procedural placeholder art. Each act should be PLAYABLE.
Focus on distinct gameplay feel per act — variety through contrast, not just reskinning.

### Act 1 — "Flight to the Sun" (ALREADY EXISTS — UPGRADE)

**Level 1 — "Dawn Flight"**
Already coded. Upgrade with:
- New movement system (FSM, momentum, dash)
- 3 altitude zones with distinct atmosphere
- Zone 1 (0-2000m): Forest canopy, no enemies, tutorial. Warm dawn.
- Zone 2 (2000-5000m): Cloud layer. Cloud demons (easy patrol).
- Zone 3 (5000-8000m): Cosmic. Celestial guards (faster, swooping).
- Goal: reach Sun at 9000m altitude

**Level 2 — "Higher and Higher"**
Already coded. Upgrade with:
- Faster pace, more enemies, asteroid obstacle corridors
- Dash tutorial prompt (if player hasn't used dash yet)
- Sacred verse fragments appear as collectible text at milestones

**Boss — "Indra's Wrath"**
Already coded. Upgrade with:
- Indra on Airavata (elephant mount) at top of arena
- Phase 1: Dodge vajra bolts (telegraph with purple flash 1 sec before). 
  Attack mace at vajra to deflect back at Indra. 3 deflections = phase change.
- Phase 2: Indra swoops down for charge attacks. Dodge + counterattack windows.
- Phase 3: Multiple vajras, faster pattern. Indra's crown glows = vulnerable window.
- Defeat cutscene: vajra hits Hanuman's jaw, slow-motion fall, Chalisa verse.

### Act 2 — "The Awakening" (NEW — HORIZONTAL PLATFORMER)

**Core change: This act is SIDE-SCROLLING, not vertical flight.**
Hanuman is depowered (sages' curse). Flight is disabled. 
He can: run, jump, wall-jump, wall-slide, basic mace attack.

**Level 1 — "The Sacred Forest"**
- Lush forest environment. Green-gold palette.
- Platforming through tree canopies, across rivers, over rocks.
- Enemies: forest asuras (ground patrol), swooping birds
- Collectibles: wisdom scrolls (replace lotuses) that unlock Chalisa verses
- Teach wall-jump mechanic (needed for level progression)
- Mood: peaceful training, humility, learning

**Level 2 — "The Rishi's Trials"**
- Ancient ashram and training grounds
- Obstacle courses: moving platforms, falling rocks, timed jumps
- Mini-encounters with rishis who test Hanuman (non-combat puzzles)
- Progressive ability hints: "you are stronger than you know"
- More challenging platforming, but generous checkpoints

**Boss — "The Shadow Self"**
- Hanuman fights a dark mirror version of himself (shadow Hanuman)
- Shadow copies player's moves with slight delay
- Must use mace timing to hit shadow during its attack wind-up
- Defeat unlocks a memory: "Until you look in Sri Ram's eyes"
- Cutscene: meeting Ram (golden light, powers restored, Chalisa verse)
- After cutscene: flight ability re-enabled for all subsequent acts

### Act 3 — "The Ocean Crossing" (NEW — HORIZONTAL FLIGHT)

**Core change: Horizontal flight over the ocean. MASSIVE scale.**
Hanuman has full powers restored. This act should feel EPIC.

**Level 1 — "The Leap"**
- Horizontal flight across ocean at high speed
- Ocean waves below with parallax layers (far waves, near waves, spray)
- Obstacles: storm clouds, water spouts, floating debris
- Encounter: Mt. Mainak (friendly mountain rises from ocean, offers rest)
  - If player lands on it: health restore, bonus points, brief safe zone
  - If player flies past: nothing bad happens, but missed opportunity
- Collectibles: sacred lotuses floating on wind currents

**Level 2 — "Surasa and Simhika"**
- Two mini-boss encounters mid-flight
- SURASA (giant mouth demoness): 
  Her massive mouth opens ahead, filling half the screen.
  PUZZLE BOSS: player must shrink (press DOWN to curl up small)
  and fly INTO her mouth then OUT through her ear. 
  Combat doesn't work — she grows bigger if you attack.
  This teaches players that not every problem is solved with the mace.
- SIMHIKA (shadow grabber):
  A dark form below the ocean tries to grab Hanuman's shadow.
  Player must stay in well-lit areas (golden light patches in sky).
  If shadow is grabbed, movement slows dramatically until you mace-attack to break free.

**Boss — "Lankini, Guardian of Lanka"**
- Demoness guards the gates of Lanka
- Ground-based fight on Lanka's outer wall (platforming + combat)
- Lankini has: charge attack, ground slam (shockwave jump), summon minions
- 3 hit phases, each faster
- Defeat opens the gates: dramatic reveal of Lanka's golden architecture

### Act 4 — "Lanka" (NEW — INFILTRATION + FIRE)

**Core change: Tighter level design, then explosive set piece.**

**Level 1 — "The Ashoka Garden"**
- Hanuman sneaks through Lanka at night
- NOT forced stealth — player CAN fight but enemies are tougher here
- Optional stealth path: hidden routes through gardens, rooftops
- Goal: reach the Ashoka garden where Sita is held
- Encounter with Sita: emotional cutscene (comic panel transition)
  Hanuman kneels, offers Ram's ring, Sita speaks of courage
  Chalisa verse: "Ram dware tum rakhvare, hot na agya bin paisare"

**Level 2 — "Lanka Burns"**
- Hanuman's tail is set on fire (by Ravana's forces)
- GAMEPLAY TWIST: Hanuman IS the weapon now
- Side-scrolling action: fly across Lanka rooftops
- Touching buildings sets them on fire (visual spectacle)
- Enemies rush at you but tail-fire damages them on contact
- This level should feel LIBERATING — raw divine fury
- The fire spreads behind you as parallax effect (Lanka burning in background)
- Timer: escape Lanka before the fire consumes everything
- End: leap off Lanka's coast, fly over ocean, Chalisa verse

### Act 5 — "The Great War" (NEW — EPIC COMBAT)

**Core change: Large-scale battles, power fantasy, emotional weight.**

**Level 1 — "The Bridge"**
- Side-scrolling: Hanuman helps build Ram Setu (bridge to Lanka)
- Carry boulders (pickup and throw mechanic — temporary)
- Fight off sea demons attacking the bridge builders
- Vanara army NPCs working alongside (adds scale)
- Mood: camaraderie, purpose, preparing for war

**Level 2 — "The Battlefield"**
- All-out combat across Lanka's battlefield
- GIANT FORM: Hanuman can temporarily grow to 3x size 
  (Devotion meter activates this instead of screen-clear in this act)
  Giant form: increased damage, wider mace range, stomping damages ground enemies
- Waves of rakshasa enemies, increasing difficulty
- Support: vanara allies fight alongside (ambient, not controllable)
- Mid-level: Lakshmana falls! Ram cries out!

**Level 3 — "Sanjeevani" (TIME PRESSURE FLIGHT)**
- Vertical/diagonal flight — race to the Himalayas
- TIMER: Lakshmana dies at dawn. Sky is slowly brightening.
- Fly through night sky, dodge obstacles at high speed
- Reach the mountain: Hanuman can't identify the herb
- GAME MOMENT: prompt says "Which herb?" — no right answer possible
  Hanuman rips the ENTIRE MOUNTAIN out of the ground
- Fly back carrying the mountain (player sprite changes, movement heavier)
- Reach camp before dawn = success
- This should be the most EXCITING level in the game

**Boss — "Ahiravana" (Underworld Demon King)**
- Ahiravana has kidnapped Ram and Lakshmana to the underworld
- Dark cavern arena, fire-lit, oppressive
- Ahiravana: teleports, summons shadow clones, dark energy projectiles
- Mechanic: must extinguish 5 ritual flames simultaneously (figure out order)
  Each flame extinguished weakens Ahiravana
- Final phase: direct combat, all abilities available
- Defeat: Ram and Lakshmana freed, Hanuman kneels, Chalisa verse

**Act 5 Finale — "The Fall of Ravana" (CUTSCENE + LIGHT GAMEPLAY)**
- Not a boss fight for Hanuman — Ram fights Ravana
- Player watches from a vantage point (parallax cinematic)
- Light gameplay: deflect stray projectiles heading toward Ram's army
- Ram fires the Brahmastra → Ravana falls
- Hanuman witnesses dharma's triumph
- Comic panel transition: page 20

### Epilogue — "Return to Ayodhya"

- Peaceful horizontal flight: no enemies, no obstacles
- Beautiful environment: sunset → twilight → lamp-lit Ayodhya below
- Lotuses to collect (optional, purely for score/completion)
- NPCs visible below celebrating (Diwali lights, crowds)
- Hanuman descends, kneels before Ram
- Final Chalisa verse: full closing prayer
- Score tally → total game grade → credits
- Credits: scroll through ALL comic panels with Chalisa chanting audio
- Post-credits: cosmic Hanuman meditating among stars (comic page 21)

---

## PHASE 4: CHALISA SYSTEM

### Transition Scenes
```
src/scenes/ChalisaTransition.js — upgrade:
Each transition displays:
1. Background: dark with golden border frame
   (Later: cropped comic panel with Ken Burns pan — when assets arrive)
2. Chalisa verse text (English transliteration — we cannot render Devanagari reliably)
3. English translation below
4. Narrative context line
5. Typewriter text animation (characters appear one by one)
6. Duration: 8 seconds, skip with SPACE
7. Gold particle border animation
```

### Verse Assignments
Store all verses in config.js as a structured object:
```javascript
const CHALISA_VERSES = {
  act1_opening: {
    transliteration: "Bal samay ravi bhakshi liyo, tahi madhur phal jani",
    english: "In childhood, He swallowed the sun, thinking it a sweet fruit",
    context: "The child Hanuman, seeing the blazing sun, mistook it for a ripe mango..."
  },
  act1_level2: {
    transliteration: "Jug sahastra jojan par bhanu, leelyo tahi madhur phal janu",
    english: "The sun, sixteen thousand miles away, you swallowed like a fruit",
    context: "Higher and higher he flew, the heavens trembling at his audacity..."
  },
  act1_boss: {
    transliteration: "Bhoot pisach nikat nahi aave, mahabir jab nam sunave",
    english: "No ghost or demon dares approach when great Hanuman's name is spoken",
    context: "Indra, king of gods, hurled his thunderbolt at the child..."
  },
  death: {
    transliteration: "Sankat se Hanuman chhudave, man kram bachan dhyan jo lave",
    english: "Hanuman rescues from all troubles those who remember him",
    context: "Rise again, devotee. The path continues."
  },
  act2_opening: {
    transliteration: "Vidyavan guni ati chatur, Ram kaj karibe ko aatur",
    english: "Full of wisdom, virtue and wit, ever eager to serve Sri Ram",
    context: "In the sacred forest, young Hanuman learned at the feet of the sages..."
  },
  act2_boss: {
    transliteration: "Raghupati kinhi bahut badai, tum mama priya Bharat-hi sam bhai",
    english: "Ram praised him greatly: You are dear to me as my brother Bharat",
    context: "Looking into the Lord's eyes, the curse was shattered..."
  },
  act3_opening: {
    transliteration: "Prabhu mudrika meli mukh mahee, jaladhi langhi gaye achraj nahee",  
    english: "Placing the Lord's ring in his mouth, crossing the ocean was no surprise",
    context: "To find Ma Sita, he stepped into the unknown..."
  },
  act4_opening: {
    transliteration: "Suksham roop dhari Siyahi dikhava, bikat roop dhari Lank jarava",
    english: "In tiny form he appeared to Sita, in terrible form he burned Lanka",
    context: "In the presence of truth, illusion dissolved — and Lanka burned."
  },
  act5_opening: {
    transliteration: "Bhima roop dhari asur sanghare, Ramchandra ke kaj sanvare",
    english: "Taking fierce form he destroyed the demons, completing Ram's mission",
    context: "One warrior, with the strength of a million..."
  },
  act5_sanjeevani: {
    transliteration: "Laye Sanjivan Lakhan jiyaye, Shri Raghubir harashi ur laye",
    english: "He brought Sanjeevani and revived Lakshmana, Ram embraced him with joy",
    context: "When hope was fading, he carried a mountain to bring back life."
  },
  victory: {
    transliteration: "Jai Jai Jai Hanuman Gosai, kripa karahu guru dev ki nai",
    english: "Glory, glory, glory to Lord Hanuman! Bestow grace as our divine guru",
    context: "Boundless as the sky, empty of all self, full of Sri Ram."
  },
  epilogue: {
    transliteration: "Pavan tanay sankat haran, Mangal murti roop",
    english: "Son of the Wind, destroyer of sorrow, embodiment of auspiciousness",
    context: "And so the story lives on, in every heart that calls his name."
  }
};
```

### Death Screen
When player health reaches 0:
1. Slow-motion (timeScale 0.3) for 1 second
2. Screen desaturates to sepia
3. Chalisa death verse fades in (centered, ornate text)
4. "Rise again, devotee" subtitle
5. 3 seconds pause
6. Respawn at last checkpoint with golden glow burst
7. Brief invincibility (3 seconds)

---

## PHASE 5: TITLE SCREEN & MENUS

### Title Screen
- Background: animated parallax (reuse Act 1 backgrounds)
- Title: "HANUMAN" in large ornate gold text (use a Google Font that works: 
  consider "Cinzel Decorative" or similar serif)
- Subtitle: "Journey of the Divine"
- "A DharmaWeave Game" at bottom
- Menu: New Game / Continue / Act Select
- Ambient: golden divine motes particle system
- Press SPACE or click to start

### Act Select Screen  
- Show all 5 acts + epilogue as chapter cards
- Locked acts show darkened with lock icon
- Completed acts show grade (S/A/B/C) and best score
- Each card has the act title and a small Chalisa verse excerpt

### Pause Menu (ESC)
- Resume / Restart Level / Act Select / Quit to Title
- Semi-transparent dark overlay with gold border

---

## TECHNICAL NOTES

### Asset Loading Strategy
```javascript
// In BootScene.preload():
// Try to load real PNG, fall back to procedural if not found
// Use Phaser's file error handler:
this.load.on('fileerror', (key) => {
  console.log(`Asset ${key} not found, using procedural`);
  // Flag this asset for procedural generation
  this.registry.set(`procedural_${key}`, true);
});
```

### Scene Flow
```
BootScene → TitleScene → [Act Select or New Game]
  → ChalisaTransition (act opening verse)
    → Act1Level1 → ChalisaTransition → Act1Level2 → ChalisaTransition → Act1Boss
      → ActComplete (score tally) → ChalisaTransition (next act verse)
        → Act2Level1 → ... etc
          → Epilogue → Credits → TitleScene
```

### Save System
Use localStorage to persist:
- Highest act/level unlocked
- Best scores per level
- Best grades per level
- Total lotuses/scrolls collected

### Performance Budget
- Target: 60fps on desktop Chrome, 30fps on mobile
- Max simultaneous particles: 200
- Max parallax layers: 10
- Max active enemies: 8
- Spritesheet frames per character: up to 16

---

## BUILD ORDER FOR THIS SESSION

1. Core engine: FSM, movement physics, dash, camera (45 min)
2. Combat feel: hit-stop, damage feedback, devotion meter, scoring (30 min)
3. Particle manager + parallax system (30 min)
4. Upgrade Act 1 (all 3 levels) with new systems (30 min)
5. Build Act 2 — The Awakening (45 min)
6. Build Act 3 — The Ocean Crossing (45 min)
7. Build Act 4 — Lanka (45 min)
8. Build Act 5 — The Great War (60 min)
9. Build Epilogue (15 min)
10. Chalisa system, transitions, death/victory flows (30 min)
11. Title screen, act select, pause menu, save system (30 min)
12. Polish pass: difficulty tuning, checkpoint placement, bug sweep (30 min)

Total estimated: ~7 hours of autonomous coding

The game should be PLAYABLE end-to-end when you're done.
All with procedural art that looks good enough to demonstrate the full experience.
Real illustrated art will replace procedural assets as it arrives in /public/.

GO BUILD. Make it incredible. Jai Hanuman. 🙏
