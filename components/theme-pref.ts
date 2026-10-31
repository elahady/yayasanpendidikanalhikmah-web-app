import { useSyncExternalStore } from "react";

/**
 * Preferensi tema: "system" (ikuti perangkat), "light", atau "dark".
 *
 * Dua atribut di <html>, keduanya diisi script inline di app/layout.tsx sebelum paint:
 *  - `data-theme-pref`: pilihan pengguna (system | light | dark)
 *  - `data-theme`: hasil akhir yang SELALU eksplisit (light | dark) — satu-satunya
 *    yang dibaca CSS. Untuk "system", script (dan setThemePref) menerjemahkannya
 *    dari prefers-color-scheme, dan script juga mendengarkan perubahan mode sistem.
 *
 * Dipakai hanya dari komponen client (theme-toggle, theme-picker).
 */

export type ThemePref = "system" | "light" | "dark";

export const THEME_OPSI: { id: ThemePref; label: string }[] = [
  { id: "system", label: "Ikuti sistem" },
  { id: "light", label: "Terang" },
  { id: "dark", label: "Gelap" },
];

export const THEME_LABEL: Record<ThemePref, string> = {
  system: "Ikuti sistem",
  light: "Terang",
  dark: "Gelap",
};

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-pref"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): ThemePref {
  const nilai = document.documentElement.getAttribute("data-theme-pref");
  return nilai === "light" || nilai === "dark" ? nilai : "system";
}

function getServerSnapshot(): ThemePref {
  return "system";
}

/** Pilihan tema saat ini; ikut berubah di semua komponen yang memakainya. */
export function useThemePref(): ThemePref {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Terapkan + simpan pilihan tema. Jaga `data-theme` tetap eksplisit. */
export function setThemePref(pref: ThemePref) {
  const root = document.documentElement;
  const resolved =
    pref === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : pref;
  root.setAttribute("data-theme-pref", pref);
  root.setAttribute("data-theme", resolved);
  try {
    localStorage.setItem("theme", pref);
  } catch {
    // Beberapa browser mobile (mode privat, in-app browser WA/IG) menolak
    // akses localStorage — tema tetap ganti di layar, cuma tidak diingat.
  }
}

/** Pilihan berikutnya untuk tombol cepat: sistem -> terang -> gelap -> sistem. */
export function temaBerikutnya(pref: ThemePref): ThemePref {
  return pref === "system" ? "light" : pref === "light" ? "dark" : "system";
}
