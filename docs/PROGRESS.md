# PROGRESS

## Roadmap (one chat session per phase)
| # | Phase | Suggested model | Status |
|---|---|---|---|
| 0 | Planning: CLAUDE.md, VISION.md, specs | Opus | ✅ done |
| 1 | Shell + live link: all 5 screens on Vercel | Sonnet | ✅ done — live at https://laavanyanegi.vercel.app/ |
| 2 | Look test: one room corner in pixel style, day/night prototype at `/lab` (approval gate) | Opus | ⏳ next |
| 3 | Content v1: first case study, About, Contact, ID card → **start applying** | Sonnet | — |
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

## Waiting on Laavanya
- v1 content (fill `docs/content-templates/`), headshot, CV PDF
- Carrd URL, social URLs
- ID card PDF (designed later)
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
