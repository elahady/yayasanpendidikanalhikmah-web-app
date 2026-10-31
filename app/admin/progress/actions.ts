"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getWebActor } from "@/lib/web-auth";
import { prisma } from "@/lib/prisma";
import { JILID_ORDER } from "@/lib/labels";

/**
 * Update progress satu santri: jilid An-Nahdhiyah saat ini (TPQ) dan catatan
 * bebas progress Madrasah Diniyah.
 */
export async function updateProgressSantri(formData: FormData): Promise<void> {
  if (!(await getWebActor())) {
    redirect("/admin/login");
  }

  const santriId = formData.get("santriId");
  if (typeof santriId !== "string" || santriId.trim() === "") {
    throw new Error("Santri tidak valid.");
  }

  const jilidSaatIni = formData.get("jilidSaatIni");
  if (
    typeof jilidSaatIni !== "string" ||
    !JILID_ORDER.includes(jilidSaatIni as (typeof JILID_ORDER)[number])
  ) {
    throw new Error("Jilid tidak valid.");
  }

  const catatanRaw = formData.get("catatanProgressMadin");
  const catatanProgressMadin =
    typeof catatanRaw === "string" && catatanRaw.trim() !== ""
      ? catatanRaw.trim()
      : null;

  // Pastikan santri memang ada sebelum update, supaya error jelas kalau id
  // sudah tidak valid (misal dihapus di antara load halaman dan submit).
  const santri = await prisma.santri.findUnique({ where: { id: santriId } });
  if (!santri) {
    throw new Error("Santri tidak ditemukan.");
  }

  await prisma.santri.update({
    where: { id: santriId },
    data: {
      jilidSaatIni: jilidSaatIni as (typeof JILID_ORDER)[number],
      catatanProgressMadin,
    },
  });

  revalidatePath("/admin/progress");
  redirect(
    `/admin/progress?santriId=${encodeURIComponent(santriId)}&tersimpan=1`,
  );
}
