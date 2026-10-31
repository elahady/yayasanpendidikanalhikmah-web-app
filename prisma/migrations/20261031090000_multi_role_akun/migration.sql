-- Migrasi multi-role: model TU diganti Akun (+ AkunRole, WaliSantri), dan absensi
-- mencatat siapa pencatatnya (dicatatOlehId).
--
-- PENTING (data produksi): baris TU yang sudah ada TIDAK dibuang. Setiap baris TU
-- disalin ke Akun dengan id, username, passwordHash, createdAt yang sama (nama diisi
-- dari username, aktif = true) lalu diberi role TU. Dengan begitu TU yang sekarang
-- login tetap bisa login dengan password yang sama, dan id-nya tidak berubah.

-- CreateTable
CREATE TABLE `Akun` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ustadzId` VARCHAR(191) NULL,

    UNIQUE INDEX `Akun_username_key`(`username`),
    UNIQUE INDEX `Akun_ustadzId_key`(`ustadzId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AkunRole` (
    `akunId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TU', 'PENGAWAS', 'PIKET', 'USTADZ', 'WALI') NOT NULL,

    INDEX `AkunRole_role_idx`(`role`),
    PRIMARY KEY (`akunId`, `role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaliSantri` (
    `akunId` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,

    INDEX `WaliSantri_santriId_idx`(`santriId`),
    PRIMARY KEY (`akunId`, `santriId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Pertahankan data TU lama: salin ke Akun, beri role TU, lalu buang tabel TU.
INSERT INTO `Akun` (`id`, `username`, `passwordHash`, `nama`, `aktif`, `createdAt`)
SELECT `id`, `username`, `passwordHash`, `username`, true, `createdAt` FROM `TU`;

INSERT INTO `AkunRole` (`akunId`, `role`)
SELECT `id`, 'TU' FROM `TU`;

-- DropTable
DROP TABLE `TU`;

-- AlterTable
ALTER TABLE `AbsensiSantri` ADD COLUMN `dicatatOlehId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `AbsensiUstadz` ADD COLUMN `dicatatOlehId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `AbsensiSantri_dicatatOlehId_idx` ON `AbsensiSantri`(`dicatatOlehId`);

-- CreateIndex
CREATE INDEX `AbsensiUstadz_dicatatOlehId_idx` ON `AbsensiUstadz`(`dicatatOlehId`);

-- AddForeignKey
ALTER TABLE `Akun` ADD CONSTRAINT `Akun_ustadzId_fkey` FOREIGN KEY (`ustadzId`) REFERENCES `Ustadz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AkunRole` ADD CONSTRAINT `AkunRole_akunId_fkey` FOREIGN KEY (`akunId`) REFERENCES `Akun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WaliSantri` ADD CONSTRAINT `WaliSantri_akunId_fkey` FOREIGN KEY (`akunId`) REFERENCES `Akun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WaliSantri` ADD CONSTRAINT `WaliSantri_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `Santri`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsensiSantri` ADD CONSTRAINT `AbsensiSantri_dicatatOlehId_fkey` FOREIGN KEY (`dicatatOlehId`) REFERENCES `Akun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsensiUstadz` ADD CONSTRAINT `AbsensiUstadz_dicatatOlehId_fkey` FOREIGN KEY (`dicatatOlehId`) REFERENCES `Akun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
