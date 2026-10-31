import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { urutkanRole } from "@/lib/authz";
import { wajibAdminHalaman } from "@/lib/web-auth";
import { ROLE_DESKRIPSI, ROLE_LABEL } from "@/lib/labels";
import { buatAkunAction } from "./actions";
import { inputClass, labelClass, tombolUtamaClass } from "./gaya";

export default async function AdminAkunPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await wajibAdminHalaman();
  const { error } = await searchParams;

  const [akunList, ustadzList] = await Promise.all([
    prisma.akun.findMany({
      orderBy: [{ aktif: "desc" }, { nama: "asc" }],
      include: {
        roles: { select: { role: true } },
        ustadz: { select: { nama: true } },
        _count: { select: { anak: true } },
      },
    }),
    // Ustadz yang belum tertaut ke akun mana pun (satu ustadz = satu akun).
    prisma.ustadz.findMany({ where: { akun: null }, orderBy: { nama: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Akun Pengguna</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {akunList.length} akun. Akun dipakai untuk login web (ADMIN/TU) dan aplikasi Android
          (semua peran).
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Daftar Akun</h2>
        <ul className="space-y-3">
          {akunList.map((akun) => (
            <li
              key={akun.id}
              className="rounded-2xl border border-border bg-bg-elevated p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{akun.nama}</p>
                  <p className="truncate text-sm text-ink-muted">@{akun.username}</p>
                </div>
                <span
                  className={
                    akun.aktif
                      ? "shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
                      : "shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent"
                  }
                >
                  {akun.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {urutkanRole(akun.roles.map((r) => r.role)).map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted"
                  >
                    {ROLE_LABEL[role]}
                  </span>
                ))}
                {akun.roles.length === 0 && (
                  <span className="text-xs text-ink-subtle">Belum punya peran</span>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-subtle">
                {akun.ustadz ? `Tertaut ke ustadz: ${akun.ustadz.nama}` : "Tidak tertaut ke ustadz"}
                {akun._count.anak > 0 && ` · ${akun._count.anak} anak`}
              </p>
              <Link
                href={`/admin/akun/${akun.id}`}
                className="mt-3 inline-block text-sm font-semibold text-link hover:underline"
              >
                Kelola
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Buat Akun Baru</h2>
        <form
          action={buatAkunAction}
          className="space-y-4 rounded-2xl border border-border bg-bg-elevated p-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nama" className={labelClass}>
                Nama
              </label>
              <input id="nama" name="nama" required maxLength={100} className={inputClass} />
            </div>
            <div>
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
              <input
                id="username"
                name="username"
                required
                minLength={3}
                maxLength={50}
                autoCapitalize="none"
                autoCorrect="off"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Password awal
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink-subtle">Minimal 8 karakter.</p>
          </div>

          <fieldset>
            <legend className={labelClass}>Peran</legend>
            <div className="mt-2 space-y-2">
              {(Object.keys(ROLE_LABEL) as (keyof typeof ROLE_LABEL)[]).map((role) => (
                <label key={role} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-ink">{ROLE_LABEL[role]}</span>
                    <span className="block text-ink-muted">{ROLE_DESKRIPSI[role]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="ustadzId" className={labelClass}>
              Tautkan ke ustadz/ustadzah (opsional)
            </label>
            <select id="ustadzId" name="ustadzId" defaultValue="" className={inputClass}>
              <option value="">Tidak ditautkan</option>
              {ustadzList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} — {u.mapelDiajar}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-subtle">
              Akun yang tertaut ke seorang ustadz tidak bisa mengabsen dirinya sendiri.
            </p>
          </div>

          <button type="submit" className={tombolUtamaClass}>
            Buat Akun
          </button>
          <p className="text-xs text-ink-subtle">
            Penautan ke santri (untuk peran Wali) diatur di halaman Kelola setelah akun dibuat.
          </p>
        </form>
      </section>
    </div>
  );
}
