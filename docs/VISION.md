# VISION: Laavanya Negi Portfolio

## 1. Goal and audience
- **Who:** Laavanya Negi, a career switcher from digital media (~21 months) to **Product Manager**. Based in DEL/BLR.
- **Audience:** hiring managers first. Work is reachable in one click from home, and every page works as a direct link.
- **Personality:** the site *is* her room. Visitors knock, get welcomed in, and explore. The entrance gives the site its meaning, so it is not skippable from `/`. Deep links skip it.

## 2. Visual style
- **The look:** a 3D room rendered as **pixel art**. The style reference (`reference/style/kitchen-style-reference.webp`) is a realistic, warmly lit 3D interior shown through chunky pixels, ordered dithering/halftone dots, soft film grain, strong directional sunlight with deep shadows, and a warm amber and dusty blue grade.
- **How to achieve it:** walls and furniture are simple low-poly blocks with flat or pixel textures, with real lighting and shadows, put through a pixelation, dithering and colour-grade filter. Fine details may be simplified compared with the reference illustrations.
- **Character:** clean 2D pixel-art sprites (billboards) placed in the 3D scene.
- **Placeholder palette** (until the Claude Design brand system arrives): pale cream/white base, dark brown contrast panels, subtle lavender/purple accents. The room's own palette is warm wood, cream walls, dark brown furniture, and lavender touches (mandala art, desk lamp).

## 3. The room (references: `reference/room/`)
A rectangular bedroom with a wooden plank floor. Seen top-down:
- **Balcony wall (west):** two curtained windows/glass doors with balcony railing and a city skyline, a grey dresser below one window, a small bookshelf, potted plants.
- **Bed wall (north):** single bed (cream sheets, brown throw) against the north-west corner, a gallery of small framed photos above it with a hanging plant, a floor lamp, and a full-length mirror with bulb lights (north-east).
- **Closet wall (east):** tall dark-wood wardrobe, a glass-front cabinet with books/jars, a low sideboard with a plant and a landscape painting above, then the **entry door** (dark wood) at the south end, with a **light switch** beside it.
- **Study/Table wall (south):** large lavender **mandala wall art** (south-west), a wooden desk with laptop, **purple lamp**, books and bottle; a **black mesh gaming chair** on a patterned rug; a side table with a small radio; a round floor cushion/pet bed in the south-west corner.

**Home views (isometric, dollhouse style, near walls cut away):**
- **View A (default):** Study wall + Balcony wall.
- **View B:** Bed wall + Closet wall.
- Desktop flip arrows (bottom-right, below the nav) switch views with a smooth 180° rotation.

**Section ↔ room spot (approved):**
| Section | Spot |
|---|---|
| Work | the desk / laptop |
| Creatives | the photo gallery above the bed |
| About | the bookshelf / glass cabinet |
| Contact | the entry door |

Floating labels for each section bob gently at their spots and are clickable. They appear when their wall is in view.

## 4. Character (references: `reference/character/`)
- **Standing sheet** (front/back/left/right): used for the door welcome. Wavy dark-brown hair with a braided crown, cream sleeveless top with lavender micro-flowers, dark brown skirt, watch on the left wrist, beaded bracelets on the right, nose ring, pearl earrings.
- **Seated sheet** (front/back/left/right in the gaming chair): used in the room. **Spin loop** = cycle front → right → back → left. She stops when a section or the handle is clicked.
- The images are AI-generated. The backgrounds (black, and a cream grid) must be removed and the faint watermark cleaned before use. If removal is poor, ask Laavanya for plain-background versions.

## 5. Flows

### 5.1 Entry (only from `/`, once per session)
1. **Knock screen:** full-screen closed door (the closet-wall door, from the hallway side) with a knocking-hand cue and the text "knock knock". This screen also covers 3D loading.
2. Click/tap the door → it opens → first-person view: standing Laavanya greets: **"Hi! I'm Laavanya Negi! Make yourself at home."**
3. **Desktop:** the camera follows her in and pulls up and out to isometric View A, where she sits and starts spinning. → Home.
4. **Mobile:** the camera follows her in, and the visitor "sits" on the bed facing her spinning in the chair (first person from the bed). → Home (mobile).

### 5.2 Home (desktop)
- Room fills the screen.
- **`@laavanyanegi` at the top-LEFT corner**, which opens the ID card.
- **WORK / CREATIVES / ABOUT / CONTACT** stacked on the right as boxed buttons: UPPERCASE, all equal, no dimming.
- A brown gradient rising from the bottom helps the nav stand out without hiding the room.
- Flip arrows at the bottom-right. Floating labels in the room.

### 5.3 Home (mobile)
- View from the bed facing Laavanya.
- **ID icon at the top-left** replaces the text handle.
- WCAC nav stacked in an accessible, thumb-friendly way.
- No flip arrows. A **20%-opacity orb** in the middle of the room: dragging it gives a 360° look around from the bed.
- One short vibration on key taps (knock, section open). Note: iOS Safari does not support vibration, so it silently does nothing there.

### 5.4 Opening a section
- Triggered from the WCAC nav, a floating label, or the top bar.
- The camera pans/zooms to the section's room spot, and the room darkens.
- The page appears as a **full page panel at ~90% opacity**, so the room is faintly visible behind it.
- Panel colour follows day/night (cream by day, dark brown by night).

### 5.5 Inner page top bar (folder-tab style)
- **Far left:** room icon (pixel house). Clicking it returns to home.
- Then `work  creatives  about  contact`. The **active** tab is UPPERCASE at 100% opacity, styled as a raised folder tab with a subtle wave/underline. **Inactive** tabs are lowercase at 30% opacity.
- **`@laavanyanegi` at the top-RIGHT, outside the folder tab**, which opens the ID card.

## 6. Pages (from sketches)
- **Work:**
  - **PROJECTS:** a row of project cards. Each shows a thumbnail and a short **Problem → Decision → Outcome** preview, and opens `/work/[slug]`.
  - **BLOGS:** cards linking to published **Medium** articles, using each article's preview image as the feature image. They open on Medium in a new tab.
- **Project detail `/work/[slug]`:** a full case study. Content structure is in `docs/content-templates/project.md`.
- **Creatives:** what Laavanya posts on social media, passion projects, portrait photography, anything artistic.
  - **SIDE PROJECTS:** a row of cards.
  - **ART & MORE:** a row of cards.
- **About:**
  - **WORK EXPERIENCE** as a vertical timeline with dots
  - **EDUCATION**
  - **ACTIVITIES & AWARDS**
  - **CERTIFICATES & BADGES**
- **Contact:** a list of icon + label links: Email, LinkedIn, GitHub, X, Instagram, Medium, Substack, Figma, Behance, YouTube. URLs come later.
- **Empty states:** until real content exists, sections show tasteful "coming soon" placeholders that match the sketch layout.

## 7. ID card overlay
- Opened from `@laavanyanegi` (desktop) or the ID icon (mobile). It drops down from the top on a **lanyard clip** and dims the background.
- **Left:** headshot. **Right:** **LAAVANYA NEGI**, **Product Manager**, **DEL/BLR**, **Languages:** Hindi, English, German (A2), Garhwali.
- **Connect:** a hyperlink to Laavanya's Carrd page (URL to be provided).
- **Download icon** next to the card, which downloads a PDF of the ID card (designed later; placeholder until then).
- **Grey ✕ button outside the card.** It closes the overlay and returns to the current page. A click outside the card and the Esc key also close it.
- **Never shown:** DOB, gender, phone number.

## 8. Day / night mode
- **Default:** set from the visitor's local time (night roughly 7pm–6am). The visitor can toggle at any time, and the choice is remembered.
- **Day:** sunlight through the balcony windows, a daytime skyline, a cream page panel.
- **Night:** dark sky with a lit city, and the room lights on: purple desk lamp, floor lamp, mirror bulbs, laptop glow. Dark brown page panel.
- **Toggles:** the **light switch by the door** is clickable in the room, and a matching **pixel light-switch icon** sits in the UI.
- Designed and iterated live in the preview together with Laavanya.

## 9. Content model
- Everything lives in `content/` as data files. A project has a `status` of `published`, `in-progress` ("case study coming soon") or `hidden`.
- Adding a project, blog or creative means adding one file.
- Templates for Laavanya to fill are in `docs/content-templates/`.

## 10. Still open (decide in the relevant phase)
- Carrd URL, social URLs, email display, CV and ID-card PDFs
- Whether Creatives cards link out (Instagram etc.) or open a lightbox gallery
- Loading-screen details, SEO/OG image, analytics
- Final brand system (fonts, colours) from Claude Design
