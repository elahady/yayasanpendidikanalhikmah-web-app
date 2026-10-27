const pengurus = [
  { jabatan: "Direktur", nama: "H. Tri Joko Mulyoto, S.Pd." },
  { jabatan: "Sekretaris 1", nama: "H.M. Roziq Rizal Al Ahadi, ST" },
  { jabatan: "Sekretaris 2", nama: "Donny Marjadi, S.Pd." },
  { jabatan: "Bendahara", nama: "H. Kholil, S.Pd." },
  { jabatan: "Anggota", nama: "H. Sutarsono, S.Pd." },
  { jabatan: "Kepala TPQ", nama: "Siti Aminah, S.Pd." },
  { jabatan: "Kepala TU", nama: "Donny Marjadi, S.Pd." },
  { jabatan: "Kepala Madrasah Diniyah", nama: "H.M. Roziq Rizal Al Ahadi, ST" },
];

export default function StrukturOrganisasiPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 pb-20 pt-4">
      <div className="space-y-3">
        <span className="text-[13px] font-bold uppercase tracking-widest text-link">Struktur Organisasi</span>
        <h1 className="font-display text-[40px] font-semibold text-ink">Susunan Pengurus</h1>
        <p className="max-w-2xl text-[16px] leading-relaxed text-ink-muted">
          Susunan pengurus Yayasan Pendidikan Al-Hikmah.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pengurus.map(({ jabatan, nama }) => (
          <div key={jabatan} className="flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-muted text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.4"></circle>
                <path d="M4.5 20C4.5 16 7.8 13 12 13C16.2 13 19.5 16 19.5 20"></path>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-ink">{jabatan}</p>
              <p className="mt-0.5 text-sm text-ink-subtle">{nama}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
