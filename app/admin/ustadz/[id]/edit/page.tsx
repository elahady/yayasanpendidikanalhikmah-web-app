import { wajibAdminHalaman } from "@/lib/web-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateUstadzAction } from "../../actions";

const inputClass =
  "mt-1 w-full rounded border border-black/20 px-3 py-2 text-base dark:border-white/20 dark:bg-transparent";
const labelClass = "block text-sm font-medium";

export default async function EditUstadzPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await wajibAdminHalaman();
  const { id } = await params;
  const { error } = await searchParams;

  const ustadz = await prisma.ustadz.findUnique({ where: { id } });
  if (!ustadz) {
    notFound();
  }

  const updateUstadzWithId = updateUstadzAction.bind(null, id);

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Edit Ustadz/Ustadzah</h1>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <form action={updateUstadzWithId} className="space-y-4">
        <div>
          <label htmlFor="nama" className={labelClass}>
            Nama
          </label>
          <input
            id="nama"
            name="nama"
            required
            defaultValue={ustadz.nama}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mapelDiajar" className={labelClass}>
            Mapel yang Diajar
          </label>
          <input
            id="mapelDiajar"
            name="mapelDiajar"
            required
            defaultValue={ustadz.mapelDiajar}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-foreground px-4 py-3 text-base font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Simpan Perubahan
        </button>
      </form>

      <Link
        href="/admin/ustadz"
        className="block text-center text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        Batal, kembali ke daftar
      </Link>
    </div>
  );
}
