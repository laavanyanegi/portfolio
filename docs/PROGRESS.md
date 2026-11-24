# PROGRESS

## Roadmap (one chat session per phase)
| # | Phase | Suggested model | Status |
|---|---|---|---|
| 0 | Planning: CLAUDE.md, VISION.md, specs | Opus | ✅ done |
| 1 | Shell + live link: all 5 screens on Vercel | Sonnet | ✅ done — live at https://laavanyanegi.vercel.app/ |
| 2 | Look test: one room corner in pixel style, day/night prototype at `/lab` (approval gate) | Opus | ✅ approved 2026-11-23 (values locked in `store/lab.ts`) |
| 3 | Content v1: first case study, About, Contact, ID card → **start applying** | Sonnet | ✅ done 2026-11-23 (placeholders remain, see below) |
| 4 | The room: full 3D room, both views, flip arrows, floating labels, spinning character, day/night lighting | Opus | ✅ done 2026-11-24 (`docs/phases/04-the-room.md`); four views, room keeps getting tweaks |
| 5 | Entrance + motion: knock screen, first-person welcome, camera choreography, section zoom | Opus | — |
| 6 | Mobile world: bed point of view, 360° orb, ID icon, haptics, lighter scene | Opus | — |
| 7 | Brand + polish: design system swap, accessibility, performance, SEO/OG | Sonnet | — |
| ∞ | Ongoing content: projects, blogs, creatives | Haiku/Sonnet | — |

Specs for phases 2–7 are written at the start of each phase, after discussing it with Laavanya.

## Decisions log
- 2026-11-22: Stack locked (see CLAUDE.md). Git identity uses the GitHub noreply email. The repo is public.
- 2026-11-22: The handle is top-left on home and top-right on inner pages. Section↔room-spot mapping approved. Deep links skip the entry. No sound, mobile haptics only. DOB, gender and phone removed from the ID card.
- 2026-11-22: The room is built as low-poly 3D with a pixel/dither post-process (style: kitchen reference). Approval is required via the Phase 2 look test.
- 2026-11-22: Look test corner = desk + balcony (south-west). Tuned with live sliders on `/lab` (separate day/night values). `/lab` is live but unlinked and noindex. No character in the look test.

- 2026-11-23: Airtel case study is a solo, self-initiated project, June–Nov 2026. The resume PDF is NOT published because it contains a phone number; a redacted CV is needed. Review screenshots are not published (they show real users' names/handles); findings are paraphrased.
- 2026-11-23: Phase 4 decisions: View A first with a review checkpoint, then View B. Two views, 180° flip (~1s) (changed in review round 6: four views, 90° per turn). Labels = pixel sign with pointer. Character swivels continuously (~3s per turn). Day/night fades over ~1s. Details in the phase spec.

## Waiting on Laavanya
- Headshot, redacted CV PDF (no phone number), Carrd URL
- ID card PDF (designed later)
- Airtel: per-user test times and after-redesign average, Miro journey/empathy map, approve drafted "What I learned" limits, confirm blog summaries (written from titles only)
- About: years for the two awards, two certificates, and school dates
- Creatives: all items (still placeholders)
- Brand system from Claude Design (needed by Phase 7)

## Session log
_(each phase appends: date, what was done, anything left over)_

### 2026-11-22: Phase 1 (shell)
- Scaffolded Next.js 16 (App Router, Tailwind 4; Cache Components is on by default) with framer-motion, three, R3F, drei, zustand, next-themes.
- Tokens (day/night) and fonts (Pixelify Sans display, Inter body) live in `app/globals.css` / `app/layout.tsx`.
- Content as typed data in `content/` (projects, blogs, creatives, about, contact, idcard, nav); types in `lib/types.ts`.
- Routes: `/`, `/work`, `/work/[slug]`, `/creatives`, `/about`, `/contact`; section pages share a ~90% panel via the `app/(sections)` route group.
- Room is a CSS gradient placeholder in `components/canvas/RoomSlot.tsx` (Phase 4 swaps in the R3F canvas).
- Home UI, folder-tab top bar, ID card overlay (lanyard, Esc/outside-click/✕, focus trap, placeholder PDF), day/night switch (default from local time, remembered) all work. Mobile layout checked at 375px.
- Known: inactive tabs are 30% opacity per spec, which is below AA contrast; revisit in Phase 7.
- Pushed to GitHub and deployed on Vercel: https://laavanyanegi.vercel.app/ (all 5 screens + case-study page verified live).

### 2026-11-22: Phase 2 (look test), part 1
- Spec: `docs/phases/02-look-test.md`.
- `/lab`: low-poly south-west corner (desk, purple lamp, laptop, mesh chair, rug, side table + radio + amber lamp, pet bed, mandala, balcony glass door with curtains, railing, skyline, bookshelf, plant). Orthographic dollhouse view with limited drag-to-look.
- Lighting: day = low warm sun through the door only (an invisible ceiling/north wall block light from the open dollhouse top), blue-ish fill. Night = moonlight, purple lamp (with shadows), amber lamp, laptop glow, lit skyline.
- Pixel look is a custom post pass (no new packages) in `components/canvas/lab/PixelPass.tsx`: low-res render → nearest upscale, ACES tone map, grade (warmth, amber/blue split-tone), Bayer dither, grain, vignette. Grain is static with reduced motion.
- Tuning panel (`components/ui/LabPanel.tsx`, store `store/lab.ts`): per-mode sliders, Copy settings, Reset. Collapsed by default on phones. Site nav hidden on `/lab`.
- 3D colours live in `lib/roomPalette.ts` (room paint/lights, separate from UI tokens).
- **Next:** Laavanya tunes `/lab`, sends copied settings → lock them into `LOOK_DEFAULTS`, note approval here, then Phase 3.



### 2026-11-23: Phase 3 (content v1)
- Airtel case study live at `/work/airtel-payments-bank-ncmc-recharge-case-study`: video, before/after galleries, MoSCoW and metrics tables, placeholders for missing test data. Sources: Google Doc (teardown, 1-pager, PRD), Notion 1-pager, GitHub repo.
- Project data model extended with `blocks` (text, list, table, gallery, video, links, quote, placeholder) in `lib/types.ts`; rendered by `components/sections/ProjectBlocks.tsx`. Images are WebP in `public/work/airtel/`.
- About filled from the resume, Contact links filled, two Medium posts added to Work. Sample project removed.
- Known: dev console shows a pre-existing Next warning about `params` outside Suspense on `/work/[slug]` (build passes).
- 2026-11-23 (later): Creatives emptied and tagged "Work in progress"; ID card headshot tagged the same; About gained a Skills section (from the resume).
- 2026-11-23 (later 2): Headshot added (`public/headshot.webp`, cropped from Laavanya's photo) and shown on the ID card. Blogs now come from Medium's public RSS feed (`lib/medium.ts`, cached hourly, feature image + summary + title; fallback list in `content/blogs.ts`) so new posts appear automatically. Contact uses brand icons (react-icons); College projects link removed. About: award/cert/school dates filled; LinkedIn internships, certifications, Saptrang Short Fest and Agile/Scrum added.
- Open conflicts to confirm: St. Stephen's German course dates (resume: Present–Apr 2027; LinkedIn: Sep 2025–Apr 2026); BA start (resume Jun 2021; LinkedIn Nov 2021); Jagran end date (resume Sept 2026; LinkedIn "Present").
- 2026-11-23 (later 3): About intro rewritten (resume + LinkedIn + Airtel result, no LinkedIn summary copy). Certificate issuers/years filled. German shown as completed Certificate (Sept 2025–Apr 2026) plus in-progress Diploma (Sept 2026–Apr 2027, expected). BA start Nov 2021 (admissions ran Jun–Nov 2021). Jagran end stays Sept 2026 (LinkedIn still says Present; Laavanya will update later).
- 2026-11-23 (later 4): About intro made universal (PM skills + person beyond work), no project references.
- 2026-11-23 (later 5): About intro replaced with Laavanya's own wording.

### 2026-11-23: Phase 4 (the room), part 1: View A (review checkpoint)
- Spec: `docs/phases/04-the-room.md`. Laavanya's idea for opening a section (she walks to the spot, camera follows and zooms) is recorded there for Phase 5.
- One persistent room canvas behind every page (`components/canvas/RoomLoader.tsx` → `RoomCanvas.tsx`, client-only, lazy). Room parts live in `components/canvas/room/`. `PixelPass` and `textures` moved up to `components/canvas/` (the lab still uses them).
- Full room shell 6.2 × 5 m. Walls facing the camera are cut away automatically but still block sunlight. View A is furnished: study wall (mandala, pet bed, cabinet, desk + laptop + purple lamp, side table + radio + amber lamp, rug) and balcony wall (window over grey dresser, glass door with two-tone curtains, bookshelf, plant stand, bed in the north-west corner).
- Flip arrows and ←/→ keys turn the camera 180° (~1s; instant with reduced motion). Small drag-to-look on home.
- Work (desk) and About (bookshelf) pixel signs bob above their spots. They are real links that follow the room. Hovering a sign or nav button makes the spot glow lavender.
- Seated sprites cut out of the reference sheet → `public/character/seated-*.png` (grid background and watermark removed). She swivels about every 3s on home and faces front elsewhere.
- Day/night fades over ~1s: lights, lamp glow, sky, backdrop and pixel-filter values together.
- Fixed: `body` no longer paints a background, which had been hiding everything behind the page (including the old CSS room).
- Review round 1: home name/title block removed (sr-only h1 kept; DEL/BLR already on the ID card). Spin is now continuous and lazy (~4.5s per turn, push-and-coast speed): the sprite turns like a card between the 4 drawings, and she glides round to face front when stopping. Pet bed moved into the corner by the balcony door. Mandala moved to the east end of the study wall (art refinements to come from Laavanya).
- Review round 2: the sprite is replaced by a low-poly 3D Laavanya (`components/canvas/room/Laavanya.tsx`) built from the seated sheets (incl. new diagonal-angle sheet, saved to `reference/character/…-other-4-angles.webp`). Seat, back and arms swivel on a fixed five-star base with a lazy push-and-coast spin. She turns to face the visitor when a section or the ID card is open. Sprite PNGs removed.
- Mandala redrawn as a sharp, bold right half centred on the study wall's east corner (radius 1.3 m), hidden with its wall in View B. Side-table "radio" is now a Marshall speaker. The amber lamp moved to a new bedside table (the plant pot by the bed is gone). A soft centre fill light evens out the night lighting. Hover glow is softer and slower, signs keep a still hit area (no flicker), and hover colours ease in.
- Review round 3: **decision**: exact likeness wins over a free 3D model. She is drawn from her own 8-angle pixel sheets (`public/character/seated-NNN.png`, cut from both seated sheets, watermarks removed). Each pose pivots on the chair's wheelbase centre and tilts between poses during the lazy spin. The 3D figure was removed. More in-between angles (e.g. 16) can be added later for a smoother turn. The mandala is now the actual artwork lifted from `reference/room/table_wall.png` (`public/room/mandala-half.webp`, wall colour keyed out), 2.65 m tall from the east corner. ID card title: "Product Manager | Creative".
- Review round 4: **decision reversed**: back to a 3D model, built as close to the sheets as possible. Body measurements live in `components/canvas/room/characterRig.ts`, measured from the front and side drawings and checked by drawing them over the drawings (`node scripts/check-character.mjs`). The model (`Character.tsx`) is painted from her own drawings: front-facing surfaces use the front drawing, side-facing surfaces use the matching side drawing (`public/character/atlas.webp`, rebuilt with `node scripts/character-atlas.mjs`). The hair is one wavy curtain framing the face, over the shoulders and down the back, plus a braided crown. The ergonomic mesh chair (S-curved see-through mesh back, headrest, T-arms, brown seat) swivels on a fixed five-star base. New sheets saved to `reference/character/…-back-angles.webp` / `…-front-angles.webp`. Sprite PNGs removed.
- Review round 5 (realism): the atlas now holds 5 drawings (front, both sides, both front three-quarters). The three-quarter drawings are really at about 25°, not 45°, which was found and confirmed with the overlay check. Painting now follows the viewing angle (a custom shader in `Character.tsx`): from each angle she wears the drawing made for that angle, switching at the halfway angle with a short fade. Forearms, hands and lap never use the three-quarter drawings (one hand rests on her lap there). Shape: lathe-turned torso with sloping shoulders and halter neckline, tapered jaw and chin, one-piece pencil skirt over both thighs, fuller hair at the back and cheeks.
### 2026-11-23: Phase 4, part 2: View B (bed + closet walls)
- `components/canvas/room/ViewB.tsx`, from the bed-wall and closet-wall references. Bed wall: gallery of 12 framed pixel pictures + macramé + trailing plant (Creatives sign), floor lamp with drum shade, leaning full-length mirror ringed with bulbs, cream rug. Closet wall: three-column wardrobe, glass-front cabinet (jars/books, four drawers), two-door sideboard with plant + photo, landscape painting, light switch, panelled entry door with silver lever (Contact sign).
- Tall pieces and wall decor hide with their wall when it's cut away, and stop casting shadows while hidden (`CutWall dropShadows`). The bookshelf now hides in View B.
- Night adds the floor lamp and mirror bulbs. The light switch by the door is clickable in View B and toggles day/night, in sync with the top-bar switch.
- All four floating signs are live. Positions in `dims.ts` (`FLOOR_LAMP`, `MIRROR`, `ENTRY_DOOR`, `LIGHT_SWITCH`, `SPOTS`).
- Review round 6: **decision**: four views instead of two. Each arrow press turns the camera 90° to the next corner: study + balcony, study + closet, bed + closet, bed + balcony (`VIEW_WALLS` in `store/ui.ts`). A sign shows whenever its wall is in view. Everything hung on or standing against a cut-away wall hides with it (the dresser, sideboard and wall socket no longer show or float in the wrong view). Corner pieces hide only when both their walls are cut (bed + nightstand + plush: north/west; pet bed: south/west). The desk set stays in every view because she sits at it. The camera aims a little higher so signs over the far corner stay on screen.
- Bed wall: the gallery moved to the balcony wall above the bed (the Creatives sign moved with it). In its place is a wall shelf from the new reference (standing books, a flat stack, a potted cactus). The hanging pot over the bed is gone. The mirror lost its easel leg and the hook string above its corner plant.
- New: fairy lights along the top of all four walls, swagging between ceiling pins, glowing at night (`FairyLights.tsx`). A wall clock on the study wall west of the desk shows the visitor's real time. A pixel-style Kuromi plush sits beside the pillow (`Kuromi.tsx`). Desk now has the full list: purple lamp, aroma diffuser (LED ring at night), two books, pen stand, mini vase (two roses, one sunflower), black water bottle, laptop, notepad, and a hexagon grid board with polaroids, a letter, notes and earrings leaning on the wall.
- Laavanya will send her own artwork/photos for the gallery frames later.
- Review round 7: pots removed from the balcony-wall dresser and the closet-wall sideboard. Kuromi moved to the inner side of the bed (between the pillow and the bed wall). The closet-wall frame now holds Laavanya's own photo (`public/room/closet-photo.webp`, 5:4, from her birthday photo with her dog) in place of the generated landscape. Fairy lights switch off while the room turns and come back once it settles (`cameraMotion.turning` in `parts.tsx`, set by the camera). `CutWall` also re-checks every half second, so pieces that finish loading late (like the photo) still hide with their wall.
- Mirror: the little hanging pot on top removed.
- Phase 4 closed 2026-11-24: build passes, committed and pushed. Laavanya approved her birthday-dog photo being public. `/lab` stays (unlinked, noindex) for now.
- **Next:** Phase 5 (entrance + motion) in a new session. Room tweaks can continue alongside. Mobile layout overlap is left for Phase 6.
