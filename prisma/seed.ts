import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Buat/perbarui satu akun lalu pastikan ia punya `role`. Idempoten: dijalankan
 * ulang akan menyetel ulang password sesuai env (perilaku seed lama dipertahankan)
 * dan tidak menghapus role lain yang sudah dimiliki akun itu.
 */
async function siapkanAkun(opts: {
  username: string;
  password: string;
  nama: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(opts.password, 10);

  const akun = await prisma.akun.upsert({
    where: { username: opts.username },
    // Akun yang sudah ada (mis. TU hasil migrasi) tidak diganti namanya.
    update: { passwordHash, aktif: true },
    create: { username: opts.username, passwordHash, nama: opts.nama },
  });

  await prisma.akunRole.upsert({
    where: { akunId_role: { akunId: akun.id, role: opts.role } },
    update: {},
    create: { akunId: akun.id, role: opts.role },
  });

  console.log(`Akun ${opts.role} "${opts.username}" siap digunakan.`);
}

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const tuUsername = process.env.TU_USERNAME;
  const tuPassword = process.env.TU_PASSWORD;

  const adaAdmin = Boolean(adminUsername && adminPassword);
  const adaTU = Boolean(tuUsername && tuPassword);

  if (!adaAdmin && !adaTU) {
    throw new Error(
      "Set ADMIN_USERNAME + ADMIN_PASSWORD (dan/atau TU_USERNAME + TU_PASSWORD) di .env sebelum menjalankan seed.",
    );
  }

  if (adminUsername && adminPassword) {
    await siapkanAkun({
      username: adminUsername,
      password: adminPassword,
      nama: "Administrator",
      role: "ADMIN",
    });
  } else {
    console.warn("ADMIN_USERNAME/ADMIN_PASSWORD tidak diset — akun ADMIN dilewati.");
  }

  if (tuUsername && tuPassword) {
    await siapkanAkun({
      username: tuUsername,
      password: tuPassword,
      nama: "TU",
      role: "TU",
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
