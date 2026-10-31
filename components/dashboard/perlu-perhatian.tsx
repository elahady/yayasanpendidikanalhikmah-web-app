import Link from "next/link";
import type { Perhatian, PerhatianAksi, PerhatianKode } from "@/lib/dashboard-types";
import { kartu, judulKartu, tombolGhost, tombolUtama } from "./gaya";
import { IkonBuku, IkonJam, IkonLolos, IkonOrang, IkonPeringatan, IkonTambah } from "./ikon";
import { Pill } from "./pill";

const TUJUAN: Record<PerhatianAksi, string> = {
  ABSENSI_SANTRI: "/admin/absensi-santri",
  ABSENSI_USTADZ: "/admin/absensi-ustadz",
  DAFTAR_SANTRI: "/admin/santri",
};

const TOMBOL: Record<PerhatianKode, string> = {
  SANTRI_BELUM_DICATAT: "Catat sekarang",
  SANTRI_ABSEN_BERUNTUN: "Lihat santri",
  USTADZ_BELUM_DICATAT: "Catat",
  PROGRESS_LAMA: "Tinjau",
};

function Ikon({ kode }: { kode: PerhatianKode }) {
  switch (kode) {
    case "SANTRI_BELUM_DICATAT":
      return <IkonJam />;
    case "SANTRI_ABSEN_BERUNTUN":
      return <IkonPeringatan />;
    case "USTADZ_BELUM_DICATAT":
      return <IkonOrang />;
    case "PROGRESS_LAMA":
      return <IkonBuku />;
  }
}

export function PerluPerhatian({
  perhatian,
  belumAdaSantri,
}: {
  perhatian: Perhatian[];
  belumAdaSantri: boolean;
}) {
  return (
    <section aria-labelledby="judul-perhatian" className={`${kartu} flex flex-col gap-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="judul-perhatian" className={judulKartu}>
          Perlu perhatian
        </h2>
        {perhatian.length > 0 && <Pill varian="no">{perhatian.length} hal</Pill>}
      </div>

      {belumAdaSantri && perhatian.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border-t border-border pt-4">
          <p className="text-sm text-ink-muted">
            Belum ada santri terdaftar, jadi belum ada yang perlu dipantau. Mulai dengan menambahkan
            santri.
          </p>
          <Link href="/admin/santri" className={tombolUtama}>
            <IkonTambah />
            Tambah santri
          </Link>
        </div>
      ) : perhatian.length === 0 ? (
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ok-bg text-ok">
            <IkonLolos />
          </span>
          <div>
            <p className="font-bold text-ink">Semua beres hari ini</p>
            <p className="text-[13px] text-ink-muted">
              Absensi sudah tercatat dan tidak ada yang perlu ditindaklanjuti.
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col">
          {perhatian.map((p) => (
            <li
              key={p.kode}
              className="flex flex-wrap items-center gap-3 border-t border-border py-3.5 last:pb-0"
            >
              <span
                className={
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
                  (p.kode === "SANTRI_ABSEN_BERUNTUN" ? "bg-no-bg text-no" : "bg-bg-muted text-ink")
                }
              >
                <Ikon kode={p.kode} />
              </span>
              <div className="min-w-0 flex-[1_1_220px]">
                <p className="font-bold text-ink">{p.judul}</p>
                <p className="text-[13px] text-ink-muted">{p.keterangan}</p>
              </div>
              <Link
                href={TUJUAN[p.aksi]}
                aria-label={`${TOMBOL[p.kode]}: ${p.judul}`}
                className={tombolGhost}
              >
                {TOMBOL[p.kode]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
