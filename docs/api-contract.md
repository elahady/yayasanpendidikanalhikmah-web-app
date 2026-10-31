# Kontrak API v1 (web ⇄ Android)

Acuan bersama untuk backend (Next.js, `app/api/v1/`) dan app Android. Kalau ada yang perlu diubah, ubah dokumen ini dulu, baru kode.

- Base URL produksi: `https://tpq-alhikmah.roziqrizal.com/api/v1` (sementara; Android menyimpannya di satu konstanta).
- Format: JSON, UTF-8. Tanggal `YYYY-MM-DD` (zona Asia/Jakarta). Waktu `ISO-8601`.
- Auth: `Authorization: Bearer <accessToken>` di semua endpoint kecuali login.
- Token: JWT, masa berlaku 30 hari, **tanpa refresh token** (TPQ kecil, jangan ribet). `401` → app kembali ke layar login.
- Error seragam: HTTP status yang sesuai + body `{ "error": { "code": "KODE", "message": "teks Indonesia" } }`.
  Kode: `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `SELF_ATTENDANCE_FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION` (422), `RATE_LIMITED` (429), `INTERNAL` (500, kesalahan server tak terduga).
- Login dibatasi percobaan (rate limit sederhana per username+IP): 5 percobaan gagal / 15 menit, juga batas 20 gagal / 15 menit per username. Terlewati -> `429 RATE_LIMITED` + header `Retry-After` (detik).

## Role

`ADMIN`, `TU`, `PENGAWAS`, `PIKET`, `USTADZ`, `WALI`. Satu akun bisa punya lebih dari satu role (mis. `PIKET` + `USTADZ`).
`ADMIN` dan `TU` saat ini hak aksesnya sama (dipisah di kode supaya mudah dibedakan nanti).

| Role | Lihat | Tulis |
|---|---|---|
| ADMIN, TU | semua | semua |
| PENGAWAS | semua | tidak ada |
| PIKET | absensi ustadz, data santri | absensi ustadz |
| USTADZ | semua santri (semua kelas), progress, absensi santri | absensi santri, progress |
| WALI | hanya santri anaknya (server memfilter) | tidak ada |

Aturan khusus:
- Akun yang tertaut ke seorang ustadz (`ustadzId`) **tidak boleh membuat/mengubah absensi atas nama ustadz itu sendiri** (`SELF_ATTENDANCE_FORBIDDEN`). Dicek di server. ADMIN/TU dikecualikan.
- Pencatat boleh mengubah entri absensi yang ia buat sendiri; ADMIN/TU boleh mengubah semua. Role lain yang mencoba mengubah entri orang lain → `FORBIDDEN`.
- Tanpa riwayat perubahan, tanpa alur persetujuan.
- Kelola akun, CRUD santri/ustadz, dan relasi wali↔santri **hanya di web** (`/admin`, untuk ADMIN/TU), tidak ada di API v1.

## Endpoint

### `POST /auth/login`
Body `{ "username": "...", "password": "..." }` →
```json
{ "accessToken": "jwt", "user": { "id": "...", "nama": "...", "roles": ["PIKET","USTADZ"], "ustadzId": "..."|null } }
```

### `GET /me`
→ objek `user` seperti di atas (untuk cek sesi saat app dibuka).

### `GET /santri?q=`
Daftar santri (WALI: hanya anaknya). `q` mencari nama.
```json
{ "items": [ { "id": "...", "nama": "...", "jenjang": "ULA", "kelas": "1", "jilidSaatIni": "JILID_2", "catatanProgressMadin": "..."|null } ] }
```
Enum `jenjang`: `ULA`, `WUSTHO`. Enum `jilidSaatIni`: `PRA_NAHDLIYAH`, `JILID_1`..`JILID_6`, `AL_QURAN`.

### `GET /santri/{id}`
Satu santri (bentuk sama dengan item di atas). WALI selain wali santri itu → `FORBIDDEN`.

### `PATCH /santri/{id}/progress`  — ADMIN, TU, USTADZ
Body (salah satu atau keduanya): `{ "jilidSaatIni": "JILID_3", "catatanProgressMadin": "teks"|null }` → santri terbaru.

### `GET /ustadz` — semua role kecuali WALI
```json
{ "items": [ { "id": "...", "nama": "...", "mapelDiajar": "..." } ] }
```

### `GET /absensi-santri?tanggal=YYYY-MM-DD` atau `?santriId=...&dari=...&sampai=...`
Mode tanggal: semua entri hari itu. Mode santri: riwayat satu santri (WALI hanya anaknya). Santri yang belum punya entri tidak muncul (klien menggabungkan dengan `/santri`).
```json
{ "items": [ { "id": "...", "santriId": "...", "tanggal": "2026-11-02", "hadir": true, "keterangan": null,
               "dicatatOleh": "nama akun", "bisaDiubah": true } ] }
```
`bisaDiubah` dihitung server untuk pemanggil, supaya klien tinggal menonaktifkan tombol.

### `PUT /absensi-santri` — ADMIN, TU, USTADZ
Upsert per (santriId, tanggal). Body `{ "santriId", "tanggal", "hadir", "keterangan"?: string|null }` → satu entri (bentuk di atas).

### `GET /absensi-ustadz?tanggal=YYYY-MM-DD` — semua role kecuali WALI
Bentuk sama, dengan `ustadzId` menggantikan `santriId`.

### `PUT /absensi-ustadz` — ADMIN, TU, PIKET
Upsert per (ustadzId, tanggal). Body `{ "ustadzId", "tanggal", "hadir", "keterangan"? }`. Aturan self-attendance di atas berlaku.

### `GET /rekap?tanggal=YYYY-MM-DD` — semua role kecuali WALI
Untuk pantauan harian pengawas.
```json
{ "tanggal": "2026-11-02", "santri": { "hadir": 40, "total": 45, "belumDicatat": 2 }, "ustadz": { "hadir": 5, "total": 6, "belumDicatat": 0 } }
```

## Catatan implementasi (disepakati saat membangun backend)

Perilaku yang belum eksplisit di atas, sekarang ditetapkan (backend = sumber kebenaran):

- Role dan status aktif akun dibaca ulang dari database di **setiap request**: akun yang dinonaktifkan langsung `401 UNAUTHENTICATED` walau tokennya belum kedaluwarsa; perubahan role langsung berlaku.
- `POST /auth/login`: username/password salah -> `401 UNAUTHENTICATED`; password benar tapi akun dinonaktifkan -> `403 FORBIDDEN` (bukan 401, supaya app menampilkan pesan, tidak sekadar kembali ke layar login).
- Matriks dipertegas: PIKET **tidak** boleh `GET /absensi-santri` (`403 FORBIDDEN`); `GET /rekap`, `GET /ustadz`, `GET /absensi-ustadz` terbuka untuk semua role kecuali WALI. Akun dengan beberapa role mendapat gabungan hak semua rolenya (WALI+USTADZ melihat semua santri, bukan hanya anaknya).
- `GET /absensi-santri` mode tanggal untuk WALI: hanya entri santri anaknya. Mode santri untuk santri yang bukan anaknya -> `403 FORBIDDEN` (id yang tidak ada pun dijawab 403 untuk WALI, supaya tidak membocorkan keberadaan data). Untuk role lain, id yang tidak ada -> `404 NOT_FOUND`. Mode santri dibatasi 400 entri terbaru; `dari`/`sampai` opsional. Wajib tepat satu mode (`tanggal` ATAU `santriId`), selain itu `422`.
- `PUT` absensi: `dicatatOleh` / pencatat entri = **akun terakhir yang menyimpannya** (jika ADMIN/TU mengubah entri ustadz, entri itu menjadi milik ADMIN/TU dan pencatat awal tidak bisa mengubahnya lagi). Entri lama dari sebelum fitur multi-role punya `dicatatOleh: null` dan hanya bisa diubah ADMIN/TU. `keterangan` yang dikosongkan/dihilangkan menjadi `null` (PUT = ganti penuh).
- Urutan pengecekan `PUT /absensi-ustadz`: role (`FORBIDDEN`) -> self-attendance (`SELF_ATTENDANCE_FORBIDDEN`) -> data ada (`NOT_FOUND`) -> kepemilikan entri (`FORBIDDEN`). `bisaDiubah` sudah memperhitungkan semuanya.
- Validasi: `tanggal` harus tanggal kalender yang valid (`2026-02-31` ditolak); `keterangan` maks 191 karakter; `catatanProgressMadin` maks 5000 karakter; `PATCH progress` tanpa field apa pun -> `422`. Body bukan JSON -> `422 VALIDATION`.
- Endpoint `/api/v1/*` yang tidak ada -> `404 NOT_FOUND` berformat JSON yang sama.
- Token HS256, `sub` = id akun; ganti password tidak membatalkan token yang sudah terbit (hanya menonaktifkan akun yang langsung efektif).
