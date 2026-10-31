import Link from "next/link";
import { hariBelajarTerakhir } from "@/lib/jadwal";
import { eyebrow, kartu, tombolGhost } from "./gaya";
import { IkonJam } from "./ikon";

/**
 * Pengganti cincin kehadiran pada hari libur (Sabtu/Minggu): kehadiran 0% di hari libur
 * menyesatkan, jadi yang ditampilkan keadaan libur beserta jalan ke hari belajar terakhir.
 */
export function KartuLibur({ tanggal }: { tanggal: string }) {
  const terakhir = hariBelajarTerakhir(tanggal);
  return (
    <div className={`${kartu} flex items-center gap-5`}>
      <span
        aria-hidden="true"
        className="grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full bg-bg-muted text-ink-muted"
      >
        <span className="scale-[1.8]">
          <IkonJam />
        </span>
      </span>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className={eyebrow}>Hari ini libur</span>
        <span className="font-bold text-ink">TPQ belajar Senin–Jumat.</span>
        <span className="text-[13px] text-ink-muted">Kegiatan dilanjutkan hari Senin.</span>
        <Link href={`/admin/absensi-santri?tanggal=${terakhir}`} className={`${tombolGhost} mt-2`}>
          Ke hari belajar terakhir
        </Link>
      </div>
    </div>
  );
}
