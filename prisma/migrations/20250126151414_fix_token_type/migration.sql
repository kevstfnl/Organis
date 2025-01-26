-- DropIndex
DROP INDEX `Token_token_key` ON `Token`;

-- AlterTable
ALTER TABLE `Token` MODIFY `token` LONGTEXT NOT NULL;
