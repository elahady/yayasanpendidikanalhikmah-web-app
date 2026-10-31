import type { Metadata } from "next";
import type { Role } from "@prisma/client";
import { Avatar } from "@/components/avatar";
import { eyebrow, kartu, judulKartu, tombolKeluar } from "@/components/dashboard/gaya";
import { IkonLolos } from "@/components/dashboard/ikon";
import { Pill } from "@/components/dashboard/pill";
import { ThemePicker } from "@/components/theme-picker";
import { urutkanRole } from "@/lib/authz";
import { ROLE_LABEL } from "@/lib/labels";
import { muatProfil } from "@/lib/profil";
import { wajibAdminHalaman } from "@/lib/web-auth";
import { keluarAction } from "./actions";
import { FormPassword } from "./form-password";
import { hakAksesUntuk } from "./hak-akses";

export const metadata: Metadata = { title: "Profil & pengaturan | Al-Hikmah" };

function tanggalDibuat(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export default async function AdminProfilPage() {
  const actor = await wajibAdminHalaman();
  const profil = await muatProfil(actor);
  const roles = urutkanRole(profil.roles as Role[]);
  const hak = hakAksesUntuk(roles);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1.5">
        <span className={eyebrow}>Akun saya</span>
        <h1 className="font-display text-3xl font-medium leading-[1.15] text-ink sm:text-[40px]">
          Profil &amp; pengaturan
        </h1>
      </section>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">
          <section aria-label="Identitas akun" className={`${kartu} flex flex-col gap-5`}>
            <div className="flex items-center gap-4">
              <Avatar nama={profil.nama} ukuran="lg" />
              <div className="min-w-0">
                <p className="break-words font-display text-2xl font-semibold leading-tight text-ink">
                  {profil.nama}
                </p>
                <p className="break-all text-sm text-ink-muted">@{profil.username}</p>
              </div>
            </div>

            {roles.length > 0 && (
              <ul aria-label="Peran" className="flex flex-wrap gap-1.5">
                {roles.map((role) => (
                  <li key={role}>
                    <Pill varian="ok">{ROLE_LABEL[role]}</Pill>
                  </li>
                ))}
              </ul>
            )}

            <dl className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Tertaut ke ustadz</dt>
                <dd className="text-right font-semibold text-ink">{profil.ustadzNama ?? "Tidak"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Akun dibuat</dt>
                <dd className="text-right font-semibold text-ink">{tanggalDibuat(profil.dibuatPada)}</dd>
              </div>
            </dl>
          </section>

          {hak.length > 0 && (
            <section aria-labelledby="judul-hak" className={`${kartu} flex flex-col gap-3`}>
              <h2 id="judul-hak" className={judulKartu}>
                Yang boleh Anda lakukan
              </h2>
              <ul className="flex flex-col gap-2.5 text-sm text-ink">
                {hak.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-primary">
                      <IkonLolos />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="flex min-w-0 flex-[2_1_480px] flex-col gap-6">
          <section aria-labelledby="judul-tampilan" className={`${kartu} flex flex-col gap-4`}>
            <div>
              <h2 id="judul-tampilan" className={judulKartu}>
                Tampilan
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Pilihan disimpan di perangkat ini. &quot;Ikuti sistem&quot; mengikuti mode
                gelap/terang perangkat.
              </p>
            </div>
            <ThemePicker />
          </section>

          <section aria-labelledby="judul-password" className={`${kartu} flex flex-col gap-4`}>
            <div>
              <h2 id="judul-password" className={judulKartu}>
                Ubah password
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Gunakan kombinasi yang tidak dipakai di tempat lain. Setelah diganti, sesi di
                perangkat lain tetap aktif sampai habis masa berlakunya.
              </p>
            </div>
            <FormPassword />
          </section>

          <section
            aria-labelledby="judul-keluar"
            className={`${kartu} flex flex-wrap items-center justify-between gap-4`}
          >
            <div>
              <h2 id="judul-keluar" className={judulKartu}>
                Keluar dari akun
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Anda perlu memasukkan username dan password lagi untuk masuk.
              </p>
            </div>
            <form action={keluarAction}>
              <button type="submit" className={tombolKeluar}>
                Keluar
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
