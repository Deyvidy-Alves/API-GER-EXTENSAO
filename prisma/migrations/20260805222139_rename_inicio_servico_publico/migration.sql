/*
  Warnings:

  - You are about to drop the column `inicioServicioPublico` on the `perfis_servidor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cursos_extensao` ADD COLUMN `imagemCapa` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `perfis_servidor` DROP COLUMN `inicioServicioPublico`,
    ADD COLUMN `inicioServicoPublico` DATETIME(3) NULL;
