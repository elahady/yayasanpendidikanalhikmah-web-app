"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SEMUA_ROLE } from "@/lib/authz";
import { wajibAdminAction } from "@/lib/web-auth";

const LIST_PATH = "/admin/akun";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter.")
  .max(50, "Username maksimal 50 karakter.")
  .regex(/^[A-Za-z0-9._-]+$/, "Username hanya boleh huruf, angka, titik, garis bawah, dan strip.");

const namaSchema = z.string().trim().min(1, "Nama wajib diisi.").max(100, "Nama maksimal 100 karakter.");

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(100, "Password maksimal 100 karakter.");

const roleSchema = z.array(z.enum(SEMUA_ROLE as [Role, ...Role[]]));

function redirectDenganError(path: string, pesan: string): never {
  redirect(`${path}?error=${encodeURIComponent(pesan)}`);
}

/** Nilai select ustadz: "" -> null, selain itu id ustadz. */
function bacaUstadzId(formData: FormData): string | null {
  const v = formData.get("ustadzId");
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function bacaRoles(formData: FormData): Role[] {
  const hasil = roleSchema.safeParse(formData.getAll("roles"));
  return hasil.success ? [...new Set(hasil.data)] : [];
}

/** Pastikan ustadz ada dan belum tertaut ke akun lain. Mengembalikan pesan error atau null. */
async function cekTautanUstadz(ustadzId: string, akunId?: string): Promise<string | null> {
  const ustadz = await prisma.ustadz.findUnique({
    where: { id: ustadzId },
    select: { akun: { select: { id: true, nama: true } } },
  });
  if (!ustadz) return "Ustadz yang dipilih tidak ditemukan.";
  if (ustadz.akun && ustadz.akun.id !== akunId) {
    return `Ustadz ini sudah tertaut ke akun "${ustadz.akun.nama}".`;
  }
  return null;
}

/**
 * Tolak perubahan yang membuat tidak ada lagi akun ADMIN/TU aktif (supaya
 * tidak ada yang terkunci dari panel ini).
 */
async function masihAdaPengelolaLain(akunId: string): Promise<boolean> {
  const lain = await prisma.akun.count({
    where: {
      id: { not: akunId },
      aktif: true,
      roles: { some: { role: { in: ["ADMIN", "TU"] } } },
    },
  });
  return lain > 0;
}

export async function buatAkunAction(formData: FormData) {
  await wajibAdminAction();

  const parsed = z
    .object({ username: usernameSchema, nama: namaSchema, password: passwordSchema })
    .safeParse({
      username: formData.get("username"),
      nama: formData.get("nama"),
      password: formData.get("password"),
    });
  if (!parsed.success) {
    redirectDenganError(LIST_PATH, parsed.error.issues[0]?.message ?? "Data tidak valid.");
  }

  const roles = bacaRoles(formData);
  const ustadzId = bacaUstadzId(formData);

  if (ustadzId) {
    const pesan = await cekTautanUstadz(ustadzId);
    if (pesan) redirectDenganError(LIST_PATH, pesan);
  }

  const sudahAda = await prisma.akun.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });
  if (sudahAda) redirectDenganError(LIST_PATH, "Username sudah dipakai akun lain.");

  const akun = await prisma.akun.create({
    data: {
      username: parsed.data.username,
      nama: parsed.data.nama,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      ustadzId,
      roles: { create: roles.map((role) => ({ role })) },
    },
  });

  revalidatePath(LIST_PATH);
  redirect(`${LIST_PATH}/${akun.id}?baru=1`);
}

export async function perbaruiAkunAction(id: string, formData: FormData) {
  const pelaku = await wajibAdminAction();
  const editPath = `${LIST_PATH}/${id}`;

  const parsed = namaSchema.safeParse(formData.get("nama"));
  if (!parsed.success) {
    redirectDenganError(editPath, parsed.error.issues[0]?.message ?? "Data tidak valid.");
  }

  const roles = bacaRoles(formData);
  const ustadzId = bacaUstadzId(formData);
  const aktif = formData.get("aktif") !== null;

  const akun = await prisma.akun.findUnique({ where: { id }, select: { id: true } });
  if (!akun) redirectDenganError(LIST_PATH, "Akun tidak ditemukan.");

  if (ustadzId) {
    const pesan = await cekTautanUstadz(ustadzId, id);
    if (pesan) redirectDenganError(editPath, pesan);
  }

  // Akun ini tetap pengelola (ADMIN/TU aktif) setelah perubahan?
  const tetapPengelola = aktif && (roles.includes("ADMIN") || roles.includes("TU"));
  if (!tetapPengelola && !(await masihAdaPengelolaLain(id))) {
    redirectDenganError(
      editPath,
      pelaku.id === id
        ? "Tidak bisa: Anda satu-satunya ADMIN/TU aktif. Buat/aktifkan akun ADMIN/TU lain dulu."
        : "Tidak bisa: harus tersisa minimal satu akun ADMIN/TU yang aktif.",
    );
  }

  await prisma.$transaction([
    prisma.akun.update({
      where: { id },
      data: { nama: parsed.data, aktif, ustadzId },
    }),
    prisma.akunRole.deleteMany({ where: { akunId: id } }),
    prisma.akunRole.createMany({ data: roles.map((role) => ({ akunId: id, role })) }),
    // Tautan anak hanya bermakna untuk WALI: bersihkan kalau role WALI dicabut.
    ...(roles.includes("WALI") ? [] : [prisma.waliSantri.deleteMany({ where: { akunId: id } })]),
  ]);

  revalidatePath(LIST_PATH);
  redirect(`${editPath}?tersimpan=1`);
}

export async function resetPasswordAction(id: string, formData: FormData) {
  await wajibAdminAction();
  const editPath = `${LIST_PATH}/${id}`;

  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    redirectDenganError(editPath, parsed.error.issues[0]?.message ?? "Password tidak valid.");
  }

  const akun = await prisma.akun.findUnique({ where: { id }, select: { id: true } });
  if (!akun) redirectDenganError(LIST_PATH, "Akun tidak ditemukan.");

  await prisma.akun.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(parsed.data, 10) },
  });

  redirect(`${editPath}?password=1`);
}

/** Simpan daftar anak (santri) untuk akun WALI. Daftar dikirim sebagai checkbox `santriId`. */
export async function simpanAnakWaliAction(id: string, formData: FormData) {
  await wajibAdminAction();
  const editPath = `${LIST_PATH}/${id}`;

  const akun = await prisma.akun.findUnique({
    where: { id },
    select: { roles: { select: { role: true } } },
  });
  if (!akun) redirectDenganError(LIST_PATH, "Akun tidak ditemukan.");
  if (!akun.roles.some((r) => r.role === "WALI")) {
    redirectDenganError(editPath, "Akun ini belum berrole WALI. Tambahkan role WALI dulu.");
  }

  const dipilih = [
    ...new Set(
      formData
        .getAll("santriId")
        .filter((v): v is string => typeof v === "string" && v.trim() !== ""),
    ),
  ];
  // Hanya santri yang benar-benar ada (buang id palsu dari form).
  const valid = await prisma.santri.findMany({
    where: { id: { in: dipilih } },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.waliSantri.deleteMany({ where: { akunId: id } }),
    prisma.waliSantri.createMany({ data: valid.map((s) => ({ akunId: id, santriId: s.id })) }),
  ]);

  revalidatePath(editPath);
  redirect(`${editPath}?anak=1`);
}
