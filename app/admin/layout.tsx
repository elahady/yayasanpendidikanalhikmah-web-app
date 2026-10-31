import { getWebActor } from "@/lib/web-auth";
import { AdminFrame } from "@/components/admin-frame";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hanya dipakai untuk menampilkan chrome (nav). Pagar akses sebenarnya ada di
  // tiap halaman & server action (lib/web-auth.ts), karena layout tidak dirender
  // ulang saat navigasi antarhalaman.
  const actor = await getWebActor();

  if (!actor) {
    return <div className="flex flex-1 items-center justify-center bg-bg p-6">{children}</div>;
  }

  return <AdminFrame nama={actor.nama}>{children}</AdminFrame>;
}
