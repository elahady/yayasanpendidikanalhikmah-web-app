import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/kurikulum-tpq", label: "Kurikulum TPQ" },
  { href: "/kurikulum-diniyah", label: "Kurikulum Diniyah" },
  { href: "/struktur-organisasi", label: "Struktur Organisasi" },
  { href: "/tentang", label: "Tentang" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-7">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex flex-wrap items-center gap-7 text-[15px] font-medium">
          {navItems.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-muted transition hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Masuk TU
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="w-full flex-1">{children}</main>
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-between gap-8 px-6 py-12">
          <div className="flex max-w-xs flex-col gap-2.5">
            <span className="font-display text-lg font-bold text-ink">Yayasan Pendidikan Al-Hikmah</span>
            <p className="text-sm leading-relaxed text-ink-muted">
              TPQ dan Madrasah Diniyah untuk anak usia SD–SMP.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-ink-muted">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-6 pb-8 text-center text-[13px] text-ink-subtle">
          © 2026 Yayasan Pendidikan Al-Hikmah
        </div>
      </footer>
    </div>
  );
}
