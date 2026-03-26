# **The Transcendent Browser: Technical and Narrative Convergence in Mythological Game Development**

The development of high-fidelity, browser-based 2D experiences in 2026 has reached a technological zenith, where the historical limitations of the Document Object Model (DOM) and the Canvas API have been superseded by sophisticated rendering pipelines and automated generative workflows. Projects such as "Hanuman — Journey of the Divine" represent a critical inflection point, synthesizing ancient scriptural narratives with the kinetic "juice" typical of premium indie titles such as *Ori and the Blind Forest* and *Celeste*. This report analyzes the technical, cultural, and economic dimensions of constructing such an experience, with a specific focus on the Phaser 3 framework, the integration of the Hanuman Chalisa as a ludic engine, and the state of AI-driven art production in March 2026\.

## **The Kinetic Sanctity of "Juice" in 2D Browser Environments**

In the vernacular of contemporary game design, "juice" refers to the non-essential but vital feedback loops that communicate weight, impact, and presence to the player. For a browser-based project targeting the atmospheric richness of a title like *Ori*, the implementation of juice must overcome the inherent latency of web environments while leveraging the unique capabilities of the Phaser 3 engine.1

### **Temporal Elasticity and the Mechanics of Impact**

One of the most profound methods for establishing the "Divine" nature of Hanuman is the manipulation of time itself. Within the Phaser 3 ecosystem, temporal control is achieved through the TimeStep plugin and the timeScale property of the Timeline and Tween managers.2 In 2026, the standard for impact feedback is "hit-stop"—a momentary pause in the game’s logic that allows the player’s brain to process a collision as a significant event.5

The implementation of hit-stop in a vanilla JavaScript environment requires a centralized state manager to prevent desynchronization. A common strategy involves a boolean flag, isHitFrozen, which is checked at the entry of every game object’s update() cycle. When a collision occurs—such as Hanuman’s mace connecting with a *Rakshasa* in the Great War of Act 4—the engine triggers a global freeze for a duration determined by the formula:

![][image1]  
where ![][image2] is the pause duration, ![][image3] is the base frame count (typically 3–10 frames), ![][image4] is the impact magnitude, and ![][image5] is the browser’s refresh rate.6 While this "Step Exit" approach is efficient, a more modern 2026 technique utilizes the this.time.timeScale property. By dropping the timescale to ![][image6] rather than a hard ![][image7], the developer maintains the "oil-painting luminosity" through active post-processing effects like Chromatic Aberration and Bloom, which continue to animate even as the character physics are suspended.4

### **Kinetic Forgiveness and the Heroic Move-Set**

To achieve a movement feel comparable to *Celeste*, the game must implement "Kinetic Forgiveness"—a suite of mechanics designed to favor the player's intent over pixel-perfect collision accuracy.9 This is especially relevant in Act 3, where Hanuman must cross the ocean to Lanka. The platforming in this sequence demands extreme precision that, without forgiveness, would lead to player frustration in a browser environment prone to minor input lag.

| Mechanic | Description | Technical Implementation in Phaser 3 |
| :---- | :---- | :---- |
| **Coyote Time** | Allows a jump for a short window after leaving a ledge. | Uses a lastGroundedTime variable updated in the isFloor check, allowing jump logic to execute if currentTime \- lastGroundedTime \< 150ms.10 |
| **Jump Buffering** | Registers a jump input shortly before the player hits the ground. | Stores jumpButtonPressedTime; if the player hits a floor within ![][image8] of this timestamp, the jump executes instantly.10 |
| **Corner Correction** | Nudges the player horizontally if they clip a tile's corner during a jump. | Checks body.blocked.up and utilizes a sensor array to adjust the x coordinate by ![][image9] pixels.9 |
| **Lift Momentum** | Stores velocity from moving platforms and applies it to the jump. | Inherits the platform's body.velocity at the moment of jump call and applies it as a persistent additive force.9 |

These mechanics are essential for communicating the effortless grace of a divine being. In Act 1, where a baby Hanuman leaps toward the sun, the Half-Gravity Jump Peak is employed. By halving the gravity constant ![][image10] when the jump button is held near the apex, the engine creates a "weightless" sensation that mirrors the cosmic scale of the event.9

### **Atmospheric Rendering and the Camera as a Narrative Tool**

The "Ori" aesthetic relies heavily on the camera’s interaction with the environment. In Phaser 3, the Camera system has been expanded by 2026 to support complex "Punch" and "Lerp" configurations.14 "Camera Punch" involves a rapid, non-linear zoom toward the point of action, followed by an eased recovery. This is technically achieved by tweening the this.cameras.main.zoom property using a back.out or circ.out easing function.14

To maintain the DharmaWeave art direction’s luminosity, the game utilizes the rexHorrifiPipeline. This post-processing shader is particularly effective in browser engines because it collapses multiple passes—vignette, noise, bloom, and chromatic aberration—into a single fragment shader call, significantly reducing the draw call overhead on integrated GPUs.8 For the "sacred fire tones" of the war in Act 4, the bloomIntensity and vignetteStrength are dynamically linked to the player's "Devotion Gauge," causing the world to glow more intensely as Hanuman’s power peaks.8

| Camera Effect | Narrative Context | Implementation Strategy |
| :---- | :---- | :---- |
| **Dynamic Lerp** | Tracking Hanuman’s flight across the ocean. | camera.setLerp(0.1, 0.1) for smooth, lagging tracking that emphasizes speed.15 |
| **Follow Offset** | Peering ahead during high-speed traversal. | Shifting camera.followOffset.x based on the player’s horizontal velocity to keep the goal in view.19 |
| **Screen Shake** | The impact of swallowing the sun. | camera.shake(500, 0.02) coupled with a flash() effect for peak visual impact.21 |
| **Parallax Zoom** | Distant views of Ayodhya. | Simultaneously tweening camera.zoom and background layer scroll factors to create a "dolly zoom" effect.14 |

## **Scriptural Ludology: Encoding the Divine in the Hanuman Chalisa**

Transforming the 40 verses of the Hanuman Chalisa into a 5-act interactive experience requires a shift from linear storytelling to "Sacred Systems." In this framework, the text is not just a source of plot but a "Symbolic Infrastructure" that defines the game's mechanics and ethics.23

### **The Five Acts: A Narrative and Mechanical Breakdown**

The structure of "Hanuman — Journey of the Divine" aligns with the chronological and spiritual progression of the hymn. Each act introduces a new mechanical layer that mirrors Hanuman’s evolution.

1. **Act 1: The Cosmic Ascent (Baby Hanuman and the Sun):** Focuses on "Laghima" (weightlessness). The gameplay centers on vertical platforming and gravity manipulation. The aesthetic is dominated by "warm golden ambers" and high-contrast light blooms.9  
2. **Act 2: The Alignment of Wills (Meeting Ram):** Focuses on "Bhakti" (devotion). Introduces a companion system and "Symbolic Operating Systems" where the player’s actions must align with a moral compass to gain power.23  
3. **Act 3: The Ocean Leap (Crossing to Lanka):** Focuses on "Prapti" (reach). A high-speed traversal level emphasizing momentum storage and "Coyote Time" over vast oceanic chasms.9  
4. **Act 4: The Great War (Lanka):** Focuses on "Mahima" (growth) and "Garima" (weight). Combat mechanics involve scaling the character’s size and mass to interact with large-scale destructible environments. The palette shifts to "sacred fire tones" and "cosmic indigos".8  
5. **Act 5: The Return to Ayodhya:** Focuses on "Mukti" (liberation). A contemplative sequence where the player’s previously acquired powers are used to heal the environment, leading to a visual climax of "oil-painting luminosity".25

### **Scripture as Code: Integrating the Chalisa**

In 2026, the integration of sacred texts into gameplay has evolved beyond simple subtitles. Modern engines utilize "Dharmic Chatbots" and semantic search algorithms to link specific verses to game states in real-time.26 For this project, the Hanuman Chalisa acts as a metadata layer. Each verse is tagged with "Relevance Scores" for specific keywords like *Shakti* (strength) or *Vidya* (knowledge).26

As the player navigates Act 4, the engine can poll the "Dharmic Treasures" database to find verses that match the current environmental intensity. The result is a "Procedural Narrative" where the ambient score and background effects are driven by the phonetic structure of the verses. This is supported by neuroscientific research indicating that the rhythmic chanting of the Chalisa harmonizes breathing patterns and heart rate variability (HRV)—an effect that can be mirrored in-game through a "Rhythm Combat" system where successful strikes are timed to the *Chaupai* meter.27

| Mechanical System | Scriptural Basis | Ludic Function |
| :---- | :---- | :---- |
| **Siddhi System** | The 8 *Siddhis* and 9 *Nidhis*. | A non-linear skill tree where powers like *Anima* (shrinking) are unlocked through devotional acts.23 |
| **Devotion Gauge** | *Bhakti* as a source of *Shakti*. | A secondary resource bar that refills when the player remains in a "meditative state" (standing still) or performs selfless actions.23 |
| **Vibration Combat** | Mantras as "Structured Vibration". | Hits are mapped to the syllables of the Chalisa; completing a verse triggers a "Divine Intervention" screen-clearing effect.23 |
| **Water Rituals** | The "Hanuman Chalisa and Water Remedy". | Healing mechanics tied to sanctifying environmental water sources, turning them into "Amrit" for the player.29 |

### **Navigating the Cultural Tightrope**

The release of high-fidelity Indian mythology games in 2026 faces a "perilous landscape" of cultural and religious sensitivities.24 Unlike Western mythology, which is often treated as secular folklore, the *Itihasa* (history) of Hanuman is a living tradition for millions. The success of *Black Myth: Wukong*—selling 25 million copies by early 2025—demonstrates that "Cultural Authenticity" is a powerful global differentiator, but it requires a "Religious Soft Power" strategy.30

Developers in 2026 often use a "Mentorship Strategy" to avoid accusations of irreverence. Rather than playing as a god in a way that feels trivial, the player often controls a "representative" or follows the god's direct guidance.33 In "Hanuman — Journey of the Divine," the player is encouraged to see the gameplay as a "Active Recitation," where every input is a form of prayer. This framing transforms the act of "winning" into an act of "attainment," aligning with the philosophical core of the Hanuman Chalisa.23

## **The Generative Renaissance: Autonomous Art Pipelines in March 2026**

The visual target of "oil-painting luminosity" is achieved through a 2026 production-ready AI game art pipeline. By March 2026, the challenges of character consistency and style drift have been fundamentally resolved through Identity Embedding and LoRA (Low-Rank Adaptation) technologies.34

### **Identity Embedding and Character Consistency**

The "original problem" of AI art—where a character’s face or outfit changed with every generation—is now addressed by the creation of a mathematical "fingerprint" or "Identity Embedding".34 For Hanuman, the developer uses a "Consistent Character Template" workflow:

1. **Identity Creation:** 1–3 reference images from the DharmaWeave novel are used to create a "fingerprint." This embedding captures the specific facial structure of the "Baby Hanuman" and the "Divine Warrior" forms.34  
2. **LoRA Training:** A custom LoRA is trained on 15–30 images of the character in under 10 minutes. This allows the model to "remember" the specific "sacred fire tones" and "painterly textures" of the original art direction.34  
3. **Cross-Scene Locking:** Platforms like Midjourney v7 utilize "cref" (character reference) parameters to ensure that Hanuman’s appearance remains identical whether he is in a dark Himalayan cave or a bright, amber-lit Ayodhya.34

This breakthrough allows the developer to generate 2D sprites that maintain "visual neighbor consistency"—a requirement for the "Ori" style where every frame must feel like a part of a unified painting.35

### **The Video-to-Sprite Workflow**

The most labor-intensive part of 2D development—animation—is now handled through an "AI Spritesheet Generator" that converts cinematic video into game-ready assets.38

| Tool | Feature | Role in "Hanuman" Pipeline |
| :---- | :---- | :---- |
| **Kling 3.0 / Runway Gen-4.5** | Multi-shot editing and temporal coherency. | Generates high-fidelity 10-second clips of Hanuman performing complex moves (e.g., the sun-swallow leap).41 |
| **SpriteMaster AI** | Frame extraction and timing cleanup. | Converts Kling video output into 16-frame sequences, ensuring seamless loops for idle and walk cycles.40 |
| **Layer Diffusion (SD Forge)** | Native transparency generation. | Generates sprites with a built-in alpha channel, avoiding the "halo" effect often seen in post-hoc background removal.45 |
| **Ludo.ai / Dzine** | Motion transfer from reference video. | Takes a video of a real actor performing a "Mudra" and transfers that motion to the AI-generated Hanuman sprite.39 |

By using this pipeline, a solo developer can produce hundreds of unique animation frames per day. Act 4’s "Great War" requires a high volume of *Rakshasa* enemies; the AI pipeline allows for "Attribute-based Synthetic Models," creating infinite variations of demon warriors while maintaining the project's "dark fantasy tones".37

### **Parallax and Tileable Backgrounds**

The "Ori" aesthetic’s depth is created through multiple visual layers moving at different speeds.18 In March 2026, AI tools like "Tiling Standard" and "ZSky AI" generate seamless 4K textures for these layers from simple text prompts.50 For Act 3’s ocean crossing, the developer generates three distinct layers:

1. **Background Layer:** Deep "cosmic indigo" nebulae and celestial gases, moving at ![][image11] speed.18  
2. **Midground Layer:** Detailed ocean waves with "sacred fire" reflections, moving at ![][image12] speed.18  
3. **Foreground Layer:** Silhouetted Himalayan peaks and floating ruins, moving at ![][image13] speed, using "Depth Maps" generated by ComfyUI to respond to dynamic lighting.18

The integration of these layers in Phaser 3 utilizes the scrollFactor property. To optimize performance in a browser, these layers are compressed as WebP or AVIF files and served via a CDN, ensuring that even the "atmospheric richness" of a high-end indie title remains accessible on a standard mobile browser.1

## **Macroeconomic Implications and Global Reception of the Indic Itihasa Genre**

The development of "Hanuman — Journey of the Divine" occurs within a broader 2026 movement to export Indian narrative traditions through interactive media.30 This "Cultural Moonshot" is driven by a massive youth population and a new ecosystem of funding and expertise.30

### **Cost Analysis and Team Requirements in 2026**

The budget for an ambitious 2D project has been significantly reduced by AI integration. While a traditional story-driven RPG might have cost $500,000+ in 2024, a small 2026 team can achieve AAA visuals for a fraction of that.54

| Project Tier | Team Size | 2026 Budget Range | Duration |
| :---- | :---- | :---- | :---- |
| **Solo Developer (AI-Heavy)** | 1 person | $10,000 – $50,000 | 6 – 12 months 54 |
| **Indie Team** | 2 – 5 people | $50,000 – $200,000 | 12 – 18 months 54 |
| **Mid-Core Mythology Game** | 10 – 40 people | $300,000 – $1.5M | 18 – 24 months 55 |
| **AAA "Global" Epic** | 100+ people | $10M – $50M+ | 3 – 5 years 53 |

For a browser-based project using Phaser 3 \+ Vite, the primary costs shift from "Asset Production" to "Polish and Optimization." AI tools now reduce asset creation and coding costs by approximately 20–35%, allowing developers to reallocate funds toward marketing and "Juice".54 In regions like India, a senior programmer in 2026 costs $30–$55 per hour, while an AI Art Pipeline Architect—a new role in 2026—commands premium rates for ensuring "Visual Identity Continuity".35

### **Market Performance and Global Benchmarks**

The success of *Black Myth: Wukong* has fundamentally changed the "trust deficit" for non-Western mythological games. As of mid-October 2025, *Wukong* became the best-selling souls-like of the decade on Steam, outperforming even *Elden Ring* in its initial sales window.57

| Metric | Black Myth: Wukong (2025) | Raji: An Ancient Epic (Lifetime) |
| :---- | :---- | :---- |
| **Units Sold** | 25 Million+ | 81,000 – 830,000 (est.) 31 |
| **Total Revenue** | $1.1 Billion+ | $1.3 Million+ (Steam) 32 |
| **Player Base** | 70% China / 30% Overseas | Global Indie Audience 31 |
| **Art Style** | High-Fidelity 3D (UE5) | Stylized 2D/3D Painterly 60 |

While "Hanuman" targets a different market (browser-based, hyper-accessible), the *Wukong* data suggests that the "Asia-Pacific" region now accounts for over 80% of new "Souls-like" or mythological releases on Steam.57 There is a burgeoning "Export Market" for Indian-themed games, with companies like Tara Gaming and Treta Studios securing government grants to tell Indic stories to a global audience.24

### **The Role of Performance and Portability**

Building in Phaser 3 \+ Vite provides a "Zero-Install" advantage that is critical for reaching the mobile-first Indian market.24 In 2026, mobile gaming accounts for 66% of total gaming expenditure in major emerging markets.63 To compete with native apps, a browser game must achieve 60fps consistency.

Phaser 3’s "Update List" and "Display List" management are superior for high-intensity action games, but they require strict adherence to "Object Pooling" and "Texture Packing".1 The transition to Vite as a build tool has reduced "Cold Start" times by 40%, ensuring that the "Divine Journey" begins almost instantly when the URL is loaded.

## **Conclusion: The Synthesis of Dharma and Digital Craft**

The development of "Hanuman — Journey of the Divine" represents more than a technical challenge; it is an exercise in "Symbolic Custodianship".23 By March 2026, the tools available to the independent developer—specifically Phaser 3’s advanced post-processing, AI-driven character consistency, and automated spritesheet pipelines—have democratized the creation of high-fidelity atmospheric experiences.

To succeed, the project must treat "Juice" as a sacred expression of Hanuman's power, using temporal manipulation and kinetic forgiveness to bridge the gap between human input and divine action.9 The integration of the Hanuman Chalisa as a mechanical engine provides a narrative depth that transcends traditional storytelling, tapping into the rhythmic and neuroscientific benefits of the sacred hymn.26

Ultimately, the commercial success of mythological epics like *Black Myth: Wukong* and the emerging slate of Indian AAA titles like *The Age of Bhaarat* confirms that there is a global hunger for authentic, culturally grounded narratives.31 By maintaining the "DharmaWeave" aesthetic through a rigorous AI-driven pipeline and optimizing for the ubiquitous browser, "Hanuman — Journey of the Divine" is positioned to become a hallmark of the new Indian gaming renaissance—a project where the ancient and the avant-garde are perfectly aligned.

#### **Works cited**

1. How I optimized my Phaser 3 action game — in 2025 | by François \- Medium, accessed on March 26, 2026, [https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b)  
2. TimeStep | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/api-documentation/class/core-timestep](https://docs.phaser.io/api-documentation/class/core-timestep)  
3. Timeline | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/api-documentation/class/time-timeline](https://docs.phaser.io/api-documentation/class/time-timeline)  
4. Time | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/phaser/concepts/time](https://docs.phaser.io/phaser/concepts/time)  
5. HIT-STOP FRAMES ARE ANNOYING : r/metroidvania \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/metroidvania/comments/1ollmr1/hitstop\_frames\_are\_annoying/](https://www.reddit.com/r/metroidvania/comments/1ollmr1/hitstop_frames_are_annoying/)  
6. My Implementation of Hitstop and how i've set it up. Any tips? ( Bit of a long read :V ) : r/gamemaker \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/gamemaker/comments/1jtgwv0/my\_implementation\_of\_hitstop\_and\_how\_ive\_set\_it/](https://www.reddit.com/r/gamemaker/comments/1jtgwv0/my_implementation_of_hitstop_and_how_ive_set_it/)  
7. FX | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/phaser/concepts/fx](https://docs.phaser.io/phaser/concepts/fx)  
8. Horri-fi \- Notes of Phaser 3 \- GitHub Pages, accessed on March 26, 2026, [https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shader-horrifi/](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shader-horrifi/)  
9. Celeste & Forgiveness \- Maddy Makes Games, accessed on March 26, 2026, [https://www.maddymakesgames.com/articles/celeste\_and\_forgiveness/index.html](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html)  
10. Improve Annoying Jump Controls With Coyote Time and Jump Buffering \- Unit Game development Tutorial \- Ketra Games, accessed on March 26, 2026, [https://www.ketra-games.com/2021/08/coyote-time-and-jump-buffering.html](https://www.ketra-games.com/2021/08/coyote-time-and-jump-buffering.html)  
11. \[5.4.9\] Implementing "Coyote Time": Ensuring Smooth Platform Jumping Even at the Last Second | NESMakers, accessed on March 26, 2026, [https://www.nesmakers.com/index.php?threads/5-4-9-implementing-coyote-time-ensuring-smooth-platform-jumping-even-at-the-last-second.8320/](https://www.nesmakers.com/index.php?threads/5-4-9-implementing-coyote-time-ensuring-smooth-platform-jumping-even-at-the-last-second.8320/)  
12. Learn how to implement coyote time and jump buffering in Unity\! : r/unity\_tutorials \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/unity\_tutorials/comments/pl15nj/learn\_how\_to\_implement\_coyote\_time\_and\_jump/](https://www.reddit.com/r/unity_tutorials/comments/pl15nj/learn_how_to_implement_coyote_time_and_jump/)  
13. Improve Your Game Feel With Coyote Time and Jump Buffering \- YouTube, accessed on March 26, 2026, [https://www.youtube.com/watch?v=97\_jvSPoRDo](https://www.youtube.com/watch?v=97_jvSPoRDo)  
14. Phaser 3 Examples, accessed on March 26, 2026, [https://labs.phaser.io/edit.html?src=src/game%20objects/container/container%20and%20camera%20zoom.js\&v=3.55.2](https://labs.phaser.io/edit.html?src=src/game+objects/container/container+and+camera+zoom.js&v=3.55.2)  
15. Camera \- Notes of Phaser 3 \- GitHub Pages, accessed on March 26, 2026, [https://rexrainbow.github.io/phaser3-rex-notes/docs/site/camera/](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/camera/)  
16. Cameras | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/phaser/concepts/cameras](https://docs.phaser.io/phaser/concepts/cameras)  
17. Camera | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/api-documentation/class/cameras-scene2d-camera](https://docs.phaser.io/api-documentation/class/cameras-scene2d-camera)  
18. The best way to create a parallax scrolling effect in 2026 \- Builder.io, accessed on March 26, 2026, [https://www.builder.io/blog/parallax-scrolling-effect](https://www.builder.io/blog/parallax-scrolling-effect)  
19. Examples \- v3.55.0 \- input \- camera \- Follow Offset \- Phaser, accessed on March 26, 2026, [https://phaser.io/examples/v3.55.0/input/camera/view/follow-offset](https://phaser.io/examples/v3.55.0/input/camera/view/follow-offset)  
20. Examples \- v3.85.0 \- camera \- Follow Offset \- Phaser, accessed on March 26, 2026, [https://phaser.io/examples/v3.85.0/camera/view/follow-offset](https://phaser.io/examples/v3.85.0/camera/view/follow-offset)  
21. Examples \- v3.85.0 \- camera \- Shake \- Phaser, accessed on March 26, 2026, [https://phaser.io/examples/v3.85.0/camera/view/shake](https://phaser.io/examples/v3.85.0/camera/view/shake)  
22. Examples \- v3.55.0 \- input \- camera \- Shake \- Phaser, accessed on March 26, 2026, [https://phaser.io/examples/v3.55.0/input/camera/view/shake](https://phaser.io/examples/v3.55.0/input/camera/view/shake)  
23. Sacred Systems: How Religious Texts Encode Operational Magic | by Anthony C Fox, accessed on March 26, 2026, [https://medium.com/@fox.anthony/sacred-systems-how-religious-texts-encode-operational-magic-4dfec31f3c72](https://medium.com/@fox.anthony/sacred-systems-how-religious-texts-encode-operational-magic-4dfec31f3c72)  
24. "Made in India" Games: The Great AAA PC & Console Pivot ..., accessed on March 26, 2026, [https://respawn.outlookindia.com/gaming/gaming-guides/upcoming-indian-games-make-or-break-2026-for-the-industry](https://respawn.outlookindia.com/gaming/gaming-guides/upcoming-indian-games-make-or-break-2026-for-the-industry)  
25. Power of Hanuman Chalisa \- YouTube, accessed on March 26, 2026, [https://www.youtube.com/shorts/KYE2kvu3-YY](https://www.youtube.com/shorts/KYE2kvu3-YY)  
26. TechnoBlogger14o3/dharmic-treasures: This is a modern, interactive web application that brings the sacred texts of Hindu philosophy to life. The application features multiple scriptures including the Bhagavad Gita, Hanuman Chalisa, Sunderkand, Bajrang Baan, and Yaksha Prashna, all with beautiful UI, 3D animations. \- GitHub, accessed on March 26, 2026, [https://github.com/TechnoBlogger14o3/dharmic-treasures](https://github.com/TechnoBlogger14o3/dharmic-treasures)  
27. The Powerful Effect of Hanuman Chalisa on Your Brain and Heart | Dr. Sweta Adatia, accessed on March 26, 2026, [https://www.youtube.com/watch?v=-sRndBNuAxM](https://www.youtube.com/watch?v=-sRndBNuAxM)  
28. Unleash the Miraculous Power of Hanuman Chalisa | Transform Your Life Today\! \- YouTube, accessed on March 26, 2026, [https://www.youtube.com/watch?v=ZXw\_fujQPq4](https://www.youtube.com/watch?v=ZXw_fujQPq4)  
29. Remove Evil Spirits and Negative Energies with This Simple Remedy | Hanuman Chalisa ... \- YouTube, accessed on March 26, 2026, [https://www.youtube.com/shorts/RqjQvelkLtQ](https://www.youtube.com/shorts/RqjQvelkLtQ)  
30. Itihasa, the new game in town \- The Economic Times, accessed on March 26, 2026, [https://m.economictimes.com/opinion/et-commentary/itihasa-the-new-game-in-town/articleshow/122118000.cms](https://m.economictimes.com/opinion/et-commentary/itihasa-the-new-game-in-town/articleshow/122118000.cms)  
31. Nearly 70% Of Black Myth: Wukong Sales Are From China, Art Director Confirms, accessed on March 26, 2026, [https://tech4gamers.com/70-black-myth-wukong-sales-china/](https://tech4gamers.com/70-black-myth-wukong-sales-china/)  
32. Black Myth: Wukong and China's Soft Power Expansion \- RSIS, accessed on March 26, 2026, [https://rsis.edu.sg/rsis-publication/rsis/black-myth-wukong-and-chinas-soft-power-expansion/](https://rsis.edu.sg/rsis-publication/rsis/black-myth-wukong-and-chinas-soft-power-expansion/)  
33. Hi\! I'm developing a Hindu inspired video game and would like to know your thoughts : r/hinduism \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/hinduism/comments/pvchrg/hi\_im\_developing\_a\_hindu\_inspired\_video\_game\_and/](https://www.reddit.com/r/hinduism/comments/pvchrg/hi_im_developing_a_hindu_inspired_video_game_and/)  
34. Character Consistency in AI Art: The 2026 Breakthrough Explained ..., accessed on March 26, 2026, [https://aistorybook.app/blog/ai-image-generation/character-consistency-in-ai-art-solved](https://aistorybook.app/blog/ai-image-generation/character-consistency-in-ai-art-solved)  
35. ai-game-art-generation | Skills Mark... \- LobeHub, accessed on March 26, 2026, [https://lobehub.com/skills/neversight-learn-skills.dev-ai-game-art-generation](https://lobehub.com/skills/neversight-learn-skills.dev-ai-game-art-generation)  
36. Consistent Character Template \- RunDiffusion, accessed on March 26, 2026, [https://www.rundiffusion.com/consistent-character-template](https://www.rundiffusion.com/consistent-character-template)  
37. Top 10 Best AI Consistent Character Generator of 2026 \- WifiTalents, accessed on March 26, 2026, [https://wifitalents.com/best/ai-consistent-character-generator/](https://wifitalents.com/best/ai-consistent-character-generator/)  
38. Free AI Sprite Sheet Generator: Create Custom Game Sprites with Rosebud AI, accessed on March 26, 2026, [https://lab.rosebud.ai/blog/ai-sprite-sheet-generator-create-free-game-sprites-with-rosebud-ai](https://lab.rosebud.ai/blog/ai-sprite-sheet-generator-create-free-game-sprites-with-rosebud-ai)  
39. Generate and Animate Custom Sprites and Sprite Sheets for Your Games \- Ludo.ai, accessed on March 26, 2026, [https://ludo.ai/features/sprite-generator](https://ludo.ai/features/sprite-generator)  
40. Trying to create a sprite sheet for a 2d platformer and I need some help / advice. \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/aigamedev/comments/1qucfl9/trying\_to\_create\_a\_sprite\_sheet\_for\_a\_2d/](https://www.reddit.com/r/aigamedev/comments/1qucfl9/trying_to_create_a_sprite_sheet_for_a_2d/)  
41. Runway AI Release Notes \- March 2026 Latest Updates \- Releasebot, accessed on March 26, 2026, [https://releasebot.io/updates/runwayai](https://releasebot.io/updates/runwayai)  
42. My deep dive into AI video generators in 2026 \- Runway, Kling, Veo, and more. What are you guys actually using? : r/Freepik\_AI \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/Freepik\_AI/comments/1r6baar/my\_deep\_dive\_into\_ai\_video\_generators\_in\_2026/](https://www.reddit.com/r/Freepik_AI/comments/1r6baar/my_deep_dive_into_ai_video_generators_in_2026/)  
43. AI Video 2026: Sora vs Runway vs Kling Comparison | OnOff.gr, accessed on March 26, 2026, [https://www.onoff.gr/blog/en/ai/ai-video-2026-sora-vs-runway-vs-kling-comparison/](https://www.onoff.gr/blog/en/ai/ai-video-2026-sora-vs-runway-vs-kling-comparison/)  
44. I launched SpriteMaster on Product Hunt — a free tool to turn AI videos into game sprite sheets : r/SideProject \- Reddit, accessed on March 26, 2026, [https://www.reddit.com/r/SideProject/comments/1r0v67a/i\_launched\_spritemaster\_on\_product\_hunt\_a\_free/](https://www.reddit.com/r/SideProject/comments/1r0v67a/i_launched_spritemaster_on_product_hunt_a_free/)  
45. Generate images with transparent backgrounds with Stable Diffusion, accessed on March 26, 2026, [https://stable-diffusion-art.com/transparent-background/](https://stable-diffusion-art.com/transparent-background/)  
46. AI background remover built into your workflow \- Leonardo.Ai, accessed on March 26, 2026, [https://leonardo.ai/transparent-png-generator/](https://leonardo.ai/transparent-png-generator/)  
47. Transparent Background Maker | Create Transparent PNGs | Claid.ai, accessed on March 26, 2026, [https://claid.ai/transparent-bg-maker](https://claid.ai/transparent-bg-maker)  
48. AI Sprite Generator – Create Animated Sprites with Dzine, accessed on March 26, 2026, [https://www.dzine.ai/tools/ai-sprite-generator/](https://www.dzine.ai/tools/ai-sprite-generator/)  
49. AI Sprite Sheet Maker \- Pixelflow | Segmind, accessed on March 26, 2026, [https://www.segmind.com/pixelflows/ai-sprite-sheet-maker](https://www.segmind.com/pixelflows/ai-sprite-sheet-maker)  
50. Best AI for Backgrounds \[Tested\] 2026 \- ZSky AI, accessed on March 26, 2026, [https://zsky.ai/blog/best-ai-for-backgrounds](https://zsky.ai/blog/best-ai-for-backgrounds)  
51. Tileable Textures \- RunDiffusion, accessed on March 26, 2026, [https://www.rundiffusion.com/tileable-textures](https://www.rundiffusion.com/tileable-textures)  
52. Top 3 pipelines for creating textures with AI (MidJourney, SD XL, DreamBooth) \- AI Library, accessed on March 26, 2026, [https://library.phygital.plus/top-3-pipelines-for-creating-textures-with-ai](https://library.phygital.plus/top-3-pipelines-for-creating-textures-with-ai)  
53. Inside Amish Tripathi, Amitabh Bachchan's Gaming Gambit To Bolster India's Soft Power, accessed on March 26, 2026, [https://www.outlookbusiness.com/interviews/inside-amish-tripathi-amitabh-bachchans-gaming-gambit-to-bolster-indias-soft-power-2](https://www.outlookbusiness.com/interviews/inside-amish-tripathi-amitabh-bachchans-gaming-gambit-to-bolster-indias-soft-power-2)  
54. Indie Game Budgets: 2026 Cost Breakdown & Success Stats \- VSQUAD Studio, accessed on March 26, 2026, [https://vsquad.art/blog/indie-game-budgets-what-it-really-costs-to-build-a-game](https://vsquad.art/blog/indie-game-budgets-what-it-really-costs-to-build-a-game)  
55. What Affects Game Development Costs in 2026? Insights into Hiring, Art, and Technology, accessed on March 26, 2026, [https://www.juegostudio.com/blog/what-affects-game-development-costs-in-2025-insights-into-hiring-art-and-technology](https://www.juegostudio.com/blog/what-affects-game-development-costs-in-2025-insights-into-hiring-art-and-technology)  
56. Mobile Game Development Cost in 2026: A Complete Budgeting Guide \- TekRevol, accessed on March 26, 2026, [https://www.tekrevol.com/blogs/mobile-game-development-cost/](https://www.tekrevol.com/blogs/mobile-game-development-cost/)  
57. Black Myth: Wukong tops 25 million copies sold as its merchandise sales skyrocket in China, accessed on March 26, 2026, [https://gameworldobserver.com/2025/01/31/black-myth-wukong-25m-copies-sold-merchandise-china](https://gameworldobserver.com/2025/01/31/black-myth-wukong-25m-copies-sold-merchandise-china)  
58. Raji: An Ancient Epic – Steam Stats – Video Game Insights \- Sensor Tower, accessed on March 26, 2026, [https://app.sensortower.com/vgi/game/raji-an-ancient-epic](https://app.sensortower.com/vgi/game/raji-an-ancient-epic)  
59. Raji: An Ancient Epic stats, graphs, and player estimates | PlayTracker Insight, accessed on March 26, 2026, [https://playtracker.net/insight/game/63456?utm\_source=SteamDB](https://playtracker.net/insight/game/63456?utm_source=SteamDB)  
60. Raji: An Ancient Epic Steam stats | Gamalytic, accessed on March 26, 2026, [https://gamalytic.com/game/730390](https://gamalytic.com/game/730390)  
61. Raji: An Ancient Epic | Newzoo, accessed on March 26, 2026, [https://newzoo.com/games/raji-an-ancient-epic](https://newzoo.com/games/raji-an-ancient-epic)  
62. Indian Board Games Gain Popularity as Bengaluru Emerges as a Gaming Hub \- Deccan Herald, accessed on March 26, 2026, [https://www.deccanherald.com/india/karnataka/bengaluru/indian-made-board-games-are-gaining-traction-3853736](https://www.deccanherald.com/india/karnataka/bengaluru/indian-made-board-games-are-gaining-traction-3853736)  
63. Black Myth: Wukong Redefines China's Game Market – CKGSB Knowledge, accessed on March 26, 2026, [https://english.ckgsb.edu.cn/knowledge/article/game-on-black-myth-wukong-boosts-chinas-already-thriving-video-game-market/](https://english.ckgsb.edu.cn/knowledge/article/game-on-black-myth-wukong-boosts-chinas-already-thriving-video-game-market/)  
64. Scenes | Phaser Help, accessed on March 26, 2026, [https://docs.phaser.io/phaser/concepts/scenes](https://docs.phaser.io/phaser/concepts/scenes)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAYCAYAAAB9ejRwAAABeElEQVR4Xu2VvytGURjHHxSGd8BCKZM3LCZ/gUkZlGSWXoOJzWqiDP4AsjFJiZQVI2EzKoNBfiYSiu/Tc9567nNPuEf3Pcv91qd7nu9zft9zzyUqVCgf7YKvDNREPNC4x7MT6PV4uaiNZKe06kkGPzc+68oaeWgP1BlvlmRSI8ZvBMvGy0Uz1oAeyP+aWkC7NWsl33mKqgaSCZ3YREzNkUxq2CZi6pnCX11ou1/1n/MU2u5H8Sf/l/N0DNbBk4urC7ELagZ3JHWvndcDdsAU2AcHlL56Elol6XTC+FrTYNKV9QROKdl5iZL5DbAAHkEX+FC51A6PgleSu4lXxfC5eidPZahC4nMbvvmrsnU/wZiKt8GmK6+ARZWzbTOrCXSALUp2Zjv2xWVV5p1k9bs4WLz9Nyo+dM9BcOHKl+6pBxoAtyrWOfZbVZxZ/I98AUeU/onz6z5TMe8mD84fzbzyO0nO0z14A30qF01rYMmaMdVNsntDNlEoRN8L3WdO6E0OLgAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAYCAYAAAB5j+RNAAABfElEQVR4Xu2VTStFURSGV/lIScrcjCRlQP6CTBgYMDG4BpKJkVJm/AIzplKIqZFMDBkoks8Uc0JSSuJ9W3tnWfekm9s9e3Keejp7r33u2evutTpHpKAgLXvwq0KT8VcC2/DDB/OiTjSxI78QaIEHPpgXc6LJDbl4U7i2wiW7kCcvUl7SBdgRxg2w2azliu+3bjdPRuy3LJMzL5rIiIn1wh0zJ2uSIOFXKd90SrS0FiZ/6WI1p9ISHsNxH6wljaKJHfqFDHjfRnDRxHnC9/AczsB6s9YJH+AJ7DLxfvgGt0R/k8my6KaVnIg93Thug58ZcT9nm6yEcQnehjHha+wXm6K99gQf4TN8l58HePhyvjFzbspT5zMmXNwSW2bVxfi1OQ3XqmEpJ808JmGTKcF9M+crioyK3tcT5v4PVM0sHAvjXTgdxnYjlmcQXpi12H934RrjFluRf8PSc+NhE+sTbfhrOCC6EZudsJ/PRPsrfgZJu2iCV3DdxAsKkvANHq9pNWwd9LcAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAYCAYAAABJA/VsAAACfElEQVR4Xu2XO2gVQRSGj2+jEmMQ0ygR0cIHNoKN0VZQQRBsBFMEEZtoYaOgiGKhkMrCRxdFEVS0UDDBRkQSUUQkhYgo+H6QBPGF+P7/nDPcs5NZkyLi3bAf/Mx5zO7dmZ0zO1ekpKRkNLMP+gT9Nt3NpgfxVCp9ed3ObLpYhIFQeSyF9or2WRblCskLqbzxPJ5DXfL3PoVhDbQFuiL5A7po7VCroTDcspb1mRrQNKjVbObPu1xhCQNlndKe7XLkq7WrRfOLXK6wvHQ2B9Xs/B3QVLO5IlIroXDw7W11Pgd10vl+KefV80zoWRz8T0yKAylCPQc4KO7S5JVPiObORTEyS6rnE5Z6KYOIO4W3uRJa4uJrLb7YxaqNGdCvOJjibeT3ig7uURTnSS2eIPJYsj90Cnot+gDcKzqhdmgB1CG6KU63vpNFV84Z6KjZuyxHONF3RM8QR1ycrBL9nctQi1ReVl4JDjBG9IF5rPSclfRFqZuth8ZB36B6i22HLkj2vrxuodm7oeNmP7DW3zfYy0UHG8cJP62hLC9BN83+KTrZSdqg91Af9BH64XLroI3O/yyVvh+g76IP7okng/4Es2vMD/DtNzl/E9Tt/NCX7Ryz50FfzA65FHnxEecwdCKK+R/fL7rkA/GDPRT9gpCxkh10oB3aYzYPSvE9SJ0Ms55HgvAAT6ydL3qGD7CGG83mJsiVxe/+XIvxeg6W3IBWuHiA9hToXSJH7kMHoGPmX3W5fwI3n3vQRPMPSrY84tnvh047nwNg7bJ8WFoBHpC4Cq5B20Q30lrLbRCd5B7okMXGi5bfdfOrls3Q7Tg4mmmA3oj+Px/WKaqkZGj+ANgno7A9/RhQAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAYCAYAAABN9iVRAAACWklEQVR4Xu2WS6hOURiGXyGXiDiJ2cHARGJkSDrFRAYMFFNMhEwMzIwMyCUMToowYEJSigykCCGR20RS7sk1kuv7nm+t/m9/1n+Us+vUPv9Tb/9a77f3+tftW2sDHTp0GMrsoD5Qv5O+Um+p787rzg83lTzQyAWYPzMGmoQGeDmaZBEsdi8GmsJK2AB7YoD0wmKHg98Y7qO85UW7dGgMpQHOpX5QT4LfODRwnfDXqdvUt+SN8g/VxMhoDCY533WweR4kv04WUptQf7tiL6zdrhjoj0cod2Y7zJ8SAwPgZ/pdUXHrozSOfinlu/gM84fFwAAo/U9dTKJ+RfNfqENXoon2k3KL+khtgF1/q13sEnWOeuc8sROt9qQFydehepZaQ12l7iRfTKW+UIeo484XL6kjsPMpsxvWn6fUY2qVixXZCuvM0hjA34NXWZ3M5XHUQ2qX8/IBuZgam8qZZdTd4L2m5qG1Yvn/5sA+rzM6gDMnqBmp7PunNjTJYkSIVdhHfYKtkE7592jlY2Y2rIHnsO/98S4WG16fPH0K69kl1XAfp6jN0YSt6pbgqS1N1DXYBPtb51iKv3Ge8H3aSJ129dpYC9uqHtWPBi+izk2MJszXSkWvHTqDZsHSL0/ABFTf0UJOdvXaeEbND9466oyrayt3u7poN6CSry083NXPp1+dTSdTeTq1LZV1M+1PZZHb3OO8Wih1VlyEdU6pNK0a6qP03mjYCkbGwCbgBqzdjFZYt9BN6qDzlbp+V72gXrn6oLEc9gF1IAaajnJZ+eevsCGFUqDOD6UO/8sfOIqbmPwg+wsAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAXCAYAAABu8J3cAAABq0lEQVR4Xu2VvyuFYRTHDyXExIBsNouwSETiD0BYpLvJKJmYmIwyWyVZlBgkiZGBQhbdLEIGC6H8OF/Pudd5Tudetzu/n/p27/k857k973uf532JEhIKp4qzx/nmnHBK4uG89HGuKcxdM2OgjbPPaeeUcpo4y5wt3QQaKfxIpdS1UmPSf8xwvlQ9RWGuZkCczmPUIbxwNow75bwZ54EfbXbckqp7OTucVc4ip1qNRWDimHFz4vMxSH7PO8W+m7OgapceCpPQrEmJrzFec0D+QtIU+y4qYCHTFCZhI2lGxXcYr3kmfyGXFPtOCpsYbp3zyjlS47/gP0NDi/FD4seN12DcW8g5xR4XeatqgPFjLSZFtmrJjIjvN15zR/5CLsj3mnsyPZk9gtunmRCPo52LXHvkhnyvOaTQU5cR5SKKOTXz5PfYU4Pvtg+PB7gKLSFWtGB2xWuwgbNXIKDHniy4bVNvqhp8iI/wrh71sKrxyPeuDP91WtX1FHrKlDujcIQzNFDoSSmXBcfqUz7RhGNtwbth1krmifNAf3cR7xLLFYWxzJ3AYz8hIaFofgAWPXmSrF4a1QAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAWCAYAAAD5Jg1dAAAAqklEQVR4XmNgGFqAG4h3AfF/ID4NxIyo0hAgzQBRwAnlC0P5THAVUPAViFeiiZ0B4h9oYmDdYWhiVVBxOLCDCtggCwJBPFRcCCZQABUwgglAQShU3Bwm0AQV0IMJQEEgVDwaJhAEFTCGCUAByM0gcX2YgBZUwBkmAAVpUHF2ZEGQQA6yABBMgIqjgO9AfA1N7B0Q30cTY2BhQLU+CsrHCUDWnQDiYHSJYQUA4z4lJYXNoC8AAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAWCAYAAACG9x+sAAAB6klEQVR4Xu2WzytmYRTHD6kJJVNSUpI0ZSNlKdnMHyAa1rLxo5mIlcLSgo0isyDUNJNYzHaQhVJYUZidEhuU5HcI59tzHp173nt5S69S91Pf7nM+z+m59+HeB6KYmBhLN6fVSkUv54xzxWk2c55SzhrnkbNo5lLCH84tuRsibcHpZ3Y4C6re4qyoGtSQW8NTYeqUE7WBHAp/ELhcU9vfIH44q8aljKgNbFD0BsZlnC81rpp58e9C1Ab862XRvk+NNZOU6H9xalX9jTPFKVIO8zMU/jyRvGUDf9VYM0pBfydXuHrOKbnXMFPcF3KvXbXq25Txq6C53UpKbgPLaqwZJucLOdmcMfFw975JOSRduW1xliUrABq/W0nJbeC3GmtGyPkMTrlcC8RlqT4Ah6PauiPjAI7zBND8w0pKbgNR38AEJfqfIa5E3Cfj4ZqMA2VWADR3WMmcU+INAdx/GVdJncwphNp/C55p8ZquEPciaO60kmmg8IXgKk1dp2pwwTkxDn0DIe76Baf/lsBj3QB5MjFkJwTMtah6UJzmHwU/zDRyPcXK+fvg1NHA9YQ4/HsDdo3/7ItZzjHngLMv10NyR5nGH3Pr5I61G3IPaMHcJWeOXP/X4DQ1irfA2fX6xe8ZjzUfjIuJifloPAF3JqLs/ViyXgAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAUCAYAAACJfM0wAAAAmElEQVR4XmNgGAUDCRiBOBRdkAgwCYgvowsiA04gLkEXJAC4gPg/AwGDeYC4FF2QAPjHQITBvAykGdwDxKYMVDaYHYhvQNlUNfg3EhvFYBCHFCwL0QYGNUDsgMSniouZgPghmhhVDP6KLsBAJYMPY8Egg7FZCAfEGIwNUMXF2ADI4CfIHFKwNEQbCgB5/xkQP2ZAMngUMAAAX+VAy5QuxLYAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAYCAYAAADDLGwtAAAAmElEQVR4XmNgGAW0AuZAvByI7dElkMFHIJ4MZc8B4r9A/B8hDQE/gPgpmhhI0RJkgTyooAiSGDNUTAtJDCyAbkUpFjGwwDc0sc9QcRQAEtiPRWwNmhhDM1QCBv5B+dpIYnBQDMTvgbidAYf7sIEvDFgUgtz2E00MpKgATQwseAHK5oXyjyGkEYAbiKcB8S4gbgViNlTpAQcA85on0bDMg3IAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAYCAYAAACSuF9OAAABs0lEQVR4Xu2VvyuFYRTHDwa/JhSDP0F+ZCCFksGKUJLIYLCQRJRFJlFSYhSDbCaDSRnZDDKzGhRF8uN87znP7bzHe+/tXjbvp77dc77POc993nuf53mJEhL+jkrWOeuLdcUqig5nZZH1SdJ7EB0qjHqSyco1r9G8OF2RmTtWl8lfSHp/BSY5cd4169V5ceDL7QJmNT82Xt5gghHnraifC9TggQJL6m0ZLy+6SSbodP6E+tXOz8UTSV/cHlwlWXBgmbVp8hRzJBO0On9Y/XbnZ2ODpKfR+SWsR42bSWreWBWsQ5LtkWZNC5qsyQyoP+b8OGpZ26xL1gPJobDgBFowL/YaDg3ifTs4rWaLNZkh9Xudn4t1kj5shUC/idtIxgNlJk4R9lCH88fVx5WQD9g76LNfajmjzGMpSkkKCjlleAjU4Kkt2RYE/96bHhTtOC/uSbDR60x+Q1JzYTzgF4R4ysQzZmyX5C0RIe7XQD5o8ri/Aifz3eQApwY1fZqPat7A2tN4UseqWLca/wA364d+ognXgeeUteC8cD08k/Qj7olUyKLhz5O8nsJ778gWJSQk/Eu+AVlrbsI2qBVbAAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAYCAYAAACSuF9OAAABlUlEQVR4Xu2VvytGYRTHDwa/JgwGf4JCComkzAqhJJHBYCEpEYvZpMTMIJvpHaxGNgOryKCMiuTH+TrnXuee98HF3dxPfXvP+Z5zn86973OfS5STkx3VrCPWK+uEVZIsp2aTdebNn9JAMkil5nWal8Yd6agiue7PA92zDpx3ynpw3ne8UEYDYZFR562on5YNVhtlMFAPySLdzp9Uv9b5IcpZFxp/NdAaa8nkyyQ3kmCeZJFW54+o3+H8EE8mDg1UxrrTuJmk55Fkz+2SbI+YdW1osiYzqP648z2rrF6ThwbC3rKgZ47kpUG8Y4szarZYkxlWv8/5Fix46bzQQAMmbifpiagw8TvRHup0/oT6OBI+A2+nJzSQpUDJgYrAhkTDb96y44BwDQZF3PXRGoP6lTc9aMIJawndCTZ6vfM8oScEb9rEs6a2RfKVSBB6GsiHTI5PCTzf50H92uRj6jWytjWe0loN61zjIvZZz/qLi3AceA5Zi95U8DfdkPwdGOiW1a81HAtYc4Hk8xSd6Htaz8nJ+b+8AS90bLndZ8jBAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAYCAYAAACSuF9OAAABpElEQVR4Xu2VyysHURTHj1deK4+ykL9AIQuvZGNhi1CSyIKy8YhE2bC1UmKLBXYWsvAvYK1srRVKyPN85575debMg4ad+dS3Oed7zp25c5s7lygj4+8oZ52xPlnnrLxgOZY71jqrjlXIamNdBjpSUEtuIqWSV0men+uIB31Wc4GOFDyyjox3wXo2XhSYwDJrlzVlaqnBTYeMtyL+d7xZ47d0kXtwp/HHxK80vuXVGgmsspZUjpXdULnHLLkHNxt/UPxW41teWFuse9YhuTEdgQ6iAtatxI3kejCujLVH7vPIsSYNDdpk+sQfMb7lgdWj8hYKr+yHigHqM+Q2DeIdXZwUs0mbzID43cb/CRiHifr0qtifsE+Jij38b6jd+KPi45eQRJE1yI3TD9WcUnzNo5hcQ5pd5k960fhJE4J/Y00LmjaNF/Um+NBrVD5B0asI79rk6PXjaVXDhsApESBqNZD3qxxHSdSb2/zEeMOS17O2JR6XWgXrSuIQB6x3uWIQfgeWY9aC8arJ9WPb4/pE4XMQ/yrU5skdT9h1yPd1U0ZGxr/kC1OKbF9ACJ8dAAAAAElFTkSuQmCC>