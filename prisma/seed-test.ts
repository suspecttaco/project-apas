import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function main() {
  console.log('Creando datos de prueba...');

  // Buscar plan existente
  const plan = await db.planEstudios.findFirst({ where: { nombre: 'Plan 2017' } });
  if (!plan) {
    console.error('Primero corre npm run seed para cargar los datos base');
    process.exit(1);
  }

  // Crear escuela de prueba
  let escuela = await db.escuela.findFirst({ where: { clave: 'TEST001' } });
  if (!escuela) {
    const hash = await bcrypt.hash('director123', 12);
    escuela = await db.escuela.create({
      data: {
        nombre:      'Secundaria General de Prueba',
        clave:       'TEST001',
        zonaEscolar: 'Z001',
        nivel:       'Secundaria',
        domicilio:   'Blvd. Macario Gaxiola 123',
        localidad:   'Los Mochis',
        municipio:   'Ahome',
        estado:      'Sinaloa',
        directores: {
          create: {
            nombre: 'Director de Prueba',
            correo: 'director@test.mx',
            contra: hash,
          },
        },
      },
    });
    console.log(`Escuela creada: ${escuela.nombre}`);
  }

  // Crear ciclo activo
  let ciclo = await db.ciclo.findFirst({ where: { idEsc: escuela.id, nombre: '2024-2025' } });
  if (!ciclo) {
    ciclo = await db.ciclo.create({
      data: {
        idPlan:  plan.id,
        idEsc:   escuela.id,
        nombre:  '2024-2025',
        fInicio: new Date('2024-08-26'),
        fFin:    new Date('2025-07-11'),
        activo:  true,
      },
    });
    console.log(`Ciclo creado: ${ciclo.nombre}`);
  }

  // Crear turno
  let turno = await db.turno.findFirst({ where: { idEsc: escuela.id, nombre: 'Matutino' } });
  if (!turno) {
    turno = await db.turno.create({
      data: {
        idEsc:   escuela.id,
        nombre:  'Matutino',
        hInicio: '07:00',
        hFin:    '13:00',
      },
    });
    console.log(`Turno creado: ${turno.nombre}`);
  }

  // Obtener grados
  const grados = await db.grado.findMany({ where: { idPlan: plan.id }, orderBy: { numero: 'asc' } });

  // Crear grupos
  for (const grado of grados) {
    const existe = await db.grupo.findFirst({
      where: { idEsc: escuela.id, idGrado: grado.id, nombre: 'A' },
    });
    if (!existe) {
      const grupo = await db.grupo.create({
        data: { idEsc: escuela.id, idGrado: grado.id, idTurno: turno.id, nombre: 'A' },
      });
      await db.estadisticaAlumnos.create({
        data: {
          idCiclo: ciclo.id,
          idGrupo: grupo.id,
          inscH: 15, inscM: 12,
          altasH: 1, altasM: 0,
          bajasH: 0, bajasM: 1,
        },
      });
      console.log(`Grupo creado: ${grado.nombre} - A`);
    }
  }

  // Crear empleado de prueba (el director)
  const nombramiento = await db.nombramiento.findFirst({
    where: { nombre: 'Director de Escuela Secundaria General' },
  });
  const rolDirector = await db.rolEmpleado.findFirst({ where: { nombre: 'Director' } });

  let empleado = await db.empleado.findFirst({ where: { idEsc: escuela.id, numControl: '1' } });
  if (!empleado && nombramiento && rolDirector) {
    const persona = await db.persona.create({
      data: {
        nombre: 'Director',
        appP:   'De Prueba',
        appM:   'Test',
        direccion: {
          create: {
            calle1:  'Blvd. Macario Gaxiola 123',
            colonia: 'Centro',
            ciudad:  'Los Mochis',
            estado:  'Sinaloa',
            codPost: '81200',
          },
        },
        contacto: {
          create: {
            numTel1: '6681234567',
            correo:  'director@test.mx',
          },
        },
      },
    });

    empleado = await db.empleado.create({
      data: {
        idPersona:   persona.id,
        idEsc:       escuela.id,
        numControl:  '1',
        rfc:         'DIPT800101ABC',
        curp:        'DIPT800101HSLRPN01',
        lugarNac:    'Los Mochis, Sinaloa',
        estadoCivil: 'Casado',
        fIngreso:    new Date('2010-08-16'),
        preparacion: {
          create: {
            estudiosPprof: 'Licenciatura en Educacion',
            escuelaRealiz: 'UAS',
            tipoEstudio:   'Titulado',
            ultimoGrado:   'Licenciatura',
            institucion:   'Universidad Autonoma de Sinaloa',
          },
        },
        roles: {
          create: {
            idRol:   rolDirector.id,
            fInicio: new Date('2010-08-16'),
          },
        },
      },
    });

    await db.plaza.create({
      data: {
        idEmpleado:     empleado.id,
        idNombramiento: nombramiento.id,
        idEsc:          escuela.id,
        codigoPlaza:    'TEST-DIR-001',
        horasDescarga:  35,
        funcDescarga:   'Direccion escolar',
      },
    });

    console.log(`Empleado director creado: ${persona.nombre} ${persona.appP}`);
  }

  console.log('\nDatos de prueba listos:');
  console.log(`Escuela:  ${escuela.nombre} (${escuela.clave})`);
  console.log(`Ciclo ID: ${ciclo.id}`);
  console.log(`Login director: director@test.mx / director123`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());