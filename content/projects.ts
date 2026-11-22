import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    slug: "sample-case-study",
    title: "Sample case study (placeholder)",
    status: "published",
    order: 1,
    company: "Company name",
    role: "Your role",
    timeline: "Mon–Mon 20XX",
    team: "Who you worked with",
    tools: "Jira, Figma, Analytics",
    problem: "What was broken or missing, and for whom.",
    decision: "What was chosen and why.",
    outcome: "The result, with a number if possible.",
    metrics: [
      { label: "Metric one", value: "—" },
      { label: "Metric two", value: "—" },
    ],
    sections: [
      { heading: "TL;DR", body: "Two or three lines a hiring manager can read in ten seconds." },
      { heading: "Context", body: "The company, the product and the situation." },
      { heading: "The problem", body: "What was broken, for whom, and how it was known." },
      { heading: "The decision", body: "What was chosen and why." },
      { heading: "Outcome", body: "Results with numbers where possible." },
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
