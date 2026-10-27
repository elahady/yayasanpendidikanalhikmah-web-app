import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSantriAction } from "./actions";
import { DeleteSantriButton } from "./delete-santri-button";

const jenjangLabel: Record<string, string> = {
  ULA: "Ula",
  WUSTHO: "Wustho",
};

const jilidLabel: Record<string, string> = {
  PRA_NAHDLIYAH: "Pra Nahdliyah",
  JILID_1: "Jilid 1",
  JILID_2: "Jilid 2",
  JILID_3: "Jilid 3",
  JILID_4: "Jilid 4",
  JILID_5: "Jilid 5",
  JILID_6: "Jilid 6",
  AL_QURAN: "Al-Qur'an",
};

const inputClass =
  "mt-1 w-full rounded border border-black/20 px-3 py-2 text-base dark:border-white/20 dark:bg-transparent";
const labelClass = "block text-sm font-medium";

export default async function AdminSantriPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const santriList = await prisma.santri.findMany({
    orderBy: [{ jenjang: "asc" }, { kelas: "asc" }, { nama: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Data Santri</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {santriList.length} santri terdaftar.
        </p>
      </div>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Tambah Santri</h2>
        <form
          action={createSantriAction}
          className="space-y-4 rounded-lg border border-black/10 p-4 dark:border-white/10"
        >
          <div>
            <label htmlFor="nama" className={labelClass}>
              Nama
            </label>
            <input id="nama" name="nama" required className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="jenjang" className={labelClass}>
                Jenjang
              </label>
              <select id="jenjang" name="jenjang" defaultValue="ULA" className={inputClass}>
                <option value="ULA">Ula</option>
                <option value="WUSTHO">Wustho</option>
              </select>
            </div>
            <div>
              <label htmlFor="kelas" className={labelClass}>
                Kelas
              </label>
              <input
                id="kelas"
                name="kelas"
                required
                placeholder="misal: 3 atau 3A"
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded bg-foreground px-4 py-3 text-base font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Tambah Santri
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Daftar Santri</h2>
        {santriList.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Belum ada data santri.</p>
        ) : (
          <>
            {/* Mobile: card list bertumpuk vertikal */}
            <ul className="space-y-3 sm:hidden">
              {santriList.map((santri) => (
                <li
                  key={santri.id}
                  className="rounded-lg border border-black/10 p-4 dark:border-white/10"
                >
                  <p className="font-medium">{santri.nama}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {jenjangLabel[santri.jenjang]} · Kelas {santri.kelas} ·{" "}
                    {jilidLabel[santri.jilidSaatIni]}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <Link
                      href={`/admin/santri/${santri.id}/edit`}
                      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <DeleteSantriButton id={santri.id} nama={santri.nama} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop/tablet: tabel */}
            <table className="hidden w-full text-left text-sm sm:table">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Jenjang</th>
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Jilid Saat Ini</th>
                  <th className="py-2 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {santriList.map((santri) => (
                  <tr key={santri.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-4">{santri.nama}</td>
                    <td className="py-2 pr-4">{jenjangLabel[santri.jenjang]}</td>
                    <td className="py-2 pr-4">{santri.kelas}</td>
                    <td className="py-2 pr-4">{jilidLabel[santri.jilidSaatIni]}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/santri/${santri.id}/edit`}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Edit
                        </Link>
                        <DeleteSantriButton id={santri.id} nama={santri.nama} />
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
