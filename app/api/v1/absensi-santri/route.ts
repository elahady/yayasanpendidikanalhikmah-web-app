import { prisma } from "@/lib/prisma";
import {
  bisaLihatSemuaAbsensiSantri,
  wajibBolehLihatSantriId,
  wajibBolehUbahEntri,
  wajibLihatAbsensiSantri,
  wajibTulisAbsensiSantri,
} from "@/lib/authz";
import { ApiError } from "@/lib/api/errors";
import { adalahBentrokUnik, bacaBody, bacaQuery, terautentikasi } from "@/lib/api/handler";
import { absensiSantriJson, sertakanPencatat } from "@/lib/api/serialisasi";
import {
  absensiSantriQuerySchema,
  keDate,
  putAbsensiSantriSchema,
} from "@/lib/api/validasi";

/** Batas jumlah entri per permintaan mode riwayat santri (cukup untuk >1 tahun). */
const BATAS_RIWAYAT = 400;

export const GET = terautentikasi(async (req, _ctx, actor) => {
  wajibLihatAbsensiSantri(actor);
  const q = bacaQuery(req, absensiSantriQuerySchema);

  if (q.tanggal) {
    // Mode tanggal: semua entri hari itu. WALI murni hanya entri anaknya.
    const entri = await prisma.absensiSantri.findMany({
      where: {
        tanggal: keDate(q.tanggal),
        ...(bisaLihatSemuaAbsensiSantri(actor)
          ? {}
          : { santri: { wali: { some: { akunId: actor.id } } } }),
      },
      include: sertakanPencatat,
      orderBy: [{ santri: { nama: "asc" } }],
    });
    return Response.json({ items: entri.map((a) => absensiSantriJson(a, actor)) });
  }

  // Mode santri: riwayat satu santri.
  const santriId = q.santriId!;
  await wajibBolehLihatSantriId(actor, santriId);
  const santri = await prisma.santri.findUnique({ where: { id: santriId }, select: { id: true } });
  if (!santri) throw new ApiError("NOT_FOUND", "Santri tidak ditemukan.");

  const entri = await prisma.absensiSantri.findMany({
    where: {
      santriId,
      ...((q.dari || q.sampai) && {
        tanggal: {
          ...(q.dari && { gte: keDate(q.dari) }),
          ...(q.sampai && { lte: keDate(q.sampai) }),
        },
      }),
    },
    include: sertakanPencatat,
    orderBy: { tanggal: "desc" },
    take: BATAS_RIWAYAT,
  });
  return Response.json({ items: entri.map((a) => absensiSantriJson(a, actor)) });
});

export const PUT = terautentikasi(async (req, _ctx, actor) => {
  wajibTulisAbsensiSantri(actor);
  const { santriId, tanggal: tanggalStr, hadir, keterangan } = await bacaBody(
    req,
    putAbsensiSantriSchema,
  );
  const tanggal = keDate(tanggalStr);

  const santri = await prisma.santri.findUnique({ where: { id: santriId }, select: { id: true } });
  if (!santri) throw new ApiError("NOT_FOUND", "Santri tidak ditemukan.");

  // Upsert manual supaya aturan kepemilikan entri dicek sebelum menimpa.
  // Dua percobaan: kalau create bentrok (dibuat orang lain di antara cek dan tulis),
  // baca ulang lalu cek kepemilikannya.
  for (let percobaan = 0; percobaan < 2; percobaan++) {
    const ada = await prisma.absensiSantri.findUnique({
      where: { santriId_tanggal: { santriId, tanggal } },
    });
    if (ada) {
      wajibBolehUbahEntri(actor, ada.dicatatOlehId);
      const entri = await prisma.absensiSantri.update({
        where: { id: ada.id },
        data: { hadir, keterangan, dicatatOlehId: actor.id },
        include: sertakanPencatat,
      });
      return Response.json(absensiSantriJson(entri, actor));
    }
    try {
      const entri = await prisma.absensiSantri.create({
        data: { santriId, tanggal, hadir, keterangan, dicatatOlehId: actor.id },
        include: sertakanPencatat,
      });
      return Response.json(absensiSantriJson(entri, actor));
    } catch (err) {
      if (!adalahBentrokUnik(err)) throw err;
    }
  }
  throw new ApiError("FORBIDDEN", "Absensi sedang diubah akun lain. Coba lagi.");
});
