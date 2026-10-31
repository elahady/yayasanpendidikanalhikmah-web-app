import Link from "next/link";
import { wajibAdminHalaman } from "@/lib/web-auth";
import { muatDashboard } from "@/lib/dashboard";
import type { DashboardRingkasan } from "@/lib/dashboard-types";
import { AktivitasTerbaru } from "@/components/dashboard/aktivitas-terbaru";
import { persen, tanggalPanjang } from "@/components/dashboard/format";
import { eyebrow, kartu, tombolGhost, tombolUtama } from "@/components/dashboard/gaya";
import { GrafikKehadiran } from "@/components/dashboard/grafik-kehadiran";
import { IkonCentang, IkonTambah } from "@/components/dashboard/ikon";
import { PerluPerhatian } from "@/components/dashboard/perlu-perhatian";
import { Pill } from "@/components/dashboard/pill";
import { TanggaJilid } from "@/components/dashboard/tangga-jilid";

const angkaBesar = "font-display text-[40px] font-semibold leading-none text-ink";

export default async function AdminDashboardPage() {
  const actor = await wajibAdminHalaman();
  const data = await muatDashboard(actor);
  const r = data.ringkasan;

  return (
    <div className="flex flex-col gap-6">
      <Sapaan nama={actor.nama} tanggal={data.tanggal} ringkasan={r} />

      {r ? (
        <>
          <AngkaUtama ringkasan={r} />
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
              <PerluPerhatian perhatian={r.perhatian} belumAdaSantri={r.santri.total === 0} />
              <GrafikKehadiran
                tren={r.tren}
                hariIni={data.tanggal}
                belumDicatatHariIni={r.santri.belumDicatat}
              />
            </div>
            <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
              <TanggaJilid perJilid={r.santri.perJilid} total={r.santri.total} />
              <AktivitasTerbaru aktivitas={r.aktivitas} hariIni={data.tanggal} />
            </div>
          </div>
        </>
      ) : (
        <p className={`${kartu} text-sm text-ink-muted`}>
          Ringkasan belum tersedia untuk akun ini.
        </p>
      )}
    </div>
  );
}

function Sapaan({
  nama,
  tanggal,
  ringkasan,
}: {
  nama: string;
  tanggal: string;
  ringkasan: DashboardRingkasan | null;
}) {
  let kalimat: React.ReactNode = null;
  if (ringkasan) {
    const n = ringkasan.perhatian.length;
    if (n > 0) {
      kalimat = (
        <>
          Hari ini ada <strong className="text-ink">{n} hal</strong> yang perlu ditindaklanjuti
          sebelum kegiatan belajar selesai.
        </>
      );
    } else if (ringkasan.santri.total === 0) {
      kalimat = "Belum ada data santri. Mulai dengan menambahkan santri pertama.";
    } else {
      kalimat = "Semua beres hari ini. Tidak ada yang perlu ditindaklanjuti.";
    }
  }

  return (
    <section className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-col gap-1.5">
        <span className={eyebrow}>{tanggalPanjang(tanggal)}</span>
        <h1 className="font-display text-3xl font-medium leading-[1.15] text-ink sm:text-[40px]">
          Assalamu&apos;alaikum, {nama}
        </h1>
        {kalimat && <p className="max-w-xl text-ink-muted">{kalimat}</p>}
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Link href="/admin/absensi-santri" className={tombolUtama}>
          <IkonCentang />
          Catat absensi
        </Link>
        <Link href="/admin/santri" className={tombolGhost}>
          <IkonTambah />
          Tambah santri
        </Link>
        <Link href="/admin/akun" className={tombolGhost}>
          Buat akun
        </Link>
      </div>
    </section>
  );
}

function AngkaUtama({ ringkasan }: { ringkasan: DashboardRingkasan }) {
  const { santri, ustadz } = ringkasan;
  const persenHadir = persen(santri.hadir, santri.total);
  const alQuran = santri.perJilid.AL_QURAN ?? 0;
  const ustadzSemuaHadir = ustadz.total > 0 && ustadz.hadir === ustadz.total;

  return (
    <section
      aria-label="Ringkasan hari ini"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-4"
    >
      <div className={`${kartu} flex items-center gap-5`}>
        <div
          role="img"
          aria-label={
            santri.total > 0
              ? `${santri.hadir} dari ${santri.total} santri hadir (${persenHadir}%)`
              : "Belum ada santri terdaftar"
          }
          style={{
            background: `conic-gradient(var(--color-primary) 0 ${persenHadir}%, var(--color-track) 0)`,
          }}
          className="grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full"
        >
          <div
            aria-hidden="true"
            className="grid h-[78px] w-[78px] place-items-center rounded-full bg-bg-elevated font-display text-2xl font-semibold text-ink"
          >
            {santri.total > 0 ? `${persenHadir}%` : "–"}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className={eyebrow}>Santri hadir</span>
          {santri.total > 0 ? (
            <>
              <span>
                <strong>{santri.hadir}</strong> dari {santri.total} santri
              </span>
              <span className="text-[13px] text-ink-muted">
                {santri.tidakHadir} tidak hadir · {santri.belumDicatat} belum dicatat
              </span>
            </>
          ) : (
            <span className="text-[13px] text-ink-muted">Belum ada santri terdaftar</span>
          )}
        </div>
      </div>

      <div className={`${kartu} flex flex-col justify-center gap-2`}>
        <span className={eyebrow}>Ustadz &amp; ustadzah</span>
        {ustadz.total > 0 ? (
          <>
            <span className={angkaBesar}>
              {ustadz.hadir}{" "}
              <span className="font-sans text-xl font-medium text-ink-muted">
                dari {ustadz.total}
              </span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ustadzSemuaHadir && <Pill varian="ok">Semua hadir</Pill>}
              {ustadz.tidakHadir > 0 && <Pill varian="no">{ustadz.tidakHadir} tidak hadir</Pill>}
              {ustadz.belumDicatat > 0 && <Pill varian="na">{ustadz.belumDicatat} belum dicatat</Pill>}
            </div>
          </>
        ) : (
          <>
            <span className={angkaBesar}>0</span>
            <span className="text-[13px] text-ink-muted">Belum ada ustadz terdaftar</span>
          </>
        )}
      </div>

      <div className={`${kartu} flex flex-col justify-center gap-2`}>
        <span className={eyebrow}>Santri aktif</span>
        <span className={angkaBesar}>{santri.total}</span>
        <span className="text-[13px] text-ink-muted">
          {santri.perJenjang.ULA} jenjang Ula · {santri.perJenjang.WUSTHO} jenjang Wustho
        </span>
      </div>

      <div className={`${kartu} flex flex-col justify-center gap-2`}>
        <span className={eyebrow}>Sudah khatam jilid</span>
        <span className={angkaBesar}>{alQuran}</span>
        <span className="text-[13px] text-ink-muted">
          Sudah membaca Al-Qur&apos;an langsung ({persen(alQuran, santri.total)}%)
        </span>
      </div>
    </section>
  );
}
