import { prisma } from "@/lib/prisma";
import { wajibLihatDataStaf } from "@/lib/authz";
import { terautentikasi } from "@/lib/api/handler";
import { ustadzJson } from "@/lib/api/serialisasi";

export const GET = terautentikasi(async (_req, _ctx, actor) => {
  wajibLihatDataStaf(actor);
  const ustadz = await prisma.ustadz.findMany({ orderBy: { nama: "asc" } });
  return Response.json({ items: ustadz.map(ustadzJson) });
});
