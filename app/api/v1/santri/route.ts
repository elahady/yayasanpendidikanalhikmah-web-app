import { prisma } from "@/lib/prisma";
import { filterSantri, wajibLihatSantri } from "@/lib/authz";
import { bacaQuery, terautentikasi } from "@/lib/api/handler";
import { santriJson } from "@/lib/api/serialisasi";
import { daftarSantriQuerySchema } from "@/lib/api/validasi";

export const GET = terautentikasi(async (req, _ctx, actor) => {
  wajibLihatSantri(actor);
  const { q } = bacaQuery(req, daftarSantriQuerySchema);

  const santri = await prisma.santri.findMany({
    where: {
      // WALI murni: server memfilter hanya anaknya.
      AND: [filterSantri(actor), q ? { nama: { contains: q } } : {}],
    },
    orderBy: [{ jenjang: "asc" }, { kelas: "asc" }, { nama: "asc" }],
  });

  return Response.json({ items: santri.map(santriJson) });
});
