/*
  Warnings:

  - You are about to drop the column `entrepriseId` on the `User` table. All the data in the column will be lost.
  - Added the required column `enterpriseId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_entrepriseId_fkey`;

-- DropIndex
DROP INDEX `User_entrepriseId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `entrepriseId`,
    ADD COLUMN `enterpriseId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_enterpriseId_fkey` FOREIGN KEY (`enterpriseId`) REFERENCES `Enterprise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
