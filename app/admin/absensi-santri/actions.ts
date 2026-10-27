"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
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
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  const tanggalStr = formData.get("tanggal");
  if (!isValidDateInputValue(tanggalStr)) {
    throw new Error("Tanggal tidak valid.");
  }
  const tanggal = new Date(tanggalStr);

  const semuaSantri = await prisma.santri.findMany({ select: { id: true } });

  if (semuaSantri.length > 0) {
    await prisma.$transaction(
      semuaSantri.map(({ id }) => {
        const hadir = formData.get(`hadir-${id}`) !== null;
        const keteranganRaw = formData.get(`keterangan-${id}`);
        const keterangan =
          typeof keteranganRaw === "string" && keteranganRaw.trim() !== ""
            ? keteranganRaw.trim()
            : null;

        return prisma.absensiSantri.upsert({
          where: { santriId_tanggal: { santriId: id, tanggal } },
          update: { hadir, keterangan },
          create: { santriId: id, tanggal, hadir, keterangan },
        });
      }),
    );
  }

  revalidatePath("/admin/absensi-santri");
  redirect(
    `/admin/absensi-santri?tanggal=${encodeURIComponent(tanggalStr)}&tersimpan=1`,
  );
}
