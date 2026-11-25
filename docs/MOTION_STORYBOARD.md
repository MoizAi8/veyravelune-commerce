# Cinematic homepage storyboard
Use one persistent R3F canvas within the pinned hero on capable devices, with GSAP ScrollTrigger driving a normalized progress ref, not React renders per frame. DOM text and CTA remain above canvas; static poster rendered first. Illustrative target positions; tune visually for camera framing and model dimensions.

| Scene | Progress | Direction |
|---|---|---|
| Arrival | 0–0.18 | Sofa appears from shadow, rotates from -35° to +20° Y; optional short 0.8–1.2s intro, no mandatory preloader; rim light sweeps across velvet. Title and Shop CTA fade in without delay to navigation. |
| The shift | 0.18–0.42 | Sofa drifts left to x=-3 and recedes; vase enters from right x=+4 to 0 with a restrained 90° turn. Crossfade typography to Objects of distinction. |
| The detail | 0.42–0.62 | Vase slides to right x=+2; camera moves toward texture; highlight glazed surface; collection link stays readable. |
| Illumination (P1) | 0.62–0.82 | Chandelier descends gently, warm lighting changes, vase exits; avoid flash or strong bloom. P0 may transition directly to collection. |
| The realm (P1) | 0.82–1 | Reveal interior composition with products; release pin into real shop grid. P0 releases directly to DOM collections. |

P0 has a genuine sofa/vase sequence if assets secured, else original procedural 3D geometry (accurately labeled stylized) or poster-based motion, never call fallback photoreal 3D. Aim for 250–350vh total desktop scroll section, shorten if usability suffers. Native scroll, reverse on upward scroll, no forced scroll speed. Skip experience anchor to catalog. Mobile: simple unpinned poster transitions by default; optional capable-device 3D only after testing. Reduced motion: static composition, no autoplay/pin/parallax/rotation. Context loss/error: switch to static poster without losing shopping functionality.

Implementation: lazy-load canvas via client boundary with SSR disabled only there; use R3F refs and frame interpolation, clamp DPR to 1–1.5, limit dynamic shadows/lights, avoid expensive full-screen postprocessing by default. Preload only hero poster; lazy load models sequentially. Dispose geometries/materials/textures when appropriate; clean GSAP context/ScrollTrigger on unmount, refresh after resize/fonts, pause when offscreen or hidden. Do not add Lenis unless native scrolling has a documented deficiency. Use Motion only for separate elements (drawer, card microinteractions). Do not animate layout-heavy properties every frame. Verify no text overlap at 360px, 768px, 1440px. Test using actual scroll, keyboard, touch and reduced-motion.

## Phase 2 implementation

The desktop film spans 345 viewport heights with native sticky layout and a single GSAP ScrollTrigger. Chapter copy changes at 0%, 27%, 59% and 84%. The entrance light animates once and the remaining camera, rotation, motion and lighting follow scroll in both directions. The final chapter dissolves into an editorial salon still. The View stills control is keyboard accessible and keeps focus in the page.

Below 1000 CSS pixels and under reduced motion, the page renders an unpinned arrival and three fully linked still chapters with zero model downloads. Desktop WebGL failures retain the chapter timeline and substitute stills while preserving shopping links. The adapted models, HDR environment and backplate are listed in the asset register.
