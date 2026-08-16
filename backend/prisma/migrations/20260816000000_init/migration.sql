-- Initial schema for Han Wedding API
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `role` ENUM('ADMIN','STAFF') NOT NULL DEFAULT 'STAFF',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Invitation` (
  `id` VARCHAR(191) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `guestName` VARCHAR(160) NOT NULL,
  `contact` VARCHAR(120) NULL,
  `quota` INT NOT NULL,
  `status` ENUM('ACTIVE','REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `Invitation_token_key` (`token`), KEY `Invitation_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Guest` (
  `id` VARCHAR(191) NOT NULL,
  `invitationId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `contact` VARCHAR(120) NULL,
  `countedGuest` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), KEY `Guest_invitationId_idx` (`invitationId`),
  CONSTRAINT `Guest_invitationId_fkey` FOREIGN KEY (`invitationId`) REFERENCES `Invitation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RSVP` (
  `id` VARCHAR(191) NOT NULL,
  `invitationId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `attendance` ENUM('ATTENDING','NOT_ATTENDING') NOT NULL,
  `guestCount` INT NOT NULL,
  `babyCount` INT NOT NULL DEFAULT 0,
  `qrToken` VARCHAR(64) NULL,
  `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `RSVP_invitationId_key` (`invitationId`), UNIQUE KEY `RSVP_qrToken_key` (`qrToken`),
  CONSTRAINT `RSVP_invitationId_fkey` FOREIGN KEY (`invitationId`) REFERENCES `Invitation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Attendance` (
  `id` VARCHAR(191) NOT NULL,
  `invitationId` VARCHAR(191) NOT NULL,
  `checkedInAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `checkedInById` VARCHAR(191) NULL,
  `source` ENUM('STAFF','WALK_IN') NOT NULL DEFAULT 'STAFF',
  PRIMARY KEY (`id`), UNIQUE KEY `Attendance_invitationId_key` (`invitationId`), KEY `Attendance_checkedInAt_idx` (`checkedInAt`),
  CONSTRAINT `Attendance_invitationId_fkey` FOREIGN KEY (`invitationId`) REFERENCES `Invitation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Attendance_checkedInById_fkey` FOREIGN KEY (`checkedInById`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
  `id` VARCHAR(191) NOT NULL,
  `invitationId` VARCHAR(191) NULL,
  `guestName` VARCHAR(160) NOT NULL,
  `message` VARCHAR(1000) NOT NULL,
  `status` ENUM('PENDING','PUBLISHED','HIDDEN') NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `moderatedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`), KEY `Message_status_createdAt_idx` (`status`,`createdAt`), KEY `Message_invitationId_idx` (`invitationId`),
  CONSTRAINT `Message_invitationId_fkey` FOREIGN KEY (`invitationId`) REFERENCES `Invitation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `actorId` VARCHAR(191) NULL,
  `action` VARCHAR(80) NOT NULL,
  `entity` VARCHAR(80) NOT NULL,
  `entityId` VARCHAR(64) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), KEY `AuditLog_entity_entityId_idx` (`entity`,`entityId`), KEY `AuditLog_createdAt_idx` (`createdAt`),
  CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
