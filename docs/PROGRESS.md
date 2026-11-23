# PROGRESS

## Roadmap (one chat session per phase)
| # | Phase | Suggested model | Status |
|---|---|---|---|
| 0 | Planning: CLAUDE.md, VISION.md, specs | Opus | ✅ done |
| 1 | Shell + live link: all 5 screens on Vercel | Sonnet | ✅ done — live at https://laavanyanegi.vercel.app/ |
| 2 | Look test: one room corner in pixel style, day/night prototype at `/lab` (approval gate) | Opus | ✅ approved 2026-11-23 (values locked in `store/lab.ts`) |
| 3 | Content v1: first case study, About, Contact, ID card → **start applying** | Sonnet | ✅ done 2026-11-23 (placeholders remain, see below) |
| 4 | The room: full 3D room, both views, flip arrows, floating labels, spinning character, day/night lighting | Opus | — |
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
