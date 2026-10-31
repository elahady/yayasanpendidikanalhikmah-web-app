import type { JilidKode } from "@/lib/dashboard-types";
import { kartu, judulKartu } from "./gaya";

const BARIS: { kode: JilidKode; label: string }[] = [
  { kode: "PRA_NAHDLIYAH", label: "Pra" },
  { kode: "JILID_1", label: "Jilid 1" },
  { kode: "JILID_2", label: "Jilid 2" },
  { kode: "JILID_3", label: "Jilid 3" },
  { kode: "JILID_4", label: "Jilid 4" },
  { kode: "JILID_5", label: "Jilid 5" },
  { kode: "JILID_6", label: "Jilid 6" },
  { kode: "AL_QURAN", label: "Al-Qur'an" },
];

export function TanggaJilid({
  perJilid,
  total,
}: {
  perJilid: Record<JilidKode, number>;
  total: number;
}) {
  const maks = Math.max(1, ...BARIS.map((b) => perJilid[b.kode] ?? 0));

  return (
    <section aria-labelledby="judul-jilid" className={`${kartu} flex flex-col gap-1.5`}>
      <h2 id="judul-jilid" className={judulKartu}>
        Tangga jilid An-Nahdhiyah
      </h2>
      {total === 0 ? (
        <p className="text-[13px] text-ink-muted">
          Belum ada santri, sebaran jilid muncul setelah santri ditambahkan.
        </p>
      ) : (
        <>
          <p className="mb-2 text-[13px] text-ink-muted">
            Sebaran {total} santri dari Pra Nahdhiyah sampai membaca Al-Qur&apos;an.
          </p>
          <ul className="flex flex-col gap-2.5">
            {BARIS.map((b) => {
              const n = perJilid[b.kode] ?? 0;
              return (
                <li key={b.kode} className="flex items-center gap-3">
                  <span className="w-[76px] shrink-0 text-[13px] font-semibold text-ink sm:w-[92px]">
                    {b.label}
                  </span>
                  <div aria-hidden="true" className="h-[26px] flex-1 rounded-lg bg-bg-muted">
                    <div
                      style={{ width: `${(n / maks) * 100}%` }}
                      className={`h-full rounded-lg ${b.kode === "AL_QURAN" ? "bg-accent" : "bg-primary"}`}
                    />
                  </div>
                  <strong className="w-8 shrink-0 text-right text-ink">
                    {n}
                    <span className="sr-only"> santri</span>
                  </strong>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
