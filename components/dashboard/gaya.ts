/** Kelas bersama komponen dashboard & profil admin (semua lewat token di app/globals.css). */

export const kartu = "rounded-[20px] border border-border bg-bg-elevated p-5 sm:p-6";

export const eyebrow = "text-xs font-bold uppercase tracking-[0.08em] text-ink-muted";

export const judulKartu = "font-display text-[22px] font-semibold leading-tight text-ink";

const tombolDasar =
  "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-full border px-[18px] text-sm font-bold transition";

export const tombolUtama = `${tombolDasar} border-transparent bg-primary text-bg hover:opacity-90`;

export const tombolGhost = `${tombolDasar} border-border-strong bg-transparent text-ink hover:bg-bg-muted`;

export const tombolKeluar = `${tombolDasar} border-link bg-transparent text-link hover:bg-bg-muted`;
