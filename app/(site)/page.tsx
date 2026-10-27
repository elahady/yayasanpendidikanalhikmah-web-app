import Link from "next/link";

const programs = [
  {
    href: "/kurikulum-tpq",
    title: "TPQ — Metode An-Nahdhiyah",
    desc: "Belajar membaca Al-Qur'an dengan ketukan khas dan koreksi satu-per-satu (musyafahah), berjenjang dari Pra Nahdhiyah hingga Jilid 6.",
    icon: (
      <>
        <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11V20H5.5C4.67 20 4 19.33 4 18.5V5.5Z"></path>
        <path d="M20 5.5C20 4.67 19.33 4 18.5 4H13V20H18.5C19.33 20 20 19.33 20 18.5V5.5Z"></path>
      </>
    ),
  },
  {
    href: "/kurikulum-diniyah",
    title: "Madrasah Diniyah",
    desc: "Jenjang Ula (setara SD) dan Wustho (setara SMP) — Al-Qur'an, Fiqih, Aqidah Akhlak, SKI, dan Bahasa Arab.",
    icon: (
      <>
        <path d="M2 9L12 4L22 9L12 14L2 9Z"></path>
        <path d="M6 11.5V16C6 16 8.5 18 12 18C15.5 18 18 16 18 16V11.5"></path>
      </>
    ),
  },
];

const values = [
  {
    title: "Kurikulum Berjenjang",
    desc: "Ula dan Wustho disusun bertahap sesuai usia, dari dasar hingga siap lanjut ke jenjang berikutnya.",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="13" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="4" y="13" width="7" height="7" rx="1.5"></rect>
        <rect x="13" y="13" width="7" height="7" rx="1.5"></rect>
      </>
    ),
  },
  {
    title: "Metode Baca Qur'an Teruji",
    desc: "An-Nahdhiyah: ketukan menjaga tempo bacaan, sistem klasikal lalu individual.",
    icon: <path d="M12 3L4 7V12C4 16.5 7.5 20.3 12 21C16.5 20.3 20 16.5 20 12V7L12 3Z"></path>,
  },
  {
    title: "Koreksi Satu-per-Satu",
    desc: "Musyafahah — tiap santri dikoreksi bacaannya langsung oleh ustadz/ustadzah.",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.2"></circle>
        <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20"></path>
      </>
    ),
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative mx-auto mt-2 max-w-5xl overflow-hidden rounded-[28px] bg-hero px-6">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-10">
          <defs>
            <pattern id="starPattern" width="84" height="84" patternUnits="userSpaceOnUse">
              <path
                d="M42 2 L50 20 L68 12 L60 30 L82 42 L60 54 L68 72 L50 64 L42 82 L34 64 L16 72 L24 54 L2 42 L24 30 L16 12 L34 20 Z"
                fill="none"
                stroke="#FAF6EC"
                strokeWidth="1"
              ></path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#starPattern)"></rect>
        </svg>
        <div className="relative flex max-w-xl flex-col items-start gap-7 py-20">
          <span className="rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#F0CDA8]">
            TPQ &amp; Madrasah Diniyah
          </span>
          <h1 className="font-display text-[42px] font-semibold leading-[1.12] text-bg sm:text-5xl">
            Mendidik Generasi Qur&apos;ani, Satu Bacaan Setiap Hari
          </h1>
          <p className="max-w-lg text-[17px] leading-relaxed text-bg/80">
            Yayasan Pendidikan Al-Hikmah mengelola TPQ dengan metode An-Nahdhiyah dan Madrasah Diniyah
            berjenjang, untuk anak usia SD hingga SMP.
          </p>
          <div className="flex flex-wrap gap-3.5 pt-1">
            <Link
              href="/kurikulum-tpq"
              className="rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-white transition hover:opacity-90"
            >
              Lihat Kurikulum TPQ
            </Link>
            <Link
              href="/kurikulum-diniyah"
              className="rounded-xl border border-white/35 px-6 py-3.5 text-[15px] font-semibold text-bg transition hover:bg-white/10"
            >
              Kurikulum Diniyah
            </Link>
          </div>
        </div>
      </section>

      {/* Program */}
      <section className="mx-auto max-w-5xl px-6 pt-24">
        <div className="mb-10 max-w-xl">
          <span className="text-[13px] font-bold uppercase tracking-widest text-link">Program Kami</span>
          <h2 className="mt-2.5 font-display text-[32px] font-semibold text-ink">
            Dua jalur pembelajaran, satu tujuan
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {programs.map((p) => (
            <div
              key={p.href}
              className="flex flex-col gap-4 rounded-[20px] border border-border bg-bg-elevated p-8 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-bg-muted text-primary">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {p.icon}
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-ink">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-muted">{p.desc}</p>
              <Link href={p.href} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-link">
                Lihat kurikulum
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12H19"></path>
                  <path d="M13 6L19 12L13 18"></path>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-5xl px-6 pt-24">
        <div className="grid grid-cols-1 gap-10 border-y border-border py-12 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="flex flex-col gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {v.icon}
              </svg>
              <h4 className="text-[17px] font-bold text-ink">{v.title}</h4>
              <p className="text-sm leading-relaxed text-ink-muted">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[24px] bg-bg-muted p-10">
          <div className="max-w-md">
            <h3 className="mb-2 font-display text-2xl font-semibold text-ink">
              Ingin tahu lebih jauh tentang yayasan kami?
            </h3>
            <p className="text-[15px] text-ink-muted">
              Kenali struktur pengurus dan visi-misi Yayasan Pendidikan Al-Hikmah.
            </p>
          </div>
          <Link
            href="/tentang"
            className="whitespace-nowrap rounded-xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-bg transition hover:opacity-90"
          >
            Tentang Yayasan
          </Link>
        </div>
      </section>
    </div>
  );
}
