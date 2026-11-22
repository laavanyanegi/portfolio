import type { Metadata } from "next";
import { creatives } from "@/content/creatives";
import { CardRow, ComingSoon, PageTitle, SectionHeading, Thumb } from "@/components/sections/parts";
import type { CreativeGroup } from "@/lib/types";

export const metadata: Metadata = { title: "Creatives — Laavanya Negi" };

const groups: { id: CreativeGroup; heading: string }[] = [
  { id: "side-projects", heading: "Side projects" },
  { id: "art", heading: "Art & more" },
];

export default function CreativesPage() {
  return (
    <>
      <PageTitle>Creatives</PageTitle>
      {groups.map((g) => {
        const items = creatives.filter((c) => c.group === g.id);
        return (
          <section key={g.id}>
            <SectionHeading>{g.heading}</SectionHeading>
            {items.length === 0 ? (
              <ComingSoon>Coming soon.</ComingSoon>
            ) : (
              <CardRow label={g.heading}>
                {items.map((c) => {
                  const inner = (
                    <>
                      <Thumb label="Coming soon" />
                      <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                      <p className="text-sm text-muted">{c.description}</p>
                    </>
                  );
                  return (
                    <li key={c.title} className="rounded-md border-2 border-line bg-panel-alt p-3">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </CardRow>
            )}
          </section>
        );
      })}
    </>
  );
}
