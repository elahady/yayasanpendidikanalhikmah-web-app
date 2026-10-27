"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidDateInputValue } from "@/lib/labels";

/**
 * Simpan absensi harian seluruh ustadz/ustadzah untuk satu tanggal sekaligus.
 * Pola sama dengan `simpanAbsensiSantri` — lihat komentar di
 * app/admin/absensi-santri/actions.ts.
 */
export async function simpanAbsensiUstadz(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  const tanggalStr = formData.get("tanggal");
  if (!isValidDateInputValue(tanggalStr)) {
    throw new Error("Tanggal tidak valid.");
  }
  const tanggal = new Date(tanggalStr);

  const semuaUstadz = await prisma.ustadz.findMany({ select: { id: true } });

  if (semuaUstadz.length > 0) {
    await prisma.$transaction(
      semuaUstadz.map(({ id }) => {
        const hadir = formData.get(`hadir-${id}`) !== null;
        const keteranganRaw = formData.get(`keterangan-${id}`);
        const keterangan =
          typeof keteranganRaw === "string" && keteranganRaw.trim() !== ""
            ? keteranganRaw.trim()
            : null;

        return prisma.absensiUstadz.upsert({
          where: { ustadzId_tanggal: { ustadzId: id, tanggal } },
          update: { hadir, keterangan },
          create: { ustadzId: id, tanggal, hadir, keterangan },
        });
      }),
    );
  }

  revalidatePath("/admin/absensi-ustadz");
  redirect(
    `/admin/absensi-ustadz?tanggal=${encodeURIComponent(tanggalStr)}&tersimpan=1`,
  );
}
