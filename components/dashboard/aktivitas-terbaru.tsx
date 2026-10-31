import type { Aktivitas } from "@/lib/dashboard-types";
import { kartu, judulKartu } from "./gaya";
import { waktuRelatif } from "./format";

export function AktivitasTerbaru({
  aktivitas,
  hariIni,
}: {
  aktivitas: Aktivitas[];
  hariIni: string;
}) {
  return (
    <section aria-labelledby="judul-aktivitas" className={`${kartu} flex flex-col gap-3.5`}>
      <h2 id="judul-aktivitas" className={judulKartu}>
        Aktivitas terbaru
      </h2>
      {aktivitas.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Belum ada aktivitas pencatatan dalam 7 hari terakhir.
        </p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {aktivitas.map((a, i) => {
            // `ringkas` berupa kalimat utuh yang diawali nama pencatat; nama ditebalkan.
            const diawaliNama = a.oleh !== "" && a.ringkas.startsWith(a.oleh);
            return (
              <li key={`${a.waktu}-${i}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                />
                <div>
                  <p className="text-sm text-ink">
                    {diawaliNama ? (
                      <>
                        <strong>{a.oleh}</strong>
                        {a.ringkas.slice(a.oleh.length)}
                      </>
                    ) : (
                      a.ringkas
                    )}
                  </p>
                  <p className="text-xs text-ink-muted">{waktuRelatif(a.waktu, hariIni)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
