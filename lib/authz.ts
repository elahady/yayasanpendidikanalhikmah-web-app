import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Lapisan otorisasi terpusat — SATU-SATUNYA tempat aturan hak akses ditulis.
 * Dipakai oleh REST API (`app/api/v1/*`) maupun server action web admin.
 * Semua pengecekan dilakukan di server; klien (Android/web) hanya menerima
 * hasilnya (mis. flag `bisaDiubah`) untuk keperluan tampilan.
 *
 * Matriks role (lihat docs/api-contract.md):
 *  - ADMIN, TU : semua (hak sama; dipisah di kode supaya mudah dibedakan nanti)
 *  - PENGAWAS  : lihat semua, tidak menulis
 *  - PIKET     : lihat data santri + absensi ustadz, tulis absensi ustadz
 *  - USTADZ    : lihat semua santri, progress, absensi santri; tulis absensi santri & progress
 *  - WALI      : hanya santri anaknya, tidak menulis
 */

export const SEMUA_ROLE: Role[] = ["ADMIN", "TU", "PENGAWAS", "PIKET", "USTADZ", "WALI"];

/** Urutkan & buang duplikat role sesuai urutan baku (supaya output stabil). */
export function urutkanRole(roles: Iterable<Role>): Role[] {
  const set = new Set(roles);
  return SEMUA_ROLE.filter((r) => set.has(r));
}

/** Identitas pemanggil yang sudah terverifikasi (dimuat dari database tiap request). */
export type Actor = {
  id: string;
  username: string;
  nama: string;
  roles: Role[];
  ustadzId: string | null;
};

/** Pelanggaran aturan hak akses. `code` mengikuti kontrak API (HTTP 403). */
export class AuthzError extends Error {
  readonly status = 403;
  constructor(
    readonly code: "FORBIDDEN" | "SELF_ATTENDANCE_FORBIDDEN",
    message: string,
  ) {
    super(message);
    this.name = "AuthzError";
  }
}

const PESAN_FORBIDDEN = "Anda tidak memiliki izin untuk melakukan ini.";

// ---------------------------------------------------------------------------
// Cek role dasar
// ---------------------------------------------------------------------------

export function punyaRole(actor: Actor, ...roles: Role[]): boolean {
  return roles.some((r) => actor.roles.includes(r));
}

/** ADMIN/TU: akses penuh. */
export function adalahAdminAtauTU(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU");
}

/** Hanya ADMIN/TU yang boleh memakai web /admin. */
export function bisaMasukWebAdmin(actor: Actor): boolean {
  return adalahAdminAtauTU(actor);
}

// ---------------------------------------------------------------------------
// Matriks lihat / tulis
// ---------------------------------------------------------------------------

/** Boleh melihat SEMUA santri (WALI murni hanya melihat anaknya — lihat filterSantri). */
export function bisaLihatSemuaSantri(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "PENGAWAS", "PIKET", "USTADZ");
}

/** Boleh membuka data santri sama sekali (semua role; WALI terbatas anaknya). */
export function bisaLihatSantri(actor: Actor): boolean {
  return bisaLihatSemuaSantri(actor) || punyaRole(actor, "WALI");
}

/** Absensi santri: PIKET tidak termasuk; WALI hanya anaknya. */
export function bisaLihatAbsensiSantri(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "PENGAWAS", "USTADZ", "WALI");
}

/** Absensi santri dilihat tanpa batas anak (selain WALI murni). */
export function bisaLihatSemuaAbsensiSantri(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "PENGAWAS", "USTADZ");
}

export function bisaTulisAbsensiSantri(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "USTADZ");
}

export function bisaTulisProgress(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "USTADZ");
}

/** Daftar ustadz, absensi ustadz, dan rekap harian: semua role kecuali WALI murni. */
export function bisaLihatDataStaf(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "PENGAWAS", "PIKET", "USTADZ");
}

export function bisaTulisAbsensiUstadz(actor: Actor): boolean {
  return punyaRole(actor, "ADMIN", "TU", "PIKET");
}

// ---------------------------------------------------------------------------
// Aturan khusus
// ---------------------------------------------------------------------------

/**
 * Self-attendance: akun yang tertaut ke seorang ustadz tidak boleh membuat/mengubah
 * absensi atas nama ustadz itu sendiri. ADMIN/TU dikecualikan.
 */
export function melanggarSelfAttendance(actor: Actor, ustadzId: string): boolean {
  return !adalahAdminAtauTU(actor) && actor.ustadzId !== null && actor.ustadzId === ustadzId;
}

/**
 * Kepemilikan entri: ADMIN/TU boleh mengubah semua; role lain hanya entri yang
 * ia catat sendiri. Entri lama tanpa pencatat (`null`) hanya bisa diubah ADMIN/TU.
 */
export function bisaMengubahEntriOrang(actor: Actor, dicatatOlehId: string | null): boolean {
  return adalahAdminAtauTU(actor) || (dicatatOlehId !== null && dicatatOlehId === actor.id);
}

/** Flag `bisaDiubah` untuk satu entri absensi santri, dihitung untuk pemanggil. */
export function bisaMengubahAbsensiSantri(
  actor: Actor,
  entri: { dicatatOlehId: string | null },
): boolean {
  return bisaTulisAbsensiSantri(actor) && bisaMengubahEntriOrang(actor, entri.dicatatOlehId);
}

/** Flag `bisaDiubah` untuk satu entri absensi ustadz (termasuk aturan self-attendance). */
export function bisaMengubahAbsensiUstadz(
  actor: Actor,
  entri: { ustadzId: string; dicatatOlehId: string | null },
): boolean {
  return (
    bisaTulisAbsensiUstadz(actor) &&
    !melanggarSelfAttendance(actor, entri.ustadzId) &&
    bisaMengubahEntriOrang(actor, entri.dicatatOlehId)
  );
}

// ---------------------------------------------------------------------------
// Versi "wajib" — melempar AuthzError (dipetakan ke 403 oleh API)
// ---------------------------------------------------------------------------

function wajib(ok: boolean, pesan = PESAN_FORBIDDEN): void {
  if (!ok) throw new AuthzError("FORBIDDEN", pesan);
}

export const wajibLihatSantri = (a: Actor) => wajib(bisaLihatSantri(a));
export const wajibLihatAbsensiSantri = (a: Actor) => wajib(bisaLihatAbsensiSantri(a));
export const wajibTulisAbsensiSantri = (a: Actor) => wajib(bisaTulisAbsensiSantri(a));
export const wajibTulisProgress = (a: Actor) => wajib(bisaTulisProgress(a));
export const wajibLihatDataStaf = (a: Actor) => wajib(bisaLihatDataStaf(a));
export const wajibTulisAbsensiUstadz = (a: Actor) => wajib(bisaTulisAbsensiUstadz(a));

export function wajibTidakSelfAttendance(actor: Actor, ustadzId: string): void {
  if (melanggarSelfAttendance(actor, ustadzId)) {
    throw new AuthzError(
      "SELF_ATTENDANCE_FORBIDDEN",
      "Anda tidak boleh mencatat absensi atas nama diri sendiri.",
    );
  }
}

export function wajibBolehUbahEntri(actor: Actor, dicatatOlehId: string | null): void {
  wajib(
    bisaMengubahEntriOrang(actor, dicatatOlehId),
    "Entri ini dicatat oleh akun lain, Anda tidak boleh mengubahnya.",
  );
}

// ---------------------------------------------------------------------------
// Aturan "wali hanya anaknya" (butuh database)
// ---------------------------------------------------------------------------

/**
 * Filter Prisma untuk santri yang boleh dilihat pemanggil: semua (`{}`) untuk
 * role non-WALI, atau hanya anak yang tertaut untuk WALI murni.
 * Pemanggil sudah harus lolos `bisaLihatSantri`.
 */
export function filterSantri(actor: Actor): Prisma.SantriWhereInput {
  if (bisaLihatSemuaSantri(actor)) return {};
  return { wali: { some: { akunId: actor.id } } };
}

/** Pastikan pemanggil boleh melihat santri tertentu; selain itu AuthzError(FORBIDDEN). */
export async function wajibBolehLihatSantriId(actor: Actor, santriId: string): Promise<void> {
  wajibLihatSantri(actor);
  if (bisaLihatSemuaSantri(actor)) return;
  const tertaut = await prisma.waliSantri.findUnique({
    where: { akunId_santriId: { akunId: actor.id, santriId } },
    select: { akunId: true },
  });
  wajib(tertaut !== null);
}
