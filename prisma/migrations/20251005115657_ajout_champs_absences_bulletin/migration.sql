-- AlterTable
ALTER TABLE `bulletins_paie` ADD COLUMN `joursAbsences` VARCHAR(191) NULL,
    ADD COLUMN `montantDeduction` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `nombreAbsences` INTEGER NULL DEFAULT 0;
