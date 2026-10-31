import type { KehadiranHitung } from "@/lib/dashboard-types";

/** "YYYY-MM-DD" -> Date pada tengah malam UTC (tanggal kalender, bebas zona waktu). */
export function dariTanggal(tanggal: string): Date {
  return new Date(`${tanggal}T00:00:00Z`);
}

/** "18 Okt" */
export function tanggalPendek(tanggal: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    dariTanggal(tanggal),
  );
}

/** "Sabtu, 31 Oktober 2026" */
export function tanggalPanjang(tanggal: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dariTanggal(tanggal));
}

function tanggalJakarta(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(d);
}

/** "Hari ini, 08.12" / "Kemarin, 16.20" / "29 Okt, 10.05" (zona waktu Asia/Jakarta). */
export function waktuRelatif(iso: string, hariIni: string): string {
  const waktu = new Date(iso);
  const jam = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  })
    .format(waktu)
    .replace(":", ".");
  const hari = tanggalJakarta(waktu);
  const kemarin = new Date(dariTanggal(hariIni).getTime() - 86_400_000).toISOString().slice(0, 10);
  if (hari === hariIni) return `Hari ini, ${jam}`;
  if (hari === kemarin) return `Kemarin, ${jam}`;
  return `${tanggalPendek(hari)}, ${jam}`;
}

/** Persentase bulat (0 bila pembagi 0). */
export function persen(bagian: number, total: number): number {
  return total > 0 ? Math.round((bagian / total) * 100) : 0;
}

export function adaData(h: KehadiranHitung): boolean {
  return h.total > 0;
}
