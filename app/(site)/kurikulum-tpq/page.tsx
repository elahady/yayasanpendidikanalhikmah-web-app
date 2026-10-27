import { Callout } from "../_components/Callout";
import { Section } from "../_components/Section";

const jilidList = [
  {
    jilid: "Jilid 1",
    materi: "Huruf hijaiyah & makharijul huruf (tempat keluarnya huruf).",
  },
  {
    jilid: "Jilid 2 - 3",
    materi:
      "Lanjutan materi dasar. [TODO: detail isi belum terverifikasi dari riset]",
  },
  {
    jilid: "Jilid 4",
    materi: "Nun sukun, tanwin, dan mad.",
  },
  {
    jilid: "Jilid 5",
    materi: "Waqaf (tanda berhenti) & pendalaman materi jilid sebelumnya.",
  },
  {
    jilid: "Jilid 6",
    materi:
      "Izhar halqi, mulai masuk Juz 1 — menjembatani santri ke bacaan Al-Qur'an langsung.",
  },
];

export default function KurikulumTpqPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Kurikulum TPQ (An-Nahdhiyah)</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          TPQ di Yayasan Pendidikan Al-Hikmah menggunakan metode cepat tanggap
          belajar Al-Qur&apos;an (CTBA) &ldquo;An-Nahdhiyah&rdquo; (juga
          ditulis &ldquo;An-Nahdliyah&rdquo;).
        </p>
      </div>

      <Section title="Asal Metode">
        <p>
          Metode An-Nahdhiyah lahir dari Lembaga Pendidikan (LP) Ma&apos;arif
          NU Tulungagung, Jawa Timur, hasil kerja bersama para kiai dan ahli
          pengajaran Al-Qur&apos;an setempat. Salah satu tokoh yang menginisiasi
          metode ini adalah KH. Munawwir Kholid (juga ditulis &ldquo;Cholid&rdquo;
          di beberapa sumber).
        </p>
        <p>
          Metode ini dibina secara nasional oleh Pimpinan Pusat Majelis
          Pembina (MABIN) TPQ An-Nahdliyah, yang berkedudukan di Tulungagung.
        </p>
      </Section>

      <Section title="Ciri Khas Pengajaran">
        <p>
          Ciri khas metode An-Nahdhiyah adalah penekanan pada{" "}
          <strong>ketukan (titian murottal)</strong> yang diiringi tongkat
          dalam sistem <strong>klasikal</strong> — santri membaca bersama-sama
          dengan tempo yang terjaga.
        </p>
        <p>
          Setelah tahap klasikal, pembelajaran dilanjutkan ke tahap{" "}
          <strong>individual (musyafahah)</strong>, yaitu koreksi bacaan
          satu-per-satu oleh ustadz/ustadzah kepada setiap santri.
        </p>
      </Section>

      <Section title="Struktur Jilid">
        <p>Metode An-Nahdhiyah terdiri dari 6 jilid dengan tahapan sebagai berikut:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left dark:border-white/10">
                <th className="py-2 pr-4 font-semibold">Jilid</th>
                <th className="py-2 font-semibold">Materi</th>
              </tr>
            </thead>
            <tbody>
              {jilidList.map((row) => (
                <tr
                  key={row.jilid}
                  className="border-b border-black/5 align-top dark:border-white/5"
                >
                  <td className="py-2 pr-4 whitespace-nowrap font-medium">
                    {row.jilid}
                  </td>
                  <td className="py-2">{row.materi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Callout variant="catatan">
        <p>
          Ringkasan ini disusun dari riset sumber publik (situs NU wilayah/cabang
          dan skripsi kampus), bukan dokumen resmi tunggal dari LP Ma&apos;arif NU
          — detail teknis sebaiknya dikonfirmasi saat pelatihan resmi.
        </p>
      </Callout>
    </div>
  );
}
