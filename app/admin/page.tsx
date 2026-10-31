import { wajibAdminHalaman } from "@/lib/web-auth";

export default async function AdminDashboardPage() {
  const actor = await wajibAdminHalaman();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="text-ink-muted">
        Halo, {actor.nama}. Pilih menu di atas untuk mengelola data santri, ustadz, absensi,
        progress, dan akun pengguna.
      </p>
    </div>
  );
}
