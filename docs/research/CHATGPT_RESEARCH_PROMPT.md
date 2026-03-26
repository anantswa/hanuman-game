# ChatGPT Deep Research Prompt
## Paste this into ChatGPT with Deep Research enabled

---

I'm building a 2D side-scrolling game using Phaser 3 (v3.90) + Vite + vanilla JavaScript. The game is called "Hanuman — Journey of the Divine" and follows the story of the Hanuman Chalisa through multiple acts. The visual target is Ori and the Blind Forest / Will of the Wisps level atmosphere and beauty, but built in a browser engine.

I need deep research on TWO topics:

## Topic 1: Ori and the Blind Forest — Visual Techniques Breakdown

Research exactly HOW Moon Studios / Airborn Studios achieved the painterly 2.5D look in Ori. I need technical specifics, not just "it looks pretty." Specifically:

1. **Layering architecture:** How many depth layers did they use? How were sprites arranged in 3D space? What scroll speed ratios created the parallax depth?

2. **Lighting and atmosphere:** They used a custom fog solution with color blending over depth, and depth-of-field with a custom curve. How did this work? What were the key parameters? How did they make environments feel "warm" vs "cold"?

3. **Character animation:** Ori used sprite-based animation (originally 30fps, later 60fps). How many animation frames per action? How did they handle state transitions? What made Ori's movement feel fluid?

4. **Particle systems:** What types of ambient particles did they run constantly? How did particles interact with gameplay (lighting up near surfaces, reacting to movement)?

5. **Art pipeline:** Airborn Studios painted assets and composed them directly in Unity. How were individual painted elements decomposed into reusable game layers? How did they maintain visual consistency across hundreds of hand-painted assets?

6. **Post-processing:** What screen-space effects did they use (bloom, color grading, vignette, motion blur)? How aggressive were these effects?

7. **What's transferable to Phaser 3 WebGL?** For each technique above, assess whether it can be replicated in a browser-based 2D engine with WebGL shaders, blend modes, and the Phaser particle system.

Look at GDC talks (especially the 2015 animation talk by James Benson), the Polycount art dumps, the Airborn Studios project page, the MCV/Develop Unity interview with Moon Studios, and any technical postmortems.

## Topic 2: Best Phaser 3 Games — What's the Ceiling?

Research the most visually impressive and commercially successful games built with Phaser 3 (or Phaser CE / Phaser 4 if relevant). I need:

1. **Showcase games:** What are the 10 best-looking Phaser 3 games ever shipped? Screenshots/links if possible. What visual techniques did they use?

2. **Performance ceiling:** What's the practical limit for parallax layers, particle count, sprite animation complexity, and shader effects in Phaser 3 WebGL on modern browsers?

3. **Specific techniques:** Which Phaser 3 games successfully implemented:
   - Deep parallax (6+ layers)
   - Atmospheric lighting / glow effects
   - Fluid sprite animation (12+ frame cycles)
   - Particle-heavy environments
   - Camera effects (zoom, shake, lead)
   - Post-processing pipelines

4. **Mobile performance:** What's achievable on mobile Safari / Chrome? Where do Phaser 3 games typically hit performance walls?

5. **Comparison to our target:** Given that our target is Ori-like atmosphere in Phaser 3, what's realistic and what's not? What specific compromises should we expect? What techniques will give us the biggest visual return for lowest performance cost?

Please be specific and technical. I don't need marketing language — I need an engineer's assessment of what's possible and how to get there.
