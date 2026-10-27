"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ganti ke tampilan terang" : "Ganti ke tampilan gelap"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-ink-muted transition hover:border-border-strong hover:text-ink"
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5"></circle>
          <path d="M12 2.5V5"></path>
          <path d="M12 19V21.5"></path>
          <path d="M4.2 4.2L6 6"></path>
          <path d="M18 18L19.8 19.8"></path>
          <path d="M2.5 12H5"></path>
          <path d="M19 12H21.5"></path>
          <path d="M4.2 19.8L6 18"></path>
          <path d="M18 6L19.8 4.2"></path>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 13.2C19.9 13.7 18.7 14 17.4 14C12.8 14 9 10.2 9 5.6C9 4.3 9.3 3.1 9.8 2C5.8 2.9 2.8 6.5 2.8 10.8C2.8 15.8 6.9 19.9 11.9 19.9C16.2 19.9 19.8 16.9 20.7 12.9C20.8 13 21 13.1 21 13.2Z"></path>
        </svg>
      )}
    </button>
  );
}
