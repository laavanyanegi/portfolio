import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { visibleProjects } from "@/content/projects";
import { getBlogs } from "@/lib/medium";
import { CardRow, ComingSoon, PageTitle, SectionHeading, Thumb } from "@/components/sections/parts";

export const metadata: Metadata = { title: "Work — Laavanya Negi" };

export default async function WorkPage() {
  const blogs = await getBlogs();
  return (
    <>
      <PageTitle>Work</PageTitle>

      <SectionHeading>Projects</SectionHeading>
      {visibleProjects.length === 0 ? (
        <ComingSoon>Case studies are on the way.</ComingSoon>
      ) : (
        <CardRow label="Projects">
          {visibleProjects.map((p) => {
            const body = (
              <>
                {p.thumbnail ? (
                  <Image
                    src={p.thumbnail}
                    alt=""
                    width={1280}
                    height={640}
                    sizes="(min-width: 1024px) 300px, 50vw"
                    className="aspect-video w-full rounded-sm object-cover"
                  />
                ) : (
                  <Thumb label={p.status === "published" ? "Case study" : "Coming soon"} />
                )}
                <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
                {p.status === "in-progress" && <p className="text-sm text-muted">Case study coming soon</p>}
                <dl className="mt-2 space-y-1 text-sm">
                  <div>
                    <dt className="inline font-semibold text-accent">Problem → </dt>
                    <dd className="inline">{p.problem}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-accent">Decision → </dt>
                    <dd className="inline">{p.decision}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-accent">Outcome → </dt>
                    <dd className="inline">{p.outcome}</dd>
                  </div>
                </dl>
              </>
            );
            return (
              <li key={p.slug} className="rounded-md border-2 border-line bg-panel-alt p-3">
                {p.status === "published" ? (
                  <Link href={`/work/${p.slug}`} className="block hover:opacity-80">
                    {body}
                  </Link>
                ) : (
                  <div>{body}</div>
                )}
              </li>
            );
          })}
        </CardRow>
      )}

      <SectionHeading>Blogs</SectionHeading>
      {blogs.length === 0 ? (
        <ComingSoon>Articles coming soon.</ComingSoon>
      ) : (
        <CardRow label="Blogs">
          {blogs.map((b) => (
            <li key={b.url + b.title} className="rounded-md border-2 border-line bg-panel-alt p-3">
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">
                {b.image ? (
                  <Image
                    src={b.image}
                    alt=""
                    width={1024}
                    height={576}
                    sizes="(min-width: 1024px) 300px, 50vw"
                    className="aspect-video w-full rounded-sm object-cover"
                  />
                ) : (
                  <Thumb label="Medium" />
                )}
                <h3 className="mt-3 text-lg font-semibold">
                  {b.title} <span className="sr-only-text">(opens in a new tab)</span>
                  <span aria-hidden="true"> ↗</span>
                </h3>
                <p className="text-sm text-muted">{b.summary}</p>
              </a>
            </li>
          ))}
        </CardRow>
      )}
    </>
  );
}
