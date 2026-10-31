import bcrypt from "bcryptjs";
import type { Actor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  catatGantiPasswordBerhasil,
  catatPasswordLamaSalah,
  detikSampaiBolehGantiPassword,
} from "@/lib/rate-limit";

/** Gagal ubah password; `message` sudah berbahasa Indonesia dan aman ditampilkan apa adanya. */
export class PasswordError extends Error {
  constructor(
    readonly code: "PASSWORD_LAMA_SALAH" | "PASSWORD_BARU_TIDAK_VALID" | "RATE_LIMITED",
    message: string,
    /** Detik sampai boleh mencoba lagi (hanya untuk RATE_LIMITED). */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "PasswordError";
  }
}

const MIN_PANJANG = 8;
/** bcrypt hanya memakai 72 byte pertama; kita tolak yang lebih panjang daripada memotongnya diam-diam. */
const MAKS_BYTE = 72;
/** Cost bcrypt yang sama dengan seed, pembuatan akun, dan reset password admin. */
const BCRYPT_ROUNDS = 10;

/**
 * Ubah password akun pemanggil sendiri (dipakai `POST /me/password` dan server action web).
 * Aturan: docs/api-contract.md. Melempar [PasswordError] bila ditolak.
 * Token/sesi yang sudah terbit tetap berlaku (tidak ada pencabutan).
 */
export async function ubahPasswordSendiri(
  actor: Actor,
  passwordLama: string,
  passwordBaru: string,
): Promise<void> {
  // 1) Bentuk password baru (tidak menghabiskan jatah percobaan).
  if (passwordBaru.length < MIN_PANJANG) {
    throw new PasswordError(
      "PASSWORD_BARU_TIDAK_VALID",
      `Password baru minimal ${MIN_PANJANG} karakter.`,
    );
  }
  if (Buffer.byteLength(passwordBaru, "utf8") > MAKS_BYTE) {
    throw new PasswordError(
      "PASSWORD_BARU_TIDAK_VALID",
      `Password baru maksimal ${MAKS_BYTE} karakter.`,
    );
  }
  if (passwordBaru === passwordLama) {
    throw new PasswordError(
      "PASSWORD_BARU_TIDAK_VALID",
      "Password baru harus berbeda dari password sekarang.",
    );
  }

  // 2) Batas percobaan salah per akun (5 / 15 menit). Dicek sebelum membandingkan hash,
  //    jadi akun yang sedang terkunci tidak bisa dipakai menebak password lama.
  const tunggu = detikSampaiBolehGantiPassword(actor.id);
  if (tunggu > 0) {
    throw new PasswordError(
      "RATE_LIMITED",
      `Terlalu banyak percobaan salah. Coba lagi dalam ${Math.ceil(tunggu / 60)} menit.`,
      tunggu,
    );
  }

  // 3) Password lama.
  const akun = await prisma.akun.findUnique({
    where: { id: actor.id },
    select: { passwordHash: true },
  });
  const cocok = akun ? await bcrypt.compare(passwordLama, akun.passwordHash) : false;
  if (!akun || !cocok) {
    catatPasswordLamaSalah(actor.id);
    throw new PasswordError("PASSWORD_LAMA_SALAH", "Password sekarang salah.");
  }

  // 4) Simpan hash baru.
  await prisma.akun.update({
    where: { id: actor.id },
    data: { passwordHash: await bcrypt.hash(passwordBaru, BCRYPT_ROUNDS) },
  });
  catatGantiPasswordBerhasil(actor.id);
}
