"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getWebActor } from "@/lib/web-auth";
import { prisma } from "@/lib/prisma";
import { isValidDateInputValue } from "@/lib/labels";

/**
 * Simpan absensi harian seluruh santri untuk satu tanggal sekaligus.
 * Form mengirim checkbox `hadir-<santriId>` (ada = hadir) dan field opsional
 * `keterangan-<santriId>`. Daftar santri ditarik ulang dari database (bukan
 * dari hidden input) supaya tidak bisa dipalsukan dari client dan tetap akurat
 * walau data santri berubah di antara load halaman dan submit.
 */
export async function simpanAbsensiSantri(formData: FormData): Promise<void> {
  const actor = await getWebActor();
  if (!actor) {
    redirect("/admin/login");
  }

  const tanggalStr = formData.get("tanggal");
  if (!isValidDateInputValue(tanggalStr)) {
    throw new Error("Tanggal tidak valid.");
  }
  const tanggal = new Date(tanggalStr);

  const [semuaSantri, tersimpan] = await Promise.all([
    prisma.santri.findMany({ select: { id: true } }),
    prisma.absensiSantri.findMany({ where: { tanggal } }),
  ]);
  const tersimpanMap = new Map(tersimpan.map((a) => [a.santriId, a]));

  // Hanya tulis baris yang baru atau berubah, supaya `dicatatOlehId` entri yang
  // tidak disentuh (mis. dicatat ustadz lewat app) tidak ikut berpindah ke TU.
  const operasi = semuaSantri.flatMap(({ id }) => {
    const hadir = formData.get(`hadir-${id}`) !== null;
    const keteranganRaw = formData.get(`keterangan-${id}`);
    const keterangan =
      typeof keteranganRaw === "string" && keteranganRaw.trim() !== ""
        ? keteranganRaw.trim()
        : null;

    const lama = tersimpanMap.get(id);
    if (lama && lama.hadir === hadir && lama.keterangan === keterangan) return [];

    return [
      prisma.absensiSantri.upsert({
        where: { santriId_tanggal: { santriId: id, tanggal } },
        update: { hadir, keterangan, dicatatOlehId: actor.id },
        create: { santriId: id, tanggal, hadir, keterangan, dicatatOlehId: actor.id },
      }),
    ];
  });

  if (operasi.length > 0) {
    await prisma.$transaction(operasi);
  }

  revalidatePath("/admin/absensi-santri");
  redirect(
    `/admin/absensi-santri?tanggal=${encodeURIComponent(tanggalStr)}&tersimpan=1`,
  );
}
