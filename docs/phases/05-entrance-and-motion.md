# Phase 5: Entrance + motion

Scope agreed with Laavanya on 2026-11-24.

## Decisions
- **Standing Laavanya:** a flat pixel sprite (billboard) from Laavanya's full-body drawings (front, back, facing left, facing right; black flats) plus her walk-frame sheet (2 front, 4 back, 4 left, 3 right frames, playing at 7 fps while she walks). `scripts/standing-sprite.mjs` cuts them from `docs/reference/character/` into `public/character/standing.webp`. Frames with the patterned shoes and the watermarked frame are not used. The seated 3D model stays as it is.
- **Sit / stand:** she walks to a spot in front of the chair, turns her back to it and lowers into it (~0.5s) while the seated model fades in; the chair turns to meet her and her spin eases in. Getting up is the reverse. Never on the desk side.
- **Loading:** while 3D loads, the page background shows "knock knock" in the pixel font (no separate loading design). No WebGL → straight to a readable home.
- **Knock screen (3D, no hallway):** first-person, facing the closet-wall entry door from outside. The door fills most of the screen; around it is only the outside face of the wall and a soft light. A knocking-hand cue and "knock knock" over the door. A click anywhere (or Enter / Space) knocks.
- **Entry (~4s, quick and smooth, no choppy camera):** knock → door swings open → standing Laavanya inside greets with a pixel speech bubble: **"Hi! I'm Laavanya Negi. Make yourself at home."** → she turns and walks to the chair; the camera follows her in, then rises in one continuous move to the isometric View A → she sits and starts spinning → the door closes behind → home UI fades in. Built in two steps: door + greeting first (approved 2026-11-24), then the walk-in and pull-out.
  - Timing: door opens ~0.85s → greeting 1.9s (a click starts the walk sooner) → walk-in 2.6s → home. ~5.4s after the knock.
  - The walk-in is one camera move: it follows her through the doorway at eye level, rises above the walls while still inside, swings to the View A corner, and ends in a dolly zoom (600 m away, <1° field of view) so the hand-off to the isometric camera doesn't jump. During the entrance a wall is only cut once the camera has passed over it (`cameraMotion.planeCut`), so nothing flickers.
  - The door closes once home shows, but it is on the cut-away closet wall in View A, so it is seen closed only after turning to a closet-wall view.
- **Every load of `/` (changed 2026-11-24 by Laavanya):** opening or reloading the main link always starts at the knock screen. A direct link to a section (e.g. `/work`) always skips the knock and the walk-in. (Was: once per browser session.)
- **Opening a section (close-up):**
  - **Work:** she stays seated and swivels to the laptop. The camera turns to a view that shows the desk and zooms close to the laptop. The laptop screen shows a generic open browser window (Chrome-like), with nothing specific on it.
  - Close-ups show the spots as they are: no real content is put into the room (gallery frames stay ambiguous until Laavanya sends her creatives, one by one).
  - **About / Creatives / Contact:** she stands up and walks to the spot (bookshelf / gallery above the bed / entry door). The camera follows her and ends in a close-up of the spot.
  - The camera stays isometric and closes in (zoom + pan) on the spot. Then the 90% panel fades in (starts ~0.85s after the click), which dims the room. Section → section moves the camera and her the same way. Going back home reverses it: the panel goes, the camera pulls back to the home view, and she walks back and sits.
  - Deep link to a section: she is already there, so no animation plays.
- **Reduced motion** (an operating-system setting some visitors turn on because motion makes them dizzy): the knock, door and greeting stay; the walk-in becomes a cut straight to home.
- **Mobile:** in this phase, the entry ends in the same home view as desktop. The bed point of view, orb and haptics come in Phase 6.

## Tasks (as built)
1. ✅ Standing sprite + walk frames from Laavanya's full-body art (`scripts/standing-sprite.mjs` → `public/character/standing.webp`); billboard picks the drawing by viewing angle and plays walk frames while she moves.
2. ✅ Entrance state in `store/intro.ts`: `pending | off | knock | opening | greeting | walking | done`. Plays on every load of `/`; the route stays the source of truth for which section is open.
3. ✅ Camera: first-person perspective at the door (wider on portrait screens), one continuous walk-in ending in a dolly zoom handed to the isometric camera; the isometric camera closes in on section spots (`sections.ts`).
4. ✅ Entry door with a real doorway, hinged leaf and outside face (no hallway).
5. ✅ "knock knock" + pixel fist, speech bubble pinned above her head, home UI fade-in.
6. ✅ Walk routes through the open middle of the room (`Walker.tsx`).
7. ✅ Section open/close: close-ups, panel fades in after the zoom; fades out going home (room icon, and browser Back via the navigation event); Work keeps her seated facing the laptop (generic browser screen).
8. ✅ Verified: entry, each section, section→section, back (icon + browser Back), deep links, day/night, reduced motion, keyboard, no-WebGL, 375px (readability; full mobile is Phase 6). Build passes.

## Out of scope
Mobile bed view, 360° orb, haptics (Phase 6). Brand swap (Phase 7). Leg walk cycle (needs art).

## Done when
Every load of `/` plays the knock → welcome → home sequence (~4.9s after the knock; clicking skips ahead). Each section opens with her moving and the camera closing in. Deep links skip it all. Laavanya has approved it, and it is live.
