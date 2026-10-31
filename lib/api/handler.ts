import type { NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { AuthzError, type Actor } from "@/lib/authz";
import { muatActor } from "@/lib/akun";
import { ApiError, responsError } from "@/lib/api/errors";
import { verifikasiToken } from "@/lib/api/jwt";

/**
 * Pembungkus route handler REST API v1: menangani error secara seragam
 * (ApiError, AuthzError, ZodError, error tak terduga) dan, untuk varian
 * `terautentikasi`, memverifikasi `Authorization: Bearer <JWT>` lalu memuat
 * akun dari database (akun nonaktif / sudah dihapus -> 401).
 */

type Konteks<P> = { params: Promise<P> };

function keResponsError(err: unknown): Response {
  if (err instanceof ApiError) return responsError(err);
  if (err instanceof AuthzError) return responsError(new ApiError(err.code, err.message));
  if (err instanceof ZodError) {
    return responsError(new ApiError("VALIDATION", pesanZod(err)));
  }
  console.error("[api/v1] error tak terduga:", err);
  return responsError(new ApiError("INTERNAL", "Terjadi kesalahan pada server."));
}

export function pesanZod(err: ZodError): string {
  const isu = err.issues[0];
  if (!isu) return "Data tidak valid.";
  const lokasi = isu.path.length > 0 ? `${isu.path.join(".")}: ` : "";
  return `${lokasi}${isu.message}`;
}

export function publik<P = Record<string, never>>(
  fn: (req: NextRequest, ctx: Konteks<P>) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: Konteks<P>): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      return keResponsError(err);
    }
  };
}

export function terautentikasi<P = Record<string, never>>(
  fn: (req: NextRequest, ctx: Konteks<P>, actor: Actor) => Promise<Response>,
) {
  return publik<P>(async (req, ctx) => {
    const actor = await autentikasi(req);
    return fn(req, ctx, actor);
  });
}

async function autentikasi(req: NextRequest): Promise<Actor> {
  const header = req.headers.get("authorization") ?? "";
  const cocok = /^Bearer\s+(\S+)$/i.exec(header);
  if (!cocok) {
    throw new ApiError("UNAUTHENTICATED", "Token tidak ditemukan. Silakan login.");
  }
  const akunId = await verifikasiToken(cocok[1]);
  if (!akunId) {
    throw new ApiError("UNAUTHENTICATED", "Sesi tidak valid atau sudah berakhir. Silakan login ulang.");
  }
  const actor = await muatActor(akunId);
  if (!actor) {
    throw new ApiError("UNAUTHENTICATED", "Akun tidak ditemukan atau dinonaktifkan.");
  }
  return actor;
}

/** Baca & validasi body JSON; body bukan JSON / tidak sesuai skema -> VALIDATION (422). */
export async function bacaBody<T>(req: NextRequest, skema: ZodType<T>): Promise<T> {
  let mentah: unknown;
  try {
    mentah = await req.json();
  } catch {
    throw new ApiError("VALIDATION", "Body harus berupa JSON yang valid.");
  }
  const hasil = skema.safeParse(mentah);
  if (!hasil.success) throw new ApiError("VALIDATION", pesanZod(hasil.error));
  return hasil.data;
}

/** Validasi query string. */
export function bacaQuery<T>(req: NextRequest, skema: ZodType<T>): T {
  const mentah: Record<string, string> = {};
  for (const [k, v] of req.nextUrl.searchParams) mentah[k] = v;
  const hasil = skema.safeParse(mentah);
  if (!hasil.success) throw new ApiError("VALIDATION", pesanZod(hasil.error));
  return hasil.data;
}

/** True kalau error Prisma karena unique constraint (P2002), mis. dua upsert bersamaan. */
export function adalahBentrokUnik(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
