import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.TU_USERNAME;
  const password = process.env.TU_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Set TU_USERNAME dan TU_PASSWORD di .env sebelum menjalankan seed.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.tU.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Akun TU "${username}" siap digunakan.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
