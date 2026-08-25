-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `lastOverdueNotifiedAt` DATETIME(3) NULL,
    ADD COLUMN `remindedAt` DATETIME(3) NULL;
