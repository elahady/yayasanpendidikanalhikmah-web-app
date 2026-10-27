export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="18" cy="18" r="17" stroke="var(--color-primary)" strokeWidth="1.5"></circle>
        <path
          d="M18 6L20.5 14.5L29 12L23.5 18L29 24L20.5 21.5L18 30L15.5 21.5L7 24L12.5 18L7 12L15.5 14.5Z"
          fill="var(--color-accent)"
        ></path>
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
          Yayasan Pendidikan
        </span>
        <span className="font-display text-xl font-bold text-ink">Al-Hikmah</span>
      </span>
    </span>
  );
}
