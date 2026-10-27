import { Callout } from "../_components/Callout";
import { Section } from "../_components/Section";

export default function TentangPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Tentang Yayasan</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Yayasan Pendidikan Al-Hikmah bergerak di bidang pendidikan
          Al-Qur&apos;an dan ilmu agama, melalui Taman Pendidikan
          Al-Qur&apos;an (TPQ) dan Madrasah Diniyah.
        </p>
      </div>

      <Section title="Visi">
        <p>
          Menjadi lembaga pendidikan Al-Qur&apos;an dan ilmu agama yang
          mencetak generasi yang mampu membaca, memahami, dan mengamalkan
          Al-Qur&apos;an serta berakhlak mulia dalam kehidupan sehari-hari.
        </p>
      </Section>

      <Section title="Misi">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Menyelenggarakan pembelajaran membaca Al-Qur&apos;an yang
            terstruktur dan berjenjang.
          </li>
          <li>
            Menyelenggarakan pendidikan diniyah (Ula dan Wustho) yang
            mendukung pemahaman agama secara menyeluruh.
          </li>
          <li>
            Membina akhlak dan kepribadian santri sesuai nilai-nilai
            Al-Qur&apos;an dan ajaran Islam.
          </li>
          <li>
            Menyediakan tenaga pengajar yang kompeten dan terus
            mengembangkan metode pengajaran.
          </li>
        </ul>
      </Section>

      <Callout variant="catatan">
        <p>
          Visi dan misi di atas adalah draft awal, bukan versi final yang
          sudah disetujui pengurus yayasan. Konten ini akan diperbarui
          setelah ada keputusan resmi.
        </p>
      </Callout>
    </div>
  );
}
