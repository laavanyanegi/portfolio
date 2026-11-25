# Phase 6: Mobile world

Scope agreed with Laavanya on 2026-11-25.

## Decisions
- **Who gets it:** phones only: screens narrower than a tablet (under 768px wide), plus phones held sideways (touch screen under 500px tall). Tablets and laptops keep the dollhouse view and turn arrows.
- **Bed point of view:** first person, sitting on the foot end of the bed (north-west corner), facing Laavanya spinning in her chair. Every wall stays up (nothing is cut away) and a ceiling closes the top.
- **360° orb:** a see-through (20%) orb in the lower middle of the screen, above the section buttons, so it never covers her face. Dragging it (or anywhere on the room) looks around a full 360°, with a limited look up/down. Letting go leaves the view where it is. A tap on the orb glides back to Laavanya. Arrow keys work on the orb too.
- **Opening a section:** the visitor stays on the bed. The view turns to the spot (desk, bookshelf, gallery, door) and zooms in while she walks there, then the page fades in. Going home turns back to her.
- **Entrance:** same knock and greeting. The walk-in stays at eye level: the camera follows her through the door and settles on the bed as she sits down facing it.
- **Floating signs:** all four are live on phones; a sign shows whenever its spot is in front of the visitor.
- **ID icon:** top-left, replaces the text handle (opens the ID card).
- **Haptics:** one short vibration (15 ms) on the knock and on opening a section. Phones only. iOS Safari ignores it.
- **Lighter scene:** on phones and low-end devices (≤4 CPU cores or ≤4 GB memory): smaller sun shadow map, no desk-lamp shadow, lower GPU power mode. The look stays the same.

## Out of scope
Brand swap, full accessibility and performance audit (Phase 7).

## Done when
On a phone, the entrance ends on the bed facing her; the orb looks around 360°; sections open with the view turning from the bed; haptics fire on Android; the scene runs smoothly. Desktop is unchanged. Build passes, Laavanya approves, it is live.
