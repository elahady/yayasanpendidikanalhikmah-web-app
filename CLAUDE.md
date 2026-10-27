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

- `app/(site)/` — halaman publik, pakai layout nav bersama: `/` (beranda), `/kurikulum-tpq`, `/kurikulum-diniyah`, `/struktur-organisasi`, `/tentang`. Semua masih placeholder "TODO" — konten dari riset ada di `docs/tahapan-pengembangan.md`.
- `app/admin/` — admin TU, dilindungi `proxy.ts` (redirect ke `/admin/login` kalau belum login): `/admin` (dashboard), `/admin/login`, `/admin/santri`, `/admin/ustadz`, `/admin/absensi-santri`, `/admin/absensi-ustadz`, `/admin/progress`. Semua masih placeholder kecuali login (sudah fungsional).
- `auth.ts` (root) — konfigurasi NextAuth Credentials provider.
- `prisma/schema.prisma` — skema lengkap (model `TU`, `Santri`, `Ustadz`, `AbsensiSantri`, `AbsensiUstadz`, enum `Jenjang`, `JilidNahdliyah`).
- `prisma/seed.ts` — buat 1 akun TU dari env `TU_USERNAME`/`TU_PASSWORD`. Jalankan dengan `npx tsx prisma/seed.ts` (atau setup `prisma.seed` di package.json) setelah `DATABASE_URL` terisi dan migrasi jalan.
- `.env.example` — salin ke `.env`, isi `DATABASE_URL`, `AUTH_SECRET` (generate: `npx auth secret`), `TU_USERNAME`/`TU_PASSWORD`.

**Belum diverifikasi end-to-end**: belum ada koneksi ke database MySQL riil saat Tahap 0 dikerjakan (tidak ada akses ke `shared-mysql` VPS dari environment dev ini), jadi alur login belum pernah dites jalan beneran — baru lolos `npm run build` dan `npm run lint`. Tes manual (isi `.env`, `prisma migrate dev`, `seed`, coba login) perlu dilakukan begitu ada akses DB.
