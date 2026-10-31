import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { muatActor } from "@/lib/akun";
import { bisaMasukWebAdmin, type Actor } from "@/lib/authz";

/**
 * Identitas pemanggil web /admin, dibaca ulang dari database (bukan dipercaya dari
 * isi cookie): null kalau belum login, akun nonaktif/dihapus, atau bukan ADMIN/TU.
 */
export async function getWebActor(): Promise<Actor | null> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  const actor = await muatActor(id);
  if (!actor || !bisaMasukWebAdmin(actor)) return null;
  return actor;
}

/**
 * Pagar untuk halaman admin (server component). Layout Next.js tidak dirender
 * ulang saat navigasi antarhalaman, jadi SETIAP halaman /admin harus memanggil ini.
 */
export async function wajibAdminHalaman(): Promise<Actor> {
  const actor = await getWebActor();
  if (!actor) redirect("/admin/login");
  return actor;
}

/** Pagar untuk server action: lempar error (bukan redirect) kalau tidak berhak. */
export async function wajibAdminAction(): Promise<Actor> {
  const actor = await getWebActor();
  if (!actor) throw new Error("Tidak diizinkan. Silakan login ulang.");
  return actor;
}
