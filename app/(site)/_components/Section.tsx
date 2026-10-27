import type { ReactNode } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}
