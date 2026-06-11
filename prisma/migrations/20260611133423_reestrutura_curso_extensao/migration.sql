/*
  Warnings:

  - You are about to drop the column `descricao` on the `cursos_extensao` table. All the data in the column will be lost.
  - You are about to drop the column `vagas` on the `cursos_extensao` table. All the data in the column will be lost.
  - Added the required column `apresentacao` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaTematica` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `justificativa` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linhaExtensao` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localAtuacao` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxBeneficiados` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodologia` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minBeneficiados` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeloOferta` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objetivoGeral` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objetivosEspecificos` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicoAlvo` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoAcao` to the `cursos_extensao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cursos_extensao` DROP COLUMN `descricao`,
    DROP COLUMN `vagas`,
    ADD COLUMN `apresentacao` TEXT NOT NULL,
    ADD COLUMN `areaTematica` VARCHAR(191) NOT NULL,
    ADD COLUMN `fomento` VARCHAR(191) NULL,
    ADD COLUMN `justificativa` TEXT NOT NULL,
    ADD COLUMN `linhaExtensao` VARCHAR(191) NOT NULL,
    ADD COLUMN `localAtuacao` ENUM('URBANO', 'RURAL') NOT NULL,
    ADD COLUMN `maxBeneficiados` INTEGER NOT NULL,
    ADD COLUMN `metodologia` TEXT NOT NULL,
    ADD COLUMN `minBeneficiados` INTEGER NOT NULL,
    ADD COLUMN `modeloOferta` ENUM('PRESENCIAL', 'ONLINE', 'HIBRIDO') NOT NULL,
    ADD COLUMN `objetivoGeral` TEXT NOT NULL,
    ADD COLUMN `objetivosEspecificos` TEXT NOT NULL,
    ADD COLUMN `programaInstitucional` VARCHAR(191) NULL,
    ADD COLUMN `publicoAlvo` TEXT NOT NULL,
    ADD COLUMN `tipoAcao` ENUM('CURSO', 'EVENTO', 'PROJETO', 'PROGRAMA') NOT NULL;

-- CreateTable
CREATE TABLE `cursos_atividades` (
    `atividade` ENUM('MINICURSO', 'PALESTRA', 'WORKSHOP', 'SEMINARIO', 'OFICINA', 'EXPOSICAO', 'HACKATHON') NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cursoId`, `atividade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cursos_formas_avaliacao` (
    `forma` ENUM('PARTICIPACAO', 'QUESTIONARIO', 'DEBATE', 'FREQUENCIA', 'TESTE_OBJETIVO', 'PROVA', 'TRABALHOS_ESCRITOS') NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cursoId`, `forma`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cursos_formas_divulgacao` (
    `forma` ENUM('AUDIO', 'CARTAZ', 'EMAIL', 'SISTEMA_ACADEMICO', 'REDES_SOCIAIS', 'CONVITE', 'ARTICULACOES_INSTITUCIONAIS') NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cursoId`, `forma`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cursos_municipios` (
    `nome` VARCHAR(191) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cursoId`, `nome`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_orcamento` (
    `id` VARCHAR(191) NOT NULL,
    `conta` ENUM('BOLSA_AUXILIO_ESTUDANTES', 'BOLSA_AUXILIO_PESQUISADORES', 'DIARIAS_PESSOAL_CIVIL', 'ENCARGOS_PATRONAIS', 'EQUIPAMENTO_MATERIAL_PERMANENTE', 'MATERIAL_CONSUMO', 'OUTROS_SERVICOS_PF', 'OUTROS_SERVICOES_PJ', 'PASSAGENS_LOCOMOCAO') NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `itens_orcamento_cursoId_conta_key`(`cursoId`, `conta`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membros_equipe` (
    `categoria` ENUM('COORDENADOR', 'INTEGRANTE') NOT NULL,
    `vinculo` ENUM('DOCENTE_IFCE', 'TECNICO_IFCE', 'DISCENTE_IFCE', 'EXTERNO') NOT NULL,
    `receberaBolsa` BOOLEAN NOT NULL DEFAULT false,
    `horasSemanais` INTEGER NOT NULL,
    `inicioParticipacao` DATETIME(3) NOT NULL,
    `fimParticipacao` DATETIME(3) NOT NULL,
    `cursoId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cursoId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parcerias` (
    `id` VARCHAR(191) NOT NULL,
    `instituicaoParceira` VARCHAR(191) NOT NULL,
    `parceriaFormalizada` BOOLEAN NOT NULL DEFAULT false,
    `instrumentoUtilizado` VARCHAR(191) NULL,
    `numeroInstrumento` VARCHAR(191) NULL,
    `cursoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `parcerias_cursoId_numeroInstrumento_key`(`cursoId`, `numeroInstrumento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cursos_atividades` ADD CONSTRAINT `cursos_atividades_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursos_formas_avaliacao` ADD CONSTRAINT `cursos_formas_avaliacao_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursos_formas_divulgacao` ADD CONSTRAINT `cursos_formas_divulgacao_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursos_municipios` ADD CONSTRAINT `cursos_municipios_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_orcamento` ADD CONSTRAINT `itens_orcamento_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membros_equipe` ADD CONSTRAINT `membros_equipe_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membros_equipe` ADD CONSTRAINT `membros_equipe_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parcerias` ADD CONSTRAINT `parcerias_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `cursos_extensao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
