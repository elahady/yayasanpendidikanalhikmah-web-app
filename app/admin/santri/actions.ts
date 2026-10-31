"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdminAction } from "@/lib/web-auth";

const LIST_PATH = "/admin/santri";

const santriSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi."),
  jenjang: z.enum(["ULA", "WUSTHO"], "Jenjang tidak valid."),
  kelas: z.string().trim().min(1, "Kelas wajib diisi."),
});

// Server action dipanggil langsung dari klien, jadi hak akses WAJIB dicek di sini
// (ADMIN/TU aktif, dibaca dari database), bukan hanya mengandalkan proxy.ts.
async function requireSession() {
  await wajibAdminAction();
}

function parseSantriForm(formData: FormData) {
  return santriSchema.safeParse({
    nama: formData.get("nama"),
    jenjang: formData.get("jenjang"),
    kelas: formData.get("kelas"),
  });
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createSantriAction(formData: FormData) {
  await requireSession();

  const parsed = parseSantriForm(formData);
  if (!parsed.success) {
    redirectWithError(LIST_PATH, parsed.error.issues[0]?.message ?? "Data tidak valid.");
  }

  await prisma.santri.create({
    data: parsed.data,
  });

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function updateSantriAction(id: string, formData: FormData) {
  await requireSession();

  const editPath = `${LIST_PATH}/${id}/edit`;
  const parsed = parseSantriForm(formData);
  if (!parsed.success) {
    redirectWithError(editPath, parsed.error.issues[0]?.message ?? "Data tidak valid.");
  }

  await prisma.santri.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteSantriAction(id: string) {
  await requireSession();

  await prisma.santri.delete({ where: { id } });

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
