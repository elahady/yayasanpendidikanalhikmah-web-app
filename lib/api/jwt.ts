import { SignJWT, jwtVerify } from "jose";

/**
 * Token akses REST API v1: JWT HS256, berlaku 30 hari, tanpa refresh token.
 * Isi token minimal (hanya `sub` = id akun); role & status aktif SELALU dibaca
 * ulang dari database di setiap request (lihat lib/akun.ts), jadi menonaktifkan
 * akun atau mengubah role langsung berlaku.
 *
 * Kunci memakai `AUTH_SECRET` yang sama dengan NextAuth (tidak perlu env baru).
 * Token web (NextAuth) berformat JWE terenkripsi, jadi tidak bisa tertukar
 * dengan token API; `iss`/`aud` juga dipisahkan.
 */

const ISSUER = "alhikmah-web";
const AUDIENCE = "alhikmah-api-v1";
export const MASA_BERLAKU_TOKEN = "30d";

function kunci(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET belum diset.");
  return new TextEncoder().encode(secret);
}

export async function buatToken(akunId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(akunId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(MASA_BERLAKU_TOKEN)
    .sign(kunci());
}

/** Kembalikan id akun dari token yang sah, atau null kalau rusak/kedaluwarsa. */
export async function verifikasiToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, kunci(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
