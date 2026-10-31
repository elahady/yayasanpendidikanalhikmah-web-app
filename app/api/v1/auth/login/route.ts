import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { muatActor } from "@/lib/akun";
import { ApiError } from "@/lib/api/errors";
import { bacaBody, publik } from "@/lib/api/handler";
import { buatToken } from "@/lib/api/jwt";
import { loginBodySchema } from "@/lib/api/validasi";
import { muatProfil } from "@/lib/profil";
import {
  catatLoginBerhasil,
  catatLoginGagal,
  detikSampaiBolehLogin,
  ipDariHeaders,
} from "@/lib/rate-limit";

// Hash bcrypt palsu supaya waktu respons tetap sama walau username tidak ada
// (mencegah menebak username lewat selisih waktu).
const HASH_PALSU = bcrypt.hashSync("hash-palsu-tidak-dipakai", 10);

export const POST = publik(async (req) => {
  const { username, password } = await bacaBody(req, loginBodySchema);
  const ip = ipDariHeaders(req.headers);

  const tunggu = detikSampaiBolehLogin(username, ip);
  if (tunggu > 0) {
    throw new ApiError(
      "RATE_LIMITED",
      `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(tunggu / 60)} menit.`,
      { "Retry-After": String(tunggu) },
    );
  }

  const akun = await prisma.akun.findUnique({ where: { username } });
  const cocok = await bcrypt.compare(password, akun?.passwordHash ?? HASH_PALSU);
  if (!akun || !cocok) {
    catatLoginGagal(username, ip);
    throw new ApiError("UNAUTHENTICATED", "Username atau password salah.");
  }
  if (!akun.aktif) {
    // Password benar tapi akun dinonaktifkan: beri tahu jelas (bukan salah password).
    throw new ApiError("FORBIDDEN", "Akun Anda dinonaktifkan. Hubungi pengurus TPQ.");
  }

  catatLoginBerhasil(username, ip);
  const actor = await muatActor(akun.id);
  if (!actor) throw new ApiError("UNAUTHENTICATED", "Akun tidak ditemukan.");

  return Response.json({ accessToken: await buatToken(akun.id), user: await muatProfil(actor) });
});
