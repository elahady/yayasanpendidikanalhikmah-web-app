import { Callout } from "../_components/Callout";

const ciriKhas = [
  {
    title: "Ketukan & Klasikal",
    desc: "Santri membaca bersama-sama dengan tempo yang dijaga lewat ketukan (titian murottal), melatih kelancaran dan konsistensi bacaan.",
    icon: (
      <>
        <path d="M9 18V5L20 3V16"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="17" cy="16" r="3"></circle>
      </>
    ),
  },
  {
    title: "Individual (Musyafahah)",
    desc: "Setelah tahap klasikal, bacaan tiap santri dikoreksi satu-per-satu oleh ustadz/ustadzah.",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.2"></circle>
        <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20"></path>
      </>
    ),
  },
];

const jilidList = [
  { label: "0", title: "Pra Nahdhiyah", desc: "Pengenalan dasar sebelum masuk Jilid 1.", tone: "muted" as const },
  { label: "1", title: "Jilid 1", desc: "Huruf hijaiyah dan makharijul huruf (tempat keluarnya huruf).", tone: "primary" as const },
  { label: "2–3", title: "Jilid 2 – 3", desc: "Lanjutan materi dasar. (detail isi belum terverifikasi dari riset)", tone: "primary" as const },
  { label: "4", title: "Jilid 4", desc: "Nun sukun, tanwin, dan mad.", tone: "primary" as const },
  { label: "5", title: "Jilid 5", desc: "Waqaf (tanda berhenti) dan pendalaman materi jilid sebelumnya.", tone: "primary" as const },
  { label: "6", title: "Jilid 6", desc: "Izhar halqi, mulai masuk Juz 1 — menjembatani ke bacaan Al-Qur'an langsung.", tone: "primary" as const },
  { label: "✓", title: "Sudah Al-Qur'an", desc: "Santri membaca langsung mushaf Al-Qur'an.", tone: "accent" as const },
];

const toneClasses = {
  muted: "bg-bg-muted text-primary",
  primary: "bg-primary text-bg",
  accent: "bg-accent text-white",
};

export default function KurikulumTpqPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      <div className="pt-4">
        <span className="text-[13px] font-bold uppercase tracking-widest text-link">Kurikulum TPQ</span>
        <h1 className="mt-2.5 max-w-2xl font-display text-[40px] font-semibold text-ink">Metode An-Nahdhiyah</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-muted">
          Metode cepat tanggap belajar Al-Qur&apos;an (CTBA) yang lahir dari Lembaga Pendidikan (LP) Ma&apos;arif
          NU Tulungagung, Jawa Timur, bersama para kiai dan ahli pengajaran Al-Qur&apos;an setempat — salah satu
          penginisiasinya adalah KH. Munawwir Kholid. Dibina secara nasional oleh Pimpinan Pusat Majelis Pembina
          (MABIN) TPQ An-Nahdliyah.
        </p>
      </div>

      <div className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Ciri Khas Pengajaran</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ciriKhas.map((c) => (
            <div key={c.title} className="flex flex-col gap-3 rounded-[18px] border border-border bg-bg-elevated p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-muted text-primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {c.icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-ink">{c.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-1.5 font-display text-2xl font-semibold text-ink">Struktur Jilid</h2>
        <p className="mb-8 text-[15px] text-ink-muted">
          Tujuh tahap belajar, dari pengenalan huruf hingga siap membaca Al-Qur&apos;an langsung.
        </p>
        <ol className="max-w-2xl">
          {jilidList.map((j, i) => (
            <li key={j.title} className="relative flex gap-5 pb-8 pl-0 last:pb-0">
              <div className="relative flex flex-col items-center">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${toneClasses[j.tone]}`}
                >
                  {j.label}
                </span>
                {i < jilidList.length - 1 && <span className="mt-1 w-px flex-1 bg-border-strong" aria-hidden="true"></span>}
              </div>
              <div className="pb-2">
                <h4 className="mb-1 text-[16px] font-bold text-ink">{j.title}</h4>
                <p className="text-sm leading-relaxed text-ink-muted">{j.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16 max-w-2xl">
        <Callout variant="catatan">
          <p>
            Ringkasan ini disusun dari riset sumber publik (situs NU wilayah/cabang dan skripsi kampus), bukan
            dokumen resmi tunggal dari LP Ma&apos;arif NU — detail teknis sebaiknya dikonfirmasi saat pelatihan
            resmi.
          </p>
        </Callout>
      </div>
    </div>
  );
}
