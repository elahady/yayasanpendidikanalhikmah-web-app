-- CreateTable
CREATE TABLE `TU` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TU_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Santri` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenjang` ENUM('ULA', 'WUSTHO') NOT NULL,
    `kelas` VARCHAR(191) NOT NULL,
    `jilidSaatIni` ENUM('PRA_NAHDLIYAH', 'JILID_1', 'JILID_2', 'JILID_3', 'JILID_4', 'JILID_5', 'JILID_6', 'AL_QURAN') NOT NULL DEFAULT 'PRA_NAHDLIYAH',
    `catatanProgressMadin` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ustadz` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `mapelDiajar` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbsensiSantri` (
    `id` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,
    `tanggal` DATE NOT NULL,
    `hadir` BOOLEAN NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AbsensiSantri_santriId_tanggal_key`(`santriId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbsensiUstadz` (
    `id` VARCHAR(191) NOT NULL,
    `ustadzId` VARCHAR(191) NOT NULL,
    `tanggal` DATE NOT NULL,
    `hadir` BOOLEAN NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AbsensiUstadz_ustadzId_tanggal_key`(`ustadzId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AbsensiSantri` ADD CONSTRAINT `AbsensiSantri_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `Santri`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsensiUstadz` ADD CONSTRAINT `AbsensiUstadz_ustadzId_fkey` FOREIGN KEY (`ustadzId`) REFERENCES `Ustadz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
