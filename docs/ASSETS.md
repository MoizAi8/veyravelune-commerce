# Asset production and provenance
No photos, models, fonts or external assets are bundled yet. Secure hero sofa and vase first. Prefer original Blender models or properly licensed downloadable GLB assets, or build stylized procedural geometry with code. Match product imagery and model, document differences. Source options to inspect: https://polyhaven.com/ (check individual assets), https://ambientcg.com/ (check terms), https://sketchfab.com/ (license varies), https://fonts.google.com/ (check each font). Never assume all assets on a marketplace are reusable. No downloading competitors' imagery or paid assets without permission.

Target: emerald velvet sculptural sofa with brass feet, black ceramic vase with antique gold accent, optional chandelier and interior. PBR velvet/ceramic/brass materials, neutral studio HDRI, small texture atlas. Realistic scale and camera fit. Use original product names and synthetic descriptions.

Budget: hero poster <=250 KB where feasible, hero GLB <=2 MB each target, total initial 3D assets <=5 MB, mobile no automatic GLB fetch in fallback; 1K textures default, 2K only if justified; compress product images to ~100–250 KB each; responsive sizes. These are targets, measure actual transfer. Avoid oversized 4K HDRI, unnecessary shadow maps. Optimize with glTF tooling after confirming support. Always provide poster, alt text, and local fallback. No model viewer until matching asset exists.

Maintain `docs/ASSET_REGISTER.csv`: one row per actual asset with file, original URL/creator, license, attribution, redistribution permission, transformation, verification date. Original procedural models record author/tool and source geometry. Do not publish assets with unclear rights. Use a temporary labeled placeholder only during development, not as a claimed final asset.

## Original artwork production

The built-in OpenAI ImageGen tool produced the two editorial stills and four catalog contact sheets. The site uses local WebP conversions and individual contact-sheet crops under `public/images/`. The live 3D canvas uses original procedural meshes in `src/components/three/atelier-scene.tsx`.

**Arrival poster**

> Wide 16:9 premium editorial interior photograph for fictional royal fantasy furniture atelier landing page. No text. A low long crescent sofa in deep emerald velvet with subtle channel seams, low curved back, antique brass short feet, on right half of composition, taking up lower right, fully visible. Tall round Gothic-revival limestone arch behind sofa on right, cold moonlight rays from an upper right unseen window, deep muted black slate walls, polished dark limestone gallery floor, cinematic chiaroscuro, extremely refined palace interior with near-black negative space entire left 44 percent for readable text. Wide eye-level framing, believable physical scale, photoreal original concept image, rich tactile material detail, restrained antique gold, no people, no other furniture, no lettering or watermark.

**Umbra editorial still**

> Wide 3:2 original fine-art product editorial photograph for royal fantasy furniture atelier VEYRAVELUNE, as cinematic companion to an emerald velvet sofa in a dark vaulted limestone palace. On the right half on a cylindrical dark stone plinth stands one black ceramic globular vase, narrow neck, two discreet antique brass rings around its shoulder, charcoal glaze with tiny reflective variations. Moonlight from high right highlights polished ceramic and misty dark vaulted stone behind, last light of night, deeply shadowed near black left half reserved for text, no other objects, no text. Antique furniture editorial, sophisticated atmospheric still life.

**Catalog sheets**

Each sheet used the same prompt, with the corresponding product list inserted for `{subjects}`.

> Create a square catalog contact sheet for VEYRAVELUNE, a fictional luxury furniture atelier. Exact 2x2 evenly sized grid, no gutters or typography, four independent square photographs separated by hard straight divisions exactly at the central horizontal and vertical line. Order top-left, top-right, bottom-left, bottom-right: {subjects}. One subject per square, entirely inside its own quadrant with generous 12% margins. Consistent subdued warm grey taupe plaster seamless studio background and floor, sculptural chiaroscuro and realistic materials, side lighting, restrained luxury editorial product photography, no watermark, close 3/4 angle for each. The four crops must each be self-contained standalone catalog shots.

- **Seating** — `crescent emerald green velvet sofa with short brass feet; moss bouclé accent chair with rounded open walnut arms; curved wine red velvet chaise on dark wooden plinth; ivory upholstered bench with brass legs`
- **Tables** — `round black marble and aged brass pedestal coffee table; dark walnut kidney-shaped side table; rectangular fossil limestone console table; oxblood lacquer drum side table`
- **Lighting** — `aged bronze table lamp with cream silk pleated shade; brass linear pendant with five opal globes; tall oxidized brass floor lamp with elegant off-white linen shade; sculptural brass wall sconce with two frosted globes`
- **Objects** — `black ceramic globular vase with narrow neck and narrow antique brass rings; pair of oxidized bronze candlesticks; sculptural oval dark green marble bowl; blackened brass arched standing mirror`

## Phase 2 film assets

The first three film chapters use adapted CC0 assets from Poly Haven. The sofa uses the source carved frame and relief detail with a selectively reworked emerald upholstery atlas and physically based sheen. The vessel pairs the source glazed ceramic geometry with a new dark finish and modeled brass inlay. The chandelier uses the source six-arm brass geometry and fabric shades with emissive bulbs. These editorial objects and the store’s fictional designs are individually credited. The live objects differ from the catalog artwork in silhouette and finish details. [Poly Haven CC0 terms](https://polyhaven.com/license).

The original 1K glTF sets were combined into embedded GLB files using `node scripts/pack-editorial-models.mjs .local-db/phase2-assets`. Each GLB retains its source meshes with same-origin texture loading. JPEG maps use 4:4:4 chroma sampling. The three files and HDR total 3,992,460 bytes before transport compression. The salon stage functions as a photographic backdrop beneath live renderer models and contact shadows.

The built-in OpenAI ImageGen tool produced three additional editorial plates.

**Realm composition**

> Editorial hero photograph for original VEYRAVELUNE luxury interiors. 3:2 landscape. A vast late-night limestone salon with sculpted arch and understated antique-gold crystal chandelier, emerald low crescent velvet sofa center-right, antique brass table and black ceramic vase, floor polished black limestone. Compose distance with deep chiaroscuro, leave upper-left dark and visually calm for overlaid text. A cool moonlight shaft catches the sofa and floor, warm highlights from the chandelier, thick atmospheric distance, real materials, fashion-venue level art direction, astonishing spatial depth. Text-free, no people, no watermark.

**Illumination still**

> Luxury editorial photograph 3:2 landscape cinematic dark field. An antique gold and crystal chandelier in a dark royal atelier, right-center framed under a vaulted chalkstone room. Beautiful graduated genuine faceted crystal hanging drops with eight restrained candles and fine curved gilded arms; warm practical lights reflected in bevelled glass, no flare. Near-black uninterrupted left side reserved for text, stylistic resemblance to a grand fictional moonlit palace furniture campaign, high end optics and close depth, no lettering or watermark.

**Live stage backplate**

> Asset plate for an original luxury furniture site with live 3D furniture overlaid separately. Ultra-wide 16:9 horizontal eye-level interior photograph, absolutely empty noble neoclassical salon after dark, no sofa, furniture, plinth, chandelier, lamps, plants, signage or objects. Framing is architectural facade looking almost straight along the room, right half sits a finely carved broad limestone arch and pilasters, coffered stone border, deep very dark blue moss-black patinated limewash central wall, discreet gilt detail. Floor spans only the bottom 35 percent of the picture, made of dark mottled grey polished stone with quiet soft diffuse reflections. One cool diffuse moonlight source from high camera-right washes the right half and stone floor with natural restrained chiaroscuro; near-black at far left and dark floor, mostly low exposure but retain tactile stone details. Avoid fog, drawn line art, text, and hard lighting hotspots. Palette obsidian, slate green, bronze shadows. Fine art architectural photography, stylish subtle luxury.

## The Royal Realm

The vestibule, empty terracotta sleeping chamber and Convive dining photograph are original generated artwork for this reconstruction. The foyer and salon are photographic plates. Between them the sofa, vessel, bed, chandelier, chair and table are lit and drawn in real time on supported desktops.

The bed, chair and table use locally stored Poly Haven glTF assets with albedo, normal and packed material textures. Their catalog photography is rendered from the same meshes with the local HDR. Asset names, source URLs, artists and byte sizes are in the register. Reproduce the downloads with `python scripts/import-realm-models.py` and the product renders with `node scripts/render-realm-objects.mjs`. The source files are already included for offline use. The CC0 terms permit redistribution without attribution. [Asset register](ASSET_REGISTER.csv) · [Provider license](https://polyhaven.com/license)
