import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedProjects } from "@/content/projects";
import { PageTitle, SectionHeading } from "@/components/sections/parts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = publishedProjects.find((x) => x.slug === slug);
  return { title: p ? `${p.title} — Laavanya Negi` : "Work — Laavanya Negi" };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = publishedProjects.find((x) => x.slug === slug);
  if (!p) notFound();

  const facts = [
    ["Company", p.company],
    ["Role", p.role],
    ["Timeline", p.timeline],
    ["Team", p.team],
    ["Tools", p.tools],
  ].filter(([, v]) => v);

  return (
    <article>
      <Link href="/work" className="text-sm text-accent underline">
        ← Back to work
      </Link>
      <div className="mt-4">
        <PageTitle>{p.title}</PageTitle>
      </div>

      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      {p.metrics.length > 0 && (
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="Key metrics">
          {p.metrics.map((m) => (
            <li key={m.label} className="rounded-md border-2 border-line bg-panel-alt p-4">
              <p className="font-pixel text-2xl text-accent">{m.value}</p>
              <p className="text-sm text-muted">{m.label}</p>
            </li>
          ))}
        </ul>
      )}

      {p.sections
        .filter((s) => s.body)
        .map((s) => (
          <section key={s.heading}>
            <SectionHeading>{s.heading}</SectionHeading>
            <p className="max-w-prose whitespace-pre-line leading-relaxed">{s.body}</p>
          </section>
        ))}
    </article>
  );
}
