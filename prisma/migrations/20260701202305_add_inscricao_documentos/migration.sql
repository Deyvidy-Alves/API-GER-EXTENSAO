-- CreateTable
CREATE TABLE `inscricao_documentos` (
    `id` VARCHAR(191) NOT NULL,
    `nomeOriginal` VARCHAR(191) NOT NULL,
    `nomeArquivo` VARCHAR(191) NOT NULL,
    `caminho` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `tamanho` INTEGER NOT NULL,
    `inscricaoId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inscricao_documentos` ADD CONSTRAINT `inscricao_documentos_inscricaoId_fkey` FOREIGN KEY (`inscricaoId`) REFERENCES `inscricoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
