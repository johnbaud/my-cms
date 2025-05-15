/*
  Warnings:

  - You are about to drop the column `defaultMetaTitle` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `settings` DROP COLUMN `defaultMetaTitle`,
    ADD COLUMN `defaultTitleSuffix` VARCHAR(191) NULL;
