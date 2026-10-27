import Link from "next/link";
import { auth, signOut } from "@/auth";

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
    return <div className="flex flex-1 items-center justify-center p-6">{children}</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/10 dark:border-white/10">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <span className="font-semibold">Admin TU</span>
          <ul className="flex flex-wrap gap-4 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="text-sm text-zinc-500 hover:underline">
              Keluar
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
