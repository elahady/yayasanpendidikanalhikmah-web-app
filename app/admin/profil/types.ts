/** Hasil server action ubah password (dipakai useActionState di form-password.tsx). */
export type HasilUbahPassword =
  | { status: "diam" }
  | { status: "ok"; pesan: string }
  | { status: "gagal"; pesan: string };

export const AWAL_UBAH_PASSWORD: HasilUbahPassword = { status: "diam" };
