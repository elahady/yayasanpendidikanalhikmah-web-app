import Link from "next/link";
import type { TrenHari } from "@/lib/dashboard-types";
import { kartu, judulKartu, tombolGhost } from "./gaya";
import { persen, tanggalPendek } from "./format";

/**
 * Grafik batang kehadiran santri per hari belajar (CSS murni). Batang aria-hidden;
 * isinya tersedia sebagai tabel sr-only supaya angka per hari bisa dibaca pembaca layar.
 */
export function GrafikKehadiran({
  tren,
  hariIni,
  belumDicatatHariIni,
}: {
  tren: TrenHari[];
  hariIni: string;
  belumDicatatHariIni: number;
}) {
  if (tren.length === 0) {
    return (
      <section aria-labelledby="judul-tren" className={`${kartu} flex flex-col gap-4`}>
        <h2 id="judul-tren" className={judulKartu}>
          Kehadiran santri 14 hari terakhir
        </h2>
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-bg-muted p-4">
          <p className="text-sm text-ink-muted">
            Belum ada data kehadiran. Grafik akan muncul setelah absensi santri dicatat.
          </p>
          <Link href="/admin/absensi-santri" className={tombolGhost}>
            Catat absensi
          </Link>
        </div>
      </section>
    );
  }

  const baris = tren.map((h) => ({ ...h, persen: persen(h.hadir, h.tercatat) }));
  const totalHadir = tren.reduce((a, h) => a + h.hadir, 0);
  const totalTercatat = tren.reduce((a, h) => a + h.tercatat, 0);
  const rata = persen(totalHadir, totalTercatat);
  const terakhir = baris[baris.length - 1];
  const terakhirHariIni = terakhir.tanggal === hariIni;

  return (
    <section aria-labelledby="judul-tren" className={`${kartu} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="judul-tren" className={judulKartu}>
          Kehadiran santri 14 hari terakhir
        </h2>
        <span className="text-[13px] text-ink-muted">rata-rata {rata}%</span>
      </div>

      <div
        aria-hidden="true"
        className="flex h-36 items-end gap-1.5 border-b border-border-strong sm:gap-2"
      >
        {baris.map((h, i) => {
          const sorot = terakhirHariIni && i === baris.length - 1;
          return (
            <div
              key={h.tanggal}
              title={`${tanggalPendek(h.tanggal)}: ${h.hadir} dari ${h.tercatat} hadir (${h.persen}%)`}
              style={{ height: `${Math.max(h.persen, 2)}%` }}
              className={`flex-1 rounded-t-md ${sorot ? "bg-accent" : "bg-primary/55"}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between gap-3 text-xs text-ink-muted">
        <span>{tanggalPendek(baris[0].tanggal)}</span>
        <span>
          {terakhirHariIni ? "Hari ini" : tanggalPendek(terakhir.tanggal)} · {terakhir.persen}%
          {terakhirHariIni && belumDicatatHariIni > 0 ? " (belum final)" : ""}
        </span>
      </div>

      <table className="sr-only">
        <caption>Kehadiran santri per hari belajar, rata-rata {rata}%</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Hadir</th>
            <th scope="col">Tercatat</th>
            <th scope="col">Persentase</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((h) => (
            <tr key={h.tanggal}>
              <th scope="row">{tanggalPendek(h.tanggal)}</th>
              <td>{h.hadir}</td>
              <td>{h.tercatat}</td>
              <td>{h.persen}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
