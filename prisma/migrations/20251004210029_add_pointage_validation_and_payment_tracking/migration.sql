/*
  Warnings:

  - You are about to drop the column `creeLe` on the `paiements_automatises` table. All the data in the column will be lost.
  - You are about to drop the column `misAJourLe` on the `paiements_automatises` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paiements_automatises` DROP COLUMN `creeLe`,
    DROP COLUMN `misAJourLe`,
    ADD COLUMN `calculeParId` INTEGER NULL,
    ADD COLUMN `payeParId` INTEGER NULL;

-- AlterTable
ALTER TABLE `pointages` ADD COLUMN `dateValidation` DATETIME(3) NULL,
    ADD COLUMN `estValide` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `valideParId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `paiements_automatises` ADD CONSTRAINT `paiements_automatises_calculeParId_fkey` FOREIGN KEY (`calculeParId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements_automatises` ADD CONSTRAINT `paiements_automatises_payeParId_fkey` FOREIGN KEY (`payeParId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pointages` ADD CONSTRAINT `pointages_valideParId_fkey` FOREIGN KEY (`valideParId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
