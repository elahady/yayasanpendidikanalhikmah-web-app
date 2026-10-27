# Yayasan Pendidikan Al-Hikmah — Web App

Aplikasi web untuk TPQ & Madrasah Diniyah Yayasan Pendidikan Al-Hikmah: halaman publik (kurikulum, jadwal, struktur organisasi) + panel admin untuk TU (absensi ustadz/ustadzah, absensi santri, progress pembelajaran santri).

Dokumen konsep (kurikulum, proposal donatur, dll) ada di repo terpisah: [yayasanpendidikanalhikmah](https://github.com/elahady/yayasanpendidikanalhikmah).

## Status

Belum ada kode — repo baru dibuat 2026-10-27, masih tahap perencanaan teknis (stack, skema data, dll).

## Rencana Stack (belum final)

- Next.js (React + TypeScript)
- Prisma ORM + MySQL (reuse container `shared-mysql` di VPS yang sama dengan rizqflow/habitflow — lihat `C:\Project\personal\build-server`)
- NextAuth/Auth.js untuk login TU
- Deploy: Docker container di VPS `103.54.170.198`, diakses via IP:port selama development, domain terpisah menyusul kemudian
