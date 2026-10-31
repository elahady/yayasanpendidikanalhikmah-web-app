"use server";

import { signOut } from "@/auth";
import { PasswordError, ubahPasswordSendiri } from "@/lib/password";
import { wajibAdminAction } from "@/lib/web-auth";
import type { HasilUbahPassword } from "./types";

function teks(formData: FormData, nama: string): string {
  const v = formData.get(nama);
  return typeof v === "string" ? v : "";
}

export async function ubahPasswordAction(
  _sebelumnya: HasilUbahPassword,
  formData: FormData,
): Promise<HasilUbahPassword> {
  const actor = await wajibAdminAction();

  const lama = teks(formData, "passwordLama");
  const baru = teks(formData, "passwordBaru");
  const ulang = teks(formData, "passwordUlang");

  if (!lama) return { status: "gagal", pesan: "Password sekarang wajib diisi." };
  if (!baru) return { status: "gagal", pesan: "Password baru wajib diisi." };
  // Dicek di server (bukan hanya di browser) supaya salah ketik tidak mengunci pemilik akun.
  if (baru !== ulang) {
    return { status: "gagal", pesan: "Ulangi password baru tidak sama dengan password baru." };
  }

  try {
    await ubahPasswordSendiri(actor, lama, baru);
  } catch (err) {
    if (err instanceof PasswordError) return { status: "gagal", pesan: err.message };
    throw err;
  }
  return { status: "ok", pesan: "Password berhasil diubah." };
}

export async function keluarAction() {
  await signOut({ redirectTo: "/admin/login" });
}
