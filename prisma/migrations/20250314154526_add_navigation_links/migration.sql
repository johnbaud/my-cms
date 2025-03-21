/*
  Warnings:

  - A unique constraint covering the columns `[parentId,position]` on the table `NavigationLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `NavigationLink_parentId_position_key` ON `NavigationLink`(`parentId`, `position`);
