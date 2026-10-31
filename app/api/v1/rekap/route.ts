import { prisma } from "@/lib/prisma";
import { wajibLihatDataStaf } from "@/lib/authz";
import { bacaQuery, terautentikasi } from "@/lib/api/handler";
import { keDate, rekapQuerySchema } from "@/lib/api/validasi";
import { hariBelajar } from "@/lib/jadwal";

/** Rekap harian untuk pantauan pengawas: hadir / total / belum dicatat, santri & ustadz. */
export const GET = terautentikasi(async (req, _ctx, actor) => {
  wajibLihatDataStaf(actor);
  const { tanggal } = bacaQuery(req, rekapQuerySchema);
  const hari = keDate(tanggal);
  const belajar = hariBelajar(tanggal);

  const [totalSantri, santriHadir, santriTercatat, totalUstadz, ustadzHadir, ustadzTercatat] =
    await Promise.all([
      prisma.santri.count(),
      prisma.absensiSantri.count({ where: { tanggal: hari, hadir: true } }),
      prisma.absensiSantri.count({ where: { tanggal: hari } }),
      prisma.ustadz.count(),
      prisma.absensiUstadz.count({ where: { tanggal: hari, hadir: true } }),
      prisma.absensiUstadz.count({ where: { tanggal: hari } }),
    ]);

  return Response.json({
    tanggal,
    hariBelajar: belajar,
    santri: {
      hadir: santriHadir,
      total: totalSantri,
      // Hari libur tidak dihitung "belum dicatat".
      belumDicatat: belajar ? Math.max(totalSantri - santriTercatat, 0) : 0,
    },
    ustadz: {
      hadir: ustadzHadir,
      total: totalUstadz,
      belumDicatat: belajar ? Math.max(totalUstadz - ustadzTercatat, 0) : 0,
    },
  });
});
