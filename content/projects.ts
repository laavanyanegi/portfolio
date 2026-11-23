import type { GalleryImage, Project } from "@/lib/types";

const A = "/work/airtel";

const shot = (file: string, width: number, height: number, alt: string, caption: string): GalleryImage => ({
  src: `${A}/${file}.webp`,
  alt,
  caption,
  width,
  height,
});

export const projects: Project[] = [
  {
    slug: "airtel-payments-bank-ncmc-recharge-case-study",
    title: "Airtel Thanks App: Redesigning the Airtel Payments Bank RuPay NCMC Recharge Journey",
    status: "published",
    order: 1,
    company: "Airtel Payments Bank (self-initiated case study)",
    role: "Product Manager (solo: research, product, design, testing)",
    timeline: "June – November 2026 (6 months)",
    team: "Solo project",
    tools: "Notion AI, Miro, Figma, Canva",
    problem:
      "Too many screens and a hard-to-find recharge button made the NCMC top-up freeze, overwhelm and frustrate users.",
    decision:
      "Fewer screens, a payment progress bar, a more visible recharge button and a ₹50 micro-recharge quick pick.",
    outcome: "In guerrilla usability testing with 8 users, mean recharge time-on-task fell by 49.81%.",
    thumbnail: `${A}/banner.webp`,
    cover: `${A}/banner.webp`,
    metrics: [
      { label: "Reduction in mean recharge time-on-task (8 users)", value: "49.81%" },
      { label: "Baseline median time, unassisted (8 users)", value: "~267 s" },
      { label: "Planned target for median time", value: "−35%" },
    ],
    sections: [
      {
        heading: "TL;DR",
        body: "Paying for a metro ride should take seconds, but recharging an Airtel Payments Bank RuPay NCMC card in the Airtel Thanks app took users around 267 seconds and many screens. I redesigned the flow end to end: fewer screens, a progress bar that shows the steps left, a clearer recharge button, and a ₹50 quick pick for one-way trips. In guerrilla usability testing, mean recharge time-on-task dropped by 49.81% across 8 users.",
        blocks: [
          {
            type: "video",
            src: `${A}/airtel-thanks-app-prototype.mp4`,
            caption: "Screen recording of the redesigned recharge flow in the Figma prototype.",
          },
        ],
      },
      {
        heading: "Context",
        body: "Airtel Thanks is Airtel's all-in-one app, with over 500 million Android downloads. Through Airtel Payments Bank it lets customers recharge their RuPay NCMC (National Common Mobility Card), the open-loop card used for metro travel and everyday payments. Airtel Payments Bank co-branded 'On-The-Go' cards with the Delhi Metro Rail Corporation (DMRC) in May 2026, and the bank had issued over 2.5 million cards by April 2025.\n\nThe recharge interface is crowded, and customers complain about it. The goal was to cut information overload and give users a quick, confident top-up without removing the ads the business relies on.",
        blocks: [
          {
            type: "links",
            items: [
              { label: "DMRC announcement on X", url: "https://x.com/OfficialDMRC/status/2053369695861125434" },
            ],
          },
        ],
      },
      {
        heading: "The problem",
        body: "People top up while walking to the turnstile, often with weak underground signal. In that moment they hit a poor home-screen button, then too many screens, slow loads and freezes, and no sign of how far along the payment is. The result is frustration and abandonment, and users who drop off pay in a competitor's app instead.\n\nProblem statement: frequent commuters, who are short on time, struggle to spot the recharge button. Once they start, the number of screens adds cognitive load, and the missing progress indicator creates uncertainty. Frequent one-way commuters also want a quick ₹50 option.",
      },
      {
        heading: "My role",
        body: "I ran this as a solo Product Manager. I did the user research (app-store, X and Reddit reviews, interviews and competitor analysis), framed the problem, prioritised the solutions, wrote the one-pager and PRD, designed and prototyped the flow in Figma, ran the usability test, and defined the success metrics and go-to-market plan.",
      },
      {
        heading: "Users & research",
        blocks: [
          {
            type: "list",
            items: [
              "Reviews: I read Google Play Store, X and Reddit reviews. The recurring complaints were pop-up ads, screen freezing and long loading, a confusing interface, and a mismatch between the balance in the app and on the card.",
              "Interviews: 3 people aged 18 to 55 walked through the journey from the home screen to payment confirmation, and I noted friction at every step.",
              "Observation: 8 users recharged the card from both the home-screen icon and the search result. Loading was slow, and the whole payment took a median of about 267 seconds, unassisted.",
              "Competitors: the DMRC Saarthi app, Paytm and Pine Labs all support NCMC recharge with a quicker, simpler interface. Three problems stood out in Airtel's flow: slow loading, excess screens and information overload.",
            ],
          },
          { type: "text", text: "I built three personas and prioritised the first, because it covers the most areas of development and shares 'too many screens' as the pain point with the other two:" },
          {
            type: "table",
            head: ["Persona", "Who they are", "What hurts"],
            rows: [
              [
                "Rohan, college day scholar (18–24), prioritised",
                "20, Delhi. Tops up on the move with ₹50–₹100 UPI micro-recharges.",
                "Slow loads underground, too many steps, no progress indicator, a ₹100 minimum, and no NFC top-up prompt after paying.",
              ],
              [
                "Anitha, working single mother (40–55)",
                "44, Gurugram. Recharges her and her son's cards on payday, ₹1,000 or more.",
                "Anxious without real-time status, too many selection screens, balance updates late.",
              ],
              [
                "Ramesh, senior citizen on foot (60–70)",
                "66, Greater Noida. Low-to-moderate tech comfort, vision issues.",
                "Small text, jargon, fear of fraud and double deduction, so he falls back to cash tokens.",
              ],
            ],
          },
          {
            type: "placeholder",
            text: "Journey map and empathy map (Miro board) coming soon.",
          },
        ],
      },
      {
        heading: "Options considered",
        body: "I brainstormed seven solutions across the three personas, then scored each one on business objective, UX effort and engineering cost, using MoSCoW prioritisation.",
        blocks: [
          {
            type: "table",
            head: ["Priority", "Solution", "Business goal", "UX effort", "Eng. cost", "Why"],
            rows: [
              ["Must", "More visible recharge icon on the home screen", "High", "Medium", "Low", "Users find it faster; little design or tech work."],
              ["Must", "Fewer screens to stop slow loads and freezes", "High", "High", "Medium", "Biggest lever on time to pay and drop-off."],
              ["Should", "₹50 micro-recharge quick pick", "Medium", "Medium", "Low", "Fits one-way trips; competitors already offer it."],
              ["Should", "Payment status bar showing steps left", "High", "Medium", "Low", "Reduces anxiety for all three personas."],
              ["Could", "NFC top-up prompt right after recharge", "High", "Medium", "Medium", "Needs a minimum network signal to work."],
              ["Could", "Low-balance push notifications", "Medium", "Low", "High", "Low confidence: users may mute them as spam."],
              ["Won't (for now)", "Auto-pay triggers and reminders", "Medium", "Low", "High", "High tech dependency and spam risk; revisit later."],
            ],
            caption: "MoSCoW prioritisation of the seven brainstormed solutions.",
          },
        ],
      },
      {
        heading: "The decision",
        body: "I shipped the Musts and Shoulds: the visible recharge icon, fewer screens, the progress bar and the ₹50 quick pick. They help every persona, cost little, and attack the biggest friction (time and uncertainty). I deferred the NFC prompt, low-balance alerts and auto-pay because they carry higher engineering cost, more dependencies and a spam risk.\n\nConstraints shaped the call: the app must not freeze on low-connectivity underground trips, engineering should cache locally so payments process without the user noticing, and there was little time, testing capacity and go-to-market budget. I also kept the ads in the flow so revenue was not put at risk for a nicer experience.",
      },
      {
        heading: "Execution",
        body: "I worked solo from June to November 2026. Research began in June and formal documentation started in September. I brainstormed in Notion AI, built personas and journeys in Miro, and prototyped the low-fidelity and high-fidelity flows in Figma. I redesigned both entry paths: the home-screen icon and the search bar.",
        blocks: [
          {
            type: "table",
            head: ["Heuristic", "Existing app", "Redesign"],
            rows: [
              ["Visibility of system status", "No payment progress indicator", "Status bar shows the steps remaining"],
              ["Consistency and standards", "Confusing, near-synonymous labels on the card screen", "Renamed actions and spaced the icons (statement, block card and so on)"],
              ["Error prevention", "Successful and unsuccessful screens looked inconsistent", "Uniform screens and clearer text while the payment processes"],
            ],
            caption: "Where the usability heuristics review found problems and what changed.",
          },
          {
            type: "gallery",
            label: "Before: the current app, home-icon flow",
            items: [
              shot("before-1-homescreen", 359, 800, "Airtel Thanks home screen before the redesign", "Home screen: the recharge entry is hard to spot."),
              shot("before-2-icon", 540, 1448, "Airtel Thanks transit card icon screen before the redesign", "Extra screen before the card details."),
              shot("before-3-card", 540, 1684, "Transit card screen before the redesign", "Card screen: crowded, with vague action labels."),
              shot("before-4-add-money", 540, 1204, "Add money screen before the redesign", "Add money: no progress indicator."),
              shot("before-5-payment-mode", 540, 1171, "Payment mode screen before the redesign", "A separate payment-mode screen."),
              shot("before-6-processing", 540, 1204, "Processing screen before the redesign", "Processing: no sense of the steps left."),
              shot("before-7-unsuccessful", 540, 1204, "Unsuccessful payment screen before the redesign", "Unsuccessful screen, inconsistent with the success state."),
            ],
          },
          {
            type: "gallery",
            label: "After: my redesign, home-icon flow",
            items: [
              shot("after-1-homescreen", 402, 874, "Redesigned Airtel Thanks home screen", "A clearer recharge entry on the home screen."),
              shot("after-2-card", 402, 945, "Redesigned card screen", "Card screen with a prominent Add Money button and renamed actions."),
              shot("after-3-add-balance", 402, 874, "Redesigned add balance screen with progress bar and quick amounts", "Progress bar at the top and ₹50, ₹100, ₹200 quick picks."),
              shot("after-4-payment", 402, 874, "Redesigned payment screen", "Payment in the same flow, with the progress bar."),
              shot("after-5-processing", 402, 874, "Redesigned processing screen", "Processing state with clear text."),
              shot("after-6-successful", 402, 874, "Redesigned successful payment screen", "Success screen."),
              shot("after-7-unsuccessful", 402, 874, "Redesigned unsuccessful payment screen", "Failure screen, consistent with success."),
            ],
          },
          {
            type: "gallery",
            label: "Search-bar entry: before and after",
            items: [
              shot("before-search-1", 314, 700, "Search icon screen before the redesign", "Before: search screen."),
              shot("before-search-2", 319, 711, "Search result screen before the redesign", "Before: search result."),
              shot("after-search-1", 402, 874, "Redesigned search screen", "After: search screen."),
              shot("after-search-2", 402, 874, "Redesigned search result screen", "After: search result."),
            ],
          },
          {
            type: "text",
            text: "Go-to-market plan (not yet executed): update the app on the App Store and Google Play at rollout, announce the feature on Airtel and Airtel Payments Bank's Instagram and X, send a push notification about two days after launch on a weekly cycle so users are not bombarded, and add an infographic banner in the app and on the website.",
          },
        ],
      },
      {
        heading: "Outcome",
        body: "In guerrilla usability testing, mean recharge time-on-task fell by 49.81% across 8 users, which beats the 35% target I set for the median. Before the redesign, the unassisted median recharge took about 267 seconds.",
        blocks: [
          {
            type: "table",
            head: ["Metric", "KPI", "Objective and target"],
            rows: [
              ["North star", "Successful recharges up, drop-off down", "Cut the time to pay for regular and occasional users"],
              ["Reduce dissatisfaction", "Drop-off rate", "Fewer screens. Target: median time down 35% (the 49.81% measured is the mean)"],
              ["Keep users through checkout", "Churn rate", "Progress bar. Target: 80% of payments completed in one go"],
              ["More returning users", "Retention rate", "Simpler UI. Target: more returning users and better post-recharge card sync"],
              ["Match competitor UPI apps", "Product-market fit", "₹50 micro-recharge, as in DMRC Saarthi. Target: higher monthly active users for short, frequent trips"],
            ],
            caption: "Success metrics and targets I defined.",
          },
          {
            type: "list",
            items: [
              "Guardrail: turnstile tap latency for offline top-ups, so the security system is protected.",
              "Guardrail: slow card sync or payment errors from delays or mismatches.",
            ],
          },
          {
            type: "placeholder",
            text: "Per-user task times, average time after the redesign and test-session notes coming soon.",
          },
          {
            type: "links",
            items: [
              {
                label: "Full case study, PRD and teardown on GitHub",
                url: "https://github.com/laavanyanegi/Airtel-Payments-Bank-NCMC-case-study",
              },
            ],
          },
        ],
      },
      {
        heading: "What I learned / would do differently",
        blocks: [
          {
            type: "list",
            items: [
              "Brainstorm widely, but prioritise with evidence and logic. MoSCoW kept me from building the exciting features first.",
              "Do not put revenue at risk for advanced features. Keeping the ads in place made the redesign realistic.",
              "Design and test with real users from each persona, then iterate.",
              "Document progress and observations as you go.",
              "Next steps: test on a real phone with weak underground signal, measure the guardrail metrics, and revisit the deferred NFC prompt and low-balance alerts.",
            ],
          },
          {
            type: "text",
            text: "Limits: this is a prototype test with 8 users, so the 49.81% shows direction, not statistical proof, and the redesign has not shipped in the live app.",
          },
        ],
      },
    ],
  },
  {
    slug: "next-case-study",
    title: "Next case study",
    status: "in-progress",
    order: 2,
    company: "",
    role: "",
    timeline: "",
    team: "",
    tools: "",
    problem: "Coming soon.",
    decision: "Coming soon.",
    outcome: "Coming soon.",
    metrics: [],
    sections: [],
  },
];

export const visibleProjects = projects
  .filter((p) => p.status !== "hidden")
  .sort((a, b) => a.order - b.order);

export const publishedProjects = visibleProjects.filter((p) => p.status === "published");
