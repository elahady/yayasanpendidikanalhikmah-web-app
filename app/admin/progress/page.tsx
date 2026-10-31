import { wajibAdminHalaman } from "@/lib/web-auth";
import Link from "next/link";
import type { Santri } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JENJANG_LABEL, JILID_LABEL, JILID_ORDER } from "@/lib/labels";
import { updateProgressSantri } from "./actions";

export default async function AdminProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ santriId?: string; tersimpan?: string }>;
}) {
  await wajibAdminHalaman();
  const sp = await searchParams;

  const [semuaSantri, distribusiJilid] = await Promise.all([
    prisma.santri.findMany({
      orderBy: [{ jenjang: "asc" }, { kelas: "asc" }, { nama: "asc" }],
    }),
    prisma.santri.groupBy({
      by: ["jilidSaatIni"],
      _count: { _all: true },
    }),
  ]);

  if (semuaSantri.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Progress Santri</h1>
        <p className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Belum ada data santri — tambahkan dulu di{" "}
          <Link href="/admin/santri" className="font-medium underline">
            halaman Data Santri
          </Link>
          .
        </p>
      </div>
    );
  }

  const countByJilid = new Map(
    distribusiJilid.map((d) => [d.jilidSaatIni, d._count._all]),
  );

  const santriTerpilih =
    semuaSantri.find((s) => s.id === sp.santriId) ?? semuaSantri[0];

  // Kelompokkan daftar pilihan santri per jenjang lalu kelas.
  const kelompok = new Map<string, Map<string, Santri[]>>();
  for (const s of semuaSantri) {
    if (!kelompok.has(s.jenjang)) kelompok.set(s.jenjang, new Map());
    const byKelas = kelompok.get(s.jenjang)!;
    if (!byKelas.has(s.kelas)) byKelas.set(s.kelas, []);
    byKelas.get(s.kelas)!.push(s);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Progress Santri</h1>

      {sp.tersimpan === "1" && (
        <p className="rounded bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          Progress berhasil disimpan.
        </p>
      )}

      {/* Ringkasan distribusi jilid */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-500">
          Ringkasan distribusi jilid ({semuaSantri.length} santri)
        </h2>
        <div className="flex flex-wrap gap-2">
          {JILID_ORDER.map((jilid) => (
            <span
              key={jilid}
              className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10"
            >
              {JILID_LABEL[jilid]}:{" "}
              <strong>{countByJilid.get(jilid) ?? 0}</strong>
            </span>
          ))}
        </div>
      </section>

      {/* Pemilihan santri */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-500">Pilih santri</h2>
        {[...kelompok.entries()].map(([jenjang, byKelas]) => (
          <div key={jenjang} className="space-y-3">
            <h3 className="text-base font-semibold">
              Jenjang{" "}
              {JENJANG_LABEL[jenjang as keyof typeof JENJANG_LABEL] ??
                jenjang}
            </h3>
            {[...byKelas.entries()].map(([kelas, daftar]) => (
              <div key={kelas} className="space-y-2">
                <h4 className="text-xs font-medium text-zinc-500">
                  Kelas {kelas}
                </h4>
                <ul className="flex flex-col gap-2">
                  {daftar.map((santri) => {
                    const aktif = santri.id === santriTerpilih.id;
                    return (
                      <li key={santri.id}>
                        <Link
                          href={`/admin/progress?santriId=${encodeURIComponent(santri.id)}`}
                          className={`flex min-h-11 items-center justify-between rounded border px-4 py-2 ${
                            aktif
                              ? "border-foreground bg-foreground text-background"
                              : "border-black/10 dark:border-white/10"
                          }`}
                        >
                          <span className="font-medium">{santri.nama}</span>
                          <span
                            className={`text-xs ${aktif ? "" : "text-zinc-500"}`}
                          >
                            {JILID_LABEL[santri.jilidSaatIni]}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Form update progress santri terpilih */}
      <section className="space-y-4 rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-semibold">{santriTerpilih.nama}</h2>
        <p className="text-sm text-zinc-500">
          {JENJANG_LABEL[santriTerpilih.jenjang]} · Kelas{" "}
          {santriTerpilih.kelas}
        </p>

        <form action={updateProgressSantri} className="space-y-4">
          <input type="hidden" name="santriId" value={santriTerpilih.id} />

          <div>
            <label htmlFor="jilidSaatIni" className="block text-sm font-medium">
              Jilid An-Nahdhiyah saat ini (TPQ)
            </label>
            <select
              id="jilidSaatIni"
              name="jilidSaatIni"
              defaultValue={santriTerpilih.jilidSaatIni}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            >
              {JILID_ORDER.map((jilid) => (
                <option key={jilid} value={jilid}>
                  {JILID_LABEL[jilid]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="catatanProgressMadin"
              className="block text-sm font-medium"
            >
              Catatan progress Madrasah Diniyah
            </label>
            <textarea
              id="catatanProgressMadin"
              name="catatanProgressMadin"
              rows={4}
              defaultValue={santriTerpilih.catatanProgressMadin ?? ""}
              placeholder="Misal: sudah materi fiqih bab wudhu"
              className="mt-1 w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-foreground px-4 py-3 text-base font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Simpan Progress
          </button>
        </form>
      </section>
    </div>
  );
}
