-- CreateTable
CREATE TABLE `instituicoes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `instituicoes_sigla_key`(`sigla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(191) NOT NULL,
    `papel` ENUM('ALUNO', 'PROFESSOR', 'DEPPI', 'ADMIN') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `instituicaoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis_alunos` (
    `id` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `cursoGraduacao` VARCHAR(191) NOT NULL,
    `semestre` INTEGER NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `perfis_alunos_matricula_key`(`matricula`),
    UNIQUE INDEX `perfis_alunos_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis_professor` (
    `id` VARCHAR(191) NOT NULL,
    `siape` VARCHAR(191) NOT NULL,
    `titulacao` VARCHAR(191) NULL,
    `departamento` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `perfis_professor_siape_key`(`siape`),
    UNIQUE INDEX `perfis_professor_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cursos_extensao` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `cargaHoraria` INTEGER NOT NULL,
    `vagas` INTEGER NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `status` ENUM('RASCUNHO', 'PUBLICADO', 'EM_ANDAMENTO', 'ENCERRADO', 'CANCELADO') NOT NULL DEFAULT 'RASCUNHO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `professorId` VARCHAR(191) NOT NULL,
    `instituicaoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscricoes` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA', 'LISTA_ESPERA') NOT NULL DEFAULT 'PENDENTE',
    `inscricaoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `alunoId` VARCHAR(191) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `inscricoes_alunoId_cursoId_key`(`alunoId`, `cursoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissoes` (
    `id` VARCHAR(191) NOT NULL,
    `recurso` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `concedidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `permissoes_userId_recurso_acao_key`(`userId`, `recurso`, `acao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorios` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `parametros` JSON NULL,
    `arquivoUrl` VARCHAR(191) NULL,
    `geradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `geradoPorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_instituicaoId_fkey` FOREIGN KEY (`instituicaoId`) REFERENCES `instituicoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_alunos` ADD CONSTRAINT `perfis_alunos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_professor` ADD CONSTRAINT `perfis_professor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursos_extensao` ADD CONSTRAINT `cursos_extensao_professorId_fkey` FOREIGN KEY (`professorId`) REFERENCES `perfis_professor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursos_extensao` ADD CONSTRAINT `cursos_extensao_instituicaoId_fkey` FOREIGN KEY (`instituicaoId`) REFERENCES `instituicoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscricoes` ADD CONSTRAINT `inscricoes_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `perfis_alunos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscricoes` ADD CONSTRAINT `inscricoes_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissoes` ADD CONSTRAINT `permissoes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_geradoPorId_fkey` FOREIGN KEY (`geradoPorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
