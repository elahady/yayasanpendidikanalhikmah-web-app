import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yayasan Pendidikan Al-Hikmah",
  description: "TPQ & Madrasah Diniyah Yayasan Pendidikan Al-Hikmah",
};

// Tema: 'system' | 'light' | 'dark' tersimpan di localStorage('theme'); nilai lain /
// kosong = 'system'. data-theme-pref memuat pilihan, data-theme SELALU hasil
// eksplisit light|dark (lihat components/theme-pref.ts). Untuk 'system', perubahan
// mode gelap/terang perangkat diikuti lewat listener di bawah.
const themeInitScript = `
try {
  var root = document.documentElement;
  var pref = 'system';
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') pref = stored;
  } catch (e) {}
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var apply = function () {
    var p = root.getAttribute('data-theme-pref');
    root.setAttribute('data-theme', p === 'light' || p === 'dark' ? p : (mq.matches ? 'dark' : 'light'));
  };
  root.setAttribute('data-theme-pref', pref);
  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply);
  else if (mq.addListener) mq.addListener(apply);
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
