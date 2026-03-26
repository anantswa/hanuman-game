# Hanuman --- Journey of the Divine: Ori-Grade Visual Techniques and What's Realistic in Phaser 3 WebGL

## Research scope and engine context

You're aiming for a browser-based 2D side-scroller with an **Ori and the
Blind Forest / Will of the Wisps** atmosphere---"a painting comes to
life"---but implemented with **Phaser 3 (v3.90)**, WebGL rendering, and
vanilla JavaScript. This report focuses on (a) *how Ori's look was
constructed in production* and (b) *what the practical ceiling looks
like for Phaser 3 visuals and performance*, with an engineer's bias
toward repeatable techniques and measurable constraints.
[\[1\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)

## Ori's 2.5D scene construction and parallax

Ori's "2.5D" look is not a single trick---it\'s an **authoring and
rendering architecture** designed to make dense 2D art behave like it
exists in space.

### Multi-plane 2D arranged in 3D space

Multiple developers/artists involved with Ori describe the world (and
even characters) as fundamentally **2D elements laid out on planes in
3D**, rather than true 3D geometry. In the Ori art dump thread, the team
explicitly states "it is all 2d planes arranged in 3d space," and also
that characters are sprite sheets.
[\[2\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

A key detail here is that they weren't just using a couple of background
strips. They leaned into *dense* screen composition. Thomas Mahler
points out that a single screen required many painted elements, and they
avoided the cheap "paint 1 texture and tile it" approach---preferring
"tons of textures" that can be placed adjacent without seams.
[\[3\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

This implies an environment graph that looks more like:

-   Far background "mass" shapes (big silhouetted forms)
-   Several mid-depth "structure" layers (trunks, cliffs, ruins)
-   Near-background detail and atmospheric overlays
-   Gameplay collision layer
-   Foreground occluders and framing (plants, rock lips, mist cards)

The exact number of layers per biome/room is not publicly stated as a
fixed constant, and in practice it likely varies by shot/scene. However,
the combination of "insane levels of parallaxing" and the "single screen
= tons of elements" commentary strongly suggests **many**
independently-positioned planes and sub-planes (not a fixed 3--5 layer
setup).
[\[4\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)

### Parallax comes from depth placement and camera configuration

The Ori team discusses **sorting by depth position** and that you can
"tilt the planes etc." They also state the gameplay camera is
**perspective** (rather than strictly orthographic), which naturally
reinforces parallax as the camera translates.
[\[5\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

In other words, rather than picking parallax ratios first (e.g., 0.1 /
0.3 / 0.6), they could author in terms of **Z placement** and let the
camera create parallax "for free" (while still tuning layer motion as
needed).
[\[5\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

### Tooling: blockouts as editable planes, then art dressing

Multiple posts describe a workflow where levels begin as blockouts built
with a **custom plane/polygon tool** in-editor. Artists then set-dress
and polish, with colliders created via a blend of blockout and art. The
team highlights that much of the game was "blocked and playable really
early on," and that their blockouts evolved from conservative right
angles into more organic shapes.
[\[6\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

Airborn Studios (the external art partner) corroborates this: Moon used
rough blockouts to test gameplay, while artists worked directly in Unity
and composed the look there.
[\[7\]](https://airborn-studios.com/projects/ori/)

### Overdraw and sprite cost were actively engineered

A very "engineering" detail that's easy to miss: the team talks about
**atlasing and generating meshes** to reduce the transparent pixels the
shader must process---reporting dramatic speedups ("10x--100x") from
reducing wasted overdraw on large, semi-transparent sprites.
[\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

This matters because Ori-style art tends to include big semi-transparent
shapes (fog cards, leaf clusters, painterly gradients), which can become
fill-rate bound if you let them overlap heavily.

## Ori lighting, atmosphere, and post effects

Ori's warmth/coldness and "glow" are driven by a layered approach:
**depth-aware fog**, **depth-of-field**, **shader-driven local lighting
cheats**, and **selective baked effects**.

### Depth fog as a colored, artist-controlled blend over distance

The Ori team explicitly mentions "a custom fog solution with colors
(transparency and value) we could blend in over depth."
[\[9\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

Interpreting this technically, this implies a fog model where fog is not
merely "gray at distance," but has at least:

-   A **fog color** (likely per scene/biome, possibly with multiple
    bands)
-   A **fog opacity** curve over depth (their wording: transparency and
    value over depth)
-   Integration with scene depth (because their world planes have depth
    values)
    [\[10\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

In practice, this gives art direction the lever Ori is famous for:
distant regions can fade to *cool blues / purples* while foreground
retains *warm greens / golds*, or vice versa, without repainting every
asset.

### Depth of field with a custom curve

They also state: "Depth of Field... controlled over a custom curve so it
is not just linear."
[\[9\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

A "custom curve" strongly suggests artists could shape blur intensity
vs. depth---e.g.:

-   Keep gameplay plane and near gameplay-adjacent planes sharp
-   Blur far background earlier (for painterly softness)
-   Optionally blur near foreground framing elements (cinematic lens
    feel)
-   Create *nonlinear* falloff so blur ramps quickly after a threshold
    (avoids "always slightly blurry" mush)
    [\[9\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

### Motion blur: "free" because it was baked into sprites

A standout Ori trick is that a lot of motion blur is **not a real-time
effect**; it's baked when rendering the sprite frames. The Polycount
thread literally frames the answer to "why it looks so smooth" as
**"free awesome motionblur"**, showing side-by-side examples.
[\[11\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)

This drastically reduces runtime cost while maintaining a high-end feel,
especially for very fast action where per-object blur sells speed.

### Shader framework ("ubershader") and lighting cheats

From Moon Studios' Unity interview: they invested in an "Ubershader
framework" that modularized features, auto-generated shader
permutations, and unlocked a "new level of polish" in lighting and
environment animation once it existed.
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)

Notes from a detailed write-up of James Benson's GDC talk also describe
shader tricks like applying an additive/multiply mask to fake
directional lighting on sprites (and keeping it consistent when sprites
flip).
[\[13\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)

Even if you treat that talk-note source as secondary, the combination
of: - "ubershader framework" enabling lighting/animation,
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)\
- custom fog + DoF,
[\[9\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)\
- and extensive in-engine composition,
[\[7\]](https://airborn-studios.com/projects/ori/)\
strongly indicates Ori's "lighting" is a hybrid of **screen-space
effects + authored sprite shading**, not a single real-time
physically-based lighting system.

### Warm vs. cold environments: what likely changed

Moon Studios and Airborn don't publicly list a "warmth parameter," but
**their system design tells you what knobs existed**:

-   **Depth fog color/value** lets them push distance toward cool or
    warm tones per biome.
    [\[9\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
-   The ubershader and "lighting and environment animation" tooling
    suggests per-scene shader modifiers could shift highlights, rim,
    gradients, and emissive accents.
    [\[14\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
-   Their pipeline emphasized unique per-room composition and dense set
    dressing, making palette swaps and localized grading plausible
    without changing core assets.
    [\[15\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

So, an engineer's takeaway: "warm vs cold" in Ori is best replicated by
a **stack**: distance fog palette + localized emissive accents + post
color shaping (not by repainting everything).

## Ori character animation and why it feels unusually fluid

Ori's character feel is built from **production pipeline choices** that
trade runtime flexibility for precomputed quality and a mountain of
content.

### Sprites, rendered from 3D, with strong silhouette constraints

The Polycount thread emphasizes that in-game characters are
**pre-rendered sprites**, even large characters like Kuro ("one sprite
running at 30fps").
[\[16\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)

Airborn also describes the concept-to-character pipeline: concepts
handed to 3D artists, animated, and rendered "as sprites."
[\[7\]](https://airborn-studios.com/projects/ori/)

An additional (secondary) GDC talk-note source reports Ori was rigged in
3ds Max using CAT, rendered with a self-illum diffuse style to preserve
a graphic silhouette, and that baking effects (motion blur / even some
DoF moments) was part of the offline render-to-atlas pipeline.
[\[13\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)

### Frame rate choices: 30 fps sprites in a 60 fps world

The RockPaperShotgun interview (hosted on the official Ori site) states
that in Blind Forest, Ori is a 2D sprite animated at **30 fps**, while
the screen updates at **60 fps**, producing perceptibly less smooth
motion than the rest of the scene.
[\[17\]](https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/)

The Polycount art dump aligns with this: "rendered at 30fps for almost
everything," with a key exception described below.
[\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

### The "no blend trees" workaround: oversampled locomotion + variable playback

A big part of Ori's fluidity is how they handled transitions without
real-time skeletal blending.

The Polycount thread states: "run walk jog and all transitions are 120,"
while "almost everything... 30fps."
[\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

A detailed summary of the GDC animation talk explains one concrete
method: for animations affected by blending (idle-walk-run), they
rendered at **4× the normal frame rate (120 FPS)** and then dynamically
sped up / slowed down playback based on input, using authored
transitions to bridge thresholds.
[\[18\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)

This is a crucial technical insight for you: Ori's "smoothness" is
partially an illusion created by **high-sample-rate source animation +
controlled playback**, not just "more frames everywhere."

### State transitions and slope alignment were content-driven

The talk-note source also describes how foot placement and slope
alignment were solved largely by **rotating the character to the surface
normal** and authoring multiple idles/variants (look up slope / down
slope), plus transitions.
[\[19\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)

Even if details differ by implementation, the philosophy matches what
you can infer from their overall pipeline: when runtime IK is difficult,
**pay with content and tooling**.

## Ori's art pipeline and consistency across huge amounts of hand-painted content

Ori's pipeline is as much about **authoring ergonomics** as it is about
rendering.

### Artists composed directly in Unity with iterative blockouts

Airborn states their team "worked directly in Unity to define the look
and compose everything," specifically noting the challenge of using
Unity before it was well-suited to "extremely complex 2D games."
[\[7\]](https://airborn-studios.com/projects/ori/)

Moon Studios' Unity interview reinforces that they essentially
transformed Unity into a tailored "Ori production engine," building
custom multi-scene editing, cinematic tools, and workflow optimizations
to support a continuous world at 60 fps with heavy parallax and no
loading screens.
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)

### Reuse through modular pieces, but unique composition per room

In the Polycount thread, the team clarifies that "not every asset in Ori
is unique, but every room in itself is," achieved through free
arrangement and recomposition to hide repetition.
[\[20\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)

This is a production pattern you can copy: **reuse assets
aggressively**, but enforce **scene-level uniqueness** via composition
rules and set dressing density.

### Simple import model, heavy build-time optimization

The environment artist breakdown describes asset creation as
straightforward: paint to PNG, Unity imports automatically, refresh
colliders, test.
[\[21\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

But under that simplicity, technical depth appears in: - shader
permutation management ("ubershader framework"),
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)\
- custom scene tooling (multi-scene editing),
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)\
- and render/build-time optimization like atlassing + mesh generation to
reduce overdraw.
[\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

**Takeaway:** Ori separated "artist-friendly front door" from "heavy
optimization behind the scenes."

## What transfers to Phaser 3.90 WebGL and what doesn't

Phaser is not Unity, but Phaser 3.90 is unusually capable for a 2D WebGL
engine because it includes:

-   A batching-focused default WebGL pipeline (MultiPipeline)
    [\[22\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-multipipeline)
-   A post-processing pipeline system (PostFXPipeline)
    [\[23\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-postfxpipeline)
-   A built-in FX pipeline suite (Bloom, Blur, Bokeh, Glow, Vignette,
    etc.) [\[24\]](https://docs.phaser.io/phaser/concepts/fx)
-   A flexible pipeline manager for custom pipelines
    [\[25\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelinemanager)
-   A particle emitter that is a first-class Game Object (good for
    layering and camera motion)
    [\[26\]](https://docs.phaser.io/phaser/concepts/gameobjects/particles)

Below is a technique-by-technique transfer assessment, phrased for
implementation planning.

### Layered 2.5D parallax

**Transferable, with adaptation.**

Ori's depth is literal Z-space with a perspective camera. Phaser is
fundamentally ordered 2D, so you fake "depth" using:

-   multiple display lists / Layers / Containers per depth band
-   `scrollFactor` (or manual camera-follow offsets) per band
-   scale and blur changes per band to reinforce depth

Performance-wise, Phaser's batching model makes **texture atlases** and
draw-call minimization a first-order concern: changing textures flushes
batches, so you want adjacent draws to share atlases wherever possible.
[\[27\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)

If you want Ori-like "lots of unique elements per screen," you must
pre-plan atlas strategy (by biome/act) so the scene can still render in
a manageable number of batches.
[\[28\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

### Depth fog (color/value over distance)

**Transferable, but you'll implement it differently (layer-based, not
depth-buffer-based).**

Ori's fog is depth-aware in a true depth sense. Phaser doesn't give you
a natural depth buffer representing distance (it's draw-order), so the
practical approach is:

-   Author a fog "strength" per layer (far BG gets more fog, gameplay
    gets little)
-   Render far layers into a RenderTexture, then apply a fogging
    shader/color-matrix, then compose into the main scene
-   Alternatively, overlay multiple fog cards (large gradient sprites)
    with `scrollFactor` \< 1, tinted per biome

Phaser's FX system includes **Gradient, ColorMatrix, Glow, Bloom,
Vignette** effects as shader-based WebGL-only features, giving you
building blocks for fog and grading layers.
[\[29\]](https://docs.phaser.io/phaser/concepts/fx)

### Depth-of-field with a custom curve

**Partially transferable; "true" DOF is expensive, but Ori's *look* is
achievable.**

Ori's DOF is curve-shaped, and some blur is baked into sprites.
[\[30\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

In Phaser, a full-resolution bokeh DOF across the entire screen is
usually fill-rate heavy because it implies multiple fullscreen passes.
Instead, replicate the *art direction intent*:

-   Pre-blur far background layers (offline) and swap textures by camera
    zone
-   Or apply blur only to background render targets (downsampled), then
    composite
-   Keep gameplay sharply rendered to preserve readability (Ori
    prioritized readability heavily)
    [\[31\]](https://airborn-studios.com/projects/ori/)

Phaser's FX includes Blur and Bokeh-style effects, but you should treat
them as "selective / downsampled layer tools," not "global cinematic DOF
everywhere." [\[29\]](https://docs.phaser.io/phaser/concepts/fx)

### Sprite-based animation fluidity and transitions

**Transferable conceptually; expensive if you copy Ori's content volume
literally.**

Ori's specific pipeline used: - 30 fps sprites + baked motion blur
[\[32\]](https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/)\
- 120 fps oversampled locomotion + variable playback to fake blending
[\[33\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)\
- lots of authored transitions (explicitly called out)
[\[33\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

In Phaser you can do the same *idea*:

-   Use sprite sheets / texture atlases for animation
-   Use high-sample-rate run cycles (more frames) only for the most
    visible state (run / dash)
-   Fade/bias between nearby states with very short "bridge" clips (3--6
    frames) rather than huge transitions everywhere

But beware: large frame counts multiply texture memory and can force
atlas fragmentation, which increases draw calls. Phaser's rendering
performance is strongly tied to how few texture binds / draw operations
you make.
[\[34\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)

### Ambient particles and interaction

**Transferable, but you'll need discipline around overdraw and counts.**

Moon Studios explicitly called out Unity's particle system as a useful
feature for Ori.
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)

Phaser's particle system is robust and designed for complex emitters
(zones, events, per-particle behaviors), and documentation notes
particles have their own lightweight physics and interact with emitter
bounds/zones.
[\[35\]](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)

To mirror Ori's ambience: - Run multiple low-rate ambient emitters
(motes, spores) in far layers - Add local "reactive" emitters attached
to Ori (trail, landing puffs) - Use zones near "interactive surfaces"
(shrines, magic plants) to intensify glow particles when Ori is nearby

The engineering constraint is that particles are often **alpha-blended
sprites** (fill-rate heavy), so they can become the first thing that
tanks mobile performance---especially if layered over fog and bloom.

### Post-processing: bloom, glow, vignette, grading, motion polish

**Transferable (and Phaser is stronger here than many people realize).**

Ori used motion blur (often baked), depth-of-field, and other cinematic
tooling.
[\[36\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)

Phaser 3 has: - **PostFXPipeline** for post processing
[\[23\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-postfxpipeline)\
- a built-in FX suite, including Bloom and Vignette among others
[\[24\]](https://docs.phaser.io/phaser/concepts/fx)

So the "Ori atmosphere stack" is feasible, but you must treat post FX as
**budgeted passes**. Each fullscreen effect is a tax on fill-rate
(especially at high resolution).

### Overdraw reduction via alpha-cut meshes

**Not natively transferable; you'll approximate it.**

Ori's team mentions generating geometry meshes for atlased sprites to
reduce the number of transparent pixels processed, yielding major
speedups.
[\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

Phaser can render meshes (and you can do custom pipelines), but you
don't get Ori's tooling out of the box. Your approximations are:

-   Aggressive texture trimming and packing
-   Avoid large transparent gradients that cover the screen
-   Prefer fewer, larger fog cards *or* many small ones, but avoid
    stacking them endlessly
-   Optional: build an offline tool that alpha-traces sprites into
    polygon meshes and render them as Mesh objects (advanced; only worth
    it for large, persistent foreground cards)

## Phaser 3 ceiling with shipped games and practical budgets

### Showcase titles that demonstrate Phaser's upper range

A challenge: Phaser is used across web portals, mobile wrappers, and
Steam-wrapped HTML5 apps, so "best looking" is partly subjective and
version detection is inconsistent. Still, we can identify games and
releases that (a) are publicly featured by Phaser or (b) are explicitly
confirmed as Phaser 3 and shipped.

The list below focuses on "what they prove," not marketing claims:

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Game / release          Evidence it's Phaser / Phaser 3                                                                     What it demonstrates
  ----------------------- --------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------
  **Deadswitch Combat**   Phaser news post explicitly: "built with Phaser 3," plus description of modes and systems.          A real-time action game with online modes, lots of screen entities/effects, editor + workshop
  (Steam Early Access)    [\[37\]](https://phaser.io/news/2026/03/deadswitch-combat-free-to-play-2d-multiplayer-shooter)      workflow---useful proxy for "serious" Phaser 3 production scale.
                                                                                                                              [\[37\]](https://phaser.io/news/2026/03/deadswitch-combat-free-to-play-2d-multiplayer-shooter)

  **Deadswitch 3**        Featured by Phaser (news post), and the official site positions it as a full FPS-like 2D shooter    Demonstrates sustained rendering + gameplay complexity in Phaser in a shooter format (effects, UI,
                          experience. [\[38\]](https://phaser.io/news/2021/07/deadswitch3)                                    animation density). [\[38\]](https://phaser.io/news/2021/07/deadswitch3)

  **Vampire Survivors**   Multiple sources state it was originally Phaser-based and later moved to Unity; one case study even A "ceiling case study": Phaser can ship a hit, but extreme scaling (entity counts, platforms,
  (early versions)        frames it as "From Phaser to Unity."                                                                tooling) can motivate an engine migration.
                          [\[39\]](https://stagenext.coherence.io/blog/tradecraft/vampire-survivors-online-coop-case-study)   [\[39\]](https://stagenext.coherence.io/blog/tradecraft/vampire-survivors-online-coop-case-study)

  **Folklands** (web +    Listed as a Phaser Staff Pick. [\[40\]](https://phaser.io/games)                                    Demonstrates that Phaser can support simulation/management UI density and multi-system games, not
  Steam)                                                                                                                      only arcade titles. [\[40\]](https://phaser.io/games)

  **PAC‑MAN: Halloween    Listed as a Phaser Staff Pick. [\[41\]](https://phaser.io/games)                                    Highly polished, mass-audience web delivery constraints (fast loads, broad compatibility).
  2025 Edition** (Google                                                                                                      [\[41\]](https://phaser.io/games)
  Doodle)                                                                                                                     

  **Memory Rift**         Listed as Staff Pick. [\[41\]](https://phaser.io/games)                                             Demonstrates Phaser used for multiplayer-oriented web experiences (usually implies heavier UI +
                                                                                                                              networking integration). [\[41\]](https://phaser.io/games)

  **Witherheart**         Listed as Staff Pick. [\[41\]](https://phaser.io/games)                                             Demonstrates a modern rogue/deckbuilder UI + effects style in Phaser.
                                                                                                                              [\[41\]](https://phaser.io/games)

  **Grapplenauts**        Staff Pick w/ creator interview note. [\[41\]](https://phaser.io/games)                             Demonstrates real-time multiplayer + physics-like motion (often a stressor for JavaScript/WebGL
                                                                                                                              games). [\[41\]](https://phaser.io/games)

  **Kemotaku**            Staff Pick. [\[41\]](https://phaser.io/games)                                                       Demonstrates stylized UI/VFX-heavy strategy presentation in Phaser.
                                                                                                                              [\[41\]](https://phaser.io/games)

  **Perfect Hue TV        Staff Pick explicitly labeled "Phaser 3 + Elixir." [\[41\]](https://phaser.io/games)                Explicit Phaser 3 usage + real-time arena presentation shows cross-stack architecture still viable
  Arena**                                                                                                                     with Phaser frontend. [\[41\]](https://phaser.io/games)
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

If you want a broader Steam-only scan, SteamDB lists dozens of Steam
products detected as using Phaser, but it also warns detection is
automated and can mismatch.
[\[42\]](https://steamdb.info/tech/Engine/Phaser/)

### Practical performance ceiling in Phaser 3 WebGL

Phaser performance is dominated by the same GPU truths as any WebGL
engine: **draw calls (batch flushes), texture binds, and fill-rate
(overdraw)**.

Phaser's own rendering tutorial is blunt: keep draw calls and WebGL
operations "to an absolute minimum," and use texture atlases so sprites
can be drawn without flushing batches.
[\[43\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)

A concrete illustration from a Phaser multi-texture example: with "just
210 sprites," a scene can require **212 WebGL draw operations** (and far
more WebGL calls) if you don't batch effectively.
[\[44\]](https://gist.github.com/photonstorm/fa844ea561d95993508bfb88e6c48e69)

Key ceilings and "rules of thumb" that follow from Phaser's
architecture:

-   **Parallax layers:** There's no hard limit, but each layer typically
    adds sprites and often adds unique textures. If you can keep most
    parallax elements in a small number of atlases, layers are mostly a
    CPU-side transform cost; if each layer uses different texture pages,
    you'll flush batches constantly.
    [\[27\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
-   **Texture unit limit affects batching:** On GPUs that support 8
    texture units, only 7 are available for batching because Phaser
    reserves one "swap texture." On stronger GPUs supporting 16 units,
    you can batch many more textures at once, potentially rendering an
    entire scene in a single draw call in ideal conditions.
    [\[45\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part4)
-   **Batch size is configurable in pipeline config** (quads per batch),
    which changes how often buffers flush. This is another lever for
    large, sprite-heavy scenes.
    [\[46\]](https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Renderer.WebGL.WebGLPipelineConfig)
-   **Post FX and shader effects are WebGL-only and add passes:**
    Phaser's FX system is shader-based and not available in Canvas mode,
    meaning you pay in extra GPU work for bloom/blur/bokeh/vignette
    stacks. [\[29\]](https://docs.phaser.io/phaser/concepts/fx)
-   **Particles are first-class objects with lots of configuration
    power,** which is great for atmosphere, but they are also commonly
    alpha blended (fill-rate heavy), and cannot be treated as free
    decoration.
    [\[47\]](https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter)

So, an engineer's practical ceiling statement is:

-   If you want Ori-like richness, your true limiter isn't "Phaser can't
    do it." It's that **Ori-like richness is fundamentally an overdraw +
    texture + pass-count problem**, and Phaser is honest WebGL under the
    hood.

### Mobile Safari / Chrome: where Phaser projects hit walls

Phaser's own performance feature write-up (a 2025 optimization post)
highlights that real-world optimization often comes from classic
techniques: FPS instrumentation, object pooling, cached references,
selective processing in loops, asset compression, lazy loading, and
experimenting with canvas size and renderer choice.
[\[48\]](https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025)

Notably, it reports that on older devices, switching **from WebGL to
Canvas** improved performance by \~30%---which implies that in the real
world, WebGL is not always the win you expect on low-end/older mobile
hardware.
[\[48\]](https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025)

In practice, mobile performance walls typically appear when you
combine: - high-resolution canvas + multiple fullscreen post FX - lots
of alpha particles and fog cards - large texture memory (big atlases,
many animation frames) - heavy CPU per-frame work (AI, physics) in
JavaScript

## What's realistic for an Ori-like atmosphere in Hanuman and the best ROI techniques

### Realistic targets for Phaser 3 if you want "Ori vibe"

You can realistically hit:

-   **Deep parallax and painterly layering** (the "2.5D" read), if you
    design your assets and atlases around batching and overdraw control.
    [\[49\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
-   **Biomes that feel warm/cold** via layer fog tinting + color
    matrix + selective glow sprites, mapping directly to Ori's depth-fog
    philosophy.
    [\[50\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
-   **Glow and bloom accents** for "spirit energy," especially if you
    constrain bloom to specific layers or downsampled targets.
    [\[29\]](https://docs.phaser.io/phaser/concepts/fx)
-   **High-quality "fluid" character motion** by focusing your frame
    budget on a few key cycles + motion smear frames (the "baked blur"
    principle), instead of trying to skeletal-blend everything.
    [\[51\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)

### Things you should expect to compromise relative to Ori

Ori's runtime environment includes custom tooling, deep content volume,
and optimizations like mesh generation for alpha reduction.
[\[52\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)

In Phaser, the likely compromises are:

-   **True depth-buffer-driven DOF** across the whole scene: You'll
    replicate it as layer blur / pre-blur swaps. This is closer to Ori's
    look anyway because Ori also baked blur in places.
    [\[30\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
-   **Extreme screen-filling semi-transparent paintings** stacked in
    many layers: you can do it, but it's where mobile will suffer first
    (fill-rate). Ori mitigated this with mesh/overdraw optimization
    tooling.
    [\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)
-   **Unlimited animation frames everywhere:** Ori could afford massive
    sprite memory because it was a premium console/PC title and also
    invested heavily in pipeline tooling. You'll need to concentrate
    "frame density" where players notice most.
    [\[53\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)

### Biggest visual return for the lowest cost

If you want the most "Ori-like" payoff per millisecond in Phaser,
prioritize:

-   **Layering + atmosphere first:** parallax + fog tint + a small
    amount of vignette = huge mood gain with controllable cost.
    [\[54\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
-   **Localized emissive sprites instead of global lighting:** glowing
    flowers, spiritual UI, shrine aura---done with additive sprites and
    minimal glow/bloom effects. This echoes Ori's sprite-centric
    lighting cheats rather than full dynamic lighting.
    [\[55\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
-   **Baked motion polish:** add smear frames / baked blur to dashes,
    leaps, and attacks (Ori's "free awesome motion blur" logic).
    [\[11\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)
-   **Texture atlas discipline:** you can't get Ori density without
    batching discipline. Phaser explicitly calls out atlases as
    foundational to minimizing draw calls.
    [\[56\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
-   **Measured optimization early:** instrumentation (FPS counters),
    pooling, selective updates are repeatedly validated as the path to
    "keep it smooth on mobile."
    [\[48\]](https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025)

If you build Hanuman's acts around these priorities, you can get
extremely close to Ori's *feeling*---not by copying every expensive
trick, but by copying Ori's **stack philosophy**: layered composition +
depth mood + selective polish where the player's eyes live.
[\[57\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)

[\[1\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
[\[4\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
[\[12\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
[\[14\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
[\[53\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
[\[55\]](https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/)
https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/

<https://mcvuk.com/development-news/unity-focus-making-ori-and-the-blind-forest/>

[\[2\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[3\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[6\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[9\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[10\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[15\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[21\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[28\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[30\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[50\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[54\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
[\[57\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2)
https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2

<https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p2>

[\[5\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)
[\[8\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)
[\[33\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)
[\[52\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3)
https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3

<https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p3>

[\[7\]](https://airborn-studios.com/projects/ori/)
[\[31\]](https://airborn-studios.com/projects/ori/)
https://airborn-studios.com/projects/ori/

<https://airborn-studios.com/projects/ori/>

[\[11\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)
[\[16\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)
[\[20\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)
[\[36\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)
[\[51\]](https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1)
https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1

<https://polycount.com/discussion/150335/ori-and-the-blind-forest-artdump/p1>

[\[13\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)
[\[18\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)
[\[19\]](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/)
https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/

<https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/>

[\[17\]](https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/)
[\[32\]](https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/)
https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/

<https://www.orithegame.com/rockpapershotgun-how-animation-powers-ori-and-the-will-of-the-wisps/>

[\[22\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-multipipeline)
https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-multipipeline

<https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-multipipeline>

[\[23\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-postfxpipeline)
https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-postfxpipeline

<https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-postfxpipeline>

[\[24\]](https://docs.phaser.io/phaser/concepts/fx)
[\[29\]](https://docs.phaser.io/phaser/concepts/fx)
https://docs.phaser.io/phaser/concepts/fx

<https://docs.phaser.io/phaser/concepts/fx>

[\[25\]](https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelinemanager)
https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelinemanager

<https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelinemanager>

[\[26\]](https://docs.phaser.io/phaser/concepts/gameobjects/particles)
https://docs.phaser.io/phaser/concepts/gameobjects/particles

<https://docs.phaser.io/phaser/concepts/gameobjects/particles>

[\[27\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
[\[34\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
[\[43\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
[\[49\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
[\[56\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part2)
https://phaser.io/tutorials/advanced-rendering-tutorial/part2

<https://phaser.io/tutorials/advanced-rendering-tutorial/part2>

[\[35\]](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)
https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/

<https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/>

[\[37\]](https://phaser.io/news/2026/03/deadswitch-combat-free-to-play-2d-multiplayer-shooter)
https://phaser.io/news/2026/03/deadswitch-combat-free-to-play-2d-multiplayer-shooter

<https://phaser.io/news/2026/03/deadswitch-combat-free-to-play-2d-multiplayer-shooter>

[\[38\]](https://phaser.io/news/2021/07/deadswitch3)
https://phaser.io/news/2021/07/deadswitch3

<https://phaser.io/news/2021/07/deadswitch3>

[\[39\]](https://stagenext.coherence.io/blog/tradecraft/vampire-survivors-online-coop-case-study)
https://stagenext.coherence.io/blog/tradecraft/vampire-survivors-online-coop-case-study

<https://stagenext.coherence.io/blog/tradecraft/vampire-survivors-online-coop-case-study>

[\[40\]](https://phaser.io/games) [\[41\]](https://phaser.io/games)
https://phaser.io/games

<https://phaser.io/games>

[\[42\]](https://steamdb.info/tech/Engine/Phaser/)
https://steamdb.info/tech/Engine/Phaser/

<https://steamdb.info/tech/Engine/Phaser/>

[\[44\]](https://gist.github.com/photonstorm/fa844ea561d95993508bfb88e6c48e69)
https://gist.github.com/photonstorm/fa844ea561d95993508bfb88e6c48e69

<https://gist.github.com/photonstorm/fa844ea561d95993508bfb88e6c48e69>

[\[45\]](https://phaser.io/tutorials/advanced-rendering-tutorial/part4)
https://phaser.io/tutorials/advanced-rendering-tutorial/part4

<https://phaser.io/tutorials/advanced-rendering-tutorial/part4>

[\[46\]](https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Renderer.WebGL.WebGLPipelineConfig)
https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Renderer.WebGL.WebGLPipelineConfig

<https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Renderer.WebGL.WebGLPipelineConfig>

[\[47\]](https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter)
https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter

<https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter>

[\[48\]](https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025)
https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025

<https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025>
