# CLAUDE.md — Yayasan Pendidikan Al-Hikmah Web App

## Aturan kerja

- **Setiap selesai ngoding (fitur/perubahan kode selesai dan jalan), langsung commit dan push.** Jangan menumpuk banyak perubahan tanpa commit, dan jangan berhenti di commit lokal saja — push ke `origin main` di setiap sesi kerja, jangan menunggu diminta.

## Tentang project

Aplikasi web untuk TPQ & Madrasah Diniyah Yayasan Pendidikan Al-Hikmah:
- Halaman publik: kurikulum TPQ (An-Nahdhiyah), kurikulum Madrasah Diniyah, jadwal, struktur organisasi, tentang.
- Panel admin (login TU saja, satu akun): absensi ustadz/ustadzah, absensi santri, progress pembelajaran santri.

Dokumen konsep (kurikulum, proposal donatur) ada di repo terpisah: [yayasanpendidikanalhikmah](https://github.com/elahady/yayasanpendidikanalhikmah).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) — **versi ini banyak breaking change dari pengetahuan umum/training data model AI** (lihat `AGENTS.md` di root, auto-generated oleh Next.js sendiri). Sebelum menulis kode yang pakai API Next.js yang tidak yakin, cek `node_modules/next/dist/docs/` dulu.
  - `cacheComponents` di `next.config.ts` **sengaja dimatikan** — app ini didominasi halaman dinamis (admin cek sesi di hampir semua rute), model "statis by default" Cache Components lebih sering menghalangi build daripada membantu.
  - File convention middleware bernama **`proxy.ts`** di versi ini, bukan `middleware.ts` (sudah di-rename, isinya tetap sama — fungsi auth-based redirect ke `/admin/login`).
- **Prisma 6.19.3** (CLI + `@prisma/client`, **pinned exact**, jangan upgrade ke Prisma 7 tanpa riset dulu — Prisma 7 mengganti cara konfigurasi datasource (`url` di schema tidak didukung lagi, perlu `prisma.config.ts` + adapter) dan API barunya belum saya pelajari/implementasikan.
  - Known accepted risk: `npm audit` melaporkan 3 high severity di `deepmerge-ts` (dependency `@prisma/config`, dipakai CLI Prisma saat baca config — bukan jalur runtime aplikasi yang diakses publik). Fix otomatis (`npm audit fix --force`) akan menarik ke Prisma 7 yang breaking change di atas. **Diterima untuk sekarang**, tinjau ulang kalau ada patch Prisma 6.x yang perbaiki ini tanpa breaking change.
- MySQL — reuse container `shared-mysql` di VPS yang sama dengan rizqflow/habitflow (lihat `C:\Project\personal\build-server`), buat database baru khusus project ini (misal `tpq_alhikmah`), bukan numpang di database app lain.
- NextAuth/Auth.js v5 (beta) untuk login TU (single user via tabel `TU`, bukan multi-role). Session strategy JWT, tanpa adapter database (tidak perlu — Credentials provider + JWT sudah cukup untuk 1 user).
- UI admin: mobile-first (TU input data dari HP).
- Deploy: Docker container di VPS `103.54.170.198`. Selama development diakses via IP:port langsung; domain terpisah menyusul kemudian (belum diputuskan).

## Struktur Rute (Tahap 0, sudah ada skeleton-nya)

- `app/(site)/` — halaman publik, pakai layout nav bersama: `/` (beranda), `/kurikulum-tpq`, `/kurikulum-diniyah`, `/struktur-organisasi`, `/tentang`. Konten dari riset sudah terisi (Tahap 1-3), placeholder jelas untuk data yang belum final (nama pengurus, jadwal, pengajar).
- `app/admin/` — admin TU, dilindungi `proxy.ts` (redirect ke `/admin/login` kalau belum login): `/admin` (dashboard), `/admin/login`, `/admin/santri`, `/admin/ustadz` (CRUD, Tahap 4), `/admin/absensi-santri`, `/admin/absensi-ustadz`, `/admin/progress` (Tahap 5). Semua sudah fungsional.
- `auth.ts` (root) — konfigurasi NextAuth Credentials provider.
- `prisma/schema.prisma` — skema lengkap (model `TU`, `Santri`, `Ustadz`, `AbsensiSantri`, `AbsensiUstadz`, enum `Jenjang`, `JilidNahdliyah`). `prisma/migrations/` sudah ada (migration `init`, dibuat & dites dengan MySQL lokal XAMPP).
- `prisma/seed.ts` — buat 1 akun TU dari env `TU_USERNAME`/`TU_PASSWORD`. Jalankan dengan `npx tsx prisma/seed.ts` setelah `DATABASE_URL` terisi dan migrasi jalan.
- `.env.example` — salin ke `.env`, isi `DATABASE_URL`, `AUTH_SECRET` (generate: `npx auth secret`), `TU_USERNAME`/`TU_PASSWORD`. `.env` sendiri gitignored.

**Sudah dites end-to-end secara lokal** (2026-10-27) pakai MySQL XAMPP (`C:\xampp\mysql_start.bat`, database `tpq_alhikmah`, bukan `shared-mysql` VPS — itu baru akan dites saat Tahap 6/deploy): migrasi jalan, seed akun TU jalan, login lewat `npm run dev` berhasil, CRUD Santri/Ustadz dan form Absensi/Progress terverifikasi baca-tulis data dengan benar lewat smoke test manual (login via API, insert data tes via Prisma langsung, cek muncul di semua halaman terkait, lalu data tes dihapus lagi). Build (`npm run build`) dan lint (`npm run lint`) tetap jadi pengecekan standar sebelum commit.

## Desain & Tema (diterapkan 2026-10-27)

Desain diriset dulu (referensi: template Islamic-center modern "Istiqbal", tren warna hangat 2026) lalu dibuat mockup di Artifact (canvas Design) sebelum diterapkan ke kode — lihat riwayat chat kalau butuh konteks keputusan visualnya.

- **Token warna** di `app/globals.css` sebagai CSS custom properties (`--color-bg`, `--color-bg-elevated`, `--color-bg-muted`, `--color-hero`, `--color-ink`, `--color-ink-muted`, `--color-ink-subtle`, `--color-primary` [hijau olive], `--color-accent` [terracotta, untuk tombol/elemen besar], `--color-link` [terracotta lebih gelap, aman kontras untuk teks kecil/link], `--color-border`, `--color-border-strong`), di-expose ke Tailwind v4 lewat `@theme` sebagai utility (`bg-primary`, `text-ink-muted`, dst). **Jangan hardcode hex warna baru di halaman** — tambah token di sini kalau butuh warna baru.
- **Dark/light mode**: atribut `data-theme="light"|"dark"` di `<html>`, diset oleh script inline di `app/layout.tsx` (jalan sebelum paint, baca `localStorage` lalu fallback ke `prefers-color-scheme`) — **selalu eksplisit, tidak pernah dibiarkan kosong**, supaya satu sumber kebenaran untuk CSS vars maupun Tailwind. Toggle manual: `components/theme-toggle.tsx` (pakai `useSyncExternalStore`, **jangan diganti ke `useState`+`useEffect`** — sempat kena lint error `react-hooks/set-state-in-effect` karena setState sinkron di effect, dan juga rawan hydration mismatch).
- **Custom Tailwind `dark:` variant**: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` di `globals.css` — ini supaya kelas `dark:` bawaan Tailwind (dipakai di beberapa halaman admin lama) ikut toggle manual, bukan cuma ikut `prefers-color-scheme` sistem.
- **Font**: Fraunces (`--font-fraunces`, dipakai via utility `font-display` — judul/heading) + Plus Jakarta Sans (`--font-jakarta`, `font-sans` — body), di-load lewat `next/font/google` di `app/layout.tsx`.
- Komponen bersama: `components/logo.tsx`, `components/theme-toggle.tsx` — dipakai baik di `app/(site)/layout.tsx` maupun `app/admin/layout.tsx`.
- Halaman admin (CRUD santri/ustadz, absensi, progress, dashboard) **belum di-reskin detail** — masih pakai kelas lama (`bg-foreground`/`text-background`, dsb) yang otomatis tetap kontras tinggi di kedua tema lewat token `--color-background`/`--color-foreground`, tapi belum pakai warna brand (primary/accent) secara konsisten. Kalau mau dirapikan, ikuti pola di `app/admin/login/page.tsx` (sudah direskin penuh) sebagai referensi.
