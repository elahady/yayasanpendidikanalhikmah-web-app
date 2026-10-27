import Link from "next/link";

const tautan = [
  {
    href: "/kurikulum-tpq",
    label: "Kurikulum TPQ (An-Nahdhiyah)",
    deskripsi: "Metode baca Al-Qur'an yang dipakai di TPQ kami.",
  },
  {
    href: "/kurikulum-diniyah",
    label: "Kurikulum Madrasah Diniyah",
    deskripsi: "Jenjang Ula dan Wustho beserta mata pelajarannya.",
  },
  {
    href: "/struktur-organisasi",
    label: "Struktur Organisasi",
    deskripsi: "Susunan pengurus yayasan.",
  },
  {
    href: "/tentang",
    label: "Tentang Yayasan",
    deskripsi: "Profil, visi, dan misi Yayasan Pendidikan Al-Hikmah.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Yayasan Pendidikan Al-Hikmah</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Yayasan Pendidikan Al-Hikmah mengelola Taman Pendidikan Al-Qur&apos;an
          (TPQ) dengan metode An-Nahdhiyah dan Madrasah Diniyah, sebagai wadah
          pendidikan Al-Qur&apos;an dan ilmu agama bagi anak-anak di
          lingkungan kami.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tautan.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-black/10 p-4 transition hover:border-black/30 hover:bg-zinc-50 dark:border-white/10 dark:hover:border-white/30 dark:hover:bg-zinc-800/50"
          >
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {item.deskripsi}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
