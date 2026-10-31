"use client";

import { setThemePref, THEME_OPSI, useThemePref } from "@/components/theme-pref";

/** Pemilih tampilan tiga pilihan (halaman Profil). Berbagi state dengan ThemeToggle. */
export function ThemePicker() {
  const pref = useThemePref();

  return (
    <div
      role="group"
      aria-label="Tema tampilan"
      className="flex w-fit max-w-full flex-wrap gap-1.5 rounded-full bg-bg-muted p-1"
    >
      {THEME_OPSI.map((opsi) => {
        const aktif = pref === opsi.id;
        return (
          <button
            key={opsi.id}
            type="button"
            aria-pressed={aktif}
            onClick={() => setThemePref(opsi.id)}
            className={
              "min-h-11 touch-manipulation rounded-full px-5 text-sm font-bold transition " +
              (aktif ? "bg-primary text-bg" : "text-ink-muted hover:text-ink")
            }
          >
            {opsi.label}
          </button>
        );
      })}
    </div>
  );
}
