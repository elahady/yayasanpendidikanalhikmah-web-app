import type { Actor } from "@/lib/authz";
import type { ProfilDto } from "@/lib/dashboard-types";

/**
 * Data profil akun pemanggil (identitas, role, ustadz tertaut, tanggal dibuat).
 * Dipakai `GET /me`, `POST /auth/login` (objek `user`), dan halaman web `/admin/profil`.
 *
 * STUB — dikerjakan agent backend.
 */
export async function muatProfil(actor: Actor): Promise<ProfilDto> {
  void actor;
  throw new Error("muatProfil belum diimplementasikan");
}
