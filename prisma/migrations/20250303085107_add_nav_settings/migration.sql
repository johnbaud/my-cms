-- AlterTable
ALTER TABLE `settings` ADD COLUMN `showLogo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `showSiteName` BOOLEAN NOT NULL DEFAULT true;
