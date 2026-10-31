import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Pagar kasar untuk /admin: harus login dan (menurut isi token) berrole ADMIN/TU.
 * Ini hanya lapisan pertama — pengecekan sebenarnya (akun masih aktif, role
 * terkini) dilakukan lagi dari database di setiap halaman & server action
 * lewat lib/web-auth.ts.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (!isAdminRoute) return;

  if (!req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  const roles = (req.auth.user as { roles?: string[] } | undefined)?.roles;
  // Sesi lama (dibuat sebelum multi-role) tidak punya roles: minta login ulang.
  if (!roles) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
  if (!roles.includes("ADMIN") && !roles.includes("TU")) {
    return NextResponse.redirect(new URL("/admin/login?error=role", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
