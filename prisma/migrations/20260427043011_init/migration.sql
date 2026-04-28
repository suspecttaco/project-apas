-- CreateTable
CREATE TABLE `usuarios_supervisor` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contra` VARCHAR(255) NOT NULL,
    `rol` VARCHAR(20) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_supervisor_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios_director` (
    `id` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contra` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_director_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escuelas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `clave` VARCHAR(10) NOT NULL,
    `zonaEscolar` VARCHAR(5) NOT NULL,
    `nivel` VARCHAR(20) NOT NULL,
    `numTel` VARCHAR(10) NULL,
    `correo` VARCHAR(50) NULL,
    `domicilio` VARCHAR(255) NULL,
    `localidad` VARCHAR(50) NULL,
    `municipio` VARCHAR(50) NULL,
    `estado` VARCHAR(50) NULL,
    `codigoPostal` VARCHAR(5) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `escuelas_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ciclos` (
    `id` VARCHAR(191) NOT NULL,
    `idPlan` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(20) NOT NULL,
    `fInicio` DATE NOT NULL,
    `fFin` DATE NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT false,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ciclos_nombre_idEsc_key`(`nombre`, `idEsc`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turnos` (
    `id` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(25) NOT NULL,
    `desc` TEXT NULL,
    `hInicio` VARCHAR(5) NOT NULL,
    `hFin` VARCHAR(5) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_estudios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(20) NOT NULL,
    `desc` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grados` (
    `id` VARCHAR(191) NOT NULL,
    `idPlan` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(25) NOT NULL,
    `numero` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grados_numero_idPlan_key`(`numero`, `idPlan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materias` (
    `id` VARCHAR(191) NOT NULL,
    `idPlan` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `desc` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materia_grado` (
    `id` VARCHAR(191) NOT NULL,
    `idMateria` VARCHAR(191) NOT NULL,
    `idGrado` VARCHAR(191) NOT NULL,
    `horasSem` INTEGER NOT NULL,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `materia_grado_idMateria_idGrado_key`(`idMateria`, `idGrado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupos` (
    `id` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `idGrado` VARCHAR(191) NOT NULL,
    `idTurno` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(5) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grupos_nombre_idGrado_idTurno_idEsc_key`(`nombre`, `idGrado`, `idTurno`, `idEsc`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `appP` VARCHAR(50) NOT NULL,
    `appM` VARCHAR(50) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persona_direc` (
    `id` VARCHAR(191) NOT NULL,
    `idPersona` VARCHAR(191) NOT NULL,
    `calle1` VARCHAR(100) NULL,
    `calle2` VARCHAR(100) NULL,
    `refer` TEXT NULL,
    `colonia` VARCHAR(100) NULL,
    `codPost` VARCHAR(5) NULL,
    `ciudad` VARCHAR(50) NULL,
    `estado` VARCHAR(50) NULL,
    `pais` VARCHAR(50) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `persona_direc_idPersona_key`(`idPersona`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persona_contact` (
    `id` VARCHAR(191) NOT NULL,
    `idPersona` VARCHAR(191) NOT NULL,
    `numTel1` VARCHAR(10) NULL,
    `numTel2` VARCHAR(10) NULL,
    `correo` VARCHAR(50) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `persona_contact_idPersona_key`(`idPersona`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empleados` (
    `id` VARCHAR(191) NOT NULL,
    `idPersona` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `numControl` VARCHAR(20) NULL,
    `rfc` VARCHAR(13) NOT NULL,
    `curp` VARCHAR(18) NOT NULL,
    `lugarNac` VARCHAR(150) NULL,
    `estadoCivil` VARCHAR(20) NULL,
    `fIngreso` DATE NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `empleados_idPersona_key`(`idPersona`),
    UNIQUE INDEX `empleados_rfc_key`(`rfc`),
    UNIQUE INDEX `empleados_curp_key`(`curp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coberturas` (
    `id` VARCHAR(191) NOT NULL,
    `idEmpleadoTitular` VARCHAR(191) NOT NULL,
    `idEmpleadoCubre` VARCHAR(191) NOT NULL,
    `numControlTemp` VARCHAR(20) NOT NULL,
    `fInicio` DATE NOT NULL,
    `fFin` DATE NULL,
    `motivo` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    INDEX `coberturas_idEmpleadoCubre_activo_idx`(`idEmpleadoCubre`, `activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles_empleado` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(25) NOT NULL,
    `desc` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_empleado_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empleado_rol` (
    `id` VARCHAR(191) NOT NULL,
    `idEmpleado` VARCHAR(191) NOT NULL,
    `idRol` VARCHAR(191) NOT NULL,
    `fInicio` DATE NOT NULL,
    `fFin` DATE NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `empleado_rol_idEmpleado_idRol_fInicio_key`(`idEmpleado`, `idRol`, `fInicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preparacion_prof` (
    `id` VARCHAR(191) NOT NULL,
    `idEmpleado` VARCHAR(191) NOT NULL,
    `estudiosPprof` VARCHAR(200) NULL,
    `escuelaRealiz` VARCHAR(200) NULL,
    `tipoEstudio` VARCHAR(20) NULL,
    `ultimoGrado` VARCHAR(100) NULL,
    `institucion` VARCHAR(200) NULL,
    `especialidades` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `preparacion_prof_idEmpleado_key`(`idEmpleado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nombramientos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nombramientos_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plazas` (
    `id` VARCHAR(191) NOT NULL,
    `idEmpleado` VARCHAR(191) NOT NULL,
    `idNombramiento` VARCHAR(191) NOT NULL,
    `idMateria` VARCHAR(191) NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `codigoPlaza` VARCHAR(30) NOT NULL,
    `horasClase` INTEGER NULL,
    `horasDescarga` INTEGER NULL,
    `horasFortalec` INTEGER NULL,
    `funcDescarga` TEXT NULL,
    `evaluado` VARCHAR(255) NULL,
    `observaciones` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plaza_grupo` (
    `id` VARCHAR(191) NOT NULL,
    `idPlaza` VARCHAR(191) NOT NULL,
    `idGrupo` VARCHAR(191) NOT NULL,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plaza_grupo_idPlaza_idGrupo_key`(`idPlaza`, `idGrupo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trabajo_externo` (
    `id` VARCHAR(191) NOT NULL,
    `idEmpleado` VARCHAR(191) NOT NULL,
    `institucion` VARCHAR(200) NOT NULL,
    `horas` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horario_slots` (
    `id` VARCHAR(191) NOT NULL,
    `idEmpleado` VARCHAR(191) NULL,
    `idGrupo` VARCHAR(191) NULL,
    `idMateria` VARCHAR(191) NULL,
    `diaSemana` VARCHAR(10) NOT NULL,
    `hInicio` VARCHAR(5) NOT NULL,
    `hFin` VARCHAR(5) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estadistica_alumnos` (
    `id` VARCHAR(191) NOT NULL,
    `idCiclo` VARCHAR(191) NOT NULL,
    `idGrupo` VARCHAR(191) NOT NULL,
    `inscH` INTEGER NOT NULL DEFAULT 0,
    `inscM` INTEGER NOT NULL DEFAULT 0,
    `altasH` INTEGER NOT NULL DEFAULT 0,
    `altasM` INTEGER NOT NULL DEFAULT 0,
    `bajasH` INTEGER NOT NULL DEFAULT 0,
    `bajasM` INTEGER NOT NULL DEFAULT 0,
    `aprobTodosH` INTEGER NULL,
    `aprobTodosM` INTEGER NULL,
    `reprobH` INTEGER NULL,
    `reprobM` INTEGER NULL,
    `repetidoresH` INTEGER NULL,
    `repetidoresM` INTEGER NULL,
    `fCre` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    UNIQUE INDEX `estadistica_alumnos_idCiclo_idGrupo_key`(`idCiclo`, `idGrupo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `padrones` (
    `id` VARCHAR(191) NOT NULL,
    `idCiclo` VARCHAR(191) NOT NULL,
    `idEsc` VARCHAR(191) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'borrador',
    `fGen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fMod` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios_director` ADD CONSTRAINT `usuarios_director_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ciclos` ADD CONSTRAINT `ciclos_idPlan_fkey` FOREIGN KEY (`idPlan`) REFERENCES `plan_estudios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ciclos` ADD CONSTRAINT `ciclos_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turnos` ADD CONSTRAINT `turnos_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grados` ADD CONSTRAINT `grados_idPlan_fkey` FOREIGN KEY (`idPlan`) REFERENCES `plan_estudios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materias` ADD CONSTRAINT `materias_idPlan_fkey` FOREIGN KEY (`idPlan`) REFERENCES `plan_estudios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materia_grado` ADD CONSTRAINT `materia_grado_idMateria_fkey` FOREIGN KEY (`idMateria`) REFERENCES `materias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materia_grado` ADD CONSTRAINT `materia_grado_idGrado_fkey` FOREIGN KEY (`idGrado`) REFERENCES `grados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupos` ADD CONSTRAINT `grupos_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupos` ADD CONSTRAINT `grupos_idGrado_fkey` FOREIGN KEY (`idGrado`) REFERENCES `grados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupos` ADD CONSTRAINT `grupos_idTurno_fkey` FOREIGN KEY (`idTurno`) REFERENCES `turnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `persona_direc` ADD CONSTRAINT `persona_direc_idPersona_fkey` FOREIGN KEY (`idPersona`) REFERENCES `personas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `persona_contact` ADD CONSTRAINT `persona_contact_idPersona_fkey` FOREIGN KEY (`idPersona`) REFERENCES `personas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empleados` ADD CONSTRAINT `empleados_idPersona_fkey` FOREIGN KEY (`idPersona`) REFERENCES `personas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empleados` ADD CONSTRAINT `empleados_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coberturas` ADD CONSTRAINT `coberturas_idEmpleadoTitular_fkey` FOREIGN KEY (`idEmpleadoTitular`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coberturas` ADD CONSTRAINT `coberturas_idEmpleadoCubre_fkey` FOREIGN KEY (`idEmpleadoCubre`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empleado_rol` ADD CONSTRAINT `empleado_rol_idEmpleado_fkey` FOREIGN KEY (`idEmpleado`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empleado_rol` ADD CONSTRAINT `empleado_rol_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `roles_empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preparacion_prof` ADD CONSTRAINT `preparacion_prof_idEmpleado_fkey` FOREIGN KEY (`idEmpleado`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plazas` ADD CONSTRAINT `plazas_idEmpleado_fkey` FOREIGN KEY (`idEmpleado`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plazas` ADD CONSTRAINT `plazas_idNombramiento_fkey` FOREIGN KEY (`idNombramiento`) REFERENCES `nombramientos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plazas` ADD CONSTRAINT `plazas_idMateria_fkey` FOREIGN KEY (`idMateria`) REFERENCES `materias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plazas` ADD CONSTRAINT `plazas_idEsc_fkey` FOREIGN KEY (`idEsc`) REFERENCES `escuelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plaza_grupo` ADD CONSTRAINT `plaza_grupo_idPlaza_fkey` FOREIGN KEY (`idPlaza`) REFERENCES `plazas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plaza_grupo` ADD CONSTRAINT `plaza_grupo_idGrupo_fkey` FOREIGN KEY (`idGrupo`) REFERENCES `grupos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trabajo_externo` ADD CONSTRAINT `trabajo_externo_idEmpleado_fkey` FOREIGN KEY (`idEmpleado`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horario_slots` ADD CONSTRAINT `horario_slots_idEmpleado_fkey` FOREIGN KEY (`idEmpleado`) REFERENCES `empleados`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horario_slots` ADD CONSTRAINT `horario_slots_idGrupo_fkey` FOREIGN KEY (`idGrupo`) REFERENCES `grupos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horario_slots` ADD CONSTRAINT `horario_slots_idMateria_fkey` FOREIGN KEY (`idMateria`) REFERENCES `materias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estadistica_alumnos` ADD CONSTRAINT `estadistica_alumnos_idCiclo_fkey` FOREIGN KEY (`idCiclo`) REFERENCES `ciclos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estadistica_alumnos` ADD CONSTRAINT `estadistica_alumnos_idGrupo_fkey` FOREIGN KEY (`idGrupo`) REFERENCES `grupos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `padrones` ADD CONSTRAINT `padrones_idCiclo_fkey` FOREIGN KEY (`idCiclo`) REFERENCES `ciclos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
