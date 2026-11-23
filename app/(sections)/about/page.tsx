import type { Metadata } from "next";
import { about } from "@/content/about";
import { ComingSoon, PageTitle, SectionHeading } from "@/components/sections/parts";
import type { TimelineEntry } from "@/lib/types";

export const metadata: Metadata = { title: "About — Laavanya Negi" };

function Timeline({ items, label }: { items: TimelineEntry[]; label: string }) {
  if (items.length === 0) return <ComingSoon>Coming soon.</ComingSoon>;
  return (
    <ol aria-label={label} className="relative ml-2 border-l-2 border-line pl-6">
      {items.map((e) => (
        <li key={e.title + e.period} className="relative pb-6 last:pb-0">
          <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 bg-accent" aria-hidden="true" />
          <h3 className="font-semibold">{e.title}</h3>
          <p className="text-sm text-muted">
            {[e.org, e.location, e.period].filter(Boolean).join(" · ")}
          </p>
          {e.summary && <p className="mt-1">{e.summary}</p>}
          {e.highlights && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageTitle>About</PageTitle>
      <p className="max-w-prose leading-relaxed">
        Product-oriented professional with about two years in digital media, CMS usability improvements, user testing,
        analytics and cross-functional work. Interested in building customer-centric fintech products.
      </p>
      <p className="mt-4 text-sm text-muted">CV download coming soon.</p>
      <SectionHeading>Work experience</SectionHeading>
      <Timeline items={about.experience} label="Work experience" />
      <SectionHeading>Education</SectionHeading>
      <Timeline items={about.education} label="Education" />
      <SectionHeading>Activities &amp; awards</SectionHeading>
      <Timeline items={about.activities} label="Activities and awards" />
      <SectionHeading>Certificates &amp; badges</SectionHeading>
      <Timeline items={about.certificates} label="Certificates and badges" />
    </>
  );
}
