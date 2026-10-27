import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Dimatikan: app ini didominasi halaman dinamis (admin butuh cek sesi login
  // di hampir semua rute), jadi model Cache Components (statis by default)
  // lebih sering menghalangi daripada membantu di sini.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
