-- DropForeignKey
ALTER TABLE `Material` DROP FOREIGN KEY `Material_userId_fkey`;

-- AlterTable
ALTER TABLE `Material` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
