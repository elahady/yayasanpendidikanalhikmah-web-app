import { prisma } from "@/lib/prisma";
import { wajibBolehLihatSantriId } from "@/lib/authz";
import { ApiError } from "@/lib/api/errors";
import { terautentikasi } from "@/lib/api/handler";
import { santriJson } from "@/lib/api/serialisasi";

export const GET = terautentikasi<{ id: string }>(async (_req, ctx, actor) => {
  const { id } = await ctx.params;
  // Cek izin DULU (WALI selain wali santri ini -> FORBIDDEN, tanpa membocorkan ada/tidaknya id).
  await wajibBolehLihatSantriId(actor, id);

  const santri = await prisma.santri.findUnique({ where: { id } });
  if (!santri) throw new ApiError("NOT_FOUND", "Santri tidak ditemukan.");

  return Response.json(santriJson(santri));
});
