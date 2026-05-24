/*
  Warnings:

  - You are about to drop the `usuarios_director` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios_supervisor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombre,idPlan]` on the table `materias` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `usuarios_director` DROP FOREIGN KEY `usuarios_director_idEsc_fkey`;

-- DropTable
DROP TABLE `usuarios_director`;

-- DropTable
DROP TABLE `usuarios_supervisor`;

-- CreateTable
CREATE TABLE `roles_usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(30) NOT NULL,
    `desc` TEXT NULL,
    `requiereEscuela` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_usuario_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permisos_usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `desc` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permisos_usuario_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol_permiso_usuario` (
    `id` VARCHAR(191) NOT NULL,
    `idRol` VARCHAR(191) NOT NULL,
    `idPermiso` VARCHAR(191) NOT NULL,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rol_permiso_usuario_idRol_idPermiso_key`(`idRol`, `idPermiso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `idRol` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contra` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `materias_nombre_idPlan_key` ON `materias`(`nombre`, `idPlan`);

-- AddForeignKey
ALTER TABLE `rol_permiso_usuario` ADD CONSTRAINT `rol_permiso_usuario_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `roles_usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rol_permiso_usuario` ADD CONSTRAINT `rol_permiso_usuario_idPermiso_fkey` FOREIGN KEY (`idPermiso`) REFERENCES `permisos_usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `roles_usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
