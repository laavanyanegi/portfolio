import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedProjects } from "@/content/projects";
import Image from "next/image";
import { PageTitle, SectionHeading } from "@/components/sections/parts";
import ProjectBlocks from "@/components/sections/ProjectBlocks";

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

      {p.cover && (
        <Image
          src={p.cover}
          alt={`${p.title} banner`}
          width={1280}
          height={640}
          priority
          sizes="(min-width: 1024px) 900px, 100vw"
          className="mb-6 h-auto w-full rounded-md border-2 border-line"
        />
      )}

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
        .filter((s) => s.body || s.blocks?.length)
        .map((s) => (
          <section key={s.heading}>
            <SectionHeading>{s.heading}</SectionHeading>
            {s.body && <p className="max-w-prose whitespace-pre-line leading-relaxed">{s.body}</p>}
            {s.blocks && <ProjectBlocks blocks={s.blocks} />}
          </section>
        ))}
    </article>
  );
}
