# Phase 2: Look Test (approval gate)

**Goal:** prove the pixel-art room style on one corner before building the whole room. Laavanya approves the look (or asks for changes) before Phase 4 starts.

**Read:** CLAUDE.md, PROGRESS.md, VISION.md §2, §3, §8.
**Looked at:** `reference/style/kitchen-style-reference.webp`, `reference/room/table_wall.png`.

## Decisions (agreed 2026-11-22)
- **Corner:** south-west — study wall (mandala art, desk, purple lamp, laptop, mesh chair, rug, side table with radio, pet bed) meeting the balcony wall (one glass door with curtains, railing, skyline, plant, small bookshelf).
- **Tuning:** live sliders on `/lab` (pixel size, colour levels, dither, grain, exposure, contrast, saturation, warmth, split-tone, vignette), separate values for day and night, with "Copy settings" so Laavanya can send the values she likes.
- **Visibility:** `/lab` is deployed but unlinked and `noindex`. Kept hidden; removed or retired after Phase 4.
- **Character:** none in this phase (sprites need clean-up; Phase 4).

## Tasks
1. Low-poly corner scene in R3F with flat/procedural pixel textures (planks, mandala, rug, skyline). Isometric (orthographic) dollhouse view, slight drag-to-look.
2. Lighting: day = low warm sun through the glass door with hard shadows, blue-ish fill; night = dark sky + lit city, purple desk lamp, laptop glow, amber side lamp.
3. Custom post pass (no new dependencies): render at low resolution → nearest-neighbour upscale, tone map, colour grade (warmth, split-tone amber highlights / dusty-blue shadows), ordered (Bayer) dither, film grain, vignette.
4. `/lab` page: canvas + tuning panel + day/night switch. Site nav hidden on `/lab`. Readable fallback text without WebGL. Static grain when `prefers-reduced-motion`.
5. Verify in the browser (day, night, phone width), `npm run build`, update PROGRESS, push.

## Done when
- `/lab` is live, looks like the reference style in both modes, and Laavanya has approved a set of slider values (recorded in PROGRESS.md and locked as defaults).
