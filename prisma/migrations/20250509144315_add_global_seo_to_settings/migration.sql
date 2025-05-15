-- AlterTable
ALTER TABLE `settings` ADD COLUMN `defaultMetaDescription` VARCHAR(191) NULL,
    ADD COLUMN `defaultMetaImage` VARCHAR(191) NULL,
    ADD COLUMN `defaultMetaKeywords` VARCHAR(191) NULL,
    ADD COLUMN `defaultMetaTitle` VARCHAR(191) NULL,
    ADD COLUMN `defaultRobots` VARCHAR(191) NULL;
