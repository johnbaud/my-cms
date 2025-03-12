-- AlterTable
ALTER TABLE `settings` ADD COLUMN `footerAlignment` VARCHAR(191) NOT NULL DEFAULT 'center',
    ADD COLUMN `footerBgColor` VARCHAR(191) NOT NULL DEFAULT '#000000',
    ADD COLUMN `showFooterLinks` BOOLEAN NOT NULL DEFAULT true;
