import type { Actor } from "@/lib/authz";
import type { DashboardDto } from "@/lib/dashboard-types";

/**
 * Hitung data Beranda untuk pemanggil. `tanggal` = YYYY-MM-DD (Asia/Jakarta), bawaan hari ini.
 * Aturan lengkap: docs/api-contract.md, bagian `GET /dashboard`.
 *
 * STUB — kerangka tanda tangan agar sisi UI bisa dikompilasi; isinya dikerjakan agent backend.
 */
export async function muatDashboard(actor: Actor, tanggal?: string): Promise<DashboardDto> {
  void actor;
  void tanggal;
  throw new Error("muatDashboard belum diimplementasikan");
}
