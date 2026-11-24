# Phase 4: The Room

**Goal:** replace the gradient placeholder on home with the full 3D pixel-art room: both views, flip arrows, floating section labels, the spinning character, and day/night lighting.

**Read:** CLAUDE.md, PROGRESS.md, VISION.md §2, §3, §4, §5.2, §8.
**Look at:** `reference/room/floor_plan.png`, `complete_room.jpeg`, then each wall image as it is built; `reference/character/character-sitting-on-chair.webp` for the sprite.

## Decisions (agreed 2026-11-23)
- **Build order:** View A (study + balcony walls) first, extending the approved `/lab` corner → Laavanya reviews and tweaks → then View B (bed + closet walls).
- **Views + flip arrows:** four views (changed in review: originally two). Two arrows at the bottom-right turn the camera 90° to the next corner (~1s ease): study + balcony, study + closet, bed + closet, bed + balcony. The two walls nearest the camera are cut away (dollhouse). Slight drag-to-look stays. Arrow keys flip too. Reduced motion → instant cut.
- **Floating labels:** pixel sign with a small pointer tail, pixel font, gentle bob (static with reduced motion). Only labels on walls in view are shown. Hover/focus makes the object glow softly. Click → navigates to the section route (camera zoom is Phase 5). Labels are real buttons/links (keyboard reachable).
  - Work → desk/laptop (A) · About → bookshelf (A) · Creatives → photo gallery above bed (B) · Contact → entry door (B).
- **Character:** seated sprite billboard in the desk chair. Continuous slow swivel, one full turn ≈ 3s (front → right → back → left). Faces front and stops when a section or the handle is clicked. Static front frame with reduced motion. Claude cleans the sprite backgrounds/watermark; if the result is poor, ask Laavanya for plain-background versions.
- **Opening a section (Laavanya's idea, built in Phase 5):** on click she stops spinning, gets up and walks to that section's spot (e.g. the desk for Work). The camera follows her, zooms into that part of the room, and the section panel appears over it with the room still visible behind. Needs walking sprites (left/right/front/back walk frames) — clean up the standing sheet, or ask Laavanya for walk-cycle art. Phase 4 only does: stop spinning, face front, open the route.
- **Day/night:** approved `/lab` values are the base. Night adds floor lamp + mirror bulbs (View B). Switch = ~1s fade of sky, sun, lamps and grade; instant with reduced motion. The light switch by the door is clickable and stays in sync with the UI toggle.
- **Colours:** room colours stay in `lib/roomPalette.ts`, UI colours in `app/globals.css`; both are swapped for the brand system in Phase 7. Iterating on the room after this phase is expected.

## Tasks
1. One persistent client-only `<Canvas>` in the root layout (replaces `RoomSlot`), lazy-loaded; text fallback without WebGL. Reuse `PixelPass` + locked look values.
2. Full room shell from the floor plan; move the corner scene into reusable furniture pieces.
3. View A complete → **review checkpoint with Laavanya**.
4. View B (bed, gallery, floor lamp, mirror with bulbs, wardrobe, glass cabinet, sideboard + painting, entry door, light switch).
5. Flip arrows + camera rotation + wall cut-away; floating labels; character sprite + spin.
6. Day/night lighting for the whole room with fade; light switch wired to the store.
7. Verify (both views, day/night, keyboard, reduced motion, 375px still readable), `npm run build`, update PROGRESS, push. Decide whether `/lab` is retired.

## Out of scope
Knock screen, entry walk-in, camera zoom into sections (Phase 5). Mobile bed view, orb, haptics (Phase 6). Brand swap (Phase 7).

## Done when
Home shows the full room in both views, labels and character work, day/night fades, Laavanya has approved both halves, and it is live.
