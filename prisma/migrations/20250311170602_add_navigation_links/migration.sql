-- AlterTable
ALTER TABLE `settings` MODIFY `showFooterLinks` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `NavigationLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `pageId` INTEGER NULL,
    `parentId` INTEGER NULL,
    `position` INTEGER NOT NULL,
    `location` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NavigationLink` ADD CONSTRAINT `NavigationLink_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `NavigationLink`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
