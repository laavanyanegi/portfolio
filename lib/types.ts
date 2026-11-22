export type ProjectStatus = "published" | "in-progress" | "hidden";

export type Project = {
  slug: string;
  title: string;
  status: ProjectStatus;
  order: number;
  company: string;
  role: string;
  timeline: string;
  team: string;
  tools: string;
  problem: string;
  decision: string;
  outcome: string;
  metrics: { label: string; value: string }[];
  thumbnail?: string;
  cover?: string;
  /** Case-study sections, in reading order. Empty body = skipped. */
  sections: { heading: string; body: string }[];
};

export type Blog = {
  title: string;
  url: string;
  summary: string;
  image?: string;
  published?: string;
};

export type CreativeGroup = "side-projects" | "art";

export type Creative = {
  title: string;
  group: CreativeGroup;
  description: string;
  url?: string;
  image?: string;
};

export type TimelineEntry = {
  title: string;
  org: string;
  period: string;
  summary?: string;
};

export type About = {
  experience: TimelineEntry[];
  education: TimelineEntry[];
  activities: TimelineEntry[];
  certificates: TimelineEntry[];
};

export type ContactLink = {
  id: string;
  label: string;
  /** Empty string = not provided yet; rendered as "coming soon". */
  url: string;
};

export type IdCard = {
  handle: string;
  name: string;
  title: string;
  location: string;
  languages: string[];
  headshot?: string;
  connectUrl: string;
  pdf: string;
};
