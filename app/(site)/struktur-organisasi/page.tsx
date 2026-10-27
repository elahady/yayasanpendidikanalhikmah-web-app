import { Callout } from "../_components/Callout";

const posisi = ["Ketua", "Sekretaris", "Bendahara", "Kepala TPQ", "Kepala Madrasah Diniyah"];

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

      <Callout variant="placeholder">
        <p>
          Data pengurus (nama, kontak) belum final di dokumen internal yayasan. Halaman ini menampilkan kerangka
          posisi yang akan diisi setelah data disetujui.
        </p>
      </Callout>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posisi.map((label) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-muted text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.4"></circle>
                <path d="M4.5 20C4.5 16 7.8 13 12 13C16.2 13 19.5 16 19.5 20"></path>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-sm text-ink-subtle">Nama {label} — [belum diisi]</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
