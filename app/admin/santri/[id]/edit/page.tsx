import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSantriAction } from "../../actions";

const inputClass =
  "mt-1 w-full rounded border border-black/20 px-3 py-2 text-base dark:border-white/20 dark:bg-transparent";
const labelClass = "block text-sm font-medium";

export default async function EditSantriPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const santri = await prisma.santri.findUnique({ where: { id } });
  if (!santri) {
    notFound();
  }

  const updateSantriWithId = updateSantriAction.bind(null, id);

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Edit Santri</h1>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <form action={updateSantriWithId} className="space-y-4">
        <div>
          <label htmlFor="nama" className={labelClass}>
            Nama
          </label>
          <input
            id="nama"
            name="nama"
            required
            defaultValue={santri.nama}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="jenjang" className={labelClass}>
              Jenjang
            </label>
            <select
              id="jenjang"
              name="jenjang"
              defaultValue={santri.jenjang}
              className={inputClass}
            >
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
              defaultValue={santri.kelas}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded bg-foreground px-4 py-3 text-base font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Simpan Perubahan
        </button>
      </form>

      <Link
        href="/admin/santri"
        className="block text-center text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        Batal, kembali ke daftar
      </Link>
    </div>
  );
}
