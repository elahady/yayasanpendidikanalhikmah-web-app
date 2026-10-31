"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdminAction } from "@/lib/web-auth";

const LIST_PATH = "/admin/ustadz";

const ustadzSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi."),
  mapelDiajar: z.string().trim().min(1, "Mapel yang diajar wajib diisi."),
});

// Server action dipanggil langsung dari klien, jadi hak akses WAJIB dicek di sini
// (ADMIN/TU aktif, dibaca dari database), bukan hanya mengandalkan proxy.ts.
async function requireSession() {
  await wajibAdminAction();
}

function parseUstadzForm(formData: FormData) {
  return ustadzSchema.safeParse({
    nama: formData.get("nama"),
    mapelDiajar: formData.get("mapelDiajar"),
  });
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createUstadzAction(formData: FormData) {
  await requireSession();

  const parsed = parseUstadzForm(formData);
  if (!parsed.success) {
    redirectWithError(LIST_PATH, parsed.error.issues[0]?.message ?? "Data tidak valid.");
  }

  await prisma.ustadz.create({
    data: parsed.data,
  });

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function updateUstadzAction(id: string, formData: FormData) {
  await requireSession();

  const editPath = `${LIST_PATH}/${id}/edit`;
  const parsed = parseUstadzForm(formData);
  if (!parsed.success) {
    redirectWithError(editPath, parsed.error.issues[0]?.message ?? "Data tidak valid.");
  }

  await prisma.ustadz.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteUstadzAction(id: string) {
  await requireSession();

  await prisma.ustadz.delete({ where: { id } });

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
