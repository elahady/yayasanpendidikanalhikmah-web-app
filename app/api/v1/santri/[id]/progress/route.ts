import type { JilidNahdliyah } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { wajibTulisProgress } from "@/lib/authz";
import { ApiError } from "@/lib/api/errors";
import { bacaBody, terautentikasi } from "@/lib/api/handler";
import { santriJson } from "@/lib/api/serialisasi";
import { patchProgressSchema } from "@/lib/api/validasi";

export const PATCH = terautentikasi<{ id: string }>(async (req, ctx, actor) => {
  wajibTulisProgress(actor);
  const { id } = await ctx.params;
  const body = await bacaBody(req, patchProgressSchema);

  const ada = await prisma.santri.findUnique({ where: { id }, select: { id: true } });
  if (!ada) throw new ApiError("NOT_FOUND", "Santri tidak ditemukan.");

  const santri = await prisma.santri.update({
    where: { id },
    data: {
      ...(body.jilidSaatIni !== undefined && {
        jilidSaatIni: body.jilidSaatIni as JilidNahdliyah,
      }),
      ...(body.catatanProgressMadin !== undefined && {
        catatanProgressMadin: body.catatanProgressMadin,
      }),
    },
  });

  return Response.json(santriJson(santri));
});
