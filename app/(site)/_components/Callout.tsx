import type { ReactNode } from "react";

type CalloutVariant = "catatan" | "placeholder";

const variantClasses: Record<CalloutVariant, string> = {
  catatan: "border-accent/30 bg-bg-muted text-ink-muted",
  placeholder: "border-dashed border-border-strong bg-bg-elevated text-ink-subtle",
};

const variantLabel: Record<CalloutVariant, string> = {
  catatan: "Catatan",
  placeholder: "Belum diisi",
};

export function Callout({
  children,
  variant = "catatan",
}: {
  children: ReactNode;
  variant?: CalloutVariant;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3.5 text-sm ${variantClasses[variant]}`}>
      <p className="mb-1 font-semibold text-ink">{variantLabel[variant]}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
