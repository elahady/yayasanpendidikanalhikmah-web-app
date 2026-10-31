"use client";

import { setThemePref, temaBerikutnya, THEME_LABEL, useThemePref } from "@/components/theme-pref";

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/**
 * Tombol cepat tema: siklus Ikuti sistem -> Terang -> Gelap. Ikonnya mengikuti
 * PILIHAN (layar/matahari/bulan), bukan hasil akhir, supaya konsisten dengan
 * pemilih di halaman Profil (components/theme-picker.tsx).
 */
export function ThemeToggle() {
  const pref = useThemePref();
  const berikut = temaBerikutnya(pref);

  return (
    <button
      type="button"
      onClick={() => setThemePref(berikut)}
      aria-label={`Tampilan: ${THEME_LABEL[pref]}. Ketuk untuk ganti ke ${THEME_LABEL[berikut]}`}
      title={`Tampilan: ${THEME_LABEL[pref]}`}
      className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-border text-ink-muted transition hover:border-border-strong hover:text-ink active:scale-95"
    >
      {pref === "dark" ? (
        <svg {...svgProps}>
          <path d="M21 13.2C19.9 13.7 18.7 14 17.4 14C12.8 14 9 10.2 9 5.6C9 4.3 9.3 3.1 9.8 2C5.8 2.9 2.8 6.5 2.8 10.8C2.8 15.8 6.9 19.9 11.9 19.9C16.2 19.9 19.8 16.9 20.7 12.9C20.8 13 21 13.1 21 13.2Z"></path>
        </svg>
      ) : pref === "light" ? (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="4.5"></circle>
          <path d="M12 2.5V5"></path>
          <path d="M12 19V21.5"></path>
          <path d="M4.2 4.2L6 6"></path>
          <path d="M18 18L19.8 19.8"></path>
          <path d="M2.5 12H5"></path>
          <path d="M19 12H21.5"></path>
          <path d="M4.2 19.8L6 18"></path>
          <path d="M18 6L19.8 4.2"></path>
        </svg>
      ) : (
        <svg {...svgProps}>
          <rect x="3" y="4" width="18" height="12" rx="2"></rect>
          <path d="M8 20H16"></path>
          <path d="M12 16V20"></path>
        </svg>
      )}
    </button>
  );
}
