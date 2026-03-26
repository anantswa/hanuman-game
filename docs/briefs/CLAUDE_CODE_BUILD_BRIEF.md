# HANUMAN GAME — Updated Claude Code Brief v2
## Incorporating Deep Research from ChatGPT + Gemini
## March 26, 2026

---

## WHAT CHANGED FROM v1

This brief incorporates specific technical findings from two deep research reports:
1. ChatGPT: Ori's exact visual pipeline + Phaser 3 performance ceiling
2. Gemini: "Juice" techniques + mythology game design + AI art pipeline

Key technical upgrades from research:
- Use rexHorrifiPipeline for single-pass post-processing (bloom+vignette+chromatic aberration)
- Hit-stop should use timeScale=0.01 not 0 (keeps shaders alive during freeze)
- Bake motion blur INTO sprite frames (Ori's "free awesome motion blur" trick)
- Half-Gravity Jump Peak for divine weightlessness
- Jump Buffering + Corner Correction (not just Coyote Time)
- Texture atlas strategy is CRITICAL for Phaser 3 batching performance
- Layer fog tinting per biome = cheapest path to Ori warm/cold atmosphere
- Devotion gauge dynamically linked to bloom intensity
- 150ms coyote time window (not 100ms)

---

## CONTEXT

Repo: github.com/anantswa/hanuman-game
Stack: Phaser 3.90, Vite 8, vanilla JS
Resolution: 800x600 (scales to fit)
Current state: Act 1 coded (3 levels), procedural placeholder art

## YOUR MISSION

Build the FULL GAME — all 5 acts + epilogue — with production-quality game feel.
Procedural art that auto-upgrades when PNGs arrive in /public/.
Make it FEEL incredible even with placeholder visuals.

---

## PHASE 1: ENGINE FOUNDATION

### 1A. Player FSM
States: IDLE, RUNNING, JUMPING, FLYING, GLIDING, DASHING, ATTACKING, HURT, DEAD, KNEELING
Each state: enter(), update(), exit() methods.
State transitions are explicit and controlled.

### 1B. Movement Physics — "Divine Monkey Feel"

**Acceleration & Deceleration:**
- Ramp to max speed over ~0.3 seconds (acceleration curve, not instant)
- Deceleration "slide" over ~0.2 seconds when input released
- Gentle gravity when not flying (float, don't plummet)
- Full air control while airborne

**Kinetic Forgiveness Suite (from Celeste/Ori research):**

```javascript
// COYOTE TIME: 150ms grace window after leaving a ledge
// Store lastGroundedTime, allow jump if currentTime - lastGroundedTime < 150
const COYOTE_TIME = 150; // ms

// JUMP BUFFERING: Register jump pressed shortly BEFORE landing
// Store jumpPressedTime, execute jump if player lands within 100ms
const JUMP_BUFFER = 100; // ms

// CORNER CORRECTION: If player clips tile corner during jump,
// nudge x-position by up to 4px to let them through
const CORNER_CORRECTION_PX = 4;

// HALF-GRAVITY JUMP PEAK: When jump button is HELD and velocity is
// near zero at apex, halve gravity for divine weightlessness
// This makes Hanuman's jumps feel cosmic and sacred
if (jumpHeld && Math.abs(body.velocity.y) < 50) {
    body.gravity.y = NORMAL_GRAVITY * 0.5;
}
```

### 1C. Vayu-Dash
- SHIFT triggers dash in facing direction
- 3x velocity for 0.3 seconds, 1.5 second cooldown
- Invincibility frames during dash
- GHOSTING: 4 sprite copies at 0.6/0.4/0.2/0.1 opacity, saffron tinted (0xFF6600)
- Golden particle trail
- Camera slight zoom-out during dash

### 1D. Combat Feel — Hit-Stop System

**CRITICAL TECHNICAL DETAIL FROM RESEARCH:**
Use timeScale = 0.01 (NOT 0) during hit-stop. This keeps post-processing
shaders (bloom, vignette) alive and animating during the freeze, maintaining
the visual richness. A hard 0 looks dead.

```javascript
// CombatFeel.js
hitStop(duration = 60, magnitude = 1.0) {
    // Use 0.01 not 0 — keeps shaders alive (from Gemini research)
    this.scene.time.timeScale = 0.01;
    this.scene.cameras.main.shake(duration * 0.8, 0.008 * magnitude);
    
    // Flash enemy white
    enemy.setTintFill(0xFFFFFF);
    
    // Restore after duration
    this.scene.time.delayedCall(duration, () => {
        this.scene.time.timeScale = 1;
        enemy.clearTint();
    });
}

// Camera Punch: rapid zoom toward impact point, eased recovery
cameraPunch(x, y, intensity = 0.03) {
    const cam = this.scene.cameras.main;
    cam.zoom += intensity;
    this.scene.tweens.add({
        targets: cam,
        zoom: 1.0,
        duration: 300,
        ease: 'Back.easeOut' // Non-linear recovery (from Gemini research)
    });
}
```

**Mace Attack:**
- Hit-stop: 60ms freeze (timeScale=0.01) + camera shake + camera punch
- Particle burst: golden starburst at impact
- Enemy flash white for 100ms

**Damage Received:**
- Golden flicker (setTintFill 0xFFD700 for 100ms)
- Knockback impulse opposite damage source
- 2 second invincibility with alpha pulse (0.5 to 1.0)

### 1E. Scoring System
```
ScoreManager.js:
- Lotus = 100, Demon = 200, Guard = 500, Boss hit = 1000
- Combo: kills within 3 sec = x2/x3/x4 multiplier, floating text
- Zone bonuses, no-hit bonuses, level grades (S/A/B/C)
- Persistent within act, resets between acts
```

### 1F. Devotion Meter — LINKED TO WORLD BLOOM

**Key insight from Gemini research:**
The devotion gauge should dynamically control the bloom intensity of the
entire scene. As Hanuman's devotion rises, the world literally glows brighter.
This creates a feedback loop where playing well = the world becoming more divine.

```javascript
// DevotionMeter.js
update() {
    // Dynamically link devotion to bloom intensity
    const bloomFX = this.scene.cameras.main.postFX.get('bloom');
    if (bloomFX) {
        bloomFX.strength = 0.3 + (this.meter * 0.7); // 0.3 base, up to 1.0
    }
}

// Fills from: lotus (+5%), kill (+10%), no-damage time (+1%/sec)
// Drains from: damage taken (-20%)
// When full: Q = "Jai Hanuman" special (screen-clear, 5000 points)
```

### 1G. Camera System

```javascript
// Camera lead: look ahead in direction of travel
const leadX = player.body.velocity.x * 0.3;
const leadY = player.body.velocity.y * 0.2;
camera.setFollowOffset(-leadX, -leadY);
camera.setLerp(0.08, 0.08); // Smooth, slightly lagging (from Gemini research)

// Velocity zoom: faster = wider view
const speed = player.body.speed;
const targetZoom = Phaser.Math.Clamp(1.0 - (speed * 0.0003), 0.9, 1.0);
camera.zoom = Phaser.Math.Linear(camera.zoom, targetZoom, 0.05);

// Boss zoom: tighter during boss fights
// Set via scene flag: camera.targetZoom = 1.05 during boss

// Altitude tint: use a semi-transparent rectangle overlay
// that shifts color based on player Y position
```

---

## PHASE 2: ATMOSPHERE & RENDERING

### 2A. Post-Processing — rexHorrifiPipeline

**Key finding from both research reports:**
Use the rexHorrifiPipeline plugin. It collapses vignette, noise, bloom,
and chromatic aberration into a SINGLE fragment shader pass, reducing
draw call overhead dramatically vs stacking separate FX.

```javascript
// Install: copy rex horrifi pipeline plugin
// In scene create():
const postFxPlugin = this.plugins.get('rexHorrifiPipeline');
const fx = postFxPlugin.add(this.cameras.main, {
    enable: true,
    // Bloom
    bloomEnable: true,
    bloomRadius: 0.5,
    bloomIntensity: 0.3,    // Base — dynamically linked to devotion meter
    bloomThreshold: 0.6,
    // Vignette  
    vignetteEnable: true,
    vignetteStrength: 0.3,
    vignetteIntensity: 0.3,
    // Chromatic Aberration (subtle, for impacts only)
    chromaticEnable: false,  // Enable momentarily on big hits
    chabIntensity: 0.005,
    // Noise (very subtle film grain for painterly feel)
    noiseEnable: true,
    noiseStrength: 0.03,
    noiseSeed: Math.random(),
});
```

If rexHorrifiPipeline is not available, fall back to Phaser's built-in
FX pipeline with bloom + vignette applied to camera.

### 2B. Deep Parallax (8-10 layers)

**CRITICAL PERFORMANCE INSIGHT FROM CHATGPT RESEARCH:**
Texture atlas discipline is the #1 performance lever in Phaser 3.
Each texture switch flushes the WebGL batch. Group parallax layers into
shared atlases where possible. Avoid stacking many large semi-transparent
fog cards (fill-rate killer on mobile).

```javascript
const PARALLAX_CONFIG = [
    // Far layers — slow scroll, atmospheric
    { key: 'bg-sky', scrollFactor: 0.0, depth: -100, fogTint: null },
    { key: 'bg-cosmic', scrollFactor: 0.0, depth: -99, alpha: 0 }, // fades in at altitude
    { key: 'bg-mountains-far', scrollFactor: 0.1, depth: -80, fogTint: 0x1A0A2E },
    { key: 'bg-mountains-near', scrollFactor: 0.2, depth: -70, fogTint: 0x2D1B69 },
    { key: 'bg-clouds-far', scrollFactor: 0.3, depth: -60 },
    { key: 'bg-clouds-near', scrollFactor: 0.5, depth: -50 },
    // === GAMEPLAY at depth 0 ===
    { key: 'bg-foreground', scrollFactor: 1.3, depth: 50 }, // IN FRONT of player
];

// DEPTH FOG SYSTEM (from Ori research):
// Each layer gets a semi-transparent color overlay that shifts per biome/altitude
// This is Ori's "custom fog with colors blended over depth" translated to Phaser
// Far layers: more fog opacity. Near layers: less fog.
// Warm biomes: fog tinted amber. Cool biomes: fog tinted indigo.
```

### 2C. Altitude Realm-Passage System

The ascent in Act 1 should feel like passing through spiritual realms,
not just scrolling past textures. Smooth crossfading between atmosphere states.

```javascript
// AltitudeManager.js
const ZONES = [
    { minAlt: 0, maxAlt: 2000, name: 'forest', 
      fogColor: 0xFFAA33, fogAlpha: 0.08, skyAlpha: 1.0, cosmicAlpha: 0.0,
      particles: 'leaves', ambientTint: 'warm' },
    { minAlt: 2000, maxAlt: 5000, name: 'clouds',
      fogColor: 0xFFFFFF, fogAlpha: 0.05, skyAlpha: 1.0, cosmicAlpha: 0.0,
      particles: 'cloudWisps', ambientTint: 'neutral' },
    { minAlt: 5000, maxAlt: 8000, name: 'cosmic',
      fogColor: 0x1A0A2E, fogAlpha: 0.06, skyAlpha: 0.3, cosmicAlpha: 0.8,
      particles: 'stars', ambientTint: 'cool' },
    { minAlt: 8000, maxAlt: 9500, name: 'sun',
      fogColor: 0xFFD700, fogAlpha: 0.15, skyAlpha: 0.0, cosmicAlpha: 0.5,
      particles: 'embers', ambientTint: 'golden' },
];

// Lerp ALL values between zones based on player altitude
// No hard cuts — smooth continuous transition
```

### 2D. Glow System (Additive Sprites, NOT Light2D)

**Both research reports confirm: additive blend sprites, not dynamic lighting.**
Ori used "sprite-centric lighting cheats" not physically-based lighting.

```javascript
// Create soft radial gradient texture procedurally
function createGlowTexture(scene, key, color, radius) {
    const rt = scene.add.renderTexture(0, 0, radius*2, radius*2);
    // Draw gaussian falloff circle
    const graphics = scene.add.graphics();
    for (let i = radius; i > 0; i -= 2) {
        const alpha = (1 - (i / radius)) * 0.3;
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(radius, radius, i);
    }
    rt.draw(graphics);
    graphics.destroy();
    rt.saveTexture(key);
    rt.destroy();
}

// Usage: place behind golden objects
const sunGlow = scene.add.image(sun.x, sun.y, 'glow-golden')
    .setBlendMode(Phaser.BlendModes.ADD)
    .setScale(3)
    .setAlpha(0.4);
```

### 2E. Particle Manager

```javascript
// ParticleManager.js — ambient atmosphere particles
// Run continuously, switch based on altitude zone

createDivineMotes(scene) {
    // Tiny golden dots floating upward — ALWAYS running
    return scene.add.particles(0, 0, 'particle-dot', {
        x: { min: 0, max: 800 },
        y: { min: 0, max: 600 },
        speed: { min: 5, max: 20 },
        angle: { min: 260, max: 280 }, // mostly upward
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: { min: 3000, max: 6000 },
        frequency: 200, // one every 200ms — low count, big impact
        tint: 0xFFD700,
        blendMode: 'ADD',
    });
}

// Keep total particle count under 200 for mobile performance
// Use frequency control, not maxParticles, to throttle
```

---

## PHASE 3: ALL 5 ACTS + EPILOGUE

[Same act structure as v1 brief — Act 1 through Epilogue]
[Including: vertical flight, horizontal platforming, ocean crossing, 
Lanka infiltration, war + Sanjeevani race, peaceful return]

Key addition from Gemini research — SIDDHI SYSTEM:

### Siddhi Skill Tree (Unlocks across acts)

The 8 Siddhis (divine powers) from the Chalisa map to gameplay abilities:

```javascript
const SIDDHIS = {
    anima: { name: 'Anima (Shrinking)', act: 3,
        desc: 'Shrink to tiny size — used for Surasa boss puzzle',
        mechanic: 'Press DOWN while flying to shrink. Smaller hitbox, can enter small spaces.' },
    mahima: { name: 'Mahima (Growth)', act: 5,
        desc: 'Grow to giant size during war',
        mechanic: 'Devotion meter full = grow 3x size. More damage, wider mace.' },
    laghima: { name: 'Laghima (Weightlessness)', act: 1,
        desc: 'Divine flight — the core mechanic',
        mechanic: 'Hold UP to fly. Half-gravity at apex.' },
    garima: { name: 'Garima (Weight)', act: 5,
        desc: 'Ground pound attack',
        mechanic: 'Press DOWN while airborne = devastating ground slam.' },
    prapti: { name: 'Prapti (Reach)', act: 3,
        desc: 'Extended mace range during ocean crossing',
        mechanic: 'Mace attack range increased 1.5x.' },
    prakamya: { name: 'Prakamya (Irresistible Will)', act: 4,
        desc: 'Break through barriers in Lanka',
        mechanic: 'Dash can break through destructible walls.' },
    isitva: { name: 'Isitva (Supremacy)', act: 5,
        desc: 'Command vanara allies',
        mechanic: 'Q summons allied warriors to fight alongside.' },
    vasitva: { name: 'Vasitva (Control)', act: 4,
        desc: 'Tail fire control in Lanka',
        mechanic: 'Tail fire damages enemies on contact. Toggle with V.' },
};
```

Each Siddhi unlocks at the start of its act with a Chalisa verse transition.
The verse explains the power. This makes the Chalisa mechanically meaningful, 
not just decorative.

---

## PHASE 4: CHALISA SYSTEM

### Vibration Combat (from Gemini research — experimental, implement if time allows)

Map mace hits to Chalisa syllables. A hit counter tracks syllables.
When a full verse is completed through combat, trigger "Divine Intervention" —
a screen-clearing golden wave with the verse displayed.

```javascript
// VibrationCombat.js
const CHAUPAI_SYLLABLES = 16; // syllables per half-verse
let hitCounter = 0;

onMaceHit() {
    hitCounter++;
    // Visual: each hit pulses a syllable marker on screen
    if (hitCounter >= CHAUPAI_SYLLABLES) {
        triggerDivineIntervention();
        hitCounter = 0;
    }
}
```

This is optional/experimental but would be genuinely unique if implemented.

### Death Screen
Same as v1: slow-motion, desaturation, Chalisa verse, gentle respawn.

### Transition Scenes  
Same as v1: comic panel backgrounds + verse cards + typewriter animation.

---

## PHASE 5: PERFORMANCE OPTIMIZATION

**From ChatGPT research — these are the #1 priority for Phaser 3:**

### Texture Atlas Strategy
```
CRITICAL: Every texture switch flushes the WebGL batch.
Plan atlases BY ACT:
- act1-atlas.png: all Act 1 backgrounds, enemies, objects
- character-atlas.png: all Hanuman poses across all acts  
- effects-atlas.png: particles, glows, UI elements
- ui-atlas.png: hearts, meters, score display

Use Phaser's built-in texture packer or TexturePacker tool.
Target: <8 texture binds per frame for 60fps on mobile.
```

### Object Pooling
```
Pool ALL frequently created/destroyed objects:
- Enemy bullets / vajra projectiles
- Particle bursts (reuse emitters, don't create new ones)
- Floating score text
- Lotus pickups
```

### Mobile Performance Budget
```
Target: 60fps desktop, 30fps mobile
Max simultaneous particles: 200 (use frequency control)
Max parallax layers: 10 (but minimize alpha overlap)
Max active enemies: 8
Avoid stacking large semi-transparent sprites (fill-rate killer)
Consider Canvas fallback for very old mobile devices
```

---

## PHASE 6: TITLE, MENUS, SAVE

[Same as v1: title screen, act select, pause menu, localStorage save]

---

## BUILD ORDER

1. Core engine: FSM, movement physics, kinetic forgiveness suite (45 min)
2. Combat feel: hit-stop (timeScale=0.01), damage feedback, devotion meter (30 min)  
3. Post-processing: rexHorrifiPipeline or built-in FX stack (15 min)
4. Particles + parallax + altitude system (30 min)
5. Glow system: additive sprites for sun, mace, pickups (15 min)
6. Upgrade Act 1 with all new systems (30 min)
7. Build Act 2 — The Awakening (45 min)
8. Build Act 3 — Ocean Crossing + Siddhi unlocks (45 min)
9. Build Act 4 — Lanka infiltration + fire (45 min)
10. Build Act 5 — War + Sanjeevani + Ahiravana (60 min)
11. Build Epilogue (15 min)
12. Chalisa system + transitions + Siddhi tree (30 min)
13. Title screen, menus, save system (30 min)
14. Performance: atlas planning, pooling, mobile test (30 min)
15. Polish: difficulty tuning, checkpoints, bug sweep (30 min)

Total: ~8 hours autonomous coding

**The game should be FULLY PLAYABLE end-to-end when done.**

GO BUILD. Jai Hanuman. 🙏
