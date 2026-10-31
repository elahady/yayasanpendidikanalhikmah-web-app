import { ApiError } from "@/lib/api/errors";
import { publik } from "@/lib/api/handler";

// Rute /api/v1/* yang tidak dikenal: balas JSON error seragam (bukan halaman HTML 404).
const tidakDitemukan = publik<{ rest: string[] }>(async () => {
  throw new ApiError("NOT_FOUND", "Endpoint tidak ditemukan.");
});

export const GET = tidakDitemukan;
export const POST = tidakDitemukan;
export const PUT = tidakDitemukan;
export const PATCH = tidakDitemukan;
export const DELETE = tidakDitemukan;
