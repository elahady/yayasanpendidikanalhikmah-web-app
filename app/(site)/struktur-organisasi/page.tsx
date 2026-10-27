import { Callout } from "../_components/Callout";

const posisi = [
  "Ketua",
  "Sekretaris",
  "Bendahara",
  "Kepala TPQ",
  "Kepala Madrasah Diniyah",
];

export default function StrukturOrganisasiPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Struktur Organisasi</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Susunan pengurus Yayasan Pendidikan Al-Hikmah.
        </p>
      </div>

      <Callout variant="placeholder">
        <p>
          Data pengurus (nama, kontak) belum final di dokumen internal
          yayasan. Halaman ini menampilkan kerangka posisi yang akan diisi
          setelah data disetujui.
        </p>
      </Callout>

      <div className="grid gap-4 sm:grid-cols-2">
        {posisi.map((label) => (
          <div
            key={label}
            className="rounded-lg border border-black/10 p-4 dark:border-white/10"
          >
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Nama {label} — [belum diisi]
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
