import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatTanggalIndonesia,
  isValidDateInputValue,
  todayDateInputValue,
} from "@/lib/labels";
import { simpanAbsensiUstadz } from "./actions";

export default async function AdminAbsensiUstadzPage({
  searchParams,
}: {
  searchParams: Promise<{ tanggal?: string; tersimpan?: string }>;
}) {
  const sp = await searchParams;
  const tanggalStr = isValidDateInputValue(sp.tanggal)
    ? sp.tanggal
    : todayDateInputValue();
  const tanggal = new Date(tanggalStr);

  const [semuaUstadz, absensiTersimpan] = await Promise.all([
    prisma.ustadz.findMany({ orderBy: { nama: "asc" } }),
    prisma.absensiUstadz.findMany({ where: { tanggal } }),
  ]);

  if (semuaUstadz.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Absensi Ustadz/Ustadzah</h1>
        <p className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Belum ada data ustadz/ustadzah — tambahkan dulu di{" "}
          <Link href="/admin/ustadz" className="font-medium underline">
            halaman Data Ustadz/Ustadzah
          </Link>
          .
        </p>
      </div>
    );
  }

  const absensiMap = new Map(absensiTersimpan.map((a) => [a.ustadzId, a]));

  return (
    <div className="space-y-6 pb-28">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Absensi Ustadz/Ustadzah</h1>
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

      <form action={simpanAbsensiUstadz} className="space-y-4">
        <input type="hidden" name="tanggal" value={tanggalStr} />

        <ul className="divide-y divide-black/10 rounded border border-black/10 dark:divide-white/10 dark:border-white/10">
          {semuaUstadz.map((ustadz) => {
            const existing = absensiMap.get(ustadz.id);
            const defaultHadir = existing ? existing.hadir : true;
            return (
              <li key={ustadz.id} className="p-3">
                <label className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name={`hadir-${ustadz.id}`}
                    defaultChecked={defaultHadir}
                    className="h-6 w-6 shrink-0 accent-foreground"
                  />
                  <span className="flex-1">
                    <span className="block font-medium">{ustadz.nama}</span>
                    <span className="block text-xs text-zinc-500">
                      {ustadz.mapelDiajar}
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  name={`keterangan-${ustadz.id}`}
                  defaultValue={existing?.keterangan ?? ""}
                  placeholder="Keterangan (opsional, misal: sakit/izin)"
                  className="mt-2 w-full rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-transparent"
                />
              </li>
            );
          })}
        </ul>

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
