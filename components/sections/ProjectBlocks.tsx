import Image from "next/image";
import type { ProjectBlock } from "@/lib/types";
import { ComingSoon } from "@/components/sections/parts";

function Table({ head, rows, caption }: { head: string[]; rows: string[][]; caption?: string }) {
  return (
    <div className="my-6 overflow-x-auto rounded-md border-2 border-line" tabIndex={0} role="region" aria-label={caption ?? "Table"}>
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        {caption && <caption className="p-2 text-left text-xs text-muted">{caption}</caption>}
        <thead className="bg-panel-alt">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b-2 border-line p-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0] + r[1]} className="align-top odd:bg-panel">
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="border-b border-line p-3 font-semibold">
                    {c}
                  </th>
                ) : (
                  <td key={i} className="border-b border-line p-3">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProjectBlocks({ blocks }: { blocks: ProjectBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "text":
            return (
              <p key={i} className="my-4 max-w-prose leading-relaxed">
                {b.text}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="my-4 max-w-prose list-disc space-y-2 pl-6 leading-relaxed">
                {b.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            );
          case "table":
            return <Table key={i} head={b.head} rows={b.rows} caption={b.caption} />;
          case "gallery":
            return (
              <figure key={i} className="my-6">
                <figcaption className="mb-2 text-sm font-semibold">{b.label}</figcaption>
                <ul
                  className="flex gap-4 overflow-x-auto rounded-md border-2 border-line bg-panel-alt p-3"
                  tabIndex={0}
                  aria-label={b.label}
                >
                  {b.items.map((img) => (
                    <li key={img.src} className="w-44 shrink-0">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        sizes="176px"
                        className="h-auto w-full rounded-sm border border-line"
                      />
                      <p className="mt-2 text-xs text-muted">{img.caption}</p>
                    </li>
                  ))}
                </ul>
              </figure>
            );
          case "video":
            return (
              <figure key={i} className="my-6">
                <video
                  className="mx-auto max-h-[70vh] w-auto max-w-full rounded-md border-2 border-line bg-brown"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={b.caption}
                >
                  <source src={b.src} type="video/mp4" />
                </video>
                <figcaption className="mt-2 text-center text-sm text-muted">{b.caption}</figcaption>
              </figure>
            );
          case "links":
            return (
              <ul key={i} className="my-4 space-y-1">
                {b.items.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                      {l.label} <span className="sr-only-text">(opens in a new tab)</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-4 max-w-prose border-l-4 border-accent pl-4">
                <p>{b.text}</p>
                <footer className="text-sm text-muted">{b.source}</footer>
              </blockquote>
            );
          case "placeholder":
            return (
              <div key={i} className="my-4">
                <ComingSoon>{b.text}</ComingSoon>
              </div>
            );
        }
      })}
    </>
  );
}
