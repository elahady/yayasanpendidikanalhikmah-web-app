"use client";

/**
 * Batas galat untuk semua halaman /admin: kalau pemuatan data gagal (mis. database tidak terjangkau),
 * tampilkan pesan Indonesia dan tombol coba lagi, bukan layar galat bawaan Next.
 */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-[20px] border border-border bg-bg-elevated p-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Halaman belum bisa dimuat</h1>
      <p className="text-ink-muted">
        Terjadi gangguan saat mengambil data. Coba lagi sebentar. Kalau masih berulang, hubungi pengelola aplikasi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-transparent bg-primary px-[18px] text-sm font-bold text-bg transition hover:opacity-90"
      >
        Coba lagi
      </button>
    </div>
  );
}
