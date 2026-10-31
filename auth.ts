import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { muatActor } from "@/lib/akun";
import { adalahAdminAtauTU } from "@/lib/authz";
import {
  catatLoginBerhasil,
  catatLoginGagal,
  detikSampaiBolehLogin,
  ipDariHeaders,
} from "@/lib/rate-limit";

/** Penolakan login web dengan `code` khusus (dibaca halaman /admin/login untuk pesan jelas). */
class LoginDitolak extends CredentialsSignin {
  constructor(code: "role" | "nonaktif" | "dibatasi") {
    super();
    this.code = code;
  }
}

// Hash palsu: samakan waktu respons walau username tidak ada.
const HASH_PALSU = bcrypt.hashSync("hash-palsu-tidak-dipakai", 10);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Diakses lewat IP:port selama belum ada domain tetap (lihat
  // docs/tahapan-pengembangan.md Tahap 6) — tanpa ini NextAuth menolak
  // request dengan error "UntrustedHost" karena Host header bukan domain
  // yang "dikenal". Aman di sini karena akses publik tetap lewat HTTPS
  // Cloudflare begitu domain terpasang; tinjau ulang kalau nanti pindah
  // ke setup multi-tenant/multi-domain.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const username = (credentials?.username as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        const ip = ipDariHeaders(request.headers);
        if (detikSampaiBolehLogin(username, ip) > 0) throw new LoginDitolak("dibatasi");

        const akun = await prisma.akun.findUnique({ where: { username } });
        const valid = await bcrypt.compare(password, akun?.passwordHash ?? HASH_PALSU);
        if (!akun || !valid) {
          catatLoginGagal(username, ip);
          return null;
        }
        catatLoginBerhasil(username, ip);

        // Web /admin hanya untuk ADMIN/TU. Role lain (PENGAWAS, PIKET, USTADZ,
        // WALI) memakai app Android, dan ditolak di sini dengan pesan jelas.
        if (!akun.aktif) throw new LoginDitolak("nonaktif");
        const actor = await muatActor(akun.id);
        if (!actor || !adalahAdminAtauTU(actor)) throw new LoginDitolak("role");

        return { id: akun.id, name: akun.nama, roles: actor.roles } as {
          id: string;
          name: string;
        };
      },
    }),
  ],
  callbacks: {
    // `roles` hanya disimpan di token untuk pengecekan kasar di proxy.ts;
    // keputusan otorisasi sebenarnya selalu dibaca ulang dari database
    // (lib/web-auth.ts), jadi akun yang dinonaktifkan langsung kehilangan akses.
    jwt({ token, user }) {
      if (user) token.roles = (user as unknown as { roles: string[] }).roles;
      return token;
    },
    session({ session, token }) {
      const s = session as unknown as { user: { id?: string; roles?: string[] } };
      s.user.id = token.sub;
      s.user.roles = token.roles as string[] | undefined;
      return session;
    },
  },
});
