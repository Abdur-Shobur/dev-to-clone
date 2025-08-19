/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL,
    ADD COLUMN `verificationToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_verificationToken_key` ON `users`(`verificationToken`);

-- CreateIndex
CREATE UNIQUE INDEX `users_resetToken_key` ON `users`(`resetToken`);
