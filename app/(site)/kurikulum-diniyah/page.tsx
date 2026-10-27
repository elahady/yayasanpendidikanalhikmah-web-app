import { Callout } from "../_components/Callout";
import { Section } from "../_components/Section";

type Mapel = { nama: string; deskripsi: string };

const mapelUla: Mapel[] = [
  {
    nama: "Al-Qur'an & Tajwid",
    deskripsi: "Membaca Al-Qur'an dengan dasar-dasar ilmu tajwid.",
  },
  {
    nama: "Tahfidz",
    deskripsi: "Menghafal ayat/surat pilihan sesuai jenjang.",
  },
  {
    nama: "Aqidah Akhlak",
    deskripsi: "Dasar keimanan dan pembentukan akhlak sehari-hari.",
  },
  {
    nama: "Fiqih Ibadah",
    deskripsi: "Tata cara ibadah dasar (wudhu, sholat, dan sejenisnya).",
  },
  {
    nama: "Bahasa Arab Dasar",
    deskripsi: "Pengenalan kosakata dan tata bahasa Arab tingkat dasar.",
  },
  {
    nama: "Hadits Pilihan",
    deskripsi: "Hafalan dan pemahaman hadits-hadits pilihan.",
  },
];

const mapelWustho: Mapel[] = [
  {
    nama: "Al-Qur'an & Tajwid Lanjutan",
    deskripsi: "Pendalaman bacaan dan kaidah tajwid tingkat lanjut.",
  },
  {
    nama: "Tahfidz",
    deskripsi: "Melanjutkan hafalan ayat/surat pada jenjang berikutnya.",
  },
  {
    nama: "Fiqih",
    deskripsi: "Pendalaman hukum fiqih yang lebih luas dari jenjang Ula.",
  },
  {
    nama: "Aqidah",
    deskripsi: "Pendalaman dasar-dasar keimanan.",
  },
  {
    nama: "SKI (Sejarah Kebudayaan Islam)",
    deskripsi: "Sejarah perkembangan Islam dan tokoh-tokohnya.",
  },
  {
    nama: "Bahasa Arab",
    deskripsi: "Pengembangan kemampuan bahasa Arab lebih lanjut.",
  },
  {
    nama: "Akhlak / Adab Sosial",
    deskripsi: "Penerapan akhlak dalam kehidupan bermasyarakat.",
  },
];

function TabelMapel({ data }: { data: Mapel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left dark:border-white/10">
            <th className="py-2 pr-4 font-semibold">Mata Pelajaran</th>
            <th className="py-2 font-semibold">Fokus</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.nama}
              className="border-b border-black/5 align-top dark:border-white/5"
            >
              <td className="py-2 pr-4 whitespace-nowrap font-medium">
                {row.nama}
              </td>
              <td className="py-2">{row.deskripsi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KurikulumDiniyahPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Kurikulum Madrasah Diniyah</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Madrasah Diniyah di Yayasan Pendidikan Al-Hikmah terbagi menjadi dua
          jenjang: <strong>Ula</strong> (setara SD) dan <strong>Wustho</strong>{" "}
          (setara SMP).
        </p>
      </div>

      <Section title="Jenjang & Masa Belajar">
        <p>
          Berdasarkan acuan resmi PMA No. 13 Tahun 2014 (Kementerian Agama
          RI), masa belajar jenjang Ula adalah 6 tahun dan jenjang Wustho
          adalah 3 tahun.
        </p>
        <Callout variant="catatan">
          <p>
            Yayasan dapat memilih untuk memadatkan durasi ini menyesuaikan
            kapasitas riil TPQ — keputusan ini belum final.
          </p>
        </Callout>
      </Section>

      <Section title="Mata Pelajaran Jenjang Ula">
        <TabelMapel data={mapelUla} />
      </Section>

      <Section title="Mata Pelajaran Jenjang Wustho">
        <TabelMapel data={mapelWustho} />
      </Section>

      <Section title="Jadwal">
        <Callout variant="placeholder">
          <p>Jadwal belajar akan diumumkan di sini setelah data final.</p>
        </Callout>
      </Section>

      <Section title="Pengajar">
        <Callout variant="placeholder">
          <p>Daftar pengajar akan ditampilkan di sini.</p>
        </Callout>
      </Section>
    </div>
  );
}
