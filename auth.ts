import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
      authorize: async (credentials) => {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        const tu = await prisma.tU.findUnique({ where: { username } });
        if (!tu) return null;

        const valid = await bcrypt.compare(password, tu.passwordHash);
        if (!valid) return null;

        return { id: tu.id, name: tu.username };
      },
    }),
  ],
});
