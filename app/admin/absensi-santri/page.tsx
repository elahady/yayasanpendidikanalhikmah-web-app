import Link from "next/link";
import type { Santri } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  JENJANG_LABEL,
  formatTanggalIndonesia,
  isValidDateInputValue,
  todayDateInputValue,
} from "@/lib/labels";
import { simpanAbsensiSantri } from "./actions";

export default async function AdminAbsensiSantriPage({
  searchParams,
}: {
  searchParams: Promise<{ tanggal?: string; tersimpan?: string }>;
}) {
  const sp = await searchParams;
  const tanggalStr = isValidDateInputValue(sp.tanggal)
    ? sp.tanggal
    : todayDateInputValue();
  const tanggal = new Date(tanggalStr);

  const [semuaSantri, absensiTersimpan] = await Promise.all([
    prisma.santri.findMany({
      orderBy: [{ jenjang: "asc" }, { kelas: "asc" }, { nama: "asc" }],
    }),
    prisma.absensiSantri.findMany({ where: { tanggal } }),
  ]);

  if (semuaSantri.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Absensi Santri</h1>
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

  const absensiMap = new Map(absensiTersimpan.map((a) => [a.santriId, a]));

  // Kelompokkan per jenjang lalu per kelas, supaya daftar tidak jadi satu
  // list panjang yang membingungkan saat diisi dari HP.
  const kelompok = new Map<string, Map<string, Santri[]>>();
  for (const s of semuaSantri) {
    if (!kelompok.has(s.jenjang)) kelompok.set(s.jenjang, new Map());
    const byKelas = kelompok.get(s.jenjang)!;
    if (!byKelas.has(s.kelas)) byKelas.set(s.kelas, []);
    byKelas.get(s.kelas)!.push(s);
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Absensi Santri</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatTanggalIndonesia(tanggal)}
        </p>
      </div>

      {sp.tersimpan === "1" && (
        <p className="rounded bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          Absensi tanggal {tanggalStr} berhasil disimpan.
        </p>
      )}

      <form method="get" className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="tanggal" className="block text-sm font-medium">
            Tanggal
          </label>
          <input
            type="date"
            id="tanggal"
            name="tanggal"
            defaultValue={tanggalStr}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <button
          type="submit"
          className="h-fit rounded border border-black/20 px-4 py-2 text-sm dark:border-white/20"
        >
          Tampilkan
        </button>
      </form>

      <form action={simpanAbsensiSantri} className="space-y-6">
        <input type="hidden" name="tanggal" value={tanggalStr} />

        {[...kelompok.entries()].map(([jenjang, byKelas]) => (
          <section key={jenjang} className="space-y-4">
            <h2 className="text-lg font-semibold">
              Jenjang {JENJANG_LABEL[jenjang as keyof typeof JENJANG_LABEL] ?? jenjang}
            </h2>
            {[...byKelas.entries()].map(([kelas, daftar]) => (
              <div key={kelas} className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-500">
                  Kelas {kelas}
                </h3>
                <ul className="divide-y divide-black/10 rounded border border-black/10 dark:divide-white/10 dark:border-white/10">
                  {daftar.map((santri) => {
                    const existing = absensiMap.get(santri.id);
                    const defaultHadir = existing ? existing.hadir : true;
                    return (
                      <li key={santri.id} className="p-3">
                        <label className="flex min-h-11 cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            name={`hadir-${santri.id}`}
                            defaultChecked={defaultHadir}
                            className="h-6 w-6 shrink-0 accent-foreground"
                          />
                          <span className="flex-1 font-medium">
                            {santri.nama}
                          </span>
                        </label>
                        <input
                          type="text"
                          name={`keterangan-${santri.id}`}
                          defaultValue={existing?.keterangan ?? ""}
                          placeholder="Keterangan (opsional, misal: sakit/izin)"
                          className="mt-2 w-full rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-transparent"
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        ))}

        <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-background p-4 dark:border-white/10">
          <div className="mx-auto max-w-4xl">
            <button
              type="submit"
              className="w-full rounded bg-foreground px-4 py-3 text-base font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Simpan Absensi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
