import type { Metadata } from "next";
import { contactLinks } from "@/content/contact";
import { PageTitle } from "@/components/sections/parts";

export const metadata: Metadata = { title: "Contact — Laavanya Negi" };

export default function ContactPage() {
  return (
    <>
      <PageTitle>Contact</PageTitle>
      <ul className="grid max-w-xl gap-3">
        {contactLinks.map((c) => {
          const row = (
            <span className="flex items-center gap-4">
              <span
                className="font-pixel grid h-10 w-10 place-items-center rounded-sm bg-accent-soft text-sm uppercase"
                aria-hidden="true"
              >
                {c.label.slice(0, 2)}
              </span>
              <span className="font-semibold">{c.label}</span>
              {!c.url && <span className="ml-auto text-sm text-muted">coming soon</span>}
            </span>
          );
          return (
            <li key={c.id} className="rounded-md border-2 border-line bg-panel-alt p-3">
              {c.url ? (
                <a
                  href={c.url}
                  target={c.id === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="block hover:opacity-80"
                >
                  {row}
                </a>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
