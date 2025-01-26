/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Token` DROP FOREIGN KEY `Token_userId_fkey`;

-- DropIndex
DROP INDEX `Token_userId_key` ON `Token`;

-- AlterTable
ALTER TABLE `Token` ADD COLUMN `type` ENUM('REFRESH_TOKEN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Token_token_key` ON `Token`(`token`);

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
