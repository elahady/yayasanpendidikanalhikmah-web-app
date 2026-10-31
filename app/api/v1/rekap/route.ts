import { prisma } from "@/lib/prisma";
import { wajibLihatDataStaf } from "@/lib/authz";
import { bacaQuery, terautentikasi } from "@/lib/api/handler";
import { keDate, rekapQuerySchema } from "@/lib/api/validasi";

/** Rekap harian untuk pantauan pengawas: hadir / total / belum dicatat, santri & ustadz. */
export const GET = terautentikasi(async (req, _ctx, actor) => {
  wajibLihatDataStaf(actor);
  const { tanggal } = bacaQuery(req, rekapQuerySchema);
  const hari = keDate(tanggal);

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
    santri: {
      hadir: santriHadir,
      total: totalSantri,
      belumDicatat: Math.max(totalSantri - santriTercatat, 0),
    },
    ustadz: {
      hadir: ustadzHadir,
      total: totalUstadz,
      belumDicatat: Math.max(totalUstadz - ustadzTercatat, 0),
    },
  });
});
