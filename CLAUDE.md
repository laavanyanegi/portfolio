# Laavanya Negi — Portfolio

Hiring-manager-first PM portfolio set inside a pixel-art 3D version of Laavanya's bedroom. Visitors knock, enter, and open sections (Work, Creatives, About, Contact) from the room.

## Read at session start
- `docs/PROGRESS.md`: what's done, decisions, what's next. Always read.
- The phase spec the user names: `docs/phases/NN-*.md`. Stay inside its scope.
- `docs/VISION.md`: full product and UX spec. Read the sections relevant to the task.
- `docs/reference/` holds images (gitignored, local only). Open one only when the phase spec says to; VISION.md already describes them in words.

## Stack
Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber + drei · Zustand · next-themes. Hosted on Vercel; it auto-deploys on push to `main` of github.com/laavanyanegi/portfolio (public).

## Commands
Windows, PowerShell 5.1: chain commands with `;`, because `&&` does not work.
- `npm run dev`: local preview (use the browser pane)
- `npm run build`: must pass before any push
- `npm run lint`

## Structure
- `app/`: routes `/`, `/work`, `/work/[slug]`, `/creatives`, `/about`, `/contact`
- `components/canvas/`: 3D only (room, camera, character, effects)
- `components/ui/`: 2D chrome (nav, top bar, ID card, toggles)
- `components/sections/`: page bodies for each section
- `content/`: all site content as data files (projects, blogs, creatives, about, contact)
- `store/`: Zustand stores (intro stage, wall view, ID card open, day/night)
- `lib/`: helpers and types

## Rules
- The user is not a coder. Explain choices briefly and in plain language. Ask before building, and confirm scope at the start of a phase.
- Content lives in `content/`, never hardcoded in components. Projects have `status: published | in-progress | hidden`.
- Colours and fonts come only from tokens in `app/globals.css`. The palette is a placeholder until the brand system (from Claude Design) arrives.
- Route = section state. Zustand holds world/UI state only. Keep 3D state out of UI components and vice versa.
- One persistent `<Canvas>` in the root layout, loaded client-only. Page content must render and be readable without WebGL.
- Deep links (e.g. `/work`) skip the entry sequence. The entry plays from `/` once per session.
- Respect `prefers-reduced-motion`. No sound anywhere. Haptics: one short vibration on mobile only.
- Accessibility: semantic HTML, keyboard reachable, alt text, AA contrast in day and night.
- Performance: lazy-load 3D, compress images, target 60fps on desktop and a lighter scene on low-end/mobile.
- Privacy: never publish DOB, gender, phone or home address.
- End of every phase: `npm run build` passes → update `docs/PROGRESS.md` → commit and push.
