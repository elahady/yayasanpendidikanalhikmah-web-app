import type { Jenjang, JilidNahdliyah } from "@prisma/client";

/**
 * Label Bahasa Indonesia untuk enum Jenjang, dipakai di halaman admin
 * (absensi santri, progress) supaya tidak menampilkan nama enum mentah.
 */
export const JENJANG_LABEL: Record<Jenjang, string> = {
  ULA: "Ula",
  WUSTHO: "Wustho",
};

/**
 * Label Bahasa Indonesia untuk enum JilidNahdliyah (8 pilihan progress TPQ
 * An-Nahdhiyah), dipakai di halaman Progress Santri.
 */
export const JILID_LABEL: Record<JilidNahdliyah, string> = {
  PRA_NAHDLIYAH: "Pra Nahdhiyah",
  JILID_1: "Jilid 1",
  JILID_2: "Jilid 2",
  JILID_3: "Jilid 3",
  JILID_4: "Jilid 4",
  JILID_5: "Jilid 5",
  JILID_6: "Jilid 6",
  AL_QURAN: "Sudah Al-Qur'an",
};

/** Urutan tampil yang masuk akal (bukan urutan alfabetis enum). */
export const JILID_ORDER: JilidNahdliyah[] = [
  "PRA_NAHDLIYAH",
  "JILID_1",
  "JILID_2",
  "JILID_3",
  "JILID_4",
  "JILID_5",
  "JILID_6",
  "AL_QURAN",
];

/** Format tanggal jadi "Senin, 27 Oktober 2026" (zona waktu Asia/Jakarta). */
export function formatTanggalIndonesia(tanggal: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(tanggal);
}

/** Nilai untuk `<input type="date">` hari ini, berdasar zona waktu Asia/Jakarta
 * (bukan zona waktu server, supaya "hari ini" sesuai lokasi TPQ). */
export function todayDateInputValue(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
}

/** Validasi string tanggal dari query param, format "YYYY-MM-DD". */
export function isValidDateInputValue(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
