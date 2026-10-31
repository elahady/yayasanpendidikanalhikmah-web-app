"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/santri", label: "Santri" },
  { href: "/admin/ustadz", label: "Ustadz" },
  { href: "/admin/absensi-santri", label: "Absensi Santri" },
  { href: "/admin/absensi-ustadz", label: "Absensi Ustadz" },
  { href: "/admin/progress", label: "Progress" },
  { href: "/admin/akun", label: "Akun" },
];

/** Halaman yang tata letaknya lebar (dua kolom); sisanya tetap memakai lebar form lama. */
const HALAMAN_LEBAR = ["/admin", "/admin/profil"];

function aktif(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Kerangka halaman admin (header + nav + <main>). Client component hanya supaya
 * bisa menandai menu aktif lewat usePathname; isi halaman tetap server component.
 */
export function AdminFrame({ nama, children }: { nama: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const lebar = HALAMAN_LEBAR.includes(pathname);
  const wadah = lebar ? "max-w-6xl" : "max-w-4xl";
  const diProfil = aktif(pathname, "/admin/profil");

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <header className="border-b border-border bg-bg">
        <div
          className={`mx-auto flex w-full ${wadah} flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3`}
        >
          <Link href="/admin" aria-label="Al-Hikmah, ke Dashboard" className="shrink-0">
            <Logo />
          </Link>

          <div className="ml-auto flex items-center gap-2.5 xl:order-3">
            <ThemeToggle />
            <Link
              href="/admin/profil"
              aria-label={`Profil dan pengaturan: ${nama}`}
              aria-current={diProfil ? "page" : undefined}
              className={
                "flex min-h-11 items-center gap-2.5 rounded-full border py-0.5 pl-1 pr-1 transition sm:pr-3.5 " +
                (diProfil ? "border-2 border-primary" : "border-border-strong hover:border-ink-subtle")
              }
            >
              <Avatar nama={nama} />
              <span className="hidden max-w-40 truncate text-sm font-semibold text-ink sm:inline">
                {nama}
              </span>
            </Link>
          </div>

          <nav
            aria-label="Menu utama"
            className="-mx-1 flex w-full flex-wrap gap-1 xl:order-2 xl:mx-0 xl:w-auto xl:flex-1"
          >
            {navItems.map((item) => {
              const on = aktif(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={
                    "inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold transition " +
                    (on ? "bg-soft text-ok" : "text-ink-muted hover:bg-bg-muted hover:text-ink")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className={`mx-auto w-full ${wadah} flex-1 px-5 py-8 sm:py-10`}>{children}</main>
    </div>
  );
}
