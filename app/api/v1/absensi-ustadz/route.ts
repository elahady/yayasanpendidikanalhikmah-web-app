import { prisma } from "@/lib/prisma";
import {
  wajibBolehUbahEntri,
  wajibLihatDataStaf,
  wajibTidakSelfAttendance,
  wajibTulisAbsensiUstadz,
} from "@/lib/authz";
import { ApiError } from "@/lib/api/errors";
import { adalahBentrokUnik, bacaBody, bacaQuery, terautentikasi } from "@/lib/api/handler";
import { absensiUstadzJson, sertakanPencatat } from "@/lib/api/serialisasi";
import { absensiUstadzQuerySchema, keDate, putAbsensiUstadzSchema } from "@/lib/api/validasi";

export const GET = terautentikasi(async (req, _ctx, actor) => {
  wajibLihatDataStaf(actor);
  const { tanggal } = bacaQuery(req, absensiUstadzQuerySchema);

  const entri = await prisma.absensiUstadz.findMany({
    where: { tanggal: keDate(tanggal) },
    include: sertakanPencatat,
    orderBy: { ustadz: { nama: "asc" } },
  });
  return Response.json({ items: entri.map((a) => absensiUstadzJson(a, actor)) });
});

export const PUT = terautentikasi(async (req, _ctx, actor) => {
  wajibTulisAbsensiUstadz(actor);
  const { ustadzId, tanggal: tanggalStr, hadir, keterangan } = await bacaBody(
    req,
    putAbsensiUstadzSchema,
  );
  const tanggal = keDate(tanggalStr);

  // Self-attendance dicek sebelum apa pun: akun yang tertaut ke ustadz X tidak
  // boleh mengabsen X (ADMIN/TU dikecualikan).
  wajibTidakSelfAttendance(actor, ustadzId);

  const ustadz = await prisma.ustadz.findUnique({ where: { id: ustadzId }, select: { id: true } });
  if (!ustadz) throw new ApiError("NOT_FOUND", "Ustadz tidak ditemukan.");

  for (let percobaan = 0; percobaan < 2; percobaan++) {
    const ada = await prisma.absensiUstadz.findUnique({
      where: { ustadzId_tanggal: { ustadzId, tanggal } },
    });
    if (ada) {
      wajibBolehUbahEntri(actor, ada.dicatatOlehId);
      const entri = await prisma.absensiUstadz.update({
        where: { id: ada.id },
        data: { hadir, keterangan, dicatatOlehId: actor.id },
        include: sertakanPencatat,
      });
      return Response.json(absensiUstadzJson(entri, actor));
    }
    try {
      const entri = await prisma.absensiUstadz.create({
        data: { ustadzId, tanggal, hadir, keterangan, dicatatOlehId: actor.id },
        include: sertakanPencatat,
      });
      return Response.json(absensiUstadzJson(entri, actor));
    } catch (err) {
      if (!adalahBentrokUnik(err)) throw err;
    }
  }
  throw new ApiError("FORBIDDEN", "Absensi sedang diubah akun lain. Coba lagi.");
});
