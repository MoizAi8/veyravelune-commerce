# Local performance measurements · 25 November 2026

## Final film optimization

The original 700.6 ms frame interval recurred at 717.3 ms in the unmodified production film, at step 15 of 160 (about 9% progress, near first sofa visibility). The HDR environment originally mounted only after the sofa reported ready. That put environment preparation and material compilation on the initial scroll path. Instrumented WebGL calls showed shader-program work around the reveal and texture updates during later first appearances. The frame interval also includes GPU scheduling and browser composition. The calls sampled on the JavaScript thread cannot attribute the entire stall to one driver operation.

The studio environment now resolves with the sofa. Three.js prepares each model's materials against the final lighting before revealing it, and visited models stay mounted for reverse scrolling. The model files, final lights, shadow resolution and chapter timings are shared with the previous version.

| Measurement | Baseline | Optimized |
|---|---:|---:|
| First fresh browser, first traversal p95 | 33.3 ms | 16.8 ms |
| First fresh browser, first traversal maximum | 717.3 ms | 266.9 ms |
| Median first-traversal maximum across three contexts | 50.1 ms | 33.4 ms |
| Largest warm reverse/replay p95 across three contexts | 16.8 ms | 16.8 ms |
| Largest warm reverse/replay interval across three contexts | 33.4 ms | 16.9 ms |
| Median navigation-to-probe start | 1,174 ms | 1,141 ms |

Both builds were measured in production mode with database health verified, at 1440×900 on Edge and the Radeon R7 200 via ANGLE/D3D11. Each run launched a new browser and opened three fresh contexts, with 160 sampled frame intervals per forward, reverse and replay pass. The first context is the coldest observation. Later contexts may benefit from browser-process or graphics-driver caches. Test runs used comparable conditions and kept the browser automation separate from the regression suite. Values describe the measured machine. A visible cold hitch remains possible.

[Instrumented baseline](evidence/release/film-baseline.json) · [Instrumented optimized run](evidence/release/film-optimized.json)

## Earlier opening and catalog measurements

Production Next.js on loopback, 1440×900 Edge, AMD Radeon R7 200 Series via ANGLE/D3D11. Each build had three fresh browser contexts, a 3.5-second opening observation and eight sequential HTTP search measurements per context. Table entries are medians of the three runs. Browser caches start fresh per context; server/image caches and host activity can differ. The first baseline run overlapped background verification. Three local samples cannot establish a field trend.

| Opening measurement | Reviewed build | Final build |
|---|---:|---:|
| Resource transfer, bytes | 4,480,368 | 3,115,824 |
| Model and environment transfer, bytes | 3,543,735 | 2,192,325 |
| JavaScript resource transfer, bytes | 543,889 | 529,134 |
| Largest Contentful Paint | 188 ms | 452 ms |
| Cumulative Layout Shift | 0.000170 | 0.000028 |
| Browser-reported JS heap | 22.49 MB | 23.92 MB |
| Median HTTP catalog search for regent | 7.60 ms | 7.52 ms |

The opening used to request the vessel and chandelier as soon as the sofa was ready. Those downloads now begin in preceding chapters. Initial resource transfer fell by 1,364,544 bytes (30.5%). LCP varied widely and its median increased. JavaScript numbers are measured transfer for scripts requested on this route, not total bundle size across all routes. Heap readings are approximate.

The final panel opened in 89 ms median and a result appeared in 331 ms median including the intentional 220 ms debounce and automation overhead. Twenty warmed catalog service calls against local PostgreSQL had a 2.55 ms median and an 8.04 ms p95 including ranking. The 20-piece public catalog does not currently justify a database extension or external index. Full-text ranking presently scans eligible rows, so revisit the query plan under larger-catalog load.

The standalone frame probe sampled 160 animation-frame intervals in each direction. The first traversal measured 16.7 ms median, 16.9 ms p95 and **700.6 ms maximum**. Reverse and replay p95 were both 16.8 ms, with maxima below 17 ms. The first probe begins when the canvas becomes visible and includes initialization. These are browser frame intervals, not direct GPU execution times or a guaranteed frame rate. The separate release-matrix sample overlapped other browser tests and measured a 117.1 ms p95. A consistent cold-scroll smoothness gate therefore remains open. The dominant first-frame cost has not been isolated to model decode, shader compilation or browser scheduling.

No physical-phone, field INP, GPU utilization/VRAM, hosted network, high-concurrency or Lighthouse score is claimed. Browser performance APIs, Playwright and production transfer measurements supplied the local evidence.

[Before](evidence/release/before.json) · [After](evidence/release/after.json) · [Catalog service](evidence/release/catalog-timing.json) · [Standalone film profile](evidence/release/film-profile.json) · [Concurrent frame sample](evidence/release/scroll.json)

To reproduce local measurements, build the desired revision and run `node scripts/profile-release.mjs before` or `node scripts/profile-release.mjs after`, then `node scripts/profile-film.mjs`. These commands start temporary loopback production servers.
