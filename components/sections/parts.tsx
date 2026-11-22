import type { ReactNode } from "react";

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="font-pixel mb-8 text-3xl md:text-4xl">{children}</h1>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-pixel mb-4 mt-10 border-b-2 border-line pb-2 text-xl uppercase tracking-wide">
      {children}
    </h2>
  );
}

export function CardRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
  );
}

export function Thumb({ label }: { label: string }) {
  return (
    <div
      className="font-pixel grid aspect-video place-items-center rounded-sm bg-accent-soft text-xs uppercase text-ink"
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export function ComingSoon({ children }: { children: ReactNode }) {
  return <p className="rounded-sm border-2 border-dashed border-line p-6 text-center text-muted">{children}</p>;
}
