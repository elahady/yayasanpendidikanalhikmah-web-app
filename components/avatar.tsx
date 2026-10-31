/** Inisial dari nama: huruf pertama dua kata pertama ("Ahmad Zainal" -> "AZ", "Admin" -> "AD"). */
export function inisial(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "?";
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return (kata[0][0] + kata[1][0]).toUpperCase();
}

const UKURAN = {
  sm: "h-9 w-9 text-[13px]",
  lg: "h-[72px] w-[72px] text-[26px]",
} as const;

/** Lingkaran inisial. Dekoratif (nama selalu ada di teks sekitarnya), jadi aria-hidden. */
export function Avatar({ nama, ukuran = "sm" }: { nama: string; ukuran?: keyof typeof UKURAN }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-avatar font-bold text-avatar-ink ${UKURAN[ukuran]}`}
    >
      {inisial(nama)}
    </span>
  );
}
