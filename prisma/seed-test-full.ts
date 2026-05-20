import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

// ─── helpers ────────────────────────────────────────────────────────────────
const fecha = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// ─── datos fijos ─────────────────────────────────────────────────────────────
const ESCUELA_CLAVE = 'SIN0025X';

const PERSONAL: {
  nombre: string; appP: string; appM: string;
  rfc: string; curp: string;
  lugarNac: string; estadoCivil: string; fIngreso: Date;
  calle: string; colonia: string; ciudad: string; cp: string; tel: string; correo: string;
  estudiosPprof: string; escuelaRealiz: string; tipoEstudio: 'Titulado' | 'Pasante' | 'Diplomado';
  ultimoGrado: string; institucion: string; especialidades: string;
  rolNombre: string; nombramientoNombre: string;
  materiaNombre?: string;
  horasClase?: number; horasDescarga?: number; horasFortalec?: number;
  funcDescarga?: string;
  codigoPlaza: string;
  numControl: string;
}[] = [
  {
    nombre: 'Carlos Alberto', appP: 'Ramirez', appM: 'Ibarra',
    rfc: 'RAIC780512HJ1', curp: 'RAIC780512HSLMBR08',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(2005, 8, 16),
    calle: 'Blvd. Jiquilpan 450', colonia: 'Centro', ciudad: 'Los Mochis', cp: '81200', tel: '6681234001', correo: 'director@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Ciencias de la Educacion', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Administracion Escolar',
    rolNombre: 'Director', nombramientoNombre: 'Director de Escuela Secundaria General',
    horasDescarga: 35, funcDescarga: 'Direccion escolar y administracion',
    codigoPlaza: '10EES25001PDIR001', numControl: '1',
  },
  {
    nombre: 'Maria Elena', appP: 'Gastelum', appM: 'Lizarraga',
    rfc: 'GALM820304MJ2', curp: 'GALM820304MSLSRR02',
    lugarNac: 'Culiacan, Sinaloa', estadoCivil: 'Casada', fIngreso: fecha(2008, 8, 16),
    calle: 'Calle alvaro Obregon 123', colonia: 'Rosales', ciudad: 'Los Mochis', cp: '81220', tel: '6681234002', correo: 'subdir@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Pedagogia', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Pedagogia Institucional',
    rolNombre: 'Subdirector', nombramientoNombre: 'Subdirector de Escuela Secundaria General',
    horasDescarga: 30, funcDescarga: 'Subdireccion academica',
    codigoPlaza: '10EES25001PSUB001', numControl: '2',
  },
  {
    nombre: 'Jose Luis', appP: 'Valenzuela', appM: 'Moreno',
    rfc: 'VAMJ750618HJ3', curp: 'VAMJ750618HSLRLR03',
    lugarNac: 'Guasave, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(2003, 8, 16),
    calle: 'Calle Hidalgo 789', colonia: 'La Fuente', ciudad: 'Los Mochis', cp: '81210', tel: '6681234003', correo: 'jvalenzuela@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Matematicas', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Matematicas Educativas',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Matematicas', horasClase: 20,
    codigoPlaza: '10EES25001PMAT001', numControl: '3',
  },
  {
    nombre: 'Ana Lucia', appP: 'Bojorquez', appM: 'Felix',
    rfc: 'BOFA830921MJ4', curp: 'BOFA830921MSLNLN04',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Soltera', fIngreso: fecha(2010, 8, 16),
    calle: 'Av. Leyva 345', colonia: 'San Carlos', ciudad: 'Los Mochis', cp: '81230', tel: '6681234004', correo: 'abojorquez@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Español y Literatura', escuelaRealiz: 'UPN', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Pedagogica Nacional', especialidades: 'Didactica de la Lengua',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Espanol', horasClase: 20,
    codigoPlaza: '10EES25001PESP001', numControl: '4',
  },
  {
    nombre: 'Roberto', appP: 'Camacho', appM: 'Parra',
    rfc: 'CAPR690205HJ5', curp: 'CAPR690205HSLMRB05',
    lugarNac: 'Ahome, Sinaloa', estadoCivil: 'Divorciado', fIngreso: fecha(2000, 8, 16),
    calle: 'Calle Zaragoza 612', colonia: 'Centro', ciudad: 'Los Mochis', cp: '81200', tel: '6681234005', correo: 'rcamacho@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Biologia', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Maestria', institucion: 'CIIDIR Sinaloa IPN', especialidades: 'Ciencias Naturales y Ecologia',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Ciencias', horasClase: 20,
    codigoPlaza: '10EES25001PCIE001', numControl: '5',
  },
  {
    nombre: 'Patricia', appP: 'Urias', appM: 'Cota',
    rfc: 'UICP880714MJ6', curp: 'UICP880714MSLRTR06',
    lugarNac: 'Mazatlan, Sinaloa', estadoCivil: 'Casada', fIngreso: fecha(2012, 8, 16),
    calle: 'Calle Morelos 234', colonia: 'Chapultepec', ciudad: 'Los Mochis', cp: '81240', tel: '6681234006', correo: 'purias@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Historia', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Historia de Mexico',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Historia', horasClase: 18,
    codigoPlaza: '10EES25001DHIS001', numControl: '6',
  },
  {
    nombre: 'Fernando', appP: 'Inzunza', appM: 'Soto',
    rfc: 'INSF710830HJ7', curp: 'INSF710830HSLNRN07',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(2001, 8, 16),
    calle: 'Calle Cuauhtemoc 890', colonia: 'Industrial', ciudad: 'Los Mochis', cp: '81250', tel: '6681234007', correo: 'finzunza@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Geografia', escuelaRealiz: 'UPN', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Pedagogica Nacional', especialidades: 'Geografia Humana',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Geografia', horasClase: 18,
    codigoPlaza: '10EES25001DGEO001', numControl: '7',
  },
  {
    nombre: 'Laura Beatriz', appP: 'Osuna', appM: 'Ramos',
    rfc: 'OURL920305MJ8', curp: 'OURL920305MSLSNR08',
    lugarNac: 'Culiacan, Sinaloa', estadoCivil: 'Soltera', fIngreso: fecha(2015, 8, 16),
    calle: 'Av. Castro 567', colonia: 'Lomas del Valle', ciudad: 'Los Mochis', cp: '81260', tel: '6681234008', correo: 'losuna@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Formacion Civica y etica', escuelaRealiz: 'UPN', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Pedagogica Nacional', especialidades: 'etica y Ciudadania',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Formacion Civica y Etica', horasClase: 12,
    codigoPlaza: '10EES25001DFCE001', numControl: '8',
  },
  {
    nombre: 'Miguel angel', appP: 'Lizarraga', appM: 'Acosta',
    rfc: 'LIAM860115HJ9', curp: 'LIAM860115HSLZCG09',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(2009, 8, 16),
    calle: 'Calle Independencia 321', colonia: 'Benito Juarez', ciudad: 'Los Mochis', cp: '81200', tel: '6681234009', correo: 'mlizarraga@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Educacion Fisica', escuelaRealiz: 'ESAD', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Escuela Superior de Educacion Fisica', especialidades: 'Deportes y Activacion Fisica',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Educacion Fisica', horasClase: 12,
    codigoPlaza: '10EES25001DEF001', numControl: '9',
  },
  {
    nombre: 'Claudia Veronica', appP: 'Angulo', appM: 'Rios',
    rfc: 'AARC910622MJ0', curp: 'AARC910622MSLNGL10',
    lugarNac: 'Guamuchil, Sinaloa', estadoCivil: 'Casada', fIngreso: fecha(2014, 8, 16),
    calle: 'Calle Guerrero 145', colonia: 'Nuevo Horizonte', ciudad: 'Los Mochis', cp: '81270', tel: '6681234010', correo: 'cangulo@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Artes', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Artes Plasticas y Visuales',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Artes', horasClase: 12,
    codigoPlaza: '10EES25001DART001', numControl: '10',
  },
  {
    nombre: 'Hector Manuel', appP: 'Espinoza', appM: 'Verdugo',
    rfc: 'EIVH800910HJ1', curp: 'EIVH800910HSLSPC11',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(2006, 8, 16),
    calle: 'Calle Constitucion 678', colonia: 'Las Palmas', ciudad: 'Los Mochis', cp: '81280', tel: '6681234011', correo: 'hespinoza@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Tecnologia', escuelaRealiz: 'IPN', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Instituto Politecnico Nacional', especialidades: 'Tecnologia e Informatica',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Tecnologia', horasClase: 18,
    codigoPlaza: '10EES25001DTEC001', numControl: '11',
  },
  {
    nombre: 'Rosa Isela', appP: 'Montoya', appM: 'Tapia',
    rfc: 'MOTR870420MJ2', curp: 'MOTR870420MSLNTS12',
    lugarNac: 'El Fuerte, Sinaloa', estadoCivil: 'Casada', fIngreso: fecha(2011, 8, 16),
    calle: 'Calle Allende 987', colonia: 'Valle Verde', ciudad: 'Los Mochis', cp: '81290', tel: '6681234012', correo: 'rmontoya@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Psicologia Educativa', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Orientacion Educativa',
    rolNombre: 'Orientador', nombramientoNombre: 'Orientador Educativo',
    horasDescarga: 35, funcDescarga: 'Orientacion y tutoria a alumnos',
    codigoPlaza: '10EES25001PORI001', numControl: '12',
  },
  {
    nombre: 'Ernesto', appP: 'Cañedo', appM: 'Palafox',
    rfc: 'CAPE720318HJ3', curp: 'CAPE720318HSLNRN13',
    lugarNac: 'Ahome, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(1999, 8, 16),
    calle: 'Calle Juarez 456', colonia: 'Las Fuentes', ciudad: 'Los Mochis', cp: '81200', tel: '6681234013', correo: 'ecanedo@sec25.edu.mx',
    estudiosPprof: 'Preparatoria', escuelaRealiz: 'CBTis 32', tipoEstudio: 'Pasante',
    ultimoGrado: 'Preparatoria', institucion: 'CBTis 32', especialidades: 'Vigilancia y Control Escolar',
    rolNombre: 'Prefecto', nombramientoNombre: 'Prefecto de Escuela Secundaria',
    horasDescarga: 35, funcDescarga: 'Control de asistencia y disciplina',
    codigoPlaza: '10EES25001PPREF01', numControl: '13',
  },
  {
    nombre: 'Silvia', appP: 'Gastelum', appM: 'Zazueta',
    rfc: 'GAZS850612MJ4', curp: 'GAZS850612MSLSTL14',
    lugarNac: 'Culiacan, Sinaloa', estadoCivil: 'Soltera', fIngreso: fecha(2013, 8, 16),
    calle: 'Calle Sonora 234', colonia: 'Primavera', ciudad: 'Los Mochis', cp: '81300', tel: '6681234014', correo: 'sgastelum@sec25.edu.mx',
    estudiosPprof: 'Licenciatura en Trabajo Social', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Trabajo Social Comunitario',
    rolNombre: 'Trabajador Social', nombramientoNombre: 'Trabajador Social',
    horasDescarga: 35, funcDescarga: 'Atencion a alumnos y familias en situacion vulnerable',
    codigoPlaza: '10EES25001PTS0001', numControl: '14',
  },
  {
    nombre: 'Juan Carlos', appP: 'Beltran', appM: 'Meza',
    rfc: 'BEMJ760825HJ5', curp: 'BEMJ760825HSLRLR15',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Casado', fIngreso: fecha(2002, 8, 16),
    calle: 'Calle Sinaloa 678', colonia: 'El Toreo', ciudad: 'Los Mochis', cp: '81310', tel: '6681234015', correo: 'jbeltran@sec25.edu.mx',
    estudiosPprof: 'Preparatoria tecnica', escuelaRealiz: 'CETIS 11', tipoEstudio: 'Pasante',
    ultimoGrado: 'Preparatoria Tecnica', institucion: 'CETIS 11', especialidades: 'Administracion y Contabilidad',
    rolNombre: 'Administrativo', nombramientoNombre: 'Auxiliar Administrativo',
    horasDescarga: 35, funcDescarga: 'Gestion administrativa y control escolar',
    codigoPlaza: '10EES25001PADM001', numControl: '15',
  },
];

// Horarios base por materia (diaSemana -> hInicio -> hFin)
const HORARIO_BLOQUES = [
  { hInicio: '07:00', hFin: '07:50' },
  { hInicio: '07:50', hFin: '08:40' },
  { hInicio: '08:40', hFin: '09:30' },
  { hInicio: '09:30', hFin: '10:20' },
  { hInicio: '10:40', hFin: '11:30' },
  { hInicio: '11:30', hFin: '12:20' },
  { hInicio: '12:20', hFin: '13:10' },
];

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

async function main() {
  console.log('Iniciando seed completo...');

  // Buscar plan y datos base
  const plan = await db.planEstudios.findFirst({ where: { nombre: 'Plan 2017' } });
  if (!plan) { console.error('Primero corre npm run seed'); process.exit(1); }

  const grados = await db.grado.findMany({ where: { idPlan: plan.id }, orderBy: { numero: 'asc' } });
  const materias = await db.materia.findMany({ where: { idPlan: plan.id } });
  const roles = await db.rolEmpleado.findMany();
  const nombramientos = await db.nombramiento.findMany();

  const rolMap    = Object.fromEntries(roles.map(r => [r.nombre, r.id]));
  const nombMap   = Object.fromEntries(nombramientos.map(n => [n.nombre, n.id]));
  const materiaMap = Object.fromEntries(materias.map(m => [m.nombre, m.id]));

  // ── Escuela ──────────────────────────────────────────────────────────────
  let escuela = await db.escuela.findFirst({ where: { clave: ESCUELA_CLAVE } });
  if (!escuela) {
    const hash = await bcrypt.hash('director123', 12);
    escuela = await db.escuela.create({
      data: {
        nombre:      'Secundaria General No. 25 Lazaro Cardenas',
        clave:       ESCUELA_CLAVE,
        zonaEscolar: 'Z016',
        nivel:       'Secundaria',
        numTel:      '6681550025',
        correo:      'sec25@sepycsinaloa.edu.mx',
        domicilio:   'Blvd. Macario Gaxiola 1250',
        localidad:   'Los Mochis',
        municipio:   'Ahome',
        estado:      'Sinaloa',
        codigoPostal:'81200',
        directores: {
          create: {
            nombre: 'Carlos Alberto Ramirez Ibarra',
            correo: 'director@sec25.edu.mx',
            contra: hash,
          },
        },
      },
    });
    console.log(`Escuela creada: ${escuela.nombre}`);
  } else {
    console.log(`Escuela ya existe: ${escuela.nombre}`);
  }

  // ── Ciclo ─────────────────────────────────────────────────────────────────
  let ciclo = await db.ciclo.findFirst({ where: { idEsc: escuela.id, nombre: '2024-2025' } });
  if (!ciclo) {
    ciclo = await db.ciclo.create({
      data: {
        idPlan:  plan.id,
        idEsc:   escuela.id,
        nombre:  '2024-2025',
        fInicio: fecha(2024, 8, 26),
        fFin:    fecha(2025, 7, 11),
        activo:  true,
      },
    });
    console.log(`Ciclo creado: ${ciclo.nombre}`);
  }

  // ── Turnos ────────────────────────────────────────────────────────────────
  let turnoMat = await db.turno.findFirst({ where: { idEsc: escuela.id, nombre: 'Matutino' } });
  if (!turnoMat) {
    turnoMat = await db.turno.create({
      data: { idEsc: escuela.id, nombre: 'Matutino', hInicio: '07:00', hFin: '13:10' },
    });
  }
  let turnoVes = await db.turno.findFirst({ where: { idEsc: escuela.id, nombre: 'Vespertino' } });
  if (!turnoVes) {
    turnoVes = await db.turno.create({
      data: { idEsc: escuela.id, nombre: 'Vespertino', hInicio: '13:00', hFin: '19:10' },
    });
  }
  console.log('Turnos listos');

  // ── Grupos: 2 por grado por turno = 12 grupos ─────────────────────────────
  const gruposCreados: Record<string, string> = {}; // key: "1-Mat-A" -> id

  for (const grado of grados) {
    for (const turno of [turnoMat, turnoVes]) {
      for (const letra of ['A', 'B']) {
        const key = `${grado.numero}-${turno.nombre}-${letra}`;
        let grupo = await db.grupo.findFirst({
          where: { idEsc: escuela.id, idGrado: grado.id, idTurno: turno.id, nombre: letra },
        });
        if (!grupo) {
          grupo = await db.grupo.create({
            data: { idEsc: escuela.id, idGrado: grado.id, idTurno: turno.id, nombre: letra },
          });
          // Estadistica
          const inscH = 13 + Math.floor(Math.random() * 6);
          const inscM = 12 + Math.floor(Math.random() * 6);
          const altasH = Math.floor(Math.random() * 3);
          const altasM = Math.floor(Math.random() * 3);
          const bajasH = Math.floor(Math.random() * 2);
          const bajasM = Math.floor(Math.random() * 2);
          await db.estadisticaAlumnos.create({
            data: {
              idCiclo: ciclo!.id,
              idGrupo: grupo.id,
              inscH, inscM, altasH, altasM, bajasH, bajasM,
              aprobTodosH: Math.floor(inscH * 0.7),
              aprobTodosM: Math.floor(inscM * 0.75),
              reprobH: Math.floor(inscH * 0.2),
              reprobM: Math.floor(inscM * 0.15),
              repetidoresH: 1,
              repetidoresM: 0,
            },
          });
        }
        gruposCreados[key] = grupo.id;
      }
    }
  }
  console.log(`Grupos y estadisticas listos (${Object.keys(gruposCreados).length} grupos)`);

  // ── Empleados ────────────────────────────────────────────────────────────
  const empleadosCreados: { id: string; numControl: string; materiaNombre?: string }[] = [];

  for (const p of PERSONAL) {
    let empleado = await db.empleado.findFirst({ where: { rfc: p.rfc } });
    if (empleado) {
      empleadosCreados.push({ id: empleado.id, numControl: p.numControl, materiaNombre: p.materiaNombre });
      continue;
    }

    const persona = await db.persona.create({
      data: {
        nombre: p.nombre, appP: p.appP, appM: p.appM,
        direccion: {
          create: {
            calle1: p.calle, colonia: p.colonia,
            ciudad: p.ciudad, codPost: p.cp, estado: 'Sinaloa', pais: 'Mexico',
          },
        },
        contacto: { create: { numTel1: p.tel, correo: p.correo } },
      },
    });

    const idRol = rolMap[p.rolNombre];
    const idNombramiento = nombMap[p.nombramientoNombre];
    if (!idRol || !idNombramiento) {
      console.warn(`Rol o nombramiento no encontrado para ${p.nombre}: ${p.rolNombre} / ${p.nombramientoNombre}`);
    }

    empleado = await db.empleado.create({
      data: {
        idPersona:   persona.id,
        idEsc:       escuela.id,
        numControl:  p.numControl,
        rfc:         p.rfc,
        curp:        p.curp,
        lugarNac:    p.lugarNac,
        estadoCivil: p.estadoCivil,
        fIngreso:    p.fIngreso,
        preparacion: {
          create: {
            estudiosPprof:  p.estudiosPprof,
            escuelaRealiz:  p.escuelaRealiz,
            tipoEstudio:    p.tipoEstudio,
            ultimoGrado:    p.ultimoGrado,
            institucion:    p.institucion,
            especialidades: p.especialidades,
          },
        },
        roles: idRol ? {
          create: { idRol, fInicio: p.fIngreso },
        } : undefined,
      },
    });

    // Plaza
    const idMateria = p.materiaNombre ? materiaMap[p.materiaNombre] : undefined;
    if (idNombramiento) {
      await db.plaza.create({
        data: {
          idEmpleado:     empleado.id,
          idNombramiento: idNombramiento,
          idEsc:          escuela.id,
          idMateria:      idMateria ?? null,
          codigoPlaza:    p.codigoPlaza,
          horasClase:     p.horasClase    ?? null,
          horasDescarga:  p.horasDescarga ?? null,
          horasFortalec:  p.horasFortalec ?? null,
          funcDescarga:   p.funcDescarga  ?? null,
        },
      });
    }

    empleadosCreados.push({ id: empleado.id, numControl: p.numControl, materiaNombre: p.materiaNombre });
    console.log(`   ${p.nombre} ${p.appP}`);
  }
  console.log(`${empleadosCreados.length} empleados procesados`);

  // ── Plazas → grupos (docentes frente a grupo) ────────────────────────────
  // Cada docente atiende grupos de los 3 grados, matutino y vespertino
  const docentesConMateria = empleadosCreados.filter(e => e.materiaNombre);

  for (const doc of docentesConMateria) {
    const plaza = await db.plaza.findFirst({ where: { idEmpleado: doc.id, activo: true } });
    if (!plaza) continue;

    // Asignar grupo A y B de cada grado en turno matutino
    const grupoIds: string[] = [];
    for (const grado of grados) {
      const idA = gruposCreados[`${grado.numero}-Matutino-A`];
      const idB = gruposCreados[`${grado.numero}-Matutino-B`];
      if (idA) grupoIds.push(idA);
      if (idB) grupoIds.push(idB);
    }

    for (const idGrupo of grupoIds) {
      const existe = await db.plazaGrupo.findFirst({ where: { idPlaza: plaza.id, idGrupo } });
      if (!existe) {
        await db.plazaGrupo.create({ data: { idPlaza: plaza.id, idGrupo } });
      }
    }
  }
  console.log('PlazaGrupo asignados');

  // ── Horarios ──────────────────────────────────────────────────────────────
  // Distribuir materias en los slots de cada grupo matutino
  const materiasOrden = [
    'Espanol', 'Matematicas', 'Ciencias', 'Historia', 'Geografia',
    'Formacion Civica y Etica', 'Educacion Fisica', 'Artes', 'Tecnologia',
  ];

  for (const grado of grados) {
    for (const letra of ['A', 'B']) {
      const idGrupo = gruposCreados[`${grado.numero}-Matutino-${letra}`];
      if (!idGrupo) continue;

      // 7 bloques x 5 dias = 35 slots, distribuimos las materias
      for (let diaIdx = 0; diaIdx < DIAS.length; diaIdx++) {
        const dia = DIAS[diaIdx];
        for (let bloqueIdx = 0; bloqueIdx < HORARIO_BLOQUES.length; bloqueIdx++) {
          const bloque = HORARIO_BLOQUES[bloqueIdx];
          const materiaIdx = (diaIdx * HORARIO_BLOQUES.length + bloqueIdx) % materiasOrden.length;
          const materiaNombre = materiasOrden[materiaIdx];
          const idMateria = materiaMap[materiaNombre];

          // Buscar el empleado que imparte esta materia
          const docente = docentesConMateria.find(d => d.materiaNombre === materiaNombre);
          if (!docente) continue;

          const existeSlot = await db.horarioSlot.findFirst({
            where: { idGrupo, diaSemana: dia, hInicio: bloque.hInicio, activo: true },
          });
          if (!existeSlot) {
            await db.horarioSlot.create({
              data: {
                idGrupo,
                idEmpleado: docente.id,
                idMateria:  idMateria ?? null,
                diaSemana:  dia,
                hInicio:    bloque.hInicio,
                hFin:       bloque.hFin,
              },
            });
          }
        }
      }
    }
  }
  console.log('Horarios creados');

  console.log('\nSeed completo listo:');
  console.log(`   Escuela: ${escuela.nombre} (${ESCUELA_CLAVE})`);
  console.log(`   Ciclo ID: ${ciclo!.id}`);
  console.log(`   Login: director@sec25.edu.mx / director123`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());