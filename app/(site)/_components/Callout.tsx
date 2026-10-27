import type { ReactNode } from "react";

type CalloutVariant = "catatan" | "placeholder";

const variantClasses: Record<CalloutVariant, string> = {
  catatan:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  placeholder:
    "border-dashed border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400",
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
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}>
      <p className="mb-1 font-semibold">{variantLabel[variant]}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
