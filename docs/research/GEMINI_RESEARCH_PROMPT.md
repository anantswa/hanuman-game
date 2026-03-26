# Gemini Deep Research Prompt
## Paste this into Gemini with Deep Research enabled

---

I'm building a browser-based 2D game called "Hanuman — Journey of the Divine" using Phaser 3 + Vite + vanilla JavaScript. It tells the story of the Hanuman Chalisa across 5 acts — from baby Hanuman swallowing the sun, through meeting Ram, crossing the ocean to Lanka, the great war, and the return to Ayodhya.

The visual target is the atmospheric richness of Ori and the Blind Forest, but achieved in a browser engine. I have a DharmaWeave graphic novel (AI-generated, oil-painting luminosity style) that defines the art direction: warm golden ambers, cosmic indigos, sacred fire tones, painterly textures.

I already have ChatGPT researching the technical breakdown of Ori's visual pipeline and Phaser 3's performance ceiling. I want YOU to research different angles that will surprise me with ideas I haven't considered.

## Topic 1: The Art of "Juice" — What Makes 2D Games FEEL Incredible

Research the game design concept of "juice" (the term coined by Martin Jonasson & Petri Purho in their famous "Juice it or lose it" talk). I want a comprehensive breakdown of EVERY technique that makes 2D action games feel satisfying, with specific implementation approaches for Phaser 3.

Cover these categories in depth:

**Screen Effects:**
- Screen shake variations (directional shake, rotational shake, zoom shake)
- Hit-stop / hit-freeze (frame-freeze on impact) — exactly how many frames, when to use it
- Screen flash (additive white/gold overlay on big moments)
- Chromatic aberration on heavy impacts
- Time dilation (slow-motion on kills, boss phase changes, death)
- Camera punch (brief camera displacement in direction of force)

**Animation Tricks (without needing many frames):**
- Squash and stretch on jump/land/attack
- Anticipation frames (wind-up before action)
- Follow-through (overshoot then settle)
- Smear frames (motion blur as single exaggerated frame)
- Scale pulsing on pickups and UI elements

**Particle & VFX:**
- Impact particles (directional burst vs radial burst vs spiral)
- Trail effects behind fast-moving objects
- Ambient environmental particles that make a world feel alive
- "Reward" particle systems (what happens when you collect something)
- Elemental effects: fire, lightning, divine light, smoke — best approaches in 2D

**Audio-Visual Sync (design principles even before we have audio):**
- How to design visual feedback that "implies" sound
- Rhythm in combat — how the best 2D games create musical combat flow
- The role of silence and stillness as contrast

**Specific games to study for juice techniques:**
- Hollow Knight (combat feel)
- Celeste (movement feel)
- Dead Cells (combat + movement)
- Katana ZERO (time manipulation + style)
- Hades (feedback loops + reward feel)

For each technique, assess: how hard is it to implement in Phaser 3? What's the visual payoff vs. development cost? Rank them in a priority order for a solo developer.

## Topic 2: Mythological / Spiritual Games — What Works and What Doesn't

Research games that are based on mythology, religion, or spiritual traditions. I want to understand what makes some succeed brilliantly and others feel shallow or offensive. This is critical because my game is based on a sacred Hindu text (the Hanuman Chalisa) and I need to handle it with reverence while still making it genuinely fun.

**Games to analyze:**
- Asura's Wrath (Hindu/Buddhist mythology — what worked about its emotional storytelling?)
- Raji: An Ancient Epic (Indian mythology Indie game — what were its strengths and weaknesses? How was it received in India vs globally?)
- Hellblade: Senua's Sacrifice (Norse mythology + mental health — how did it handle sacred material?)
- Journey (thatgamecompany — spiritual experience without explicit religion)
- Okami (Shinto mythology — how did it make divine power feel playful?)
- Never Alone (Iñupiat folklore — how did it embed cultural education into gameplay?)
- Black Myth: Wukong (Chinese mythology, Journey to the West — huge commercial success, how?)
- Indivisible (Southeast Asian mythology — what went right/wrong?)
- Any other Hindu mythology games that exist (find them all — I want to know the competitive landscape)

For each game, analyze:
1. How did they handle the tension between "sacred source material" and "fun gameplay"?
2. How was the game received by people from the actual culture vs. global audiences?
3. What storytelling techniques did they use to convey mythology without text dumps?
4. What was the commercial result?

**Key questions to answer:**
- Is there a proven market for Hindu mythology games? How big?
- What's the biggest unmet opportunity in this space?
- What are the common mistakes (cultural insensitivity, shallow treatment, preachy tone)?
- How should the Hanuman Chalisa be integrated — as narrative spine, as collectible lore, as UI element, as power system, or some combination?
- Does making a game "easy and devotional" vs "hard and punishing" affect how respectfully it's perceived?

## Topic 3: AI-Generated Game Art Pipelines — State of the Art (March 2026)

Research the current best practices for using AI image generation tools to create consistent, production-quality game art. This is NOT about whether AI art is good enough — I'm already using it for my graphic novel. This is about the PIPELINE.

**Specific questions:**

1. **Character consistency across poses:** What is the current best method to generate a character in DALL-E / Midjourney / Stable Diffusion that looks the SAME across idle, fly, attack, hurt, and other poses? What about using reference images, IP-Adapter, character sheets, LoRA training? What actually works in March 2026?

2. **Spritesheet generation:** Are there tools or workflows that generate game-ready spritesheets directly? What about:
   - Kling / Runway / Pika for animation → frame extraction
   - Sprite-specific AI tools (any that exist now?)
   - The process of going from a single pose → animated loop

3. **Background art for parallax:** Best practices for generating horizontally tileable game backgrounds with AI. How do you ensure seamless tiling? How do you maintain consistent style across multiple layers that need to work together?

4. **Transparency and clean edges:** AI-generated images often have messy edges, artifacts, halos. What's the best pipeline for getting clean, game-ready PNGs with transparent backgrounds? Any automated tools?

5. **Style consistency across dozens of assets:** When generating 30+ assets for a game, how do you maintain a unified visual style? Prompt engineering alone isn't enough — what workflows, reference systems, or post-processing pipelines work?

6. **Upscaling and format:** Best tools for upscaling AI art to game resolution without losing painterly quality. Best export settings for Phaser 3 (PNG-8 vs PNG-32, atlas packing, etc.)

7. **What's new since late 2025?** Any new tools, models, or techniques specifically for game art that I might not know about? Especially anything related to:
   - Consistent character generation
   - Animation from stills
   - Style transfer to match a reference aesthetic
   - Automated spritesheet creation

## Deliverable Format

For each topic, I want:
- Concrete findings with sources
- Specific techniques ranked by impact-to-effort ratio
- Actionable recommendations for my specific project (Phaser 3, Hanuman theme, solo developer, AI art pipeline)
- Anything surprising or counterintuitive that I probably haven't thought of

The game is being built TODAY — I need practical intelligence, not theoretical overviews.
