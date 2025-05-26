-- AlterTable
ALTER TABLE `settings` ADD COLUMN `borderRadius` VARCHAR(191) NULL,
    ADD COLUMN `boxShadow` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `fontFamily` VARCHAR(191) NULL DEFAULT 'Montserrat, sans-serif',
    ADD COLUMN `fontSizeBase` VARCHAR(191) NULL DEFAULT '1rem',
    ADD COLUMN `fontSizeH1` VARCHAR(191) NULL DEFAULT '2.25rem',
    ADD COLUMN `fontSizeH2` VARCHAR(191) NULL DEFAULT '1.75rem',
    ADD COLUMN `fontSizeH3` VARCHAR(191) NULL DEFAULT '1.25rem',
    ADD COLUMN `letterSpacing` VARCHAR(191) NULL DEFAULT 'normal',
    ADD COLUMN `lineHeight` VARCHAR(191) NULL DEFAULT '1.6',
    ADD COLUMN `secondaryColor` VARCHAR(191) NULL DEFAULT '#f8f9fa',
    ADD COLUMN `spacingBetweenBlocks` VARCHAR(191) NULL DEFAULT '2rem',
    ADD COLUMN `textMaxWidth` VARCHAR(191) NULL DEFAULT '65ch';
