import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Plan de estudios
  let plan = await db.planEstudios.findFirst({ where: { nombre: 'Plan 2017' } });
  if (!plan) {
    plan = await db.planEstudios.create({
      data: {
        nombre: 'Plan 2017',
        desc:   'Plan de estudios de educacion secundaria 2017',
      },
    });
  }
  console.log(`Plan de estudios: ${plan.nombre}`);

  // Grados
  const gradosData = [
    { nombre: 'Primer Grado',  numero: 1 },
    { nombre: 'Segundo Grado', numero: 2 },
    { nombre: 'Tercer Grado',  numero: 3 },
  ];

  const grados = [];
  for (const g of gradosData) {
    let grado = await db.grado.findFirst({ where: { numero: g.numero, idPlan: plan.id } });
    if (!grado) {
      grado = await db.grado.create({ data: { ...g, idPlan: plan.id } });
    }
    grados.push(grado);
  }
  console.log('Grados: 1, 2, 3');

  // Materias
  const materiasData = [
    { nombre: 'Espanol',                  horasSem: 5 },
    { nombre: 'Matematicas',              horasSem: 5 },
    { nombre: 'Ciencias',                 horasSem: 4 },
    { nombre: 'Historia',                 horasSem: 3 },
    { nombre: 'Geografia',                horasSem: 3 },
    { nombre: 'Formacion Civica y Etica', horasSem: 2 },
    { nombre: 'Educacion Fisica',         horasSem: 2 },
    { nombre: 'Artes',                    horasSem: 2 },
    { nombre: 'Tecnologia',               horasSem: 3 },
    { nombre: 'Tutoria y Asesoria',       horasSem: 1 },
  ];

  for (const m of materiasData) {
    let materia = await db.materia.findFirst({ where: { nombre: m.nombre, idPlan: plan.id } });
    if (!materia) {
      materia = await db.materia.create({ data: { nombre: m.nombre, idPlan: plan.id } });
    }

    for (const grado of grados) {
      const existe = await db.materiaGrado.findFirst({
        where: { idMateria: materia.id, idGrado: grado.id },
      });
      if (!existe) {
        await db.materiaGrado.create({
          data: { idMateria: materia.id, idGrado: grado.id, horasSem: m.horasSem },
        });
      }
    }
  }
  console.log(`Materias: ${materiasData.length} materias asociadas a los 3 grados`);

  // Roles de empleado
  const rolesData = [
    'Director',
    'Subdirector',
    'Docente',
    'Prefecto',
    'Orientador',
    'Trabajador Social',
    'Administrativo',
    'Intendente',
  ];

  for (const nombre of rolesData) {
    const existe = await db.rolEmpleado.findFirst({ where: { nombre } });
    if (!existe) {
      await db.rolEmpleado.create({ data: { nombre } });
    }
  }
  console.log(`Roles: ${rolesData.length} roles`);

  // Nombramientos
  const nombramientosData = [
    'Director de Escuela Secundaria General',
    'Subdirector de Escuela Secundaria General',
    'Profesor de Educacion Secundaria',
    'Prefecto de Escuela Secundaria',
    'Orientador Educativo',
    'Trabajador Social',
    'Auxiliar Administrativo',
    'Intendente',
  ];

  for (const nombre of nombramientosData) {
    const existe = await db.nombramiento.findFirst({ where: { nombre } });
    if (!existe) {
      await db.nombramiento.create({ data: { nombre } });
    }
  }
  console.log(`Nombramientos: ${nombramientosData.length} nombramientos`);

  // Usuario admin
  const adminNombre = process.env.ADMIN_NOMBRE ?? 'Administrador';
  const adminCorreo = process.env.ADMIN_CORREO ?? 'admin@sepyc.gob.mx';
  const adminContra = process.env.ADMIN_CONTRA;

  if (!adminContra) {
    console.warn('ADMIN_CONTRA no definido en .env - saltando creacion de admin');
  } else {
    const existe = await db.usuarioSupervisor.findFirst({ where: { correo: adminCorreo } });
    if (!existe) {
      const hash = await bcrypt.hash(adminContra, 12);
      await db.usuarioSupervisor.create({
        data: {
          nombre: adminNombre,
          correo: adminCorreo,
          contra: hash,
          rol:    'admin',
        },
      });
    }
    console.log(`Usuario admin: ${adminCorreo}`);
  }

  console.log('Seed completado');
}

main()
  .catch(e => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());