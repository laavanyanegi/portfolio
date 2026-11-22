export default function SectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-x-2 bottom-2 top-[6.25rem] overflow-y-auto rounded-md border-2 border-line text-ink md:inset-x-4 md:bottom-4 md:top-16"
      style={{ background: "color-mix(in srgb, var(--panel) 90%, transparent)" }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-12">{children}</div>
    </div>
  );
}
