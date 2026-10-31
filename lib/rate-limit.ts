/**
 * Rate limit login sederhana, in-memory (cukup untuk satu proses/container;
 * hilang saat restart — disengaja, tidak perlu Redis untuk TPQ sekecil ini).
 * Dipakai oleh login API (`/api/v1/auth/login`) dan login web admin.
 *
 * Yang dihitung hanya percobaan GAGAL:
 *  - per username+IP : maks 5 gagal / 15 menit
 *  - per username    : maks 20 gagal / 15 menit (jaring pengaman kalau penyerang
 *    memalsukan header X-Forwarded-For untuk ganti-ganti IP)
 * Login sukses menghapus hitungan username+IP.
 */

const JENDELA_MS = 15 * 60 * 1000;
const MAKS_PER_USERNAME_IP = 5;
const MAKS_PER_USERNAME = 20;
const MAKS_ENTRI = 5000;

type Hitungan = { jumlah: number; berakhirPada: number };

const g = globalThis as unknown as { __loginRateLimit?: Map<string, Hitungan> };
const penyimpan = (g.__loginRateLimit ??= new Map<string, Hitungan>());

function kunciUserIp(username: string, ip: string): string {
  return `ui|${username.toLowerCase()}|${ip}`;
}

function kunciUser(username: string): string {
  return `u|${username.toLowerCase()}`;
}

function ambil(kunci: string, sekarang: number): Hitungan | null {
  const h = penyimpan.get(kunci);
  if (!h) return null;
  if (h.berakhirPada <= sekarang) {
    penyimpan.delete(kunci);
    return null;
  }
  return h;
}

function tambah(kunci: string, sekarang: number): void {
  const h = ambil(kunci, sekarang);
  if (h) {
    h.jumlah += 1;
  } else {
    penyimpan.set(kunci, { jumlah: 1, berakhirPada: sekarang + JENDELA_MS });
  }
}

function bersihkan(sekarang: number): void {
  if (penyimpan.size < MAKS_ENTRI) return;
  for (const [k, h] of penyimpan) {
    if (h.berakhirPada <= sekarang) penyimpan.delete(k);
  }
  // Masih penuh (serangan banyak username)? Buang yang terlama.
  if (penyimpan.size >= MAKS_ENTRI) {
    const buang = penyimpan.size - MAKS_ENTRI + 1;
    let i = 0;
    for (const k of penyimpan.keys()) {
      if (i++ >= buang) break;
      penyimpan.delete(k);
    }
  }
}

/** Sisa detik sampai boleh mencoba lagi, atau 0 kalau belum kena batas. */
export function detikSampaiBolehLogin(username: string, ip: string): number {
  const sekarang = Date.now();
  const a = ambil(kunciUserIp(username, ip), sekarang);
  const b = ambil(kunciUser(username), sekarang);
  let tunggu = 0;
  if (a && a.jumlah >= MAKS_PER_USERNAME_IP) tunggu = Math.max(tunggu, a.berakhirPada - sekarang);
  if (b && b.jumlah >= MAKS_PER_USERNAME) tunggu = Math.max(tunggu, b.berakhirPada - sekarang);
  return tunggu > 0 ? Math.ceil(tunggu / 1000) : 0;
}

export function catatLoginGagal(username: string, ip: string): void {
  const sekarang = Date.now();
  bersihkan(sekarang);
  tambah(kunciUserIp(username, ip), sekarang);
  tambah(kunciUser(username), sekarang);
}

export function catatLoginBerhasil(username: string, ip: string): void {
  penyimpan.delete(kunciUserIp(username, ip));
}

/** IP klien dari header proxy; "tidak-diketahui" kalau tidak ada. */
export function ipDariHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || "tidak-diketahui";
  return headers.get("x-real-ip")?.trim() || "tidak-diketahui";
}
