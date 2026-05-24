import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

// Catalogo de permisos del sistema

const PERMISOS = [
  // Gestion del sistema -- solo admin
  { nombre: 'roles:read',         desc: 'Ver roles de usuario' },
  { nombre: 'roles:write',        desc: 'Crear, editar y eliminar roles de usuario' },
  { nombre: 'permisos:read',      desc: 'Ver permisos' },
  { nombre: 'permisos:write',     desc: 'Crear, editar y eliminar permisos' },
  { nombre: 'usuarios:read',      desc: 'Ver usuarios' },
  { nombre: 'usuarios:write',     desc: 'Crear, editar y eliminar usuarios' },
  // Gestion de escuelas -- admin y supervisor
  { nombre: 'escuelas:read',      desc: 'Ver escuelas' },
  { nombre: 'escuelas:write',     desc: 'Crear, editar y eliminar escuelas' },
  { nombre: 'directores:read',    desc: 'Ver directores' },
  { nombre: 'directores:write',   desc: 'Crear, editar y eliminar directores' },
  { nombre: 'empleados:read',     desc: 'Ver empleados' },
  { nombre: 'empleados:write',    desc: 'Crear, editar y eliminar empleados' },
  { nombre: 'ciclos:read',        desc: 'Ver ciclos escolares' },
  { nombre: 'ciclos:write',       desc: 'Crear, editar y eliminar ciclos escolares' },
  { nombre: 'turnos:read',        desc: 'Ver turnos' },
  { nombre: 'turnos:write',       desc: 'Crear, editar y eliminar turnos' },
  { nombre: 'grupos:read',        desc: 'Ver grupos' },
  { nombre: 'grupos:write',       desc: 'Crear, editar y eliminar grupos' },
  { nombre: 'plazas:read',        desc: 'Ver plazas laborales' },
  { nombre: 'plazas:write',       desc: 'Crear, editar y eliminar plazas laborales' },
  { nombre: 'horarios:read',      desc: 'Ver horarios' },
  { nombre: 'horarios:write',     desc: 'Crear, editar y eliminar horarios' },
  { nombre: 'coberturas:read',    desc: 'Ver coberturas' },
  { nombre: 'coberturas:write',   desc: 'Crear, editar y eliminar coberturas' },
  { nombre: 'estadisticas:read',  desc: 'Ver estadisticas de alumnos' },
  { nombre: 'estadisticas:write', desc: 'Editar estadisticas de alumnos' },
  { nombre: 'padron:read',        desc: 'Ver historial de padrones' },
  { nombre: 'padron:generate',    desc: 'Generar el padron en PDF' },
  { nombre: 'catalogos:read',     desc: 'Ver catalogos (materias, grados, nombramientos, roles, plan de estudios)' },
];

// Definicion de roles y sus permisos

const ROLES: {
  nombre: string;
  desc: string;
  requiereEscuela: boolean;
  permisos: string[];
}[] = [
  {
    nombre: 'admin',
    desc: 'Administrador del sistema -- acceso total',
    requiereEscuela: false,
    permisos: PERMISOS.map(p => p.nombre), // todos los permisos
  },
  {
    nombre: 'supervisor',
    desc: 'Supervisor escolar -- gestion de escuelas y su personal',
    requiereEscuela: false,
    permisos: [
      'escuelas:read',
      'escuelas:write',
      'directores:read',
      'directores:write',
      'empleados:read',
      'empleados:write',
      'ciclos:read',
      'ciclos:write',
      'turnos:read',
      'turnos:write',
      'grupos:read',
      'grupos:write',
      'plazas:read',
      'plazas:write',
      'horarios:read',
      'horarios:write',
      'coberturas:read',
      'coberturas:write',
      'estadisticas:read',
      'estadisticas:write',
      'padron:read',
      'padron:generate',
      'catalogos:read',
    ],
  },
  {
    nombre: 'director',
    desc: 'Director de escuela -- gestion de su propia escuela',
    requiereEscuela: true,
    permisos: [
      'empleados:read',
      'empleados:write',
      'ciclos:read',
      'ciclos:write',
      'turnos:read',
      'turnos:write',
      'grupos:read',
      'grupos:write',
      'plazas:read',
      'plazas:write',
      'horarios:read',
      'horarios:write',
      'coberturas:read',
      'coberturas:write',
      'estadisticas:read',
      'estadisticas:write',
      'padron:read',
      'padron:generate',
      'catalogos:read',
    ],
  },
];

async function main() {
  console.log('Iniciando seed...');

  // Permisos
  const permisosCreados: Record<string, string> = {}; // nombre -> id

  for (const p of PERMISOS) {
    const permiso = await db.permisoUsuario.upsert({
      where:  { nombre: p.nombre },
      update: { desc: p.desc },
      create: { nombre: p.nombre, desc: p.desc },
    });
    permisosCreados[permiso.nombre] = permiso.id;
  }
  console.log(`Permisos: ${Object.keys(permisosCreados).length} permisos`);

  // Roles y sus asignaciones de permisos
  for (const r of ROLES) {
    const rol = await db.rolUsuario.upsert({
      where:  { nombre: r.nombre },
      update: { desc: r.desc, requiereEscuela: r.requiereEscuela },
      create: { nombre: r.nombre, desc: r.desc, requiereEscuela: r.requiereEscuela },
    });

    for (const nombrePermiso of r.permisos) {
      const idPermiso = permisosCreados[nombrePermiso];
      await db.rolPermisoUsuario.upsert({
        where:  { idRol_idPermiso: { idRol: rol.id, idPermiso } },
        update: {},
        create: { idRol: rol.id, idPermiso },
      });
    }

    console.log(`Rol '${r.nombre}': ${r.permisos.length} permisos asignados`);
  }

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

  for (const g of gradosData) {
    await db.grado.upsert({
      where:  { numero_idPlan: { numero: g.numero, idPlan: plan.id } },
      update: { nombre: g.nombre },
      create: { ...g, idPlan: plan.id },
    });
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

  const grados = await db.grado.findMany({ where: { idPlan: plan.id } });

  for (const m of materiasData) {
    const materia = await db.materia.upsert({
      where:  { nombre_idPlan: { nombre: m.nombre, idPlan: plan.id } },
      update: {},
      create: { nombre: m.nombre, idPlan: plan.id },
    });

    for (const grado of grados) {
      await db.materiaGrado.upsert({
        where:  { idMateria_idGrado: { idMateria: materia.id, idGrado: grado.id } },
        update: { horasSem: m.horasSem },
        create: { idMateria: materia.id, idGrado: grado.id, horasSem: m.horasSem },
      });
    }
  }
  console.log(`Materias: ${materiasData.length} materias asociadas a los 3 grados`);

  // Roles laborales de empleados
  const rolesEmpleadoData = [
    'Director',
    'Subdirector',
    'Docente',
    'Prefecto',
    'Orientador',
    'Trabajador Social',
    'Administrativo',
    'Intendente',
  ];

  for (const nombre of rolesEmpleadoData) {
    await db.rolEmpleado.upsert({
      where:  { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log(`Roles de empleado: ${rolesEmpleadoData.length} roles`);

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
    await db.nombramiento.upsert({
      where:  { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log(`Nombramientos: ${nombramientosData.length} nombramientos`);

  // Usuario admin inicial
  const adminNombre = process.env.ADMIN_NOMBRE;
  const adminCorreo = process.env.ADMIN_CORREO;
  const adminContra = process.env.ADMIN_CONTRA;

  if (!adminNombre || !adminCorreo || !adminContra) {
    console.warn('ADMIN_NOMBRE, ADMIN_CORREO o ADMIN_CONTRA no definidos en .env -- saltando creacion de admin');
  } else {
    const rolAdmin = await db.rolUsuario.findFirst({ where: { nombre: 'admin' } });
    if (!rolAdmin) throw new Error('Rol admin no encontrado -- revisar seed de roles');

    const existe = await db.usuario.findFirst({ where: { correo: adminCorreo } });
    if (!existe) {
      const hash = await bcrypt.hash(adminContra, 12);
      await db.usuario.create({
        data: {
          nombre: adminNombre,
          correo: adminCorreo,
          contra: hash,
          idRol:  rolAdmin.id,
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