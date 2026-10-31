import Link from "next/link";
import { hariBelajarTerakhir, PESAN_LIBUR } from "@/lib/jadwal";
import { formatTanggalIndonesia } from "@/lib/labels";

/**
 * Pemberitahuan di halaman absensi bila tanggal terpilih libur (Sabtu/Minggu).
 * Maknanya selalu ada di teks (bukan hanya warna). `ditolak` = pengiriman form libur baru
 * saja ditolak server action; pesannya `PESAN_LIBUR`.
 */
export function PemberitahuanLibur({
  tanggal,
  halaman,
  ditolak = false,
}: {
  /** YYYY-MM-DD */
  tanggal: string;
  /** Path halaman absensi, mis. "/admin/absensi-santri" */
  halaman: string;
  ditolak?: boolean;
}) {
  const terakhir = hariBelajarTerakhir(tanggal);
  return (
    <div
      role={ditolak ? "alert" : "status"}
      className="flex flex-col gap-2 rounded-xl border border-border-strong bg-bg-muted px-4 py-3 text-sm text-ink"
    >
      <p className="font-bold">
        {formatTanggalIndonesia(new Date(tanggal))} libur — TPQ belajar Senin–Jumat
      </p>
      {ditolak && <p>{PESAN_LIBUR}</p>}
      <p className="text-ink-muted">
        Absensi tidak dapat dicatat pada hari libur. Data yang sudah terlanjur ada tetap
        ditampilkan di bawah.
      </p>
      <Link
        href={`${halaman}?tanggal=${terakhir}`}
        className="w-fit font-bold text-link underline underline-offset-2"
      >
        Ke hari belajar terakhir ({formatTanggalIndonesia(new Date(terakhir))})
      </Link>
    </div>
  );
}
