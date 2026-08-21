/*
  Warnings:

  - A unique constraint covering the columns `[invitationId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_invitationId_fkey`;

-- AlterTable
ALTER TABLE `Message` MODIFY `status` ENUM('PENDING', 'PUBLISHED', 'HIDDEN') NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE UNIQUE INDEX `Message_invitationId_key` ON `Message`(`invitationId`);

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_invitationId_fkey` FOREIGN KEY (`invitationId`) REFERENCES `Invitation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
