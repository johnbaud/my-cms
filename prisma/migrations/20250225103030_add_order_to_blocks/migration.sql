-- DropForeignKey
ALTER TABLE `block` DROP FOREIGN KEY `Block_pageId_fkey`;

-- DropIndex
DROP INDEX `Block_pageId_fkey` ON `block`;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
