/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `perfis_alunos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rg]` on the table `perfis_alunos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cursos_extensao` ADD COLUMN `tipo` ENUM('FORMACAO_INICIAL', 'FORMACAO_CONTINUADA') NOT NULL DEFAULT 'FORMACAO_CONTINUADA';

-- AlterTable
ALTER TABLE `perfis_alunos` ADD COLUMN `bairro` VARCHAR(191) NULL,
    ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `complemento` VARCHAR(191) NULL,
    ADD COLUMN `corRaca` ENUM('AMARELA', 'BRANCA', 'PARDA', 'INDIGENA', 'NAO_DECLARADA') NULL,
    ADD COLUMN `cpf` VARCHAR(191) NULL,
    ADD COLUMN `dataNascimento` DATETIME(3) NULL,
    ADD COLUMN `endereco` VARCHAR(191) NULL,
    ADD COLUMN `grauInstrucao` VARCHAR(191) NULL,
    ADD COLUMN `naturalidade` VARCHAR(191) NULL,
    ADD COLUMN `nomeSocial` VARCHAR(191) NULL,
    ADD COLUMN `numPessoasFamilia` INTEGER NULL,
    ADD COLUMN `numero` VARCHAR(191) NULL,
    ADD COLUMN `profissao` VARCHAR(191) NULL,
    ADD COLUMN `rendaFamiliarPerCapita` ENUM('ATE_MEIO_SM', 'MEIO_A_UM_SM', 'UM_A_UM_E_MEIO_SM', 'UM_E_MEIO_A_DOIS_SM', 'DOIS_E_MEIO_A_TRES_SM', 'ACIMA_DE_TRES_SM') NULL,
    ADD COLUMN `rg` VARCHAR(191) NULL,
    ADD COLUMN `rgDataEmissao` DATETIME(3) NULL,
    ADD COLUMN `rgOrgaoEmissor` VARCHAR(191) NULL,
    ADD COLUMN `rgUf` VARCHAR(191) NULL,
    ADD COLUMN `sexo` ENUM('MASCULINO', 'FEMININO') NULL,
    ADD COLUMN `telefoneCelular` VARCHAR(191) NULL,
    ADD COLUMN `telefoneComercial` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `perfis_alunos_cpf_key` ON `perfis_alunos`(`cpf`);

-- CreateIndex
CREATE UNIQUE INDEX `perfis_alunos_rg_key` ON `perfis_alunos`(`rg`);
