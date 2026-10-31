import { keUserApi } from "@/lib/akun";
import { terautentikasi } from "@/lib/api/handler";

export const GET = terautentikasi(async (_req, _ctx, actor) => {
  return Response.json(keUserApi(actor));
});
