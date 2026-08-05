-- AlterTable
ALTER TABLE `cursos_extensao` ADD COLUMN `imagemCapa` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `departamentos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `instituicaoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `departamentos` ADD CONSTRAINT `departamentos_instituicaoId_fkey` FOREIGN KEY (`instituicaoId`) REFERENCES `instituicoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
