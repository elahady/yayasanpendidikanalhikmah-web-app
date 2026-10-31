import Link from "next/link";
import type { Santri } from "@prisma/client";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { urutkanRole } from "@/lib/authz";
import { wajibAdminHalaman } from "@/lib/web-auth";
import { JENJANG_LABEL, ROLE_DESKRIPSI, ROLE_LABEL } from "@/lib/labels";
import { perbaruiAkunAction, resetPasswordAction, simpanAnakWaliAction } from "../actions";
import { inputClass, labelClass, tombolSekunderClass, tombolUtamaClass } from "../gaya";

export default async function KelolaAkunPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    baru?: string;
    tersimpan?: string;
    password?: string;
    anak?: string;
  }>;
}) {
  const pelaku = await wajibAdminHalaman();
  const { id } = await params;
  const sp = await searchParams;

  const akun = await prisma.akun.findUnique({
    where: { id },
    include: { roles: { select: { role: true } }, anak: { select: { santriId: true } } },
  });
  if (!akun) notFound();

  const roleAkun = urutkanRole(akun.roles.map((r) => r.role));
  const adalahWali = roleAkun.includes("WALI");

  const [ustadzList, semuaSantri] = await Promise.all([
    // Ustadz yang bebas, ditambah ustadz yang sudah tertaut ke akun ini.
    prisma.ustadz.findMany({
      where: { OR: [{ akun: null }, { akun: { id } }] },
      orderBy: { nama: "asc" },
    }),
    adalahWali
      ? prisma.santri.findMany({ orderBy: [{ jenjang: "asc" }, { kelas: "asc" }, { nama: "asc" }] })
      : Promise.resolve([] as Santri[]),
  ]);
  const anakSet = new Set(akun.anak.map((a) => a.santriId));

  // Kelompokkan santri per jenjang+kelas supaya daftar centang mudah dipindai di HP.
  const kelompok = new Map<string, Santri[]>();
  for (const s of semuaSantri) {
    const kunci = `${JENJANG_LABEL[s.jenjang]} · Kelas ${s.kelas}`;
    if (!kelompok.has(kunci)) kelompok.set(kunci, []);
    kelompok.get(kunci)!.push(s);
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <Link href="/admin/akun" className="text-sm font-medium text-link hover:underline">
          &larr; Semua akun
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{akun.nama}</h1>
        <p className="text-sm text-ink-muted">@{akun.username}</p>
      </div>

      {sp.error && (
        <p className="rounded-lg bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent">
          {sp.error}
        </p>
      )}
      {(sp.baru || sp.tersimpan || sp.password || sp.anak) && (
        <p className="rounded-lg bg-primary/10 px-3.5 py-2.5 text-sm font-medium text-primary">
          {sp.baru && "Akun dibuat. Atur penautan lain di bawah bila perlu."}
          {sp.tersimpan && "Perubahan akun disimpan."}
          {sp.password && "Password baru disimpan."}
          {sp.anak && "Daftar anak disimpan."}
        </p>
      )}

      <form
        action={perbaruiAkunAction.bind(null, id)}
        className="space-y-4 rounded-2xl border border-border bg-bg-elevated p-4"
      >
        <h2 className="font-display text-lg font-semibold text-ink">Data &amp; peran</h2>
        <div>
          <label htmlFor="nama" className={labelClass}>
            Nama
          </label>
          <input
            id="nama"
            name="nama"
            required
            maxLength={100}
            defaultValue={akun.nama}
            className={inputClass}
          />
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
                  defaultChecked={roleAkun.includes(role)}
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
            Tertaut ke ustadz/ustadzah
          </label>
          <select
            id="ustadzId"
            name="ustadzId"
            defaultValue={akun.ustadzId ?? ""}
            className={inputClass}
          >
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

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="aktif"
            defaultChecked={akun.aktif}
            className="h-5 w-5 shrink-0 accent-primary"
          />
          <span className="text-sm">
            <span className="font-medium text-ink">Akun aktif</span>
            <span className="block text-ink-muted">
              Hilangkan centang untuk menonaktifkan: tidak bisa login dan token yang ada langsung
              tidak berlaku.
            </span>
          </span>
        </label>
        {akun.id === pelaku.id && (
          <p className="text-xs text-ink-subtle">
            Ini akun Anda sendiri. Sistem menolak perubahan yang membuat tidak ada ADMIN/TU aktif.
          </p>
        )}

        <button type="submit" className={tombolUtamaClass}>
          Simpan Perubahan
        </button>
      </form>

      <form
        action={resetPasswordAction.bind(null, id)}
        className="space-y-4 rounded-2xl border border-border bg-bg-elevated p-4"
      >
        <h2 className="font-display text-lg font-semibold text-ink">Reset password</h2>
        <div>
          <label htmlFor="password" className={labelClass}>
            Password baru
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
        <button type="submit" className={tombolSekunderClass}>
          Simpan Password Baru
        </button>
      </form>

      <section className="space-y-4 rounded-2xl border border-border bg-bg-elevated p-4">
        <h2 className="font-display text-lg font-semibold text-ink">Anak (santri) wali</h2>
        {!adalahWali ? (
          <p className="text-sm text-ink-muted">
            Hanya untuk akun berperan Wali. Centang peran &ldquo;Wali santri&rdquo; di atas dan
            simpan dulu, lalu pilih santri anaknya di sini.
          </p>
        ) : semuaSantri.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Belum ada data santri.{" "}
            <Link href="/admin/santri" className="font-medium text-link hover:underline">
              Tambah santri
            </Link>
            .
          </p>
        ) : (
          <form action={simpanAnakWaliAction.bind(null, id)} className="space-y-4">
            <p className="text-sm text-ink-muted">
              Wali hanya bisa melihat santri yang dicentang. {anakSet.size} anak tertaut.
            </p>
            {[...kelompok.entries()].map(([judul, daftar]) => (
              <div key={judul} className="space-y-1">
                <h3 className="text-sm font-semibold text-ink-muted">{judul}</h3>
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {daftar.map((s) => (
                    <li key={s.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3">
                        <input
                          type="checkbox"
                          name="santriId"
                          value={s.id}
                          defaultChecked={anakSet.has(s.id)}
                          className="h-5 w-5 shrink-0 accent-primary"
                        />
                        <span className="text-sm text-ink">{s.nama}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button type="submit" className={tombolUtamaClass}>
              Simpan Daftar Anak
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
