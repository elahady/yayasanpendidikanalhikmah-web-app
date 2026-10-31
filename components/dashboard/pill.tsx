const VARIAN = {
  ok: "bg-ok-bg text-ok",
  no: "bg-no-bg text-no",
  na: "bg-bg-muted text-ink-muted",
} as const;

/** Label status kecil. Maknanya selalu ada di teks, warna hanya penegas. */
export function Pill({
  varian = "na",
  children,
}: {
  varian?: keyof typeof VARIAN;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${VARIAN[varian]}`}
    >
      {children}
    </span>
  );
}
