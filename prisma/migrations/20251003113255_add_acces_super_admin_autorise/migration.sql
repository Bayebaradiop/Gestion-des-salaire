-- AlterTable
ALTER TABLE `entreprises` ADD COLUMN `accesSuperAdminAutorise` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `pointages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `heureArrivee` DATETIME(3) NULL,
    `heureDepart` DATETIME(3) NULL,
    `dureeMinutes` INTEGER NULL,
    `statut` ENUM('PRESENT', 'ABSENT', 'RETARD', 'CONGE', 'MALADIE', 'TELETRAVAIL') NOT NULL DEFAULT 'PRESENT',
    `notes` VARCHAR(191) NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `misAJourLe` DATETIME(3) NOT NULL,
    `employeId` INTEGER NOT NULL,
    `entrepriseId` INTEGER NOT NULL,

    INDEX `pointages_entrepriseId_date_idx`(`entrepriseId`, `date`),
    UNIQUE INDEX `pointages_employeId_date_key`(`employeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pointages` ADD CONSTRAINT `pointages_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `employes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pointages` ADD CONSTRAINT `pointages_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `entreprises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
