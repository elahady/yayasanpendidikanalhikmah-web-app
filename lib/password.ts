import type { Actor } from "@/lib/authz";

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

/**
 * Ubah password akun pemanggil sendiri (dipakai `POST /me/password` dan server action web).
 * Aturan: docs/api-contract.md. Melempar [PasswordError] bila ditolak.
 *
 * STUB — dikerjakan agent backend.
 */
export async function ubahPasswordSendiri(
  actor: Actor,
  passwordLama: string,
  passwordBaru: string,
): Promise<void> {
  void actor;
  void passwordLama;
  void passwordBaru;
  throw new Error("ubahPasswordSendiri belum diimplementasikan");
}
