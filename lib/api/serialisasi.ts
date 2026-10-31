import type { AbsensiSantri, AbsensiUstadz, Santri, Ustadz } from "@prisma/client";
import {
  bisaMengubahAbsensiSantri,
  bisaMengubahAbsensiUstadz,
  type Actor,
} from "@/lib/authz";
import { keTanggalStr } from "@/lib/api/validasi";

/** Bentuk JSON respons API v1 (docs/api-contract.md). */

export function santriJson(s: Santri) {
  return {
    id: s.id,
    nama: s.nama,
    jenjang: s.jenjang,
    kelas: s.kelas,
    jilidSaatIni: s.jilidSaatIni,
    catatanProgressMadin: s.catatanProgressMadin,
  };
}

export function ustadzJson(u: Ustadz) {
  return { id: u.id, nama: u.nama, mapelDiajar: u.mapelDiajar };
}

type DenganPencatat = { dicatatOleh: { nama: string } | null };

export function absensiSantriJson(a: AbsensiSantri & DenganPencatat, actor: Actor) {
  return {
    id: a.id,
    santriId: a.santriId,
    tanggal: keTanggalStr(a.tanggal),
    hadir: a.hadir,
    keterangan: a.keterangan,
    dicatatOleh: a.dicatatOleh?.nama ?? null,
    bisaDiubah: bisaMengubahAbsensiSantri(actor, a),
  };
}

export function absensiUstadzJson(a: AbsensiUstadz & DenganPencatat, actor: Actor) {
  return {
    id: a.id,
    ustadzId: a.ustadzId,
    tanggal: keTanggalStr(a.tanggal),
    hadir: a.hadir,
    keterangan: a.keterangan,
    dicatatOleh: a.dicatatOleh?.nama ?? null,
    bisaDiubah: bisaMengubahAbsensiUstadz(actor, a),
  };
}

/** Sertakan nama pencatat saat query absensi. */
export const sertakanPencatat = { dicatatOleh: { select: { nama: true } } } as const;
