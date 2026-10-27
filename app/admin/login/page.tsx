import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-sm space-y-7 rounded-[24px] border border-border bg-bg-elevated p-8">
      <Logo />
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Login TU</h1>
        <p className="mt-1 text-sm text-ink-muted">Masuk untuk mengelola data TPQ &amp; Madrasah Diniyah.</p>
      </div>
      {error && (
        <p className="rounded-lg bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent">
          Username atau password salah.
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
              redirect("/admin/login?error=1");
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
