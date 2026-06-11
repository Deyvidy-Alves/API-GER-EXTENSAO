-- CreateTable
CREATE TABLE `inscricoes_historico` (
    `id` VARCHAR(191) NOT NULL,
    `statusAnterior` ENUM('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA', 'LISTA_ESPERA') NOT NULL,
    `statusNovo` ENUM('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA', 'LISTA_ESPERA') NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `alteradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `inscricaoId` VARCHAR(191) NOT NULL,
    `alteradoPorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inscricoes_historico` ADD CONSTRAINT `inscricoes_historico_inscricaoId_fkey` FOREIGN KEY (`inscricaoId`) REFERENCES `inscricoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscricoes_historico` ADD CONSTRAINT `inscricoes_historico_alteradoPorId_fkey` FOREIGN KEY (`alteradoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
