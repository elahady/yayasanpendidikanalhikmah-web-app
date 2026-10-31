import { wajibAdminHalaman } from "@/lib/web-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createUstadzAction } from "./actions";
import { DeleteUstadzButton } from "./delete-ustadz-button";

const inputClass =
  "mt-1 w-full rounded border border-black/20 px-3 py-2 text-base dark:border-white/20 dark:bg-transparent";
const labelClass = "block text-sm font-medium";

export default async function AdminUstadzPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await wajibAdminHalaman();
  const { error } = await searchParams;

  const ustadzList = await prisma.ustadz.findMany({
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Data Ustadz/Ustadzah</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {ustadzList.length} ustadz/ustadzah terdaftar.
        </p>
      </div>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Tambah Ustadz/Ustadzah</h2>
        <form
          action={createUstadzAction}
          className="space-y-4 rounded-lg border border-black/10 p-4 dark:border-white/10"
        >
          <div>
            <label htmlFor="nama" className={labelClass}>
              Nama
            </label>
            <input id="nama" name="nama" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="mapelDiajar" className={labelClass}>
              Mapel yang Diajar
            </label>
            <input
              id="mapelDiajar"
              name="mapelDiajar"
              required
              placeholder="misal: Fiqih, Aqidah Akhlak"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-foreground px-4 py-3 text-base font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Tambah Ustadz/Ustadzah
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Daftar Ustadz/Ustadzah</h2>
        {ustadzList.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Belum ada data ustadz/ustadzah.
          </p>
        ) : (
          <>
            {/* Mobile: card list bertumpuk vertikal */}
            <ul className="space-y-3 sm:hidden">
              {ustadzList.map((ustadz) => (
                <li
                  key={ustadz.id}
                  className="rounded-lg border border-black/10 p-4 dark:border-white/10"
                >
                  <p className="font-medium">{ustadz.nama}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {ustadz.mapelDiajar}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <Link
                      href={`/admin/ustadz/${ustadz.id}/edit`}
                      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <DeleteUstadzButton id={ustadz.id} nama={ustadz.nama} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop/tablet: tabel */}
            <table className="hidden w-full text-left text-sm sm:table">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Mapel yang Diajar</th>
                  <th className="py-2 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ustadzList.map((ustadz) => (
                  <tr key={ustadz.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-4">{ustadz.nama}</td>
                    <td className="py-2 pr-4">{ustadz.mapelDiajar}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/ustadz/${ustadz.id}/edit`}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Edit
                        </Link>
                        <DeleteUstadzButton id={ustadz.id} nama={ustadz.nama} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}
