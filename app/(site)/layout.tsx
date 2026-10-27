import Link from "next/link";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/kurikulum-tpq", label: "Kurikulum TPQ" },
  { href: "/kurikulum-diniyah", label: "Kurikulum Diniyah" },
  { href: "/struktur-organisasi", label: "Struktur Organisasi" },
  { href: "/tentang", label: "Tentang" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/10 dark:border-white/10">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-semibold">
            Yayasan Pendidikan Al-Hikmah
          </Link>
          <ul className="flex flex-wrap gap-4 text-sm">
            {navItems.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
      <footer className="border-t border-black/10 px-6 py-6 text-center text-sm text-zinc-500 dark:border-white/10">
        Yayasan Pendidikan Al-Hikmah
      </footer>
    </div>
  );
}
