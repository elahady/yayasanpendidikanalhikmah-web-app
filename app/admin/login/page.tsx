import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";

// Pesan per kode penolakan (lihat LoginDitolak di auth.ts dan proxy.ts).
const PESAN_LOGIN: Record<string, string> = {
  credentials: "Username atau password salah.",
  role: "Akun ini tidak punya akses ke panel web. Panel web hanya untuk ADMIN/TU — gunakan aplikasi Android untuk peran Anda.",
  nonaktif: "Akun ini sudah dinonaktifkan. Hubungi pengurus TPQ.",
  dibatasi: "Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string }>;
}) {
  const { error, code } = await searchParams;
  const pesanError = error ? (PESAN_LOGIN[code ?? error] ?? PESAN_LOGIN.credentials) : null;

  return (
    <div className="w-full max-w-sm space-y-7 rounded-[24px] border border-border bg-bg-elevated p-8">
      <Logo />
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Login Admin</h1>
        <p className="mt-1 text-sm text-ink-muted">Khusus ADMIN/TU. Masuk untuk mengelola data TPQ &amp; Madrasah Diniyah.</p>
      </div>
      {pesanError && (
        <p className="rounded-lg bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent">
          {pesanError}
        </p>
      )}
      <form
        action={async (formData) => {
          "use server";
          try {
            await signIn("credentials", {
              username: formData.get("username"),
              password: formData.get("password"),
              redirectTo: "/admin",
            });
          } catch (err) {
            if (err instanceof AuthError) {
              // CredentialsSignin membawa `code` (credentials | role | nonaktif | dibatasi).
              const code = (err as { code?: unknown }).code;
              redirect(`/admin/login?error=1&code=${typeof code === "string" ? encodeURIComponent(code) : "credentials"}`);
            }
            throw err;
          }
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-ink">
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            className="mt-1.5 w-full rounded-xl border border-border-strong bg-bg px-3.5 py-2.5 text-base text-ink outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1.5 w-full rounded-xl border border-border-strong bg-bg px-3.5 py-2.5 text-base text-ink outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-3 text-base font-semibold text-bg transition hover:opacity-90"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
