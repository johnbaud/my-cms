-- AddForeignKey
ALTER TABLE `NavigationLink` ADD CONSTRAINT `NavigationLink_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
