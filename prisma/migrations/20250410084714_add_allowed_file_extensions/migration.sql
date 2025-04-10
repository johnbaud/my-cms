-- AlterTable
ALTER TABLE `settings` ADD COLUMN `allowedFileExtensions` VARCHAR(191) NOT NULL DEFAULT 'jpg,jpeg,png,gif,webp,svg,pdf,zip';
