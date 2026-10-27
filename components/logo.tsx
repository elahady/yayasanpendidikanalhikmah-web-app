import Image from "next/image";

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <Image src="/logo.png" alt="Logo TPQ Al-Hikmah" width={40} height={40} className="shrink-0" priority />
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
          Yayasan Pendidikan
        </span>
        <span className="font-display text-xl font-bold text-ink">Al-Hikmah</span>
      </span>
    </span>
  );
}
