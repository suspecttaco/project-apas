/**
 * seed-compartidos.ts
 * Crea una segunda escuela y asigna horarios en ella a 3 maestros
 * que ya existen en SIN0025X, para probar la vista de "Maestros compartidos".
 *
 * Prerequisito: npm run seed:test (seed-test-full.ts) ya ejecutado.
 * Ejecucion: npx tsx prisma/seed-compartidos.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

const ESCUELA_1_CLAVE = 'SIN0025X';
const ESCUELA_2_CLAVE = 'SIN0030X';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

async function main() {
  console.log('\n=== seed-compartidos ===\n');

  // ── 1. Verificar que la escuela origen existe ──────────────────────────────
  const esc1 = await db.escuela.findFirst({ where: { clave: ESCUELA_1_CLAVE } });
  if (!esc1) {
    console.error(`Escuela ${ESCUELA_1_CLAVE} no encontrada. Corre npm run seed:test primero.`);
    process.exit(1);
  }
  console.log(`Escuela origen: ${esc1.nombre}`);

  // ── 2. Crear segunda escuela ───────────────────────────────────────────────
  let esc2 = await db.escuela.findFirst({ where: { clave: ESCUELA_2_CLAVE } });
  if (!esc2) {
    esc2 = await db.escuela.create({
      data: {
        nombre:       'Secundaria General No. 30 Benito Juarez',
        clave:        ESCUELA_2_CLAVE,
        zonaEscolar:  'Z016',
        nivel:        'Secundaria',
        numTel:       '6681550030',
        correo:       'sec30@sepycsinaloa.edu.mx',
        domicilio:    'Av. Insurgentes 2500',
        localidad:    'Los Mochis',
        municipio:    'Ahome',
        estado:       'Sinaloa',
        codigoPostal: '81210',
      },
    });
    console.log(`Escuela creada: ${esc2.nombre}`);
  } else {
    console.log(`Escuela ya existe: ${esc2.nombre}`);
  }

  // ── 3. Usuario director escuela 2 ─────────────────────────────────────────
  const rolDir = await db.rolUsuario.findFirst({ where: { nombre: 'director' } });
  if (!rolDir) { console.error('Rol director no encontrado'); process.exit(1); }

  const dir2Correo = 'director@sec30.edu.mx';
  if (!await db.usuario.findFirst({ where: { correo: dir2Correo } })) {
    const hash = await bcrypt.hash('director123', 12);
    await db.usuario.create({
      data: {
        nombre: 'Gustavo Morales Perez',
        correo: dir2Correo,
        contra: hash,
        idRol:  rolDir.id,
        idEsc:  esc2.id,
      },
    });
    console.log(`Usuario director creado: ${dir2Correo}`);
  }

  // ── 4. Ciclo escolar escuela 2 ────────────────────────────────────────────
  const plan = await db.planEstudios.findFirst({ where: { nombre: 'Plan 2017' } });
  if (!plan) { console.error('Plan 2017 no encontrado'); process.exit(1); }

  let ciclo2 = await db.ciclo.findFirst({ where: { idEsc: esc2.id, nombre: '2024-2025' } });
  if (!ciclo2) {
    ciclo2 = await db.ciclo.create({
      data: {
        idPlan:  plan.id,
        idEsc:   esc2.id,
        nombre:  '2024-2025',
        fInicio: new Date(2024, 7, 26),
        fFin:    new Date(2025, 6, 11),
        activo:  true,
      },
    });
    console.log(`Ciclo creado para ${esc2.nombre}`);
  }

  // ── 5. Turno matutino escuela 2 ───────────────────────────────────────────
  let turno2 = await db.turno.findFirst({ where: { idEsc: esc2.id, nombre: 'Matutino' } });
  if (!turno2) {
    turno2 = await db.turno.create({
      data: { idEsc: esc2.id, nombre: 'Matutino', hInicio: '07:00', hFin: '13:10' },
    });
    console.log('Turno matutino creado para escuela 2');
  }

  // ── 6. Grados ─────────────────────────────────────────────────────────────
  const grados = await db.grado.findMany({ where: { idPlan: plan.id }, orderBy: { numero: 'asc' } });

  // ── 7. Grupos en escuela 2 (un grupo A por cada grado) ───────────────────
  const gruposEsc2: Record<number, string> = {};
  for (const grado of grados) {
    let grupo = await db.grupo.findFirst({
      where: { idEsc: esc2.id, idGrado: grado.id, idTurno: turno2.id, nombre: 'A' },
    });
    if (!grupo) {
      grupo = await db.grupo.create({
        data: { idEsc: esc2.id, idGrado: grado.id, idTurno: turno2.id, nombre: 'A' },
      });
      // Estadísticas básicas para analytics
      await db.estadisticaAlumnos.create({
        data: {
          idCiclo: ciclo2!.id, idGrupo: grupo.id,
          inscH: 15, inscM: 13, altasH: 1, altasM: 0, bajasH: 0, bajasM: 1,
        },
      });
    }
    gruposEsc2[grado.numero] = grupo.id;
    console.log(`   Grupo ${grado.numero}°A creado en escuela 2`);
  }

  // ── 8. Materias y nombramientos ───────────────────────────────────────────
  const materias     = await db.materia.findMany({ where: { idPlan: plan.id } });
  const nombramientos = await db.nombramiento.findMany();
  const materiaMap    = Object.fromEntries(materias.map(m => [m.nombre, m.id]));
  const nombMap       = Object.fromEntries(nombramientos.map(n => [n.nombre, n.id]));

  // ── 9. Los 3 maestros compartidos (por RFC) ───────────────────────────────
  const maestrosCompartidos = [
    {
      rfc:          'VAMJ750618HJ3',
      materiaNombre: 'Matematicas',
      codigoPlaza:   '10EES30001PMAT001',
      // Horarios en esc2: L-M-X 08:40-09:30 en cada grado
      slots: [
        { grado: 1, dia: 'Lunes',     hI: '07:00', hF: '07:50' },
        { grado: 1, dia: 'Miercoles', hI: '08:40', hF: '09:30' },
        { grado: 2, dia: 'Martes',    hI: '07:50', hF: '08:40' },
        { grado: 2, dia: 'Jueves',    hI: '09:30', hF: '10:20' },
        { grado: 3, dia: 'Viernes',   hI: '07:00', hF: '07:50' },
      ],
    },
    {
      rfc:          'BOFA830921MJ4',
      materiaNombre: 'Espanol',
      codigoPlaza:   '10EES30001PESP001',
      slots: [
        { grado: 1, dia: 'Lunes',     hI: '07:50', hF: '08:40' },
        { grado: 1, dia: 'Jueves',    hI: '07:00', hF: '07:50' },
        { grado: 2, dia: 'Miercoles', hI: '07:00', hF: '07:50' },
        { grado: 3, dia: 'Martes',    hI: '08:40', hF: '09:30' },
        { grado: 3, dia: 'Viernes',   hI: '09:30', hF: '10:20' },
      ],
    },
    {
      rfc:          'CAPR690205HJ5',
      materiaNombre: 'Ciencias',
      codigoPlaza:   '10EES30001PCIE001',
      slots: [
        { grado: 1, dia: 'Martes',    hI: '09:30', hF: '10:20' },
        { grado: 2, dia: 'Lunes',     hI: '10:40', hF: '11:30' },
        { grado: 2, dia: 'Viernes',   hI: '07:50', hF: '08:40' },
        { grado: 3, dia: 'Miercoles', hI: '10:40', hF: '11:30' },
        { grado: 3, dia: 'Jueves',    hI: '07:50', hF: '08:40' },
      ],
    },
  ];

  const nombPES = nombMap['Profesor de Educacion Secundaria'];
  if (!nombPES) { console.error('Nombramiento "Profesor de Educacion Secundaria" no encontrado'); process.exit(1); }

  for (const mc of maestrosCompartidos) {
    const empleado = await db.empleado.findFirst({ where: { rfc: mc.rfc } });
    if (!empleado) {
      console.warn(`   Empleado RFC ${mc.rfc} no encontrado, omitiendo`);
      continue;
    }

    const idMateria = materiaMap[mc.materiaNombre];

    // Plaza en escuela 2
    let plaza2 = await db.plaza.findFirst({
      where: { idEmpleado: empleado.id, idEsc: esc2.id, activo: true },
    });
    if (!plaza2) {
      plaza2 = await db.plaza.create({
        data: {
          idEmpleado:     empleado.id,
          idNombramiento: nombPES,
          idEsc:          esc2.id,
          idMateria:      idMateria ?? null,
          codigoPlaza:    mc.codigoPlaza,
          horasClase:     mc.slots.length,
        },
      });
      console.log(`   Plaza en esc2 creada para RFC ${mc.rfc}`);
    }

    // Horario slots en grupos de escuela 2
    for (const s of mc.slots) {
      const idGrupo = gruposEsc2[s.grado];
      if (!idGrupo) continue;

      const existe = await db.horarioSlot.findFirst({
        where: { idEmpleado: empleado.id, idGrupo, diaSemana: s.dia, hInicio: s.hI, activo: true },
      });
      if (!existe) {
        await db.horarioSlot.create({
          data: {
            idEmpleado: empleado.id,
            idGrupo,
            idMateria:  idMateria ?? null,
            diaSemana:  s.dia,
            hInicio:    s.hI,
            hFin:       s.hF,
          },
        });
      }
    }
    console.log(`   ${mc.slots.length} slots creados para RFC ${mc.rfc} en escuela 2`);
  }

  console.log('\n=== Seed completado ===');
  console.log(`   Escuela 2: ${esc2.nombre} (${ESCUELA_2_CLAVE})`);
  console.log(`   Director escuela 2: director@sec30.edu.mx / director123`);
  console.log(`   Maestros compartidos: VAMJ750618HJ3, BOFA830921MJ4, CAPR690205HJ5`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
