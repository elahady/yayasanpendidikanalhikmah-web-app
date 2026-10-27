import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/santri", label: "Santri" },
  { href: "/admin/ustadz", label: "Ustadz/Ustadzah" },
  { href: "/admin/absensi-santri", label: "Absensi Santri" },
  { href: "/admin/absensi-ustadz", label: "Absensi Ustadz" },
  { href: "/admin/progress", label: "Progress Santri" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <div className="flex flex-1 items-center justify-center bg-bg p-6">{children}</div>;
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <header className="border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3.5">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className="text-sm font-medium text-ink-muted hover:text-ink">
                Keluar
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-5 pb-3 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-ink-muted transition hover:bg-bg-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
