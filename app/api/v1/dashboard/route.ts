import { muatDashboard } from "@/lib/dashboard";
import { bacaQuery, terautentikasi } from "@/lib/api/handler";
import { dashboardQuerySchema } from "@/lib/api/validasi";

/** Bahan layar Beranda. Terbuka untuk semua role; isinya disaring per role di `muatDashboard`. */
export const GET = terautentikasi(async (req, _ctx, actor) => {
  const { tanggal } = bacaQuery(req, dashboardQuerySchema);
  return Response.json(await muatDashboard(actor, tanggal));
});
