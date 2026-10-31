import { ApiError } from "@/lib/api/errors";
import { bacaBody, terautentikasi } from "@/lib/api/handler";
import { ubahPasswordBodySchema } from "@/lib/api/validasi";
import { PasswordError, ubahPasswordSendiri } from "@/lib/password";

/** Ubah password akun sendiri. Salah password lama = 422 (bukan 401) agar app tidak mengira sesi habis. */
export const POST = terautentikasi(async (req, _ctx, actor) => {
  const { passwordLama, passwordBaru } = await bacaBody(req, ubahPasswordBodySchema);
  try {
    await ubahPasswordSendiri(actor, passwordLama, passwordBaru);
  } catch (err) {
    if (err instanceof PasswordError) {
      if (err.code === "RATE_LIMITED") {
        throw new ApiError("RATE_LIMITED", err.message, {
          "Retry-After": String(err.retryAfter ?? 900),
        });
      }
      throw new ApiError("VALIDATION", err.message);
    }
    throw err;
  }
  return Response.json({ ok: true });
});
