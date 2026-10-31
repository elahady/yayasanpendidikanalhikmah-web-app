import { z } from "zod";
import { JILID_ORDER } from "@/lib/labels";

/** Skema validasi input REST API v1 (pesan error Bahasa Indonesia). */

const PESAN_TANGGAL = "Tanggal harus berformat YYYY-MM-DD dan berupa tanggal yang valid.";

/** Tanggal "YYYY-MM-DD" yang benar-benar ada di kalender (menolak 2026-02-31). */
export const tanggalSchema = z
  .string({ error: PESAN_TANGGAL })
  .regex(/^\d{4}-\d{2}-\d{2}$/, PESAN_TANGGAL)
  .refine((v) => {
    const d = new Date(`${v}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, PESAN_TANGGAL);

/** String "YYYY-MM-DD" -> Date UTC tengah malam (dipakai kolom `@db.Date`). */
export function keDate(tanggal: string): Date {
  return new Date(`${tanggal}T00:00:00.000Z`);
}

/** Date kolom `@db.Date` -> "YYYY-MM-DD". */
export function keTanggalStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const idSchema = (nama: string) =>
  z
    .string({ error: `${nama} wajib diisi.` })
    .trim()
    .min(1, `${nama} wajib diisi.`)
    .max(191, `${nama} tidak valid.`);

const keteranganSchema = z
  .string({ error: "keterangan harus berupa teks." })
  .trim()
  .max(191, "keterangan maksimal 191 karakter.")
  .nullish()
  .transform((v) => (v ? v : null));

export const loginBodySchema = z.object({
  username: z
    .string({ error: "username wajib diisi." })
    .trim()
    .min(1, "username wajib diisi.")
    .max(191, "username terlalu panjang."),
  password: z
    .string({ error: "password wajib diisi." })
    .min(1, "password wajib diisi.")
    .max(200, "password terlalu panjang."),
});

export const daftarSantriQuerySchema = z.object({
  q: z.string().trim().max(100, "q maksimal 100 karakter.").optional(),
});

export const absensiSantriQuerySchema = z
  .object({
    tanggal: tanggalSchema.optional(),
    santriId: idSchema("santriId").optional(),
    dari: tanggalSchema.optional(),
    sampai: tanggalSchema.optional(),
  })
  .superRefine((q, ctx) => {
    if (!q.tanggal && !q.santriId) {
      ctx.addIssue({
        code: "custom",
        message: "Isi tanggal=YYYY-MM-DD, atau santriId (dengan dari/sampai opsional).",
      });
    }
    if (q.tanggal && q.santriId) {
      ctx.addIssue({
        code: "custom",
        message: "Pilih salah satu mode: tanggal, atau santriId.",
      });
    }
    if (q.dari && q.sampai && q.dari > q.sampai) {
      ctx.addIssue({ code: "custom", message: "dari tidak boleh setelah sampai." });
    }
  });

export const absensiUstadzQuerySchema = z.object({ tanggal: tanggalSchema });
export const rekapQuerySchema = z.object({ tanggal: tanggalSchema });
export const dashboardQuerySchema = z.object({ tanggal: tanggalSchema.optional() });

/** Aturan panjang/beda password dicek di lib/password.ts; di sini hanya tipe datanya. */
export const ubahPasswordBodySchema = z.object({
  passwordLama: z.string({ error: "passwordLama wajib diisi." }).min(1, "passwordLama wajib diisi."),
  passwordBaru: z.string({ error: "passwordBaru wajib diisi." }),
});

export const putAbsensiSantriSchema = z.object({
  santriId: idSchema("santriId"),
  tanggal: tanggalSchema,
  hadir: z.boolean({ error: "hadir harus true atau false." }),
  keterangan: keteranganSchema,
});

export const putAbsensiUstadzSchema = z.object({
  ustadzId: idSchema("ustadzId"),
  tanggal: tanggalSchema,
  hadir: z.boolean({ error: "hadir harus true atau false." }),
  keterangan: keteranganSchema,
});

export const patchProgressSchema = z
  .object({
    jilidSaatIni: z
      .enum(JILID_ORDER as [string, ...string[]], {
        error: `jilidSaatIni harus salah satu dari: ${JILID_ORDER.join(", ")}.`,
      })
      .optional(),
    catatanProgressMadin: z
      .string({ error: "catatanProgressMadin harus berupa teks atau null." })
      .trim()
      .max(5000, "catatanProgressMadin maksimal 5000 karakter.")
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v)),
  })
  .refine((b) => b.jilidSaatIni !== undefined || b.catatanProgressMadin !== undefined, {
    message: "Isi jilidSaatIni dan/atau catatanProgressMadin.",
  });
