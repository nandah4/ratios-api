-- AlterTable
ALTER TABLE `photo` ADD COLUMN `albumId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `Follows` (
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`followerId`, `followingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `Album`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
