import { prisma } from "@/lib/prisma";
import { urutkanRole, type Actor } from "@/lib/authz";

/**
 * Muat identitas pemanggil dari database (sumber kebenaran): role & status aktif
 * dibaca ulang di setiap request, jadi akun yang dinonaktifkan atau diubah rolenya
 * langsung berlaku tanpa menunggu token/sesi kedaluwarsa.
 * Mengembalikan null kalau akun tidak ada atau nonaktif.
 */
export async function muatActor(akunId: string): Promise<Actor | null> {
  const akun = await prisma.akun.findUnique({
    where: { id: akunId },
    select: {
      id: true,
      username: true,
      nama: true,
      aktif: true,
      ustadzId: true,
      roles: { select: { role: true } },
    },
  });
  if (!akun || !akun.aktif) return null;
  return {
    id: akun.id,
    username: akun.username,
    nama: akun.nama,
    roles: urutkanRole(akun.roles.map((r) => r.role)),
    ustadzId: akun.ustadzId,
  };
}

/** Bentuk `user` di respons API (login & /me), sesuai docs/api-contract.md. */
export function keUserApi(actor: Actor) {
  return { id: actor.id, nama: actor.nama, roles: actor.roles, ustadzId: actor.ustadzId };
}
