import type { Role } from "@prisma/client";

/**
 * Ringkasan "Yang boleh Anda lakukan" per role, untuk halaman Profil.
 * Cermin ringkas matriks di lib/authz.ts / docs/api-contract.md; kalau aturan
 * di sana berubah, sesuaikan di sini (tampilan saja — penegakan tetap di authz).
 */
const ADMIN_TU = [
  "Mengelola data santri dan ustadz",
  "Mengubah absensi dan progress siapa pun",
  "Membuat, menonaktifkan akun, dan mengatur peran",
];

export const HAK_AKSES: Record<Role, string[]> = {
  ADMIN: ADMIN_TU,
  TU: ADMIN_TU,
  PENGAWAS: [
    "Melihat semua data santri, ustadz, absensi, dan progress",
    "Memantau rekap kehadiran harian",
    "Tidak dapat mengubah data",
  ],
  PIKET: [
    "Mencatat absensi ustadz",
    "Melihat data santri dan ustadz",
  ],
  USTADZ: [
    "Mencatat absensi santri dan memperbarui progress",
    "Melihat semua santri",
    "Tidak dapat mengubah absensi diri sendiri",
  ],
  WALI: ["Melihat data dan progress santri anak Anda"],
};

const ROLE_VALID = new Set<string>(Object.keys(HAK_AKSES));

/** Gabungan hak semua role akun, tanpa duplikat (ADMIN dan TU berbagi daftar yang sama). */
export function hakAksesUntuk(roles: string[]): string[] {
  const hasil: string[] = [];
  for (const role of roles) {
    if (!ROLE_VALID.has(role)) continue;
    for (const hak of HAK_AKSES[role as Role]) {
      if (!hasil.includes(hak)) hasil.push(hak);
    }
  }
  return hasil;
}
