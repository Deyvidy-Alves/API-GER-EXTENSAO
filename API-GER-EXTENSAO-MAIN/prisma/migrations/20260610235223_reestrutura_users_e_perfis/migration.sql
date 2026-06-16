/*
  Warnings:

  - You are about to drop the column `bairro` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `corRaca` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `dataNascimento` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `naturalidade` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `nomeSocial` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `rgDataEmissao` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `rgOrgaoEmissor` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `rgUf` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `sexo` on the `perfis_alunos` table. All the data in the column will be lost.
  - You are about to drop the column `siape` on the `perfis_professor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `perfis_professor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[perfilServidorId]` on the table `perfis_professor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailSiape]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pisPasep]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `perfilServidorId` to the `perfis_professor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `perfis_professor` DROP FOREIGN KEY `perfis_professor_userId_fkey`;

-- DropIndex
DROP INDEX `perfis_alunos_cpf_key` ON `perfis_alunos`;

-- DropIndex
DROP INDEX `perfis_alunos_rg_key` ON `perfis_alunos`;

-- DropIndex
DROP INDEX `perfis_professor_siape_key` ON `perfis_professor`;

-- DropIndex
DROP INDEX `perfis_professor_userId_key` ON `perfis_professor`;

-- AlterTable
ALTER TABLE `perfis_alunos` DROP COLUMN `bairro`,
    DROP COLUMN `cep`,
    DROP COLUMN `cidade`,
    DROP COLUMN `complemento`,
    DROP COLUMN `corRaca`,
    DROP COLUMN `cpf`,
    DROP COLUMN `dataNascimento`,
    DROP COLUMN `endereco`,
    DROP COLUMN `naturalidade`,
    DROP COLUMN `nomeSocial`,
    DROP COLUMN `numero`,
    DROP COLUMN `rg`,
    DROP COLUMN `rgDataEmissao`,
    DROP COLUMN `rgOrgaoEmissor`,
    DROP COLUMN `rgUf`,
    DROP COLUMN `sexo`;

-- AlterTable
ALTER TABLE `perfis_professor` DROP COLUMN `siape`,
    DROP COLUMN `userId`,
    ADD COLUMN `disciplinaIngresso` VARCHAR(191) NULL,
    ADD COLUMN `nce` VARCHAR(191) NULL,
    ADD COLUMN `perfilServidorId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `bairro` VARCHAR(191) NULL,
    ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `complemento` VARCHAR(191) NULL,
    ADD COLUMN `cpf` VARCHAR(191) NULL,
    ADD COLUMN `dataNascimento` DATETIME(3) NULL,
    ADD COLUMN `emPGD` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `emailGoogleSalaAula` VARCHAR(191) NULL,
    ADD COLUMN `emailNotificacao` VARCHAR(191) NULL,
    ADD COLUMN `emailRecuperacao` VARCHAR(191) NULL,
    ADD COLUMN `emailSiape` VARCHAR(191) NULL,
    ADD COLUMN `endereco` VARCHAR(191) NULL,
    ADD COLUMN `escolaridade` VARCHAR(191) NULL,
    ADD COLUMN `estadoCivil` ENUM('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL') NULL,
    ADD COLUMN `grupoSanguineo` ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG') NULL,
    ADD COLUMN `naturalidade` VARCHAR(191) NULL,
    ADD COLUMN `nomeMae` VARCHAR(191) NULL,
    ADD COLUMN `nomePai` VARCHAR(191) NULL,
    ADD COLUMN `nomeSocial` VARCHAR(191) NULL,
    ADD COLUMN `nomeUsual` VARCHAR(191) NULL,
    ADD COLUMN `numero` VARCHAR(191) NULL,
    ADD COLUMN `pisPasep` VARCHAR(191) NULL,
    ADD COLUMN `quantDependentesIR` INTEGER NULL,
    ADD COLUMN `racaEtnia` ENUM('AMARELA', 'BRANCA', 'PARDA', 'INDIGENA', 'NAO_DECLARADA') NULL,
    ADD COLUMN `rgDataExpedicao` DATETIME(3) NULL,
    ADD COLUMN `rgNumero` VARCHAR(191) NULL,
    ADD COLUMN `rgOrgaoExpeditor` VARCHAR(191) NULL,
    ADD COLUMN `rgUf` VARCHAR(191) NULL,
    ADD COLUMN `sexo` ENUM('MASCULINO', 'FEMININO') NULL,
    ADD COLUMN `telefonesInstitucionais` VARCHAR(191) NULL,
    ADD COLUMN `telefonesPessoais` VARCHAR(191) NULL,
    ADD COLUMN `tituloNumero` VARCHAR(191) NULL,
    ADD COLUMN `tituloSecao` VARCHAR(191) NULL,
    ADD COLUMN `tituloUf` VARCHAR(191) NULL,
    ADD COLUMN `tituloZona` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `perfis_servidor` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `siape` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NULL,
    `setorSuap` VARCHAR(191) NULL,
    `lotacaoSiape` VARCHAR(191) NULL,
    `exercicioSiape` VARCHAR(191) NULL,
    `situacao` ENUM('ATIVO', 'INATIVO', 'APOSENTADO', 'CEDIDO', 'AFASTADO') NULL,
    `regimeTrabalho` ENUM('DEDICACAO_EXCLUSIVA', 'QUARENTA_HORAS', 'VINTE_HORAS') NULL,
    `jornadaTrabalho` ENUM('INTEGRAL', 'PARCIAL', 'NOTURNO') NULL,
    `operaRaioX` BOOLEAN NOT NULL DEFAULT false,
    `inicioServicioPublico` DATETIME(3) NULL,
    `dataPosseInstituicao` DATETIME(3) NULL,
    `inicioExercicioInstituicao` DATETIME(3) NULL,
    `dataPosseCargo` DATETIME(3) NULL,
    `inicioExercicioCargo` DATETIME(3) NULL,
    `cargo` VARCHAR(191) NULL,
    `classeCargo` VARCHAR(191) NULL,
    `padrao` VARCHAR(191) NULL,
    `grupoCargo` VARCHAR(191) NULL,
    `codigoVaga` VARCHAR(191) NULL,
    `banco` VARCHAR(191) NULL,
    `agencia` VARCHAR(191) NULL,
    `contaCorrente` VARCHAR(191) NULL,

    UNIQUE INDEX `perfis_servidor_userId_key`(`userId`),
    UNIQUE INDEX `perfis_servidor_siape_key`(`siape`),
    UNIQUE INDEX `perfis_servidor_matricula_key`(`matricula`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `perfis_professor_perfilServidorId_key` ON `perfis_professor`(`perfilServidorId`);

-- CreateIndex
CREATE UNIQUE INDEX `users_emailSiape_key` ON `users`(`emailSiape`);

-- CreateIndex
CREATE UNIQUE INDEX `users_cpf_key` ON `users`(`cpf`);

-- CreateIndex
CREATE UNIQUE INDEX `users_pisPasep_key` ON `users`(`pisPasep`);

-- AddForeignKey
ALTER TABLE `perfis_professor` ADD CONSTRAINT `perfis_professor_perfilServidorId_fkey` FOREIGN KEY (`perfilServidorId`) REFERENCES `perfis_servidor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_servidor` ADD CONSTRAINT `perfis_servidor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
