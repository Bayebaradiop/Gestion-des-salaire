/*
  Warnings:

  - You are about to drop the `paiements_automatises` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `paiements_automatises` DROP FOREIGN KEY `paiements_automatises_calculeParId_fkey`;

-- DropForeignKey
ALTER TABLE `paiements_automatises` DROP FOREIGN KEY `paiements_automatises_employeId_fkey`;

-- DropForeignKey
ALTER TABLE `paiements_automatises` DROP FOREIGN KEY `paiements_automatises_entrepriseId_fkey`;

-- DropForeignKey
ALTER TABLE `paiements_automatises` DROP FOREIGN KEY `paiements_automatises_payeParId_fkey`;

-- AlterTable
ALTER TABLE `employes` ADD COLUMN `tauxHoraire` DOUBLE NULL,
    MODIFY `typeContrat` ENUM('JOURNALIER', 'FIXE', 'HONORAIRE', 'HORAIRE') NOT NULL;

-- DropTable
DROP TABLE `paiements_automatises`;
