/*
  Warnings:

  - You are about to drop the column `concedidoEm` on the `permissoes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `permissoes` table. All the data in the column will be lost.
  - You are about to drop the column `papel` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recurso,acao]` on the table `permissoes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `permissoes` DROP FOREIGN KEY `permissoes_userId_fkey`;

-- DropIndex
DROP INDEX `permissoes_userId_recurso_acao_key` ON `permissoes`;

-- AlterTable
ALTER TABLE `permissoes` DROP COLUMN `concedidoEm`,
    DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `papel`;

-- CreateTable
CREATE TABLE `papeis` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `papeis_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_papeis` (
    `userId` VARCHAR(191) NOT NULL,
    `papelId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `papelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `papeis_permissoes` (
    `papelId` VARCHAR(191) NOT NULL,
    `atribuidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `permissaoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`papelId`, `permissaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `permissoes_recurso_acao_key` ON `permissoes`(`recurso`, `acao`);

-- AddForeignKey
ALTER TABLE `users_papeis` ADD CONSTRAINT `users_papeis_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_papeis` ADD CONSTRAINT `users_papeis_papelId_fkey` FOREIGN KEY (`papelId`) REFERENCES `papeis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `papeis_permissoes` ADD CONSTRAINT `papeis_permissoes_papelId_fkey` FOREIGN KEY (`papelId`) REFERENCES `papeis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `papeis_permissoes` ADD CONSTRAINT `papeis_permissoes_permissaoId_fkey` FOREIGN KEY (`permissaoId`) REFERENCES `permissoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
