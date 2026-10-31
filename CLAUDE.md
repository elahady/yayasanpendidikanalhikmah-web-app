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

## Deploy (Tahap 6, live sejak 2026-10-27)

**Live di** `http://103.54.170.198:8083` (akses langsung via IP:port, HTTP polos — masih hidup) dan, begitu DNS aktif, `https://tpq-alhikmah.roziqrizal.com`.

**Status HTTPS (2026-10-31):** nginx di VPS **sudah siap** untuk subdomain sementara `tpq-alhikmah.roziqrizal.com` (tanpa beli domain baru, lewat Cloudflare), tapi **menunggu record DNS** dari user. Keputusan: subdomain sementara dulu, domain sendiri menyusul kalau perlu.

- Config: `/etc/nginx/sites-available/tpq-alhikmah.roziqrizal.com` (+ symlink di `sites-enabled`), pola sama dengan rizqflow: port 80 redirect 301 ke HTTPS, port 443 pakai sertifikat Cloudflare Origin `/etc/nginx/ssl/cloudflare-origin.pem|.key`, reverse proxy ke `http://127.0.0.1:8083` dengan header `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`.
- Sertifikat Origin tsb. SAN-nya `*.roziqrizal.com` + `roziqrizal.com`, berlaku s/d 2041-10-14 → **valid untuk subdomain ini**, jadi mode SSL Cloudflare boleh **Full (strict)**.
- Terverifikasi tanpa DNS (2026-10-31, `curl -k --resolve tpq-alhikmah.roziqrizal.com:443:103.54.170.198`): `/` → 200, `/admin/login` → 200, `/api/auth/csrf` → 200; `http://` → 301 ke HTTPS; `nginx -t` bersih; rizqflow/habitflow/roziqrizal.com respons tidak berubah (302/302/200). **Belum diverifikasi** lewat DNS/Cloudflare sungguhan (karena record belum ada).

> ⚠️ **Belum dianggap aman sampai DNS aktif & diverifikasi.** Selama itu, akses lewat `http://103.54.170.198:8083` masih HTTP polos — login TU (username+password) terkirim sebagai teks polos. **Jangan dipakai TU untuk input data harian sungguhan lewat IP:port**; tunggu `https://tpq-alhikmah.roziqrizal.com` jalan.

**Langkah untuk user (Cloudflare, zona `roziqrizal.com`):**
1. DNS → Add record: Type `A`, Name `tpq-alhikmah`, IPv4 `103.54.170.198`, Proxy status **Proxied (awan oranye)**, TTL Auto.
2. SSL/TLS → Overview → mode **Full (strict)** (sertifikat Origin valid untuk subdomain ini). Kalau zona sudah di Full (strict) untuk rizqflow/habitflow, tidak perlu diubah.
3. Tes `https://tpq-alhikmah.roziqrizal.com` dan login `/admin/login` dari HP.

**Tindak lanjut setelah DNS terverifikasi:** ubah port di `docker-compose.yml` dari `0.0.0.0:8083:3000` jadi `127.0.0.1:8083:3000` (tutup akses langsung IP:port, sama seperti rizqflow), lalu redeploy. Setelah itu baru tinjau `trustHost` di `auth.ts` dan perbarui kalimat "akses langsung IP:port" di dokumen ini.

- Lokasi di VPS: `~/apps/yayasanpendidikanalhikmah-web-app` (git clone biasa dari repo ini, SSH: `ssh -i ~/.ssh/id_ed25519_vps_jakarta elahady@103.54.170.198`). Catatan SSH: tiap PC boleh punya kunci sendiri bernama `id_ed25519_vps_jakarta` (kuncinya beda per PC, bukan file yang disalin); PC utama user sekarang memakai kunci berlabel `pc-roziq` yang sudah terdaftar di `authorized_keys` VPS sejak 2026-10-31. Kunci privat tidak pernah disimpan di repo.
- `Dockerfile` — single-stage, `node:22-bookworm-slim` (bukan Alpine, biar Prisma generate engine yang cocok tanpa config `binaryTargets` tambahan), install `openssl` eksplisit (tanpa ini Prisma warning "failed to detect libssl version"), full `node_modules` disertakan (bukan `output: "standalone"` — disengaja, lebih simpel & disk VPS longgar (47GB free), standalone+Prisma CLI untuk migrasi lebih ribet untuk app sekecil ini).
- `docker-compose.yml` — **`name:` wajib eksplisit** (pelajaran dari rizqflow: folder bernama "server" di app lain sempat bentrok/menimpa container app lain karena nama project default ikut nama folder). Port `0.0.0.0:8083:3000` (bukan `127.0.0.1` seperti rizqflow — app itu sengaja hanya lewat nginx+domain, app ini sengaja akses langsung IP:port). Network `shared-db` (external) untuk konek ke `shared-mysql`.
- `auth.ts` — **`trustHost: true` wajib** selama akses via IP:port (NextAuth menolak request dengan error `UntrustedHost` tanpa ini). Tinjau ulang kalau nanti pindah ke domain tetap (boleh dipertahankan, tidak masalah selama traffic publik tetap lewat HTTPS Cloudflare).
- `.env.production` di VPS (**tidak di-commit ke git**, isi manual sekali): `DATABASE_URL` ke `shared-mysql:3306/tpq_alhikmah` dengan user `tpq_alhikmah` khusus (dibuat via `docker exec shared-mysql mysql -uroot -p... -e "CREATE DATABASE/USER/GRANT"`, bukan pakai root), `AUTH_SECRET` (beda dari `.env` lokal), `TU_USERNAME`/`TU_PASSWORD`.
- **Cara redeploy setelah ada perubahan kode**: `git push` dari lokal, lalu di VPS: `cd ~/apps/yayasanpendidikanalhikmah-web-app && git pull && docker compose build && docker compose up -d`. Migrasi schema baru (kalau ada): `docker compose exec app npx prisma migrate deploy`.
- Kredensial database production (password user `tpq_alhikmah`, `AUTH_SECRET` production) **hanya ada di `.env.production` di VPS** — kalau lupa/perlu reset, generate baru dan update manual di sana, jangan simpan di repo manapun.

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

## Multi-role & API v1 (Tahap 2, 2026-10-31)

> Bagian ini menggantikan keterangan lama di atas yang menyebut "login TU saja / single user / model `TU`". Kontrak API: `docs/api-contract.md` (ubah dokumen dulu, baru kode).

- **Model akun** (`prisma/schema.prisma`): `Akun` (username unik, passwordHash, nama, `aktif`, `ustadzId?` unik -> `Ustadz`), `AkunRole` (satu baris per akun+role; enum `Role`: ADMIN, TU, PENGAWAS, PIKET, USTADZ, WALI), `WaliSantri` (m2m wali <-> santri). `AbsensiSantri`/`AbsensiUstadz` punya `dicatatOlehId?` (akun terakhir yang menyimpan; null = data lama). Akun dinonaktifkan (`aktif=false`), tidak dihapus, supaya jejak pencatat utuh.
- **Otorisasi terpusat**: `lib/authz.ts` — satu-satunya tempat aturan hak akses (matriks role, wali hanya anaknya, self-attendance, pencatat hanya entri sendiri / ADMIN-TU semua, `bisaDiubah`). Dipakai API dan server action web. Identitas pemanggil dimuat ulang dari DB tiap request (`lib/akun.ts` `muatActor`), jadi nonaktif/ganti role langsung berlaku.
- **REST API** `app/api/v1/*` (lihat kontrak). Helper di `lib/api/` (`handler.ts` pembungkus error seragam + Bearer auth, `jwt.ts` JWT HS256 30 hari via `jose` memakai `AUTH_SECRET`, `validasi.ts` zod, `serialisasi.ts`) dan `lib/rate-limit.ts` (in-memory, per username+IP 5 gagal/15 menit + per username 20; hilang saat restart; dipakai juga login web). Dependency baru: `jose` (sudah ada transitif lewat next-auth, kini dideklarasikan eksplisit).
- **Web `/admin` hanya ADMIN/TU**: `auth.ts` menolak role lain dengan pesan jelas di `/admin/login` (code `role`/`nonaktif`/`dibatasi`); `proxy.ts` cek kasar dari token; **tiap halaman memanggil `wajibAdminHalaman()` dan tiap server action `wajibAdminAction()`/`getWebActor()`** (`lib/web-auth.ts`, baca DB) — layout Next tidak dirender ulang saat navigasi, jadi jangan andalkan layout/proxy saja. Halaman baru wajib memanggilnya.
- **Cara bikin akun**: login web sebagai ADMIN/TU -> `/admin/akun` (buat akun, centang role, tautkan ke ustadz, nonaktifkan, reset password) -> `/admin/akun/[id]` (untuk role WALI: centang santri anaknya). Sistem menolak perubahan yang membuat tidak ada ADMIN/TU aktif. Akun yang tertaut ke ustadz tidak bisa mengabsen ustadz itu (API: `SELF_ATTENDANCE_FORBIDDEN`).
- **Seed ADMIN**: isi `ADMIN_USERNAME`/`ADMIN_PASSWORD` (dan tetap `TU_USERNAME`/`TU_PASSWORD`) di env lalu `npx tsx prisma/seed.ts`. Idempoten; menjalankan ulang menyetel ulang password akun itu sesuai env dan tidak menghapus role lain.
- **Migrasi produksi (saat deploy)**: migrasi `20261031090000_multi_role_akun` mengubah `TU` -> `Akun` **tanpa kehilangan data** (setiap baris TU disalin: id/username/passwordHash/createdAt sama, `nama`=username, `aktif`=true, + role TU; lalu tabel `TU` dibuang) dan menambah kolom `dicatatOlehId`. Urutan: (1) backup DB dulu (`mysqldump`); (2) `git pull && docker compose build && docker compose up -d`; (3) `docker compose exec app npx prisma migrate deploy`; (4) tambahkan `ADMIN_USERNAME`/`ADMIN_PASSWORD` ke `.env.production` di VPS (container perlu di-recreate agar env terbaca) lalu `docker compose exec app npx tsx prisma/seed.ts`; (5) TU yang sudah ada tetap bisa login dengan password lamanya (sesi web lama diminta login ulang sekali). Image baru harus dibangun SEBELUM migrasi dijalankan (kode lama memakai tabel `TU` dan akan error setelah migrasi).
- **Catatan**: di balik nginx/Cloudflare IP klien untuk rate limit dibaca dari `X-Forwarded-For`/`X-Real-IP` (mudah dipalsukan kalau diakses langsung via IP:port — karena itu ada batas tambahan per username). Ganti password tidak membatalkan token API yang sudah terbit (menonaktifkan akun yang langsung efektif).
- **Dites lokal** (2026-10-31, MySQL XAMPP): migrasi dari kondisi ada baris TU lama; seed; `npm run lint` + `npm run build`; smoke test API per role (89 cek) dan web admin termasuk server action akun (40 cek) terhadap `next dev` dan `next start`, data tes dibersihkan.
