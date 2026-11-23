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
  /** Case-study sections, in reading order. A section with no body and no blocks is skipped. */
  sections: ProjectSection[];
};

export type ProjectSection = {
  heading: string;
  body?: string;
  blocks?: ProjectBlock[];
};

export type GalleryImage = { src: string; alt: string; caption: string; width: number; height: number };

export type ProjectBlock =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "gallery"; label: string; items: GalleryImage[] }
  | { type: "video"; src: string; caption: string }
  | { type: "links"; items: { label: string; url: string }[] }
  | { type: "quote"; text: string; source: string }
  /** Dashed "coming soon" box for content not supplied yet. */
  | { type: "placeholder"; text: string };

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
  location?: string;
  highlights?: string[];
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
