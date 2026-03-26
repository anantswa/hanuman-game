# HANUMAN — Journey of the Divine
## Master Game Plan v1.0
### Consolidated by Claude (Brainstorm Hub) — March 26, 2026

---

## 1. VISION STATEMENT

**Target feel:** Ori and the Blind Forest meets the DharmaWeave Hanuman graphic novel.
A 2.5D painterly side-scroller where the player embodies Hanuman's divine journey — 
from childhood innocence through awakening to full divine power. 
The Hanuman Chalisa is the spine: every act, every transition, every death screen 
is rooted in its verses.

**Design pillars:**
1. **Beautiful** — Ori-level atmospheric depth, warm oil-painting luminosity from the comic
2. **Accessible** — Easy side of engaging. "Devotional flow state" — feel powerful, not punished
3. **Meaningful** — Chalisa woven into gameplay, not just decoration
4. **Fun** — Movement feels incredible. Combat feels divine. Scoring drives replayability

---

## 2. TECHNICAL REALITY CHECK

### Can Phaser 3 deliver Ori-level visuals?

**Yes, with caveats.** Key insight from Ori's development:
- Ori is ALL 2D sprites arranged in 3D space — no 3D models in-engine
- The magic comes from: deep parallax layering (6-10+ layers), custom fog/depth-of-field, 
  dynamic lighting overlays, and massive amounts of hand-painted art
- Phaser 3 with WebGL can handle: multi-layer parallax, particle systems, 
  blend modes for lighting, shader effects (bloom, glow), smooth spritesheets at 60fps

**What Phaser 3 CAN do (and we should exploit):**
- 8-10 parallax layers with different scroll speeds
- WebGL blend modes for atmospheric lighting (additive blend for glow, multiply for shadow)
- Particle emitters: light motes, leaves, embers, divine sparkles, cloud wisps
- Post-processing via custom pipeline: bloom on golden elements, subtle vignette
- Sprite animation at 30fps+ with interpolation
- Camera effects: subtle zoom on combat, smooth tracking, screen shake

**What requires workarounds:**
- Depth-of-field (Ori uses custom solution) → fake with blur on far/near layers
- Dynamic colored fog → use semi-transparent overlay sprites that shift with altitude
- Deformable terrain → not needed for flight-based gameplay

**Verdict: Stay on Phaser 3 + Vite. The gap is in the assets, not the engine.**

---

## 3. FULL GAME ARC — Chalisa Structure

The entire game maps to the Hanuman Chalisa's narrative arc AND to the graphic novel.
This is the complete vision. We perfect Act 1 first, but build toward this.

### Act 1 — "Flight to the Sun" (Childhood)
**Chalisa:** "Bal samay ravi bhakshi liyo" / "Jug sahastra jojan par bhanu"
**Comic pages:** 3-4 (baby reaching for sun, cosmic space)
**Gameplay:** Vertical flight upward through atmosphere to the sun
**Boss:** Indra on Airavata — vajra lightning battle
**Tone:** Innocent wonder → first confrontation with power

### Act 2 — "The Awakening" (Meeting Ram)  
**Chalisa:** "Vidyavan guni ati chatur" / "Ram kaj karibe ko aatur"
**Comic pages:** 6-11 (learning, service, curse, meeting Ram)
**Gameplay:** Side-scrolling platformer through sacred forests. 
Hanuman is depowered (sages' curse). Abilities unlock gradually.
Wall-jump, climb, basic combat. Meeting Ram = full power restoration cutscene.
**Boss:** Inner doubt (shadow Hanuman?)
**Tone:** Humility → purpose found

### Act 3 — "The Ocean Crossing" (Leap of Faith)
**Chalisa:** "Laye Sanjivan Lakhan Jiyaye" 
**Comic pages:** 12-13 (ocean leap, sea demons)
**Gameplay:** Horizontal flight over the ocean — massive scale.
Encounter Surasa (giant mouth demon — page 13 of comic!), Simhika (shadow-grabber),
Mt. Mainak (rest point / checkpoint).
**Boss:** Surasa — must fly INTO her mouth and out (puzzle boss, not combat)
**Tone:** Courage → unstoppable momentum

### Act 4 — "Lanka" (Infiltration & Fire)
**Chalisa:** "Lanka kot samudra si khahi" / "Lankini"
**Comic pages:** 14-15 (finding Sita, burning Lanka)
**Gameplay:** Stealth/infiltration in Lanka gardens → finding Sita (emotional cutscene) → 
tail set on fire → Lanka burning (action set piece — side-scrolling destruction)
**Boss:** Lankini (guardian demoness) then Indrajit (Ravana's son)
**Tone:** Devotion → righteous fury

### Act 5 — "The War" (Full Divine Power)
**Chalisa:** "Bhima roop dhari asur sanghare"
**Comic pages:** 17-20 (bridge building, war, Sanjeevani, Ravana's defeat)
**Gameplay:** Battlefield combat, growing to giant size. 
Sanjeevani mountain = time-pressure flight level (Lakshmana is dying).
Final battle supporting Ram against Ravana (not fighting Ravana directly — 
Hanuman is the devotee, Ram is the hero).
**Boss:** Ahiravana (underworld demon king) — classic boss fight
**Tone:** Unstoppable divine warrior → humble witness to dharma's triumph

### Epilogue — "Return to Ayodhya"
**Chalisa:** "Tumhare bhajan Ram ko pave" / closing verses
**Comic pages:** 21-22 (celebration, meditation, cosmic Hanuman)
**Gameplay:** Peaceful flight back. No enemies. Just beauty and the Chalisa playing.
Player collects final lotuses. Hanuman meditates. Credits with comic panels.
**Tone:** Peace. Devotion. Completion.

---

## 4. ACT 1 DETAILED GAME DESIGN — What to Build Now

### 4.1 Level Flow

**Act 1, Level 1 — "Dawn Flight"**
- START: Baby Hanuman on a mountaintop at dawn. Tutorial overlay.
- ZONE 1 (altitude 0-2000m): Forest canopy → open sky. 
  Learn to fly (up/down/left/right). Collect lotuses. No enemies.
  Ambient: birds, floating leaves, warm dawn light.
- ZONE 2 (altitude 2000-5000m): Cloud layer. 
  First enemies (cloud demons — easy patrol patterns). 
  Drifting cloud platforms for resting.
  Ambient: wind sounds, cloud wisps, light getting brighter.
- ZONE 3 (altitude 5000-8000m): Upper atmosphere → cosmic.
  Celestial guards (faster, swooping). Asteroids as obstacles.
  Background shifts from sky to cosmic. Stars appear.
  Ambient: ethereal, quiet, vast.
- GOAL (altitude 9000m): The Sun. Approach triggers cutscene — 
  baby Hanuman laughing, reaching out. Transition screen.

**Act 1, Level 2 — "Higher and Higher"**  
- Continuation at faster pace. More enemies, tighter corridors of asteroids.
- New mechanic: DASH (double-tap direction for burst of speed with golden trail)
- Sacred verse fragments appear as you ascend (visual reward)
- Ends at the Sun's corona — blinding golden light

**Act 1, Boss — "Indra's Wrath"**
- Arena: Cosmic void near the Sun, lightning-filled storm clouds
- Indra on Airavata (elephant mount) — hovers at top of screen
- Phase 1: Dodge vajra bolts (telegraph with purple-white flash). 
  Hit Indra by deflecting vajra back (attack at right moment).
- Phase 2: Indra swoops down for charging attacks. Dodge + counterattack.
- Phase 3: Storm intensifies, multiple vajras. Indra's crown glows = vulnerable.
- DEFEAT: Vajra hits baby Hanuman's jaw. He falls. 
  Dramatic slow-motion fall cutscene → Chalisa verse → Act 1 Complete.

### 4.2 Movement & Controls

**Core movement (what makes it feel Ori-like):**
- ARROW KEYS / WASD: Move in all directions (it's flight, not platforming for Act 1)
- SPACE: Attack (mace swing — short range, powerful, satisfying)
- SHIFT: Dash (burst of speed, golden trail, brief invincibility frames)
  - Cooldown: 1.5 seconds
  - Visual: golden light streak + saffron cloth billowing
- Automatic gentle float when not pressing anything (Hanuman doesn't fall like a rock)

**Feel tuning (critical for "easy side of engaging"):**
- Generous hitboxes on collectibles (lotus pickup radius = 1.5x visual size)
- Tight hitboxes on enemies hitting player (0.7x visual size — favor the player)
- Health: 5 hearts (generous). Enemies do 1 heart damage. Boss does 1-2.
- Health pickups (lotuses) appear frequently — every 10-15 seconds of play
- Respawn at most recent cloud platform (frequent auto-checkpoints)
- No lives system. No game over. Just respawn and keep going.
- Brief invincibility after taking damage (2 seconds, flashing)

### 4.3 Scoring System

- **Lotus Collection:** 100 points each. Levels have ~30-50 lotuses.
- **Enemy Defeated:** 200 points (demon), 500 points (celestial guard)
- **Combo System:** Defeating enemies within 3 seconds of each other multiplies score 
  (x2, x3, x4 max). Golden counter shows multiplier.
- **Verse Fragments:** Collecting all fragments in a zone = bonus 1000 points + 
  hidden verse reveal
- **No-Hit Bonus:** Complete a zone without taking damage = 2000 point bonus
- **Time Bonus:** Finish level under par time = bonus (scaled, not binary)
- **Devotion Meter:** Fills as you play well (collect, defeat, don't get hit). 
  When full, press Q for "Jai Hanuman" screen-clear special attack. 
  Using it = 5000 bonus points. Meter resets.
- **Level Grade:** S / A / B / C based on total score. S = perfect play + no-hit + speed.

### 4.4 Particle Systems (the "Ori magic")

These run constantly and are what transform the game from flat to atmospheric:

| System | Description | Layer |
|--------|-------------|-------|
| **Divine motes** | Tiny golden-white dots floating upward slowly. Everywhere. | Midground |
| **Cloud wisps** | Semi-transparent white tendrils drifting horizontally | Background |
| **Lotus trail** | When lotus collected: burst of pink-gold petals that fade | Player layer |
| **Saffron cloth** | Hanuman's sash generates trailing particles when moving fast | Player layer |
| **Mace impact** | Golden starburst + screen shake when attack connects | Foreground |
| **Vajra sparks** | Electric violet-white crackling around boss projectiles | Foreground |
| **Altitude haze** | Warm amber haze at low altitude, cool indigo at high | Full screen overlay |
| **Star twinkle** | Stars in cosmic zone gently pulse with warm tint | Far background |
| **Embers** | Near the sun: rising golden embers/sparks | Midground |

### 4.5 Camera Behavior

- **Tracking:** Smooth follow with slight lookahead in direction of movement
- **Zoom:** Subtle zoom OUT when moving fast (feels like speed)
- **Combat zoom:** Slight zoom IN during boss encounters (feels intense)
- **Screen shake:** On mace hit (light), on taking damage (medium), on boss phase change (heavy)
- **Altitude color shift:** Camera applies post-processing tint based on altitude:
  - 0-2000m: warm amber overlay (10% opacity)
  - 2000-5000m: neutral (clear)
  - 5000-8000m: cool indigo shift (10% opacity)  
  - 8000-9000m: warm golden glow intensifying (approaching the sun)

---

## 5. ASSET PRODUCTION PLAN

### 5.1 Priority Tiers (Build in This Order)

**TIER 0: Reference Sheet (DO FIRST — Everything depends on this)**

| # | Asset | Tool | Description |
|---|-------|------|-------------|
| R1 | **Hanuman Character Reference** | ChatGPT/DALL-E | Full character sheet: front, side, 3/4 view. Use comic pages 3-5 as reference image. Baby Hanuman with all canonical details. THIS defines the character for all subsequent generations. |

**TIER 1: Backgrounds (Highest visual impact per asset)**

Use comic pages 2-4 as direct reference. These should feel like the SAME world.

| # | Asset | Filename | Tool | Reference | Size |
|---|-------|----------|------|-----------|------|
| 1 | **Dawn Sky gradient** | `bg-sky-dawn.png` | Gemini | Comic p1 sky | 1600x600 |
| 2 | **Cosmic Sky** | `bg-sky-cosmic.png` | Gemini | Comic p3 background (indigo-purple nebula with warm stars) | 1600x600 |
| 3 | **Mountains far** | `bg-mountains-far.png` | Gemini | Comic p1 mountain/island silhouettes | 1600x600 |
| 4 | **Mountains near** | `bg-mountains-near.png` | Gemini | Darker, more detailed layer | 1600x600 |
| 5 | **Clouds far** | `bg-clouds-far.png` | Gemini | Light, wispy, dawn-golden | 1600x600 |
| 6 | **Clouds near** | `bg-clouds-near.png` | Gemini | Larger, more detailed, slightly darker | 1600x600 |
| 7 | **Forest canopy** | `bg-forest.png` | Gemini | Comic p7-8 lush green canopy (starting zone) | 1600x600 |
| 8 | **Sun corona** | `bg-sun-glow.png` | Gemini | Radial golden glow for final zone | 1600x600 |
| 9 | **Foreground particles** | `bg-foreground-leaves.png` | Gemini | Blurred close-up leaves/petals overlay | 1600x600 |

**TIER 2: Player Character (4 key poses)**

| # | Asset | Filename | Tool | Comic Reference |
|---|-------|----------|------|-----------------|
| 10 | **Baby Hanuman Idle** | `hanuman-idle.png` | DALL-E | p5 right (standing with mace, confident) |
| 11 | **Baby Hanuman Flying** | `hanuman-fly.png` | DALL-E | p3 left (reaching for sun, flying upward) |
| 12 | **Baby Hanuman Attack** | `hanuman-attack.png` | DALL-E | p5 left (swinging mace overhead, laughing) |
| 13 | **Baby Hanuman Hurt** | `hanuman-hurt.png` | DALL-E | p4 left (struck by lightning, falling) |

**IMPORTANT NOTE:** For Act 1, the player character is BABY Hanuman (pages 3-5 of comic), 
not adult Hanuman. He's round, chubby, joyful, mischievous. 
This is a crucial distinction from the game design doc which describes adult Hanuman.

**TIER 3: Enemies**

| # | Asset | Filename | Tool | Comic Reference |
|---|-------|----------|------|-----------------|
| 14 | **Cloud Demon** | `enemy-demon.png` | DALL-E | p13 left (dark smoky forms, red eyes) |
| 15 | **Celestial Guard** | `enemy-guard.png` | DALL-E | p4 left (divine warriors in storm) |
| 16 | **Indra on Airavata** | `enemy-indra.png` | DALL-E | p4 left (Indra with vajra on elephant, in clouds) |

**TIER 4: Objects, Pickups, Effects**

| # | Asset | Filename | Tool | Size |
|---|-------|----------|------|------|
| 17 | **The Sun** | `sun.png` | DALL-E | p3 (blazing divine sun, looks like fruit) | 256px |
| 18 | **Sacred Lotus** | `pickup-health.png` | DALL-E | Pink lotus, golden center, soft glow | 64px |
| 19 | **Vajra bolt** | `vajra.png` | DALL-E | Golden thunderbolt with violet crackle | 64px |
| 20 | **Mace impact** | `mace-hit.png` | DALL-E | Golden starburst flash | 64px |
| 21 | **Dash trail** | `dash-trail.png` | DALL-E | Golden light streak segment | 128px |

**TIER 5: UI**

| # | Asset | Filename | Tool | Size |
|---|-------|----------|------|------|
| 22 | **Heart full** | `ui-heart.png` | DALL-E | Ornate golden-red Om or lotus heart | 32px |
| 23 | **Heart empty** | `ui-heart-empty.png` | DALL-E | Same shape, hollow/dark | 32px |
| 24 | **Devotion meter frame** | `ui-devotion.png` | DALL-E | Ornate golden bar frame | 200x24px |
| 25 | **Score display BG** | `ui-score-bg.png` | DALL-E | Semi-transparent ornate panel | 200x40px |

**TIER 6: Chalisa Text Screens (Pre-rendered PNGs)**

These bypass the Devanagari rendering problem entirely. Generate in ChatGPT or Canva.

| # | Asset | Filename | Content |
|---|-------|----------|---------|
| 26 | **Verse 1 card** | `chalisa-verse1.png` | बाल समय रवि भक्षि लियो... with transliteration + English |
| 27 | **Verse 2 card** | `chalisa-verse2.png` | जुग सहस्र योजन पर भानू... |
| 28 | **Verse 3 card** | `chalisa-verse3.png` | Boss intro verse |
| 29 | **Death verse** | `chalisa-death.png` | संकट से हनुमान छुड़ावे... |
| 30 | **Victory verse** | `chalisa-victory.png` | जय जय जय हनुमान गोसाई... |
| 31 | **Opening invocation** | `chalisa-opening.png` | श्री गुरु चरण सरोज रज... |

**TIER 7: Animated Spritesheets (Kling → extract frames)**

| # | Asset | Frames | Kling Input | Output |
|---|-------|--------|-------------|--------|
| A | **Flying loop** | 8-12 frames | DALL-E fly pose → Kling animate 2sec loop | `hanuman-fly-sheet.png` |
| B | **Idle breathing** | 8 frames | DALL-E idle pose → Kling animate 2sec | `hanuman-idle-sheet.png` |
| C | **Mace swing** | 6 frames | DALL-E attack pose → Kling animate 1sec | `hanuman-attack-sheet.png` |
| D | **Cloud demon hover** | 6 frames | DALL-E demon → Kling animate 2sec loop | `enemy-demon-sheet.png` |

---

## 6. CODE CHANGES NEEDED (For the coding thread with Claude)

### 6.1 Immediate (Before/alongside asset creation)

**A. Refactor Player to Finite State Machine (from Gemini — critical)**
```
Player.js — Full FSM refactor:
States: IDLE, FLYING, DASHING, ATTACKING, HURT, DEAD
Each state has: enter(), update(), exit() methods
State transitions are explicit (e.g., FLYING → DASHING only on SHIFT press)
This replaces scattered if/else state checks throughout Player.js
Benefits: clean code, easy to add WALL_SLIDE / GIANT_FORM in later acts
```

**B. Add Vayu-Dash mechanic (enhanced with Gemini's ghosting)**
```
Player.js (DASHING state):
- SHIFT key triggers dash
- 1.5 second cooldown
- Brief invincibility (iframes) — 0.3 seconds
- Velocity burst in facing direction (3x normal speed)
- "GHOSTING" EFFECT: Spawn 3-4 copies of current sprite at decreasing opacity
  (0.6, 0.4, 0.2, 0.1) at positions behind player, fading over 0.5 seconds
  These are saffron-tinted via setTint()
- Additionally: particle trail of golden light streaks
- Camera slight zoom-out during dash for speed feel
```

**C. Momentum-based physics (from Gemini)**
```
Player.js physics tuning:
- Acceleration curves: not instant max speed, ramp up over ~0.3 seconds
- Deceleration "slide": when input released, velocity decays over ~0.2 seconds
  (not instant stop — feels like a monkey's agility)
- "Weight" feel: powerful acceleration impulse, then momentum carries
- Gravity: gentle downward pull when not actively flying (not a rock-fall)
- COYOTE TIME: 100ms grace period on dodge/dash inputs
  (if player presses dash 100ms AFTER they should have, still count it)
  This secretly makes the game more forgiving without player awareness
```

**D. Add Scoring system**
```
New file: src/systems/ScoreManager.js
- Score counter (persists across levels within act)
- Combo multiplier (resets after 3 seconds without kill)
- Zone completion bonuses
- Level grade calculation (S/A/B/C)
- Display: score in top-right, combo multiplier when active
```

**C. Add Devotion Meter**
```
New file: src/systems/DevotionMeter.js
- Fills from: lotus collection (+5%), enemy kill (+10%), no-hit time (+1%/sec)
- Drains from: taking damage (-20%)
- When full: Q key activates "Jai Hanuman" special
- Special: screen flash gold, all enemies on screen destroyed, 5000 points
- Meter resets after use
```

**E. Improve Camera system (enhanced with Gemini's "Camera Lead")**
```
Act1Level1.js camera updates:
- CAMERA LEAD: Look ahead in direction of travel (from Gemini)
  Calculate offset = player.velocity * 0.3, lerp camera toward that point
  This gives player better view of incoming obstacles
- Smooth follow with lookahead (lerp factor ~0.08 for fluid feel)
- Subtle zoom based on velocity (faster = wider FOV, zoom out 5-10%)
- Zoom IN slightly during boss encounters (intensity)
- Screen shake function (intensity, duration params)
- Altitude-based tint overlay (warm low, cool high, golden near sun)
```

**F. Combat Feel — "Hit-Stop" system (from ChatGPT — high leverage)**
```
New file: src/systems/CombatFeel.js
HIT-STOP: When mace connects with enemy, freeze game for 50-80ms
  - this.scene.time.timeScale = 0 for ~3 frames, then restore
  - Combined with: screen shake (medium), particle burst (golden starburst),
    camera micro-zoom (2% for 100ms), enemy flash white
  - This single technique is what makes Hollow Knight / Celeste combat feel incredible
  - Zero-cost to implement, massive feel improvement

DAMAGE FEEDBACK when player is hit:
  - Golden/fiery flicker (not crude arcade blink)
  - Brief knockback impulse
  - 2-second invincibility with gentle pulse effect
  - Subtle camera shake (light)
  - Screen briefly desaturates 10% then recovers

PICKUP FEEL:
  - Sacred lotus: soft golden pulse + gentle chime hook + particles spiral inward
  - Should feel like receiving a blessing, not grabbing an arcade icon
```

**G. Add Particle systems**
```
New file: src/systems/ParticleManager.js
- Divine motes (always running, golden dots floating up)
- Movement trail (triggers when player velocity > threshold)
- Lotus collection burst (petals spiral inward to player)
- Mace impact starburst
- Dash ghosting afterimages
- Altitude-dependent: leaves low, clouds mid, stars high, embers near sun
```

### 6.2 When Assets Arrive

**F. Asset integration pipeline**
```
BootScene.js updates:
- Load all new PNGs from /public/
- Set up spritesheet configs for animated assets
- Fallback to procedural only if file not found
```

**G. Parallax background upgrade**
```
Act1Level1.js background system:
- Replace 4-layer with 8-10 layer system
- Each layer: different scroll speed, different tileSprite
- Layer order (back to front):
  1. bg-sky-dawn.png (static or very slow scroll)
  2. bg-sky-cosmic.png (reveals as altitude increases, crossfade)
  3. bg-mountains-far.png (0.1x scroll)
  4. bg-mountains-near.png (0.2x scroll)
  5. bg-clouds-far.png (0.3x scroll)
  6. bg-clouds-near.png (0.5x scroll)
  7. GAMEPLAY LAYER (player, enemies, collectibles)
  8. bg-foreground-leaves.png (1.2x scroll — slightly faster for depth)
  9. Particle overlay layer
  10. UI layer
```

**H. WebGL effects**
```
main.js Phaser config:
- Ensure WebGL renderer (not Canvas)
**H. WebGL effects & Glow system**
```
main.js Phaser config:
- Ensure WebGL renderer (not Canvas)
- Add custom pipeline for bloom effect on golden elements

GLOW APPROACH (adjusted from Gemini's Light2D suggestion):
- Do NOT use Phaser Light2D pipeline — too heavy for painterly art
- Instead: additive blend mode sprites for glow effects
  - Sun glow: large soft-edge radial gradient sprite, blendMode: ADD
  - Mace glow: smaller golden glow sprite parented to weapon
  - Lotus pickup glow: soft pink-white circle, pulse scale
  - Boss vajra: violet-white glow sprite
- These are simple, performant, and look better on painted art than dynamic lighting
- Can layer multiple glow sprites for intensity (sun = 3 overlapping glows)
```

### 6.3 Polish (After core gameplay + assets are solid)

**I. Chalisa transition system — COMIC PANEL CUTSCENES (from Gemini)**
```
ChalisaTransition.js — Major upgrade:
- USE ACTUAL COMIC PANELS as transition backgrounds!
  (Gemini's best idea — we have 22 pages of stunning art, USE THEM)
- Crop relevant comic panel region, load as transition BG
- Apply slow Ken Burns effect (subtle pan + zoom across panel)
- Overlay: ornate gold scroll/frame at bottom
- Inside scroll: pre-rendered Chalisa PNG card (Devanagari + transliteration + English)
- Verse text appears with typewriter/fade-in effect
- Music: Chalisa chanting audio for that specific verse
- Duration: 8-10 seconds (enough to read, not enough to bore)

Transition mapping:
- Level 1 → Level 2: Comic p3 (baby reaching for sun) + verse 2
- Level 2 → Boss: Comic p4 left (Indra in storm) + boss intro verse  
- Boss defeat: Comic p4 right (Hanuman with mace in forest) + victory verse
- Death screen: Comic p2 left (meditating Hanuman) + death comfort verse
```

**J. Death/respawn flow**
```
Player.js death handling:
- Slow-motion fall (time scale 0.3 for 1 second)
- Screen desaturates
- Chalisa death verse fades in (pre-rendered PNG)
- "Sankat se Hanuman chudave" with translation
- Gentle "Try again" prompt
- Respawn at last checkpoint with brief golden glow
```

**K. Victory flow**
```
ActComplete.js:
- Score tally screen with satisfying number counting animation
- Grade reveal (S/A/B/C) with appropriate fanfare
- Chalisa victory verse
- Transition to next act preview
```

---

## 7. PROMPT LIBRARY — Ready to Use

### 7.1 Hanuman Character Reference Sheet (ChatGPT/DALL-E)

```
Create a 2D game character reference sheet for baby Hanuman (Hindu monkey god, 
age appearance: young child, 4-5 years old). Three views: front, side (facing right), 
and three-quarter view.

Character details:
- Round, chubby proportions (he's a divine toddler)
- Grey-blue fur covering body, lighter on chest/belly
- Large expressive eyes, mischievous joyful smile
- Golden mukut (ornate crown) with red jewel in center
- Golden arm bands, anklets, necklace with large circular pendant
- Saffron-orange dhoti (lower garment) with golden belt
- Small curled tail with golden tip
- Holding a golden gada (mace) — the mace head is nearly as big as he is
- Vermillion tilak on forehead

Art style: Rich oil-painting luminosity. Warm golden lighting. 
Comic book illustration meets Indian miniature painting. 
NOT cartoonish or chibi — reverent and heroic despite being a child.
Color palette: warm amber backgrounds, cosmic indigo accents, 
sacred fire tones (orange, gold, red).

Transparent background. Clean edges suitable for game sprite extraction.
High resolution, at least 1024px tall.
```

### 7.2 Background — Cosmic Sky (Gemini)

```
Create a horizontally tileable 2D game background layer. 
Deep cosmic sky with spiritual atmosphere.

Specifications:
- Size: 1600x600 pixels
- Deep indigo-purple base (#1A0A2E blending to #2D1B69)
- Scattered stars with WARM tint (not cold white — golden-pink-lavender)
- Subtle nebula formations in warm purple and amber
- Sacred, spiritual cosmos feel — like the night sky above an ancient temple
- NOT cold NASA space. This is divine space, warm and alive.

Art style: Oil painting luminosity. The kind of sky from a Mughal miniature 
or a European romantic landscape, but rendered for a game.

Must tile seamlessly left-to-right. 
No hard objects (planets, etc.) — just atmosphere and stars.
PNG format.
```

### 7.3 Background — Dawn Sky (Gemini)

```
Create a horizontally tileable 2D game background layer.
Dawn sky gradient for a mythological Indian game.

Specifications:
- Size: 1600x600 pixels  
- Gradient: deep blue-purple at top → warm amber-gold at horizon
- The golden hour light should feel sacred and alive
- Very subtle warm clouds near the horizon (not separate layer, baked in)
- Reference: the sky behind the Himalayas at 5:30am

Art style: Oil painting luminosity. Warm, reverent, atmospheric.
Think classical landscape painting meets Indian spiritual art.

Must tile seamlessly left-to-right.
PNG format.
```

### 7.4 Baby Hanuman Flying Pose (DALL-E)

```
2D side-scrolling game character sprite of baby Hanuman (Hindu monkey god, 
young child). Flying upward diagonally, one small fist reaching toward a 
glowing sun above, other arm trailing. Expression: pure childlike wonder 
and joy, mouth open in laughter. Saffron cloth streaming behind him.
Curled tail trailing with golden tip.

Grey-blue fur, round chubby proportions, golden crown with red jewel, 
golden ornaments (arm bands, necklace, anklets), saffron dhoti with 
golden belt, vermillion tilak on forehead.

Art style: Rich oil-painting quality. Warm golden lighting on the character. 
Heroic comic book illustration meets Indian miniature painting.
Side view, facing right. Transparent background. 
Clean edges, game-ready sprite. At least 512px tall.
```

### 7.5 Cloud Demon (DALL-E)

```
2D game enemy sprite: a dark asura (demon) made of black-purple smoke 
and cloud matter. Menacing but not gory.

Details:
- Body formed from swirling dark cloud/smoke
- Two glowing red eyes (the only solid feature)
- Sharp fangs visible in a snarling mouth
- Wispy, dissolving edges — not a solid body
- Tendrils of dark smoke trailing from arms and lower body
- Faint inner glow of dark crimson within the smoke
- Size: approximately 256px

Art style: Painterly, atmospheric. The demon should feel like a 
dark presence in an otherwise beautiful sky. Think shadow creature 
from Studio Ghibli or the dark spirits in Princess Mononoke.

Facing right. Transparent background. Clean edges for game sprite.
```

---

## 8. CHALISA VERSE MAPPING — Full Curation List

These are the specific couplets to be rendered as PNG cards.
Text should be curated/verified with ChatGPT (strong Hindi capability).

### Act 1 Verses:

| Context | Devanagari | Transliteration | English |
|---------|-----------|-----------------|---------|
| Opening | श्री गुरु चरण सरोज रज, निज मनु मुकुरु सुधारि | Shri Guru Charan Saroj Raj, Nij Manu Mukuru Sudhari | With the dust of Guru's lotus feet, I clean the mirror of my mind |
| Level 1 Start | बाल समय रवि भक्षि लियो, ताहि मधुर फल जानी | Bal Samay Ravi Bhakshi Liyo, Tahi Madhur Phal Jani | In childhood, he swallowed the sun, thinking it a sweet fruit |
| Level 2 | जुग सहस्र योजन पर भानू, लील्यो ताहि मधुर फल जानू | Jug Sahastra Jojan Par Bhanu, Leelyo Tahi Madhur Phal Janu | The sun, sixteen thousand miles away, you swallowed like a fruit |
| Boss Intro | भूत पिसाच निकट नहिं आवै, महाबीर जब नाम सुनावै | Bhoot Pisach Nikat Nahi Aave, Mahabir Jab Nam Sunave | Ghosts and demons cannot come near when Mahavir's name is heard |
| On Death | संकट से हनुमान छुड़ावै, मन क्रम बचन ध्यान जो लावै | Sankat Se Hanuman Chhudave, Man Kram Bachan Dhyan Jo Lave | Hanuman frees from all troubles, those who meditate on him |
| On Victory | जय जय जय हनुमान गोसाई, कृपा करहु गुरु देव की नाई | Jai Jai Jai Hanuman Gosai, Kripa Karahu Guru Dev Ki Nai | Glory to you, Hanuman! Bestow grace as our divine guru |
| Score Screen | सब सुख लहै तुम्हारी सरना, तुम रक्षक काहू को डर ना | Sab Sukh Lahai Tumhari Sarna, Tum Rakshak Kahu Ko Dar Na | All happiness comes from your shelter, with you as protector there is no fear |

---

## 9. WORKFLOW — Who Does What

### Claude (this thread): Brain / Consolidation Hub
- Consolidate ideas from ChatGPT & Gemini threads  
- Maintain this master plan document
- Design decisions, game design scoring, priority calls
- Prompt engineering for asset generation
- Chalisa curation and verse mapping

### Claude (coding thread): Implementation
- All Phaser 3 code changes
- Asset integration when PNGs arrive
- Bug fixes, playtesting, tuning
- Gets specific task briefs from this plan

### ChatGPT: Asset Generation + Hindi
- DALL-E image generation (character sprites, objects, UI, enemies)
- Devanagari text rendering for Chalisa cards
- Character consistency across poses
- Prompt iteration for quality

### Gemini: Backgrounds + Style Exploration  
- Background layers (painterly, atmospheric quality)
- Style exploration / mood boards
- Alternative approaches when DALL-E hits limits

### Kling: Animation
- Convert static poses → animated loops
- Flying cycle, idle breathing, attack arc
- Extract frames → spritesheets

### Anant: Creative Director
- Final approval on all assets
- Art direction adjustments
- Comic pages as reference material
- Game feel testing and feedback

---

## 10. PRODUCTION SPRINTS — Sequenced for Maximum Impact

### PHILOSOPHY (from ChatGPT — the most important strategic insight):
**Build one act at production quality, not five acts at prototype quality.**
If Act 1 becomes emotionally convincing, the rest inherits that clarity.
If Act 1 remains crude, every new act multiplies the same weakness.
This is a VERTICAL SLICE approach. Act 1 IS the game until it feels right.

### Sprint 1: "Foundation" (Code Architecture) — NOW
**Goal:** Make the codebase ready for richness.
- Refactor Player.js to FSM (Section 6.1.A)
- Implement momentum physics with acceleration/deceleration curves (Section 6.1.C)
- Upgrade camera with lead + zoom + shake (Section 6.1.E)
- Audit scene architecture for clean state handling
- **Output:** Hanuman feels dramatically better to control, even with placeholder art
- **Why first:** ChatGPT is right — movement design should precede art generation,
  because it tells you which poses you ACTUALLY need

### Sprint 2: "Hanuman Feel" (Movement + Combat) — DAYS 3-5
**Goal:** Movement and combat that feel alive.
- Vayu-Dash with ghosting effect (Section 6.1.B)
- Mace attack with HIT-STOP (from ChatGPT): 
  freeze game 50-80ms on impact + screen shake + particle burst
  This single technique transforms combat feel
- Damage feedback: golden flicker, brief invincibility, knockback
- Devotion Meter system (Section 6.1.D)
- Scoring system (Section 6.1.D)
- **Output:** Even with boxes for sprites, the game should feel "juicy"

### Sprint 3: "Atmosphere" (Particles + Environment) — DAYS 5-8
**Goal:** Act 1 stops looking like a prototype.
- Particle systems: divine motes, movement trails, altitude-dependent effects (Section 6.1.F)
- 8-10 layer parallax system (Section 6.2.G)
- Altitude realm-passage: smooth crossfading between atmospheric zones
  (NOT hard cuts — the sky should gradually transform as you ascend)
- Additive blend glow sprites for Sun, mace, pickups (Section 6.2.H)
- Integrate first wave of real background PNGs (as they arrive from Gemini)
- **Output:** Screenshots that look like they belong in the same world as the comic

### Sprint 4: "The Art Drop" (Asset Integration) — DAYS 8-12
**Goal:** Replace ALL procedural art in Act 1.
- Integrate Hanuman character sprites (all poses)
- Integrate enemy sprites
- Integrate Sun, lotus, vajra, UI assets
- Scale/hitbox tuning for new art proportions
- Comic panel cutscene transitions (Section 6.3.I)
- **Output:** Act 1 playable end-to-end with real illustrated art

### Sprint 5: "Chalisa Soul" (Emotional System) — DAYS 12-15
**Goal:** The game has a soul, not just mechanics.
- Chalisa transition system with comic panels + verse cards
- Death/respawn flow with devotional verse (Section 6.3.J)
- Victory flow with score tally (Section 6.3.K)
- Add devotional kneeling pose (from ChatGPT) for transition moments
- Sound design pass: Chalisa chanting, ambient, SFX hooks
- **Output:** Someone plays Act 1 and feels something beyond "fun"

### Sprint 6: "Polish & Ship Act 1" — DAYS 15-20
**Goal:** Act 1 is a finished, shareable vertical slice.
- Difficulty tuning (easy side of engaging — generous pickups, forgiving hitboxes)
- Performance optimization
- Mobile touch controls refinement
- Bug sweep
- **Output:** You can share Act 1 publicly as a DharmaWeave product preview

### Sprint 7+: "Act 2 — The Forest" — AFTER Act 1 ships
**Goal:** Prove the game has range.
- Horizontal platforming (contrast with Act 1's vertical flight)
- Forest aesthetic from comic pages 6-8
- Grounded combat, wall-jump, training encounters
- New enemy behaviors
- Only build this AFTER the vertical slice proves the concept

---

## 11. PARALLEL ASSET TRACK (Runs alongside code sprints)

**This runs on YOUR time with ChatGPT, Gemini, and Kling while Claude codes.**

### Week 1 (alongside Sprints 1-3):
1. Generate Hanuman character reference sheet (DALL-E, prompt 7.1)
2. Generate cosmic sky + dawn sky backgrounds (Gemini, prompts 7.2-7.3)
3. Generate baby Hanuman flying + idle poses (DALL-E, prompt 7.4)
4. Start Chalisa verse curation with ChatGPT (Section 8)

### Week 2 (alongside Sprints 3-5):
5. Generate remaining Hanuman poses (attack, hurt, devotional kneel)
6. Generate all background layers (mountains, clouds, forest, foreground)
7. Generate enemies (cloud demon, celestial guard, Indra)
8. Generate objects (sun, lotus, vajra, mace hit, UI hearts)
9. Pre-render Chalisa verse cards as PNGs

### Week 3 (alongside Sprints 5-6):
10. Kling animation: flying loop, idle breathing, mace swing
11. Extract spritesheets from Kling output
12. Iterate on any assets that don't match in-game
13. Crop comic panels for transition backgrounds

### Deep Research (Commission NOW, results feed into all sprints):
- Topics TBD based on your selection
- Results get integrated into this plan as they arrive

---

*This is a living document. Updated with inputs from Claude, ChatGPT, and Gemini.*

**Jai Hanuman.** 🙏
