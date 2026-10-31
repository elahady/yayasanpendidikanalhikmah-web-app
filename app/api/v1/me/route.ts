import { terautentikasi } from "@/lib/api/handler";
import { muatProfil } from "@/lib/profil";

export const GET = terautentikasi(async (_req, _ctx, actor) => {
  return Response.json(await muatProfil(actor));
});
