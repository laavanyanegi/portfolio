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
      <div className="max-w-prose space-y-4 leading-relaxed">
        <p>
          I am a product-minded professional who likes turning user friction into better digital experiences. Two years
          in digital media taught me how people use platforms and how data shows what to fix. I bring user research,
          prioritisation, PRD writing, analytics and prototyping to the problems I take on, with a particular interest
          in consumer behaviour and fintech.
        </p>
        <p>
          Away from work, I am a storyteller at heart: I write and publish on Medium, design and make art, and have
          been part of a student documentary screened at Saptrang Short Fest. I speak Hindi, English and Garhwali, am learning German, and
          enjoy volunteering and community work. Curious by habit, I am happiest when learning a new skill and building
          something people actually enjoy using.
        </p>
      </div>
      <p className="mt-4 text-sm text-muted">CV download coming soon.</p>
      <SectionHeading>Work experience</SectionHeading>
      <Timeline items={about.experience} label="Work experience" />
      <SectionHeading>Skills</SectionHeading>
      <dl className="grid gap-4 sm:grid-cols-2">
        {about.skills.map((s) => (
          <div key={s.category} className="rounded-md border-2 border-line bg-panel-alt p-3">
            <dt className="font-pixel text-sm uppercase text-accent">{s.category}</dt>
            <dd className="mt-2">
              <ul className="flex flex-wrap gap-2">
                {s.items.map((i) => (
                  <li key={i} className="rounded-sm bg-accent-soft px-2 py-1 text-sm text-ink">
                    {i}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <SectionHeading>Education</SectionHeading>
      <Timeline items={about.education} label="Education" />
      <SectionHeading>Activities &amp; awards</SectionHeading>
      <Timeline items={about.activities} label="Activities and awards" />
      <SectionHeading>Certificates &amp; badges</SectionHeading>
      <Timeline items={about.certificates} label="Certificates and badges" />
    </>
  );
}
