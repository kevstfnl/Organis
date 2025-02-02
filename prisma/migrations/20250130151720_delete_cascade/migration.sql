-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_enterpriseId_fkey`;

-- DropIndex
DROP INDEX `User_enterpriseId_fkey` ON `User`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_enterpriseId_fkey` FOREIGN KEY (`enterpriseId`) REFERENCES `Enterprise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
