# DEEP RESEARCH SYNTHESIS — Key Findings
## ChatGPT (Ori + Phaser 3 Ceiling) + Gemini (Juice + Mythology + AI Pipeline)
## March 26, 2026

---

## THE 10 MOST ACTIONABLE FINDINGS

### 1. timeScale = 0.01, not 0 (Gemini)
During hit-stop, set timeScale to 0.01 instead of 0. This keeps post-processing
shaders (bloom, vignette, chromatic aberration) alive and animating during the
freeze. A hard zero makes the screen look dead. 0.01 maintains the "oil-painting
luminosity" while physics are effectively paused.

### 2. Baked Motion Blur in Sprites (ChatGPT — from Ori Polycount dump)
Ori's "free awesome motion blur" was NOT a real-time effect. They baked blur
into the sprite frames during the offline render-to-atlas process. This means
when we generate sprites in DALL-E/Kling, we should deliberately add motion
blur streaks to dash frames, attack swing frames, and fast movement frames.
Zero runtime cost, huge perceived quality boost.

### 3. rexHorrifiPipeline = Single-Pass Post-Processing (Both)
This Phaser 3 plugin collapses bloom + vignette + noise + chromatic aberration
into ONE fragment shader call. Compared to stacking Phaser's built-in FX
individually (each adds a fullscreen pass), this dramatically reduces GPU cost.
Essential for mobile performance.

### 4. Half-Gravity Jump Peak (Gemini — from Celeste)
When the jump button is held and velocity is near zero at the apex, halve gravity.
This creates a "weightless" sensation perfectly suited to a divine being.
Baby Hanuman's leaps should feel cosmic and suspended, not snappy and mechanical.

### 5. Depth Fog = Cheapest Path to Ori Atmosphere (ChatGPT)
Ori's warm/cold biome feel comes from a "custom fog solution with colors blended
over depth." In Phaser, implement as: semi-transparent color overlays per layer,
tinted per biome. Far layers get more fog (higher alpha). Near layers get less.
Warm biomes: amber fog. Cool biomes: indigo fog. Costs almost nothing.

### 6. Texture Atlas Discipline is THE Performance Lever (ChatGPT)
Every texture switch in Phaser 3 flushes the WebGL batch. With 210 sprites and
no atlasing, you get 212 draw operations. With proper atlasing, the entire scene
can render in 1-2 draw calls. Plan atlases BY ACT. This is not optional — it's
the difference between 60fps and 20fps.

### 7. Devotion Gauge → Bloom Intensity (Gemini)
Link the devotion meter to the scene's bloom strength. As the player performs
well (collects lotuses, defeats enemies, avoids damage), the world literally
glows brighter. Playing well = the divine realm manifesting. Playing poorly =
the world dimming. This is mechanically novel and thematically perfect.

### 8. Siddhi System = Chalisa as Skill Tree (Gemini)
The 8 Siddhis (divine powers) from the Chalisa map directly to gameplay
abilities: Anima (shrinking) for Surasa, Mahima (growth) for war, Laghima
(weightlessness) for flight, Garima (weight) for ground pound, etc.
Each Siddhi unlocks at the start of its act with a Chalisa verse.
This makes the sacred text mechanically meaningful, not just decorative.

### 9. 150ms Coyote Time + Jump Buffering + Corner Correction (Gemini)
Three "kinetic forgiveness" techniques that make games feel effortless:
- Coyote Time (150ms): can still jump after leaving a ledge
- Jump Buffering (100ms): jump input registered before landing still fires
- Corner Correction (4px): player nudged through if they clip a tile edge
These are invisible to the player but transform perceived responsiveness.

### 10. Black Myth Wukong Proves the Market (Gemini)
25 million copies, $1.1 billion revenue for an Asian mythology game.
Raji (Indian mythology indie): 81K-830K copies, $1.3M revenue — modest but
proves there IS an audience. The gap between Wukong and Raji is execution
quality, not market demand. A polished Hanuman game fills a genuine void.

---

## ADDITIONAL INSIGHTS WORTH NOTING

### From ChatGPT (Ori Technical):
- Ori used PERSPECTIVE camera (not orthographic) for natural parallax depth
- In Phaser we fake this with scrollFactor, which is functionally equivalent
- Ori's animation: 30fps sprites in 60fps world. Walk/run at 120fps oversampled
  with variable playback speed. We should use 12-16 frame cycles for key states.
- Ori's "layered painterly look" came from: unique composition per room, but
  heavy reuse of modular painted pieces. Same philosophy for our AI assets.
- Pre-blur far background layers OFFLINE, don't apply real-time DOF
- Camera DOF: keep gameplay sharp, blur only far BG layers

### From Gemini (Mythology + Pipeline):
- "Active Recitation" framing: position gameplay as prayer, not conquest
- Vibration Combat: map hits to Chalisa syllables, complete verse = divine power
- Camera Punch: rapid non-linear zoom using Back.easeOut for impact moments
- LoRA training (15-30 images) now takes <10 minutes for character consistency
- SpriteMaster AI: converts Kling video to 16-frame spritesheet sequences
- Layer Diffusion (SD Forge): native alpha channel generation (no halo artifacts)
- Indian gaming market: 66% mobile-first, browser = "zero-install advantage"
- Solo dev with AI: $10K-50K budget range for ambitious 2D game in 2026

---

## WHAT THIS MEANS FOR ASSET GENERATION

When generating sprites in DALL-E/Kling, apply these research findings:

1. **Bake motion blur** into dash/attack/fast-movement frames
2. **Use LoRA** if using Stable Diffusion for character consistency
3. **Use Midjourney v7 cref** for character reference locking across scenes
4. **SpriteMaster AI** for converting Kling video to spritesheet
5. **Layer Diffusion** for native transparency (no background removal needed)
6. **Pre-blur far background layers** at generation time, not in-engine
7. **Generate assets sized for texture atlases** — plan which assets share atlases
8. **Tileable backgrounds**: use AI tiling tools (Tiling Standard, ZSky AI)

---

## WHAT THIS MEANS FOR THE CODE

Priority order of implementation (by impact-to-effort ratio):

1. **FSM + kinetic forgiveness** (movement feel is everything — from ChatGPT)
2. **Hit-stop at 0.01 + camera punch** (combat feel — from Gemini)
3. **Depth fog tinting** (atmosphere — from ChatGPT Ori analysis)
4. **rexHorrifiPipeline** (post-processing — from both)
5. **Devotion → bloom link** (unique mechanic — from Gemini)
6. **Parallax + altitude crossfading** (visual depth — from ChatGPT)
7. **Additive glow sprites** (Ori lighting philosophy — from ChatGPT)
8. **Particle systems** (ambient atmosphere — from both)
9. **Siddhi system** (Chalisa as skill tree — from Gemini)
10. **Atlas planning + object pooling** (performance — from ChatGPT)
