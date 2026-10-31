"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getWebActor } from "@/lib/web-auth";
import { prisma } from "@/lib/prisma";
import { isValidDateInputValue } from "@/lib/labels";

/**
 * Simpan absensi harian seluruh ustadz/ustadzah untuk satu tanggal sekaligus.
 * Pola sama dengan `simpanAbsensiSantri` — lihat komentar di
 * app/admin/absensi-santri/actions.ts.
 */
export async function simpanAbsensiUstadz(formData: FormData): Promise<void> {
  const actor = await getWebActor();
  if (!actor) {
    redirect("/admin/login");
  }

  const tanggalStr = formData.get("tanggal");
  if (!isValidDateInputValue(tanggalStr)) {
    throw new Error("Tanggal tidak valid.");
  }
  const tanggal = new Date(tanggalStr);

  const [semuaUstadz, tersimpan] = await Promise.all([
    prisma.ustadz.findMany({ select: { id: true } }),
    prisma.absensiUstadz.findMany({ where: { tanggal } }),
  ]);
  const tersimpanMap = new Map(tersimpan.map((a) => [a.ustadzId, a]));

  // Hanya tulis baris yang baru atau berubah (lihat komentar di absensi-santri/actions.ts).
  const operasi = semuaUstadz.flatMap(({ id }) => {
    const hadir = formData.get(`hadir-${id}`) !== null;
    const keteranganRaw = formData.get(`keterangan-${id}`);
    const keterangan =
      typeof keteranganRaw === "string" && keteranganRaw.trim() !== ""
        ? keteranganRaw.trim()
        : null;

    const lama = tersimpanMap.get(id);
    if (lama && lama.hadir === hadir && lama.keterangan === keterangan) return [];

    return [
      prisma.absensiUstadz.upsert({
        where: { ustadzId_tanggal: { ustadzId: id, tanggal } },
        update: { hadir, keterangan, dicatatOlehId: actor.id },
        create: { ustadzId: id, tanggal, hadir, keterangan, dicatatOlehId: actor.id },
      }),
    ];
  });

  if (operasi.length > 0) {
    await prisma.$transaction(operasi);
  }

  revalidatePath("/admin/absensi-ustadz");
  redirect(
    `/admin/absensi-ustadz?tanggal=${encodeURIComponent(tanggalStr)}&tersimpan=1`,
  );
}
