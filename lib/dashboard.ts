import { JILID_ORDER, todayDateInputValue } from "@/lib/labels";
import {
  bisaLihatDataStaf,
  bisaLihatSemuaAbsensiSantri,
  punyaRole,
  type Actor,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { keDate, keTanggalStr, tanggalSchema } from "@/lib/api/validasi";
import { santriJson } from "@/lib/api/serialisasi";
import type {
  Aktivitas,
  DashboardAnak,
  DashboardDto,
  DashboardRingkasan,
  DashboardSantri,
  JenjangKode,
  JilidKode,
  KehadiranHitung,
  Perhatian,
  StatusHari,
  TrenHari,
} from "@/lib/dashboard-types";

/**
 * Hitung data Beranda untuk pemanggil. `tanggal` = YYYY-MM-DD (Asia/Jakarta), bawaan hari ini.
 * Aturan lengkap: docs/api-contract.md, bagian `GET /dashboard`.
 *
 * Semua hak lihat mengikuti lib/authz.ts. Hanya agregasi Prisma (count/groupBy/findMany
 * ber-select) dalam jumlah query tetap, tanpa N+1.
 */

const MS_HARI = 24 * 60 * 60 * 1000;
const MS_JAM = 60 * 60 * 1000;
const MAKS_HARI_TREN = 14;
const HARI_BERUNTUN = 3;
const HARI_PROGRESS_LAMA = 60;
const HARI_AKTIVITAS = 7;
const MAKS_AKTIVITAS = 6;
const HARI_KALENDER_ANAK = 30;
const MAKS_NAMA = 3;
const OFFSET_JAKARTA_MS = 7 * MS_JAM;

const JENJANG: JenjangKode[] = ["ULA", "WUSTHO"];

function geserHari(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_HARI);
}

/** "Aisyah, Fadhil, Rafi dan 3 lainnya" (maks 3 nama). */
function ringkasNama(nama: string[], jumlah: number): string {
  const tampil = nama.slice(0, MAKS_NAMA);
  const sisa = jumlah - tampil.length;
  if (sisa > 0) return `${tampil.join(", ")} dan ${sisa} lainnya`;
  if (tampil.length <= 1) return tampil.join("");
  return `${tampil.slice(0, -1).join(", ")} dan ${tampil[tampil.length - 1]}`;
}

function hitungKehadiran(
  total: number,
  baris: { hadir: boolean; _count: { _all: number } }[],
): KehadiranHitung {
  const hadir = baris.find((b) => b.hadir)?._count._all ?? 0;
  const tidakHadir = baris.find((b) => !b.hadir)?._count._all ?? 0;
  return { total, hadir, tidakHadir, belumDicatat: Math.max(total - hadir - tidakHadir, 0) };
}

export async function muatDashboard(actor: Actor, tanggal?: string): Promise<DashboardDto> {
  // Tanggal tak valid dari pemanggil non-API jatuh ke hari ini (route API sudah menolaknya 422).
  const tgl = tanggal && tanggalSchema.safeParse(tanggal).success ? tanggal : todayDateInputValue();

  const [ringkasan, anak] = await Promise.all([
    bisaLihatDataStaf(actor) ? muatRingkasan(actor, tgl) : Promise.resolve(null),
    punyaRole(actor, "WALI") ? muatAnak(actor, tgl) : Promise.resolve(null),
  ]);

  return { tanggal: tgl, ringkasan, anak };
}

// ---------------------------------------------------------------------------
// Ringkasan (role non-WALI)
// ---------------------------------------------------------------------------

async function muatRingkasan(actor: Actor, tgl: string): Promise<DashboardRingkasan> {
  const hari = keDate(tgl);
  // Nama santri & aktivitas absensi santri: hanya yang boleh melihat SEMUA absensi santri
  // (PIKET murni tidak; WALI+PIKET juga tidak, supaya nama santri lain tak bocor ke wali).
  const bolehNamaSantri = bisaLihatSemuaAbsensiSantri(actor);
  const batasProgress = new Date(hari.getTime() - OFFSET_JAKARTA_MS - HARI_PROGRESS_LAMA * MS_HARI);

  const [
    perJenjangRaw,
    perJilidRaw,
    absSantriHariIni,
    totalUstadz,
    absUstadzHariIni,
    hariBelajarDesc,
    belumSantriJumlah,
    belumSantriNama,
    belumUstadzJumlah,
    belumUstadzNama,
    progressLamaJumlah,
    progressLamaNama,
    aktSantri,
    aktUstadz,
  ] = await Promise.all([
    prisma.santri.groupBy({ by: ["jenjang"], _count: { _all: true } }),
    prisma.santri.groupBy({ by: ["jilidSaatIni"], _count: { _all: true } }),
    prisma.absensiSantri.groupBy({ by: ["hadir"], where: { tanggal: hari }, _count: { _all: true } }),
    prisma.ustadz.count(),
    prisma.absensiUstadz.groupBy({ by: ["hadir"], where: { tanggal: hari }, _count: { _all: true } }),
    prisma.absensiSantri.groupBy({
      by: ["tanggal"],
      where: { tanggal: { lte: hari } },
      orderBy: { tanggal: "desc" },
      take: MAKS_HARI_TREN,
    }),
    bolehNamaSantri
      ? prisma.santri.count({ where: { absensi: { none: { tanggal: hari } } } })
      : Promise.resolve(0),
    bolehNamaSantri
      ? prisma.santri.findMany({
          where: { absensi: { none: { tanggal: hari } } },
          orderBy: { nama: "asc" },
          take: MAKS_NAMA,
          select: { nama: true },
        })
      : Promise.resolve([]),
    prisma.ustadz.count({ where: { absensi: { none: { tanggal: hari } } } }),
    prisma.ustadz.findMany({
      where: { absensi: { none: { tanggal: hari } } },
      orderBy: { nama: "asc" },
      take: MAKS_NAMA,
      select: { nama: true },
    }),
    prisma.santri.count({
      where: { jilidSaatIni: { not: "AL_QURAN" }, updatedAt: { lt: batasProgress } },
    }),
    bolehNamaSantri
      ? prisma.santri.findMany({
          where: { jilidSaatIni: { not: "AL_QURAN" }, updatedAt: { lt: batasProgress } },
          orderBy: { nama: "asc" },
          take: MAKS_NAMA,
          select: { nama: true },
        })
      : Promise.resolve([]),
    bolehNamaSantri ? kelompokAktivitas("santri", hari) : Promise.resolve([]),
    kelompokAktivitas("ustadz", hari),
  ]);

  // --- Angka agregat -------------------------------------------------------
  const perJenjang = Object.fromEntries(JENJANG.map((j) => [j, 0])) as Record<JenjangKode, number>;
  for (const b of perJenjangRaw) perJenjang[b.jenjang] = b._count._all;
  const perJilid = Object.fromEntries(JILID_ORDER.map((j) => [j, 0])) as Record<JilidKode, number>;
  for (const b of perJilidRaw) perJilid[b.jilidSaatIni] = b._count._all;
  const totalSantri = JENJANG.reduce((jml, j) => jml + perJenjang[j], 0);

  const santri: DashboardSantri = {
    ...hitungKehadiran(totalSantri, absSantriHariIni),
    perJenjang,
    perJilid,
  };
  const ustadz = hitungKehadiran(totalUstadz, absUstadzHariIni);

  // --- Tren + santri absen beruntun (butuh daftar hari belajar) ------------
  const hariBelajar = hariBelajarDesc.map((h) => h.tanggal).reverse(); // naik
  const hariBeruntun = hariBelajar.slice(-HARI_BERUNTUN);
  const perluBeruntun = bolehNamaSantri && hariBeruntun.length === HARI_BERUNTUN;

  const [trenRaw, beruntunRaw, pencatat] = await Promise.all([
    hariBelajar.length > 0
      ? prisma.absensiSantri.groupBy({
          by: ["tanggal", "hadir"],
          where: { tanggal: { in: hariBelajar } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    perluBeruntun
      ? prisma.absensiSantri.groupBy({
          by: ["santriId"],
          where: { tanggal: { in: hariBeruntun }, hadir: false },
          _count: { _all: true },
          having: { santriId: { _count: { equals: HARI_BERUNTUN } } },
        })
      : Promise.resolve([]),
    muatNamaPencatat([...aktSantri, ...aktUstadz].map((k) => k.dicatatOlehId)),
  ]);

  const beruntunNama = beruntunRaw.length
    ? await prisma.santri.findMany({
        where: { id: { in: beruntunRaw.map((b) => b.santriId) } },
        orderBy: { nama: "asc" },
        select: { nama: true },
      })
    : [];

  const tren: TrenHari[] = hariBelajar.map((d) => {
    const baris = trenRaw.filter((r) => r.tanggal.getTime() === d.getTime());
    const hadir = baris.find((r) => r.hadir)?._count._all ?? 0;
    const tidakHadir = baris.find((r) => !r.hadir)?._count._all ?? 0;
    return { tanggal: keTanggalStr(d), hadir, tercatat: hadir + tidakHadir };
  });

  // --- Perlu perhatian (urutan baku) ---------------------------------------
  const perhatian: Perhatian[] = [];
  if (belumSantriJumlah > 0) {
    perhatian.push({
      kode: "SANTRI_BELUM_DICATAT",
      jumlah: belumSantriJumlah,
      judul: `${belumSantriJumlah} santri belum dicatat absensinya`,
      keterangan: ringkasNama(belumSantriNama.map((s) => s.nama), belumSantriJumlah),
      aksi: "ABSENSI_SANTRI",
    });
  }
  if (beruntunNama.length > 0) {
    perhatian.push({
      kode: "SANTRI_ABSEN_BERUNTUN",
      jumlah: beruntunNama.length,
      judul: `${beruntunNama.length} santri tidak hadir ${HARI_BERUNTUN} hari belajar berturut-turut`,
      keterangan: ringkasNama(beruntunNama.map((s) => s.nama), beruntunNama.length),
      aksi: "ABSENSI_SANTRI",
    });
  }
  if (belumUstadzJumlah > 0) {
    perhatian.push({
      kode: "USTADZ_BELUM_DICATAT",
      jumlah: belumUstadzJumlah,
      judul: `${belumUstadzJumlah} ustadz belum dicatat absensinya`,
      keterangan: ringkasNama(belumUstadzNama.map((u) => u.nama), belumUstadzJumlah),
      aksi: "ABSENSI_USTADZ",
    });
  }
  if (progressLamaJumlah > 0) {
    perhatian.push({
      kode: "PROGRESS_LAMA",
      jumlah: progressLamaJumlah,
      judul: `${progressLamaJumlah} santri belum diperbarui progressnya lebih dari ${HARI_PROGRESS_LAMA} hari`,
      keterangan: bolehNamaSantri
        ? ringkasNama(progressLamaNama.map((s) => s.nama), progressLamaJumlah)
        : "Buka daftar santri untuk melihat siapa saja.",
      aksi: "DAFTAR_SANTRI",
    });
  }

  // --- Aktivitas terbaru ---------------------------------------------------
  const aktivitas: Aktivitas[] = [
    ...aktSantri.map((k) => ({ ...k, jenis: "ABSENSI_SANTRI" as const })),
    ...aktUstadz.map((k) => ({ ...k, jenis: "ABSENSI_USTADZ" as const })),
  ]
    .sort((a, b) => b.waktu.getTime() - a.waktu.getTime())
    .slice(0, MAKS_AKTIVITAS)
    .map((k) => {
      const oleh = pencatat.get(k.dicatatOlehId) ?? "Pengurus";
      const objek = k.jenis === "ABSENSI_SANTRI" ? "santri" : "ustadz";
      return {
        waktu: k.waktu.toISOString(),
        oleh,
        jenis: k.jenis,
        ringkas: `${oleh} mencatat absensi ${objek} (${k.jumlah} ${objek})`,
      };
    });

  return { santri, ustadz, tren, perhatian, aktivitas };
}

type KelompokAktivitas = { dicatatOlehId: string; waktu: Date; jumlah: number };

/** Entri absensi 7 hari terakhir yang punya pencatat, dikelompokkan per (pencatat, tanggal). */
async function kelompokAktivitas(
  jenis: "santri" | "ustadz",
  hari: Date,
): Promise<KelompokAktivitas[]> {
  const where = {
    dicatatOlehId: { not: null },
    tanggal: { gte: geserHari(hari, -(HARI_AKTIVITAS - 1)), lte: hari },
  };
  const opsi = {
    by: ["dicatatOlehId", "tanggal"] as ["dicatatOlehId", "tanggal"],
    where,
    _count: { _all: true as const },
    _max: { createdAt: true as const },
    orderBy: { _max: { createdAt: "desc" as const } },
    take: MAKS_AKTIVITAS,
  };
  const baris =
    jenis === "santri"
      ? await prisma.absensiSantri.groupBy(opsi)
      : await prisma.absensiUstadz.groupBy(opsi);
  const hasil: KelompokAktivitas[] = [];
  for (const b of baris) {
    if (b.dicatatOlehId === null || b._max.createdAt === null) continue;
    hasil.push({ dicatatOlehId: b.dicatatOlehId, waktu: b._max.createdAt, jumlah: b._count._all });
  }
  return hasil;
}

async function muatNamaPencatat(ids: string[]): Promise<Map<string, string>> {
  const unik = [...new Set(ids)];
  if (unik.length === 0) return new Map();
  const akun = await prisma.akun.findMany({
    where: { id: { in: unik } },
    select: { id: true, nama: true },
  });
  return new Map(akun.map((a) => [a.id, a.nama]));
}

// ---------------------------------------------------------------------------
// Anak (role WALI)
// ---------------------------------------------------------------------------

async function muatAnak(actor: Actor, tgl: string): Promise<DashboardAnak[]> {
  const hari = keDate(tgl);
  const mulai = geserHari(hari, -(HARI_KALENDER_ANAK - 1));

  const [anak, hariBelajarRaw] = await Promise.all([
    prisma.santri.findMany({
      where: { wali: { some: { akunId: actor.id } } },
      orderBy: { nama: "asc" },
    }),
    prisma.absensiSantri.groupBy({
      by: ["tanggal"],
      where: { tanggal: { gte: mulai, lte: hari } },
      orderBy: { tanggal: "asc" },
    }),
  ]);
  if (anak.length === 0) return [];

  // Hari belajar = ada >=1 entri absensi santri di mana pun; `tanggal` sendiri selalu ikut.
  const hariBelajar = new Set(hariBelajarRaw.map((h) => keTanggalStr(h.tanggal)));
  hariBelajar.add(tgl);
  const daftarHari = [...hariBelajar].sort();

  const entri = await prisma.absensiSantri.findMany({
    where: { santriId: { in: anak.map((a) => a.id) }, tanggal: { gte: mulai, lte: hari } },
    select: { santriId: true, tanggal: true, hadir: true },
  });
  const status = new Map<string, boolean>();
  for (const e of entri) status.set(`${e.santriId}|${keTanggalStr(e.tanggal)}`, e.hadir);

  return anak.map((s) => {
    const hariAnak = daftarHari.map((tanggalHari) => {
      const hadir = status.get(`${s.id}|${tanggalHari}`);
      const st: StatusHari =
        hadir === undefined ? "BELUM_DICATAT" : hadir ? "HADIR" : "TIDAK_HADIR";
      return { tanggal: tanggalHari, status: st };
    });
    const hitung = (st: StatusHari) => hariAnak.filter((h) => h.status === st).length;
    return {
      santri: santriJson(s),
      diperbaruiPada: s.updatedAt.toISOString(),
      kehadiran: {
        hadir: hitung("HADIR"),
        tidakHadir: hitung("TIDAK_HADIR"),
        belumDicatat: hitung("BELUM_DICATAT"),
        hari: hariAnak,
      },
    };
  });
}
