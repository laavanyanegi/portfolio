# PROGRESS

## Roadmap (one chat session per phase)
| # | Phase | Suggested model | Status |
|---|---|---|---|
| 0 | Planning: CLAUDE.md, VISION.md, specs | Opus | ✅ done |
| 1 | Shell + live link: all 5 screens on Vercel | Sonnet | ✅ done — live at https://laavanyanegi.vercel.app/ |
| 2 | Look test: one room corner in pixel style, day/night prototype at `/lab` (approval gate) | Opus | ✅ approved 2026-11-23 (values locked in `store/lab.ts`) |
| 3 | Content v1: first case study, About, Contact, ID card → **start applying** | Sonnet | ✅ done 2026-11-23 (placeholders remain, see below) |
| 4 | The room: full 3D room, both views, flip arrows, floating labels, spinning character, day/night lighting | Opus | ✅ done 2026-11-24 (`docs/phases/04-the-room.md`); four views, room keeps getting tweaks |
| 5 | Entrance + motion: knock screen, first-person welcome, camera choreography, section zoom | Opus | ✅ done 2026-11-24 (`docs/phases/05-entrance-and-motion.md`) |
| 6 | Mobile world: bed point of view, 360° orb, ID icon, haptics, lighter scene | Opus | ✅ done 2026-11-25 (`docs/phases/06-mobile-world.md`) |
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

### 2026-11-24: Phase 5 (entrance + motion), part 1: the entrance
- Spec: `docs/phases/05-entrance-and-motion.md`. No hallway: the knock screen is the 3D entry door seen from outside (outside face of the closet wall, doormat, a warm light).
- Entrance state lives in `store/intro.ts` (knock → opening → greeting → walking → done), once per browser session from `/`. `/?knock` replays it for review. Deep links, repeat visits and no-WebGL skip it. Home UI and labels stay hidden (but in the page) until it ends, then fade in.
- 3D: `components/canvas/room/Entrance.tsx` (standing sprite, outside of the door, entry camera + walk-in), the entry door now has a real doorway, a hinged leaf and a lever on both faces (`ViewB.tsx`). 2D: `components/ui/EntryOverlay.tsx` ("knock knock" + pixel fist, speech bubble pinned above her head, full-screen click targets). Wording in `content/intro.ts`.
- Standing Laavanya is a flat sprite from Laavanya's full-body drawings and walk-frame sheet (sent 2026-11-24, saved in `docs/reference/character/standing-full-*.webp` and `character-walk-frame.webp`), built by `scripts/standing-sprite.mjs`. Black flats only; the walk frames play while she walks.
- Walk-in verified frame by frame (slowed 5× for capture): smooth, no wall flicker, no jump at the hand-off to the home camera.
- Known: another session's dev server on :3000 once served a stale stylesheet (bubble box missing) until it recompiled.
- Decisions for the section zoom: laptop close-up shows a generic browser window, nothing specific. Gallery frames stay ambiguous; Laavanya will send creatives one at a time to add.

### 2026-11-24: Phase 5, part 2: section zoom
- The home camera (still isometric) closes in on the open section's spot and turns to the nearest view that shows its wall; going home it pulls back out. Framing per section in `components/canvas/room/sections.ts` (`SECTION_SHOTS`). Deep links start already zoomed in.
- She moves with the route (`components/canvas/room/Walker.tsx`): Work = stays seated and swivels to the laptop; About / Creatives / Contact = stands up, walks a route through the open middle of the room (`ROUTES`) to a spot beside the bookshelf / under the gallery / inside the door, and turns to face the visitor. Spot to spot she walks straight across; home = walks back and sits.
- Laptop screen = a generic browser window texture (`browserScreenTexture`), nothing specific on it.
- Section panel (`components/ui/SectionPanel.tsx`) fades in ~0.85s after opening a section from home, once the camera has closed in; direct visits and section-to-section show it at once. The hover glow is cleared on every page change.
- Going home from the top bar's room icon: the panel and top bar fade out (0.3s), then the camera pulls back. (Browser back skips the fade.)
- Next keeps a left page alive in the background, so the panel's fade-in restarts each time it is shown (`useLayoutEffect` in SectionPanel), not only when first built.
- Checked: all four close-ups by day and night (standing Laavanya's own glow now dims at night, she was washing out orange), keyboard only (Tab order on home: ID card, day/night, Work, Creatives, About, Contact; Enter opens a section with the full zoom; Tab then reaches the room icon with a visible focus ring; Enter on it fades out and returns home).
- Known: after returning home by keyboard, focus goes back to the top of the page (Next's default). Mobile has no turn arrows by design (VISION 5.3: the 360° orb replaces them in Phase 6).
- Build passes.

### 2026-11-24: Phase 5, part 3: final fixes + checks
- **Decision (Laavanya):** every open or reload of the main link starts at the knock screen; direct section links always skip it; going home from inside never replays it. (Replaces "once per session".)
- Greeting shortened to 1.4s (entrance ≈4.9s after the knock).
- Keyboard: coming home, focus goes to the button of the section just left.
- Browser Back from a section fades out a snapshot of the page (listens to the browser's navigation event, which fires before Next swaps the page; popstate as fallback).
- Night Creatives close-up: the amber bedside lamp glides to ~55% while it's open.
- **Bug fixed:** without WebGL the 3D library crashed the whole page. Now the room isn't loaded without WebGL, and an error boundary drops only the room if it ever fails (pages keep working, entrance ends).
- Phones: the door view widens on portrait screens so the doorway, Laavanya and the bubble fit.
- Checked: reduced motion (door + greeting, then a cut; sections jump), no-WebGL (no knock, working home and sections), 375px (knock, greeting, case study readable, no sideways scroll), case-study page uses the Work close-up (by code; the preview was backgrounded for the picture).

### 2026-11-24: Phase 5, part 4: sitting down, her face, bug sweep
- **Sitting down / getting up** (Laavanya: "walks into the middle of the chair, then cuts to sitting"). She now walks to a spot in front of the chair, turns her back to it, and lowers into it: her drawing slides down and back and fades while her seated model fades in (~0.5s); the chair turns to meet her first, and her spin eases in over ~1.6s. Getting up for a section is the reverse (chair turns to the room, she rises and steps out). Shared state in `components/canvas/room/laavanya.ts` (`standing.seat` 0→1, `chairFace`); `Walker.tsx` runs seated → rising → walking → sitting/standing. She never sits or stands on the desk side.
- **Her face** (Laavanya: "hair and side profiles are messing the face"). Head, nose and hair now wear one drawing at a time, laid over the whole head from the current angle, instead of a drawing per surface direction (which put the side profile's eye on her cheek next to the front eyes, and hair strands across her face). The switch from the three-quarter drawing to the side profile moved from ~57° to ~68°. The grey cap on her crown came from leftover grid grey above her hair in the front drawings; the crown now samples her hair's top row.
- **Bug sweep:** "Taking a while? Come straight in" appears if the room hasn't loaded after 10s (nobody stuck at the door). Leaving `/` mid-entrance (Back/Forward) ends it. A failed trip home un-fades the page after 2s. The 3D-support check now releases its test context (browsers allow only a few). Shadow setting updated (three.js removed the old soft type; console warning gone). The case-study page reads its address inside a Suspense boundary (Next's dev error gone). Console is clean on `/` and a case study.
- The error boundary was proven when the preview's GPU refused a context: the room dropped out and the page kept working.
- Build and lint pass.
- Phase 5 closed 2026-11-24: approved by Laavanya, committed and pushed (Vercel deploys from `main`).
- **Next:** Phase 6 (mobile world: bed point of view, 360° orb, ID icon, haptics, lighter scene) in a new session. Waiting on Laavanya: creatives for the gallery frames (one at a time).

### 2026-11-24: Phase 5 follow-up: smoothness
- Laavanya saw the entrance stutter in Chrome. Measured frame by frame: stalls of 100–133 ms at each entrance step and 550 ms at the hand-off to the home view.
- Causes and fixes: (1) removing the door-outside light when the entrance ended changed the light count, so three.js rebuilt every material: the light now stays mounted, switched off. (2) The whole room re-rendered at every entrance step: the canvas now only re-renders when the entrance starts/ends, and Shell, ViewA and FairyLights are memoised. (3) Her seated model was first drawn mid-sit: it is now drawn see-through for its first frames. (4) The standing sprite switched into transparent mode mid-sit (a material rebuild): it is always transparent now.
- Production build: entrance 480 frames in 8 s, worst frame 18 ms (was 550 ms). Opening a section: one 50 ms frame at the click (the page itself loading).
- `.claude/launch.json` gained a `prod` config (`next start` on :3005) for measuring real performance.

### 2026-11-25: Phase 6 (mobile world), part 1
- Spec: `docs/phases/06-mobile-world.md`. Laavanya chose: phones only (under 768px wide, or a touch screen under 500px tall), the view stays where it is left, sections open by turning from the bed, orb in the lower middle.
- Phone check: `lib/device.ts` (`usePhone`, `isLowEnd`, `buzz`). The room picks its camera from it.
- Bed view: `components/canvas/room/BedCamera.tsx`, first person from the foot of the bed (`BED_EYE` in `dims.ts`), facing her chair. No wall is cut away on phones (`cameraMotion.inside`) and a ceiling with a soft glow closes the top. She sits facing the bed (`BED_FACE`).
- 360° orb: `components/ui/LookOrb.tsx` (styles in `globals.css`). Dragging it or the room turns the view all the way round (look direction in `store/look.ts`); a tap faces her again; the dot inside shows where she is. Arrow keys turn/tilt on phones.
- Sections from the bed (`BED_SHOTS`): the view turns to the spot and zooms; going home turns back to her. All four signs are live and show whenever their spot is in front.
- Entrance on phones: same knock and greeting, then the camera follows her through the doorway at eye level and settles on the bed (hand-off to the bed view without a jump).
- ID icon top-left on phones (also held sideways). Haptics: 15 ms on the knock, section buttons, signs and top-bar tabs (phones only).
- Lighter scene (phones and ≤4-core / ≤4 GB devices): 1024 sun shadow map (was 2048), no desk-lamp shadow, default GPU power mode.
- Checked at 375×812: entrance, orb drag round to the balcony and the gallery, tap to face her, Creatives/Work/Contact, home. Desktop unchanged. Console clean. Build and lint pass.
- Bug sweep: the room only takes over a finger once it really drags, so a tap still reaches the light switch (it was swallowed before); the bed view clears the "room turning" flag, so the fairy lights can never get stuck off after resizing from desktop to phone. Light switch tap and room drag re-checked on 375px.
- Open for review: on Creatives she walks to her spot by the bed, which is off-screen from the bed view (the gallery is behind the visitor). Haptics need a real Android phone to feel.

### 2026-11-25: Phase 6, part 2: smoothness (Laavanya: "a bit choppy on my phone")
- Measured with a temporary probe (removed), same room and view, production build:
  - Desktop: ~1,500 draw commands and 23.4 ms per frame before (over the 16.7 ms a smooth 60 fps allows) → 234 commands / 6.2 ms by day, 350 / ~11.8 ms at night with the lamp shadow.
  - Phone size, home view: ~780 → ~120 draw commands per frame.
- Cause 1: ~500 separate room blocks, each drawn on its own, and again for every shadow. Fix: `components/canvas/room/StaticBatch.tsx` merges the plain, still blocks into a few pieces once the room mounts (colours kept per block). It never merges across a wall (`CutWall`) or hover-glow (`Glow`) group (`userData.batchBoundary`), skips anything clickable, glowing-by-texture, see-through or `userData.dynamic` (clock hands, door leaf). Identical night glows (mirror bulbs) merge and keep their glow. The chair is merged too (base and swivelling seat separately). Originals are hidden, not removed.
- Cause 2: the six lamp lights cost every pixel even by day (dark), and the desk lamp's shadow (the room drawn six more times a frame) was redrawn all day. Fix: the lamps are hidden by day (`Lights.tsx`); both versions of every material are prepared up front (frames 2, 90, 300, for the pixel filter's image `sceneTarget`), so switching day/night doesn't stall.
- Checked: overhead view (walls cut correctly in every turn, same look as live), hover glow, night glows, phone bed view day and night, light switch. Build and lint pass.
- Floating signs (Laavanya's screen recording: signs lag and pop in when the room turns): they were placed from the camera's previous-frame position (its matrices only update when the room is drawn) and swapped by view index the instant an arrow was pressed. Now `LabelTracker` updates the camera first and runs after it (priority 1), and every sign shows exactly while its own wall is on screen (`isCut`, exported from `Shell.tsx`), so they swap mid-turn together with the walls. Checked frame by frame through a turn.
- Phase 6 closed 2026-11-25: approved by Laavanya, live. Open for later: Creatives close-up on phones (she walks out of view from the bed).
- **Next:** Phase 7 (brand + polish) in a new session, once the brand system from Claude Design arrives.
