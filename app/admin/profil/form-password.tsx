"use client";

import { useActionState } from "react";
import { ubahPasswordAction } from "./actions";
import { AWAL_UBAH_PASSWORD, type HasilUbahPassword } from "./types";
import { tombolUtama } from "@/components/dashboard/gaya";

const labelClass = "text-[13px] font-semibold text-ink-muted";
const inputClass =
  "min-h-12 w-full rounded-xl border border-border-strong bg-bg px-3.5 text-base text-ink outline-none focus:border-primary";

export function FormPassword() {
  const [hasil, aksi, sedangProses] = useActionState<HasilUbahPassword, FormData>(
    ubahPasswordAction,
    AWAL_UBAH_PASSWORD,
  );

  return (
    <form action={aksi} className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        <div className="col-span-full flex max-w-[420px] flex-col gap-1.5">
          <label htmlFor="passwordLama" className={labelClass}>
            Password sekarang
          </label>
          <input
            id="passwordLama"
            name="passwordLama"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="passwordBaru" className={labelClass}>
            Password baru
          </label>
          <input
            id="passwordBaru"
            name="passwordBaru"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            aria-describedby="petunjuk-password"
            className={inputClass}
          />
          <p id="petunjuk-password" className="text-xs text-ink-muted">
            8 sampai 72 karakter dan berbeda dari password sekarang.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="passwordUlang" className={labelClass}>
            Ulangi password baru
          </label>
          <input
            id="passwordUlang"
            name="passwordUlang"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
      </div>

      {hasil.status === "gagal" && (
        <p role="alert" className="rounded-lg bg-no-bg px-3.5 py-2.5 text-sm font-medium text-no">
          {hasil.pesan}
        </p>
      )}
      {hasil.status === "ok" && (
        <p role="status" className="rounded-lg bg-ok-bg px-3.5 py-2.5 text-sm font-medium text-ok">
          {hasil.pesan}
        </p>
      )}

      <div>
        <button type="submit" disabled={sedangProses} className={`${tombolUtama} disabled:opacity-60`}>
          {sedangProses ? "Menyimpan..." : "Simpan password"}
        </button>
      </div>
    </form>
  );
}
