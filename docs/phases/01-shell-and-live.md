# Phase 1: Shell + Live Link

**Goal:** a live Vercel URL showing the home screen and all 4 section pages, structurally complete, with placeholder content. No real 3D yet.

**Read:** CLAUDE.md, PROGRESS.md, VISION.md §5.2, §5.5, §6, §7, §8.
**Look at:** `reference/sketches/*`, but only if a layout is unclear from VISION.md.

## Tasks
1. **Scaffold** Next.js + TypeScript + Tailwind + ESLint (App Router, no `src/`). The folder already holds `docs/`, `CLAUDE.md` and `.gitignore`, so scaffold in the scratchpad and move the files in. Install framer-motion, three, @react-three/fiber, @react-three/drei, zustand, next-themes.
2. **Tokens:** placeholder palette and a pixel-style display font plus a readable body font, as CSS variables in `app/globals.css`, with day and night values.
3. **Content system:** typed data files in `content/` for projects (with `status`), blogs, creatives, about, contact and the ID card. Seed one placeholder per type.
4. **Routes:** `/`, `/work`, `/work/[slug]`, `/creatives`, `/about`, `/contact`. Each section page is a ~90%-opacity panel over the background.
5. **Room placeholder:** a static background (e.g. a soft blurred gradient or a still of the room) inside the persistent canvas slot, so Phase 4 can swap it out.
6. **Home UI:** handle top-left, boxed WCAC stack on the right, bottom brown gradient, flip-arrow placeholders.
7. **Top bar:** room icon, folder-tab active state (UPPERCASE 100%) and inactive tabs (lowercase 30%), handle top-right outside the tab. Responsive.
8. **Page skeletons** per VISION §6, including empty "coming soon" states. Project card shows Problem → Decision → Outcome. Blog cards link out.
9. **ID card overlay** per VISION §7: lanyard drop-down, download icon (placeholder PDF), grey ✕ outside the card, outside-click and Esc close it, focus trapped while open.
10. **Day/night:** theme switch (UI light-switch icon), default from local time, remembered. Inner-panel colours only; room lighting comes in Phase 4.
11. **Mobile pass:** ID icon top-left, stacked nav, all pages readable.
12. **Ship:** `npm run build` passes. `git init`, push to github.com/laavanyanegi/portfolio. Guide Laavanya through importing the repo on Vercel and confirm the live URL.

## Done when
- The live URL loads all 5 screens on desktop and phone.
- Day/night and the ID card work.
- PROGRESS.md is updated with the live URL.
