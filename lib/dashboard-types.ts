/**
 * Bentuk data Beranda/Dashboard — cermin persis `GET /api/v1/dashboard` di docs/api-contract.md.
 * Tipe murni (tanpa import server) supaya aman diimpor dari komponen mana pun.
 */

export type JenjangKode = "ULA" | "WUSTHO";
export type JilidKode =
  | "PRA_NAHDLIYAH"
  | "JILID_1"
  | "JILID_2"
  | "JILID_3"
  | "JILID_4"
  | "JILID_5"
  | "JILID_6"
  | "AL_QURAN";

export type KehadiranHitung = {
  total: number;
  hadir: number;
  tidakHadir: number;
  belumDicatat: number;
};

export type DashboardSantri = KehadiranHitung & {
  perJenjang: Record<JenjangKode, number>;
  perJilid: Record<JilidKode, number>;
};

export type DashboardUstadzItem = {
  id: string;
  nama: string;
  mapelDiajar: string;
  status: StatusHari;
};

/** Ringkasan ustadz hari ini + daftar per ustadz (urut nama). */
export type DashboardUstadz = KehadiranHitung & { daftar: DashboardUstadzItem[] };

export type TrenHari = { tanggal: string; hadir: number; tercatat: number };

export type PerhatianKode =
  | "SANTRI_BELUM_DICATAT"
  | "SANTRI_ABSEN_BERUNTUN"
  | "USTADZ_BELUM_DICATAT"
  | "PROGRESS_LAMA";

export type PerhatianAksi = "ABSENSI_SANTRI" | "ABSENSI_USTADZ" | "DAFTAR_SANTRI";

export type Perhatian = {
  kode: PerhatianKode;
  jumlah: number;
  judul: string;
  keterangan: string;
  aksi: PerhatianAksi;
};

export type Aktivitas = {
  /** ISO-8601 */
  waktu: string;
  oleh: string;
  jenis: "ABSENSI_SANTRI" | "ABSENSI_USTADZ";
  ringkas: string;
};

export type DashboardRingkasan = {
  santri: DashboardSantri;
  ustadz: DashboardUstadz;
  tren: TrenHari[];
  perhatian: Perhatian[];
  aktivitas: Aktivitas[];
};

export type StatusHari = "HADIR" | "TIDAK_HADIR" | "BELUM_DICATAT";

export type DashboardAnak = {
  santri: {
    id: string;
    nama: string;
    jenjang: JenjangKode;
    kelas: string;
    jilidSaatIni: JilidKode;
    catatanProgressMadin: string | null;
  };
  /** ISO-8601 */
  diperbaruiPada: string;
  kehadiran: {
    hadir: number;
    tidakHadir: number;
    belumDicatat: number;
    hari: { tanggal: string; status: StatusHari }[];
  };
};

export type DashboardDto = {
  /** YYYY-MM-DD (Asia/Jakarta) */
  tanggal: string;
  /** false bila `tanggal` Sabtu/Minggu (libur); lihat lib/jadwal.ts */
  hariBelajar: boolean;
  ringkasan: DashboardRingkasan | null;
  anak: DashboardAnak[] | null;
};

/** Data layar Profil (web `/admin/profil` dan objek `user` API `GET /me`). */
export type ProfilDto = {
  id: string;
  username: string;
  nama: string;
  roles: string[];
  ustadzId: string | null;
  ustadzNama: string | null;
  /** ISO-8601 */
  dibuatPada: string;
};
