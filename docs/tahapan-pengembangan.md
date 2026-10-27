# Tahapan Pengembangan

Memetakan hasil riset (lihat repo [yayasanpendidikanalhikmah](https://github.com/elahady/yayasanpendidikanalhikmah) — `docs/pelatihan-an-nahdhiyah.md` & `docs/kurikulum-madrasah-diniyah.md`, diperbarui 2026-10-27) ke konten konkret tiap halaman, dan urutan pengerjaannya.

## Ringkasan

| Tahap | Status | Fokus | Output Utama |
|---|---|---|---|
| 0 | ✅ Selesai (2026-10-27) | Setup Project | Next.js 16 + Prisma 6.19.3 + NextAuth, skema lengkap, skeleton semua rute publik & admin |
| 1-3 | ✅ Selesai (2026-10-27) | Halaman Publik | Kurikulum TPQ (An-Nahdhiyah), Kurikulum Madrasah Diniyah, Struktur Organisasi, Tentang, Beranda — konten dari riset, placeholder jelas untuk data yang belum final (nama pengurus, jadwal, pengajar) |
| 4 | ✅ Selesai (2026-10-27) | Admin: Master Data | CRUD Santri (nama, jenjang, kelas) dan Ustadz/Ustadzah (nama, mapel) via Server Actions, mobile-first |
| 5 | ✅ Selesai (2026-10-27) | Admin: Absensi & Progress | Form absensi harian santri & ustadz (mobile-first, default hadir, bisa dikoreksi), update progress santri (jilid An-Nahdhiyah + catatan Madin), ringkasan distribusi jilid |
| 6 | ✅ Selesai (2026-10-27) | Deploy | **Live** di `http://103.54.170.198:8083` — Docker container di VPS, database `tpq_alhikmah` di `shared-mysql`, domain terpisah menyusul |
| *Ditunda* | — | Donasi, Legalitas, Galeri | Sengaja tidak masuk versi awal (keputusan 2026-10-27) |

Tahap 0-6 dikerjakan 2026-10-27: Tahap 0 manual, Tahap 1-3/4/5 lewat 3 agent paralel (git worktree terisolasi) lalu di-merge ke `main`, Tahap 6 deploy manual ke VPS. Semua tahap lolos `npm run build` dan `npm run lint`, dan sudah dites end-to-end dengan database MySQL nyata (lokal via XAMPP, lalu production via `shared-mysql` VPS) — login, CRUD, absensi, progress semua terverifikasi baca-tulis data dengan benar.

**Masalah yang ditemukan & diperbaiki saat deploy ke VPS:**
- NextAuth menolak request karena diakses lewat IP:port bukan domain (`UntrustedHost`) — fix: `trustHost: true` di `auth.ts`.
- Prisma tidak bisa deteksi versi OpenSSL di image Docker — fix: install `openssl` di `Dockerfile` sebelum `prisma generate`.

Detail kredensial database/akun produksi ada di `.env.production` di VPS (`~/apps/yayasanpendidikanalhikmah-web-app/.env.production`, tidak di-commit ke git) — lihat `CLAUDE.md` bagian Deploy untuk cara reproduce/update.

Detail tiap tahap ada di bawah.

## Tahap 0 — Setup Project

- Scaffold Next.js (TypeScript) + Prisma + koneksi ke `shared-mysql` (VPS, lihat `C:\Project\personal\build-server`) + NextAuth (single user TU).
- Belum ada konten — tujuannya project bisa jalan lokal dan ada skeleton routing (publik vs `/admin`).

## Tahap 1 — Halaman Publik: Kurikulum TPQ (An-Nahdhiyah)

Konten diambil langsung dari riset (`pelatihan-an-nahdhiyah.md` §1), ditampilkan sebagai halaman statis (bukan data dari database — ini konten tetap, bukan yang diinput TU):

| Bagian halaman | Isi (dari riset) |
|---|---|
| Pengantar metode | Asal: LP Ma'arif NU Tulungagung. Nama lengkap: metode cepat tanggap belajar Al-Qur'an (CTBA). |
| Ciri khas | Ketukan (titian murottal) + sistem klasikal, lanjut individual (musyafahah) |
| Struktur jilid | Tabel 6 jilid: Jilid 1 (huruf hijaiyah & makharijul huruf) → Jilid 4 (nun sukun, tanwin, mad) → Jilid 5 (waqaf & pendalaman) → Jilid 6 (izhar halqi, mulai juz 1) |
| Catatan jujur | Tandai sebagai "ringkasan dari riset web, bukan dokumen resmi LP Ma'arif" — jangan terkesan otoritatif 100% |

**Keputusan desain**: field `jilid_saat_ini` di data santri (Tahap 5) harus punya opsi yang cocok dengan 6 jilid ini + 1 opsi "Pra Nahdhiyah" + 1 opsi "Sudah Al-Qur'an/sorogan" (lulus jilid 6) — total 8 pilihan progress.

## Tahap 2 — Halaman Publik: Kurikulum Madrasah Diniyah

Konten dari riset (`kurikulum-madrasah-diniyah.md` §1 & §3):

| Bagian halaman | Isi (dari riset) |
|---|---|
| Jenjang | Ula (setara SD, acuan resmi 6 tahun) dan Wustho (setara SMP, acuan resmi 3 tahun) — tampilkan juga catatan kalau yayasan memilih memadatkan durasi |
| Mapel Ula | Al-Qur'an & Tajwid, Tahfidz, Aqidah Akhlak, Fiqih Ibadah, Bahasa Arab dasar, Hadits pilihan |
| Mapel Wustho | Al-Qur'an & Tajwid lanjutan, Tahfidz, Fiqih, Aqidah, SKI, Bahasa Arab, Akhlak/Adab sosial |
| Jadwal | Placeholder sampai data riil TPQ diisi (lihat Tahap 3) |
| Pengajar | Daftar ustadz/ustadzah per mapel — ditarik dari data master (Tahap 4), bukan hardcode |

**Keputusan desain**: field `jenjang_saat_ini` di data santri (Tahap 5) = enum `Ula` / `Wustho` (sesuai riset, bukan 4 skala seperti draft lama), dan field progress madin per santri cukup catatan bebas ("sudah materi fiqih bab wudhu", dst) — tidak perlu skema serumit jilid An-Nahdhiyah karena kurikulum diniyah tidak punya tahapan buku senumerik itu.

## Tahap 3 — Halaman Publik: Struktur Organisasi & Tentang

- Struktur Organisasi: daftar pengurus yayasan (statis, dari dokumen `proposal-donatur.md` §II di repo dokumen — isi setelah data pengurus final).
- Tentang: profil singkat yayasan, visi-misi (dari `proposal-donatur.md` §III).
- Tidak butuh database — konten statis yang diedit lewat kode saat ada perubahan pengurus.

## Tahap 4 — Admin: Login TU + Master Data

- Login TU (NextAuth, 1 akun).
- CRUD data master: **Santri** (nama, jenjang Ula/Wustho, kelas), **Ustadz/Ustadzah** (nama, mapel yang diajar).
- Ini prasyarat sebelum absensi/progress (Tahap 5) bisa dicatat — tidak bisa absen orang yang belum ada di data master.

## Tahap 5 — Admin: Absensi & Progress (mobile-first)

- Form absensi harian santri (per kelas, checklist hadir/tidak) — UI dioptimalkan untuk HP sesuai keputusan sebelumnya.
- Form absensi harian ustadz/ustadzah.
- Form update progress santri: `jilid_saat_ini` (8 pilihan, lihat Tahap 1) untuk TPQ, dan catatan progress Madin (lihat Tahap 2) untuk Diniyah.
- Output ringkas (jumlah santri aktif, distribusi jilid) bisa ditampilkan ringkas di halaman publik Tahap 1/2 sebagai statistik, tanpa membuka data pribadi per santri.

## Tahap 6 — Deploy

- Docker container di VPS `103.54.170.198`, akses development via IP:port.
- Domain terpisah untuk yayasan menyusul kemudian (belum diputuskan — lihat README).

## Ditunda (bukan untuk versi awal)

Donasi, Legalitas, Galeri — sudah didiskusikan dan sengaja **tidak** masuk tahapan awal (keputusan 2026-10-27).

## Yang Masih Perlu Diverifikasi Manual (tidak ditemukan lewat riset web)

- Kontak resmi PC LP Ma'arif NU / Pimpinan Pusat MABIN TPQ An-Nahdliyah untuk pelatihan.
- Istilah resmi sertifikasi pengajar An-Nahdhiyah (riset tidak menemukan konfirmasi istilah "munaqosah" untuk konteks ini).
- Alokasi jam pelajaran resmi per mapel Madrasah Diniyah (sumber riset tidak konsisten) — cek teks PMA 13/2014 & Pedoman Kurikulum MDT 2023 di JDIH Kemenag.

Detail lengkap riset ada di repo dokumen: [docs/pelatihan-an-nahdhiyah.md](https://github.com/elahady/yayasanpendidikanalhikmah/blob/main/docs/pelatihan-an-nahdhiyah.md) dan [docs/kurikulum-madrasah-diniyah.md](https://github.com/elahady/yayasanpendidikanalhikmah/blob/main/docs/kurikulum-madrasah-diniyah.md).
