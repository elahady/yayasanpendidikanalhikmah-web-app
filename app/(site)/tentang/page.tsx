import { Callout } from "../_components/Callout";
import { Section } from "../_components/Section";

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 pb-20 pt-4">
      <div className="space-y-3">
        <span className="text-[13px] font-bold uppercase tracking-widest text-link">Tentang</span>
        <h1 className="font-display text-[40px] font-semibold text-ink">Tentang Yayasan</h1>
        <p className="max-w-2xl text-[16px] leading-relaxed text-ink-muted">
          Yayasan Pendidikan Al-Hikmah bergerak di bidang pendidikan Al-Qur&apos;an dan ilmu agama, melalui Taman
          Pendidikan Al-Qur&apos;an (TPQ) dan Madrasah Diniyah.
        </p>
      </div>

      <Section title="Visi">
        <p>
          Menjadi lembaga pendidikan Al-Qur&apos;an dan ilmu agama yang mencetak generasi yang mampu membaca,
          memahami, dan mengamalkan Al-Qur&apos;an serta berakhlak mulia dalam kehidupan sehari-hari.
        </p>
      </Section>

      <Section title="Misi">
        <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
          <li>Menyelenggarakan pembelajaran membaca Al-Qur&apos;an yang terstruktur dan berjenjang.</li>
          <li>Menyelenggarakan pendidikan diniyah (Ula dan Wustho) yang mendukung pemahaman agama secara menyeluruh.</li>
          <li>Membina akhlak dan kepribadian santri sesuai nilai-nilai Al-Qur&apos;an dan ajaran Islam.</li>
          <li>Menyediakan tenaga pengajar yang kompeten dan terus mengembangkan metode pengajaran.</li>
        </ul>
      </Section>

      <Callout variant="catatan">
        <p>
          Visi dan misi di atas adalah draft awal, bukan versi final yang sudah disetujui pengurus yayasan.
          Konten ini akan diperbarui setelah ada keputusan resmi.
        </p>
      </Callout>
    </div>
  );
}
