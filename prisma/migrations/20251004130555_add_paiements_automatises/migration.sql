-- CreateTable
CREATE TABLE `paiements_automatises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periode` VARCHAR(191) NOT NULL,
    `montantDu` DOUBLE NOT NULL,
    `montantPaye` DOUBLE NOT NULL DEFAULT 0,
    `typeContrat` ENUM('JOURNALIER', 'FIXE', 'HONORAIRE') NOT NULL,
    `detailsCalcul` JSON NOT NULL,
    `statut` ENUM('CALCULE', 'PARTIEL', 'PAYE', 'ANNULE') NOT NULL DEFAULT 'CALCULE',
    `methodePaiement` ENUM('ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE', 'AUTRE') NULL,
    `dateCalcul` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `datePaiement` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `misAJourLe` DATETIME(3) NOT NULL,
    `employeId` INTEGER NOT NULL,
    `entrepriseId` INTEGER NOT NULL,

    INDEX `paiements_automatises_entrepriseId_periode_idx`(`entrepriseId`, `periode`),
    UNIQUE INDEX `paiements_automatises_employeId_periode_key`(`employeId`, `periode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `paiements_automatises` ADD CONSTRAINT `paiements_automatises_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `employes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements_automatises` ADD CONSTRAINT `paiements_automatises_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `entreprises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
