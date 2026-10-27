# Image Debian (bukan Alpine) supaya Prisma generate engine binary yang cocok
# (glibc) tanpa perlu konfigurasi binaryTargets tambahan di schema.prisma.
FROM node:22-bookworm-slim

WORKDIR /app

# Prisma butuh OpenSSL untuk deteksi engine yang benar (tanpa ini ada warning
# "failed to detect libssl version" saat generate/runtime).
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Nilai dummy — hanya supaya `prisma generate` dan `next build` tidak gagal
# karena env var "kosong". Nilai asli datang dari .env.production saat container
# benar-benar jalan (lihat docker-compose.yml, env_file).
ENV DATABASE_URL="mysql://user:pass@localhost:3306/placeholder"
ENV AUTH_SECRET="build-time-placeholder-not-used-at-runtime"

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
