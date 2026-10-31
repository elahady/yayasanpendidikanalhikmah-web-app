/**
 * Jadwal TPQ: belajar Senin–Jumat, Sabtu–Minggu LIBUR (keputusan pemilik, 2026-10-31).
 * SATU-SATUNYA tempat aturan hari belajar ditulis; API, server action web, dan dashboard memakainya.
 * Android menyalin aturan yang sama di domain `Jadwal` (ubah dokumen kontrak dulu, lalu kedua sisi).
 *
 * Tanggal berupa string `YYYY-MM-DD` (kalender Asia/Jakarta); hari pekan dihitung dari tanggal
 * kalender itu sendiri (UTC tengah malam), jadi tidak bergantung zona waktu server.
 */

/** 0 = Minggu ... 6 = Sabtu (sesuai `Date#getUTCDay`). */
const HARI_LIBUR_PEKAN: readonly number[] = [0, 6];

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

export const PESAN_LIBUR = "TPQ libur pada hari Sabtu dan Minggu. Absensi tidak dapat dicatat.";

function hariPekan(tanggal: string): number {
  return new Date(`${tanggal}T00:00:00.000Z`).getUTCDay();
}

/** True bila `tanggal` (YYYY-MM-DD) adalah hari belajar (Senin–Jumat). */
export function hariBelajar(tanggal: string): boolean {
  return !HARI_LIBUR_PEKAN.includes(hariPekan(tanggal));
}

/** Nama hari Indonesia untuk `tanggal` (YYYY-MM-DD), mis. "Sabtu". */
export function namaHari(tanggal: string): string {
  return NAMA_HARI[hariPekan(tanggal)];
}

/**
 * Hari belajar terakhir pada atau sebelum `tanggal` (YYYY-MM-DD): `tanggal` itu sendiri bila
 * hari belajar, selain itu hari belajar sebelumnya (Sabtu/Minggu -> Jumat).
 */
export function hariBelajarTerakhir(tanggal: string): string {
  const d = new Date(`${tanggal}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return tanggal;
  while (!hariBelajar(d.toISOString().slice(0, 10))) {
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return d.toISOString().slice(0, 10);
}
