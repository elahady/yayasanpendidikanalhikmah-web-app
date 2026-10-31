/** Ikon garis kecil untuk dashboard (dekoratif: selalu disertai teks). */

const dasar = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "h-5 w-5 shrink-0",
} as const;

export function IkonCentang() {
  return (
    <svg {...dasar}>
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

export function IkonTambah() {
  return (
    <svg {...dasar}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IkonJam() {
  return (
    <svg {...dasar}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IkonPeringatan() {
  return (
    <svg {...dasar}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

export function IkonOrang() {
  return (
    <svg {...dasar}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IkonBuku() {
  return (
    <svg {...dasar}>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19V5" />
    </svg>
  );
}

export function IkonLolos() {
  return (
    <svg {...dasar}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}
