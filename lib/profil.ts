import type { Actor } from "@/lib/authz";
import type { ProfilDto } from "@/lib/dashboard-types";
import { prisma } from "@/lib/prisma";

/**
 * Data profil akun pemanggil (identitas, role, ustadz tertaut, tanggal dibuat).
 * Dipakai `GET /me`, `POST /auth/login` (objek `user`), dan halaman web `/admin/profil`.
 * Identitas & role diambil dari `actor` (sudah dimuat dari DB); sisanya dibaca di sini.
 */
export async function muatProfil(actor: Actor): Promise<ProfilDto> {
  const akun = await prisma.akun.findUnique({
    where: { id: actor.id },
    select: { createdAt: true, ustadz: { select: { nama: true } } },
  });
  if (!akun) throw new Error("Akun tidak ditemukan.");
  return {
    id: actor.id,
    username: actor.username,
    nama: actor.nama,
    roles: actor.roles,
    ustadzId: actor.ustadzId,
    ustadzNama: akun.ustadz?.nama ?? null,
    dibuatPada: akun.createdAt.toISOString(),
  };
}
