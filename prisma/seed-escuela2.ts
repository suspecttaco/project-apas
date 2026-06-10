import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db  = new PrismaClient();
const f   = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// ── Nueva escuela ──────────────────────────────────────────────────────────────
const CLAVE_ESC2 = '25-EES-0007B';

// ── Personal exclusivo de Escuela 2 ───────────────────────────────────────────
type TipoEstudio = 'Titulado' | 'Pasante' | 'Diplomado';
interface PersonalDef {
  nombre: string; appP: string; appM: string;
  rfc: string; curp: string;
  lugarNac: string; estadoCivil: string; fIngreso: Date;
  calle: string; colonia: string; ciudad: string; cp: string; tel: string; correo: string;
  estudiosPprof: string; escuelaRealiz: string; tipoEstudio: TipoEstudio;
  ultimoGrado: string; institucion: string; especialidades: string;
  rolNombre: string; nombramientoNombre: string;
  materiaNombre?: string;
  horasClase?: number; horasDescarga?: number; funcDescarga?: string;
  codigoPlaza: string; numControl: string;
}

const PERSONAL_ESC2: PersonalDef[] = [
  {
    nombre: 'Marco Antonio', appP: 'Leyva', appM: 'Ochoa',
    rfc: 'LEOM711210HJ8', curp: 'LEOM711210HSLYCR08',
    lugarNac: 'Culiacan, Sinaloa', estadoCivil: 'Casado', fIngreso: f(2004, 8, 16),
    calle: 'Calle Aquiles Serdan 120', colonia: 'Centro', ciudad: 'Culiacan', cp: '80000',
    tel: '6671450001', correo: 'director@sec7.edu.mx',
    estudiosPprof: 'Licenciatura en Educacion', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Maestria', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Administracion Educativa',
    rolNombre: 'Director', nombramientoNombre: 'Director de Escuela Secundaria General',
    horasDescarga: 35, funcDescarga: 'Direccion y administracion escolar',
    codigoPlaza: '25EES0007PDIR001', numControl: 'E2-01',
  },
  {
    nombre: 'Gabriela', appP: 'Zazueta', appM: 'Cota',
    rfc: 'ZACG830615MJ9', curp: 'ZACG830615MSLZTR09',
    lugarNac: 'Guamuchil, Sinaloa', estadoCivil: 'Soltera', fIngreso: f(2009, 8, 16),
    calle: 'Calle Rosales 234', colonia: 'Rosales', ciudad: 'Culiacan', cp: '80010',
    tel: '6671450002', correo: 'subdir@sec7.edu.mx',
    estudiosPprof: 'Licenciatura en Pedagogia', escuelaRealiz: 'UPN', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Pedagogica Nacional', especialidades: 'Gestion Escolar',
    rolNombre: 'Subdirector', nombramientoNombre: 'Subdirector de Escuela Secundaria General',
    horasDescarga: 30, funcDescarga: 'Subdireccion academica y seguimiento curricular',
    codigoPlaza: '25EES0007PSUB001', numControl: 'E2-02',
  },
  {
    nombre: 'Sergio Ivan', appP: 'Palafox', appM: 'Quinonez',
    rfc: 'PAQS890322HJA', curp: 'PAQS890322HSLLFR0A',
    lugarNac: 'Mazatlan, Sinaloa', estadoCivil: 'Soltero', fIngreso: f(2016, 8, 16),
    calle: 'Av. Universidad 780', colonia: 'Universitarios', ciudad: 'Culiacan', cp: '80040',
    tel: '6671450003', correo: 'spalafox@sec7.edu.mx',
    estudiosPprof: 'Licenciatura en Quimica', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Quimica General y Organica',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Ciencias', horasClase: 20,
    codigoPlaza: '25EES0007PCIE001', numControl: 'E2-03',
  },
  {
    nombre: 'Irma Leticia', appP: 'Carvajal', appM: 'Morales',
    rfc: 'CAMI761105MJB', curp: 'CAMI761105MSLRRL0B',
    lugarNac: 'Guasave, Sinaloa', estadoCivil: 'Casada', fIngreso: f(2002, 8, 16),
    calle: 'Calle Benito Juarez 321', colonia: 'Guadalupe', ciudad: 'Culiacan', cp: '80020',
    tel: '6671450004', correo: 'icarvajal@sec7.edu.mx',
    estudiosPprof: 'Licenciatura en Derecho', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Licenciatura', institucion: 'Universidad Autonoma de Sinaloa', especialidades: 'Formacion Civica y Educacion para la Paz',
    rolNombre: 'Docente', nombramientoNombre: 'Profesor de Educacion Secundaria',
    materiaNombre: 'Formacion Civica y Etica', horasClase: 18,
    codigoPlaza: '25EES0007PFCE001', numControl: 'E2-04',
  },
  {
    nombre: 'Enrique', appP: 'Montoya', appM: 'Beltran',
    rfc: 'MOBE840710HJC', curp: 'MOBE840710HSLNLR0C',
    lugarNac: 'Los Mochis, Sinaloa', estadoCivil: 'Casado', fIngreso: f(2011, 8, 16),
    calle: 'Calle Colon 567', colonia: 'Tierra Blanca', ciudad: 'Culiacan', cp: '80030',
    tel: '6671450005', correo: 'emontoya@sec7.edu.mx',
    estudiosPprof: 'Licenciatura en Psicologia', escuelaRealiz: 'UAS', tipoEstudio: 'Titulado',
    ultimoGrado: 'Maestria', institucion: 'UNAM', especialidades: 'Psicologia Educativa y Orientacion Vocacional',
    rolNombre: 'Orientador', nombramientoNombre: 'Orientador Educativo',
    horasDescarga: 35, funcDescarga: 'Orientacion educativa y vocacional',
    codigoPlaza: '25EES0007PORI001', numControl: 'E2-05',
  },
];

// ── Docentes compartidos (tienen RFC de Escuela 1) ────────────────────────────
const COMPARTIDOS = [
  { rfc: 'RALC850312AB1', materiaNombre: 'Matematicas', codigoPlaza: '25EES0007PMAT001', horasClase: 10 },
  { rfc: 'TOVM920705CD2', materiaNombre: 'Espanol',     codigoPlaza: '25EES0007PESP001', horasClase: 10 },
  { rfc: 'MECL900214GH4', materiaNombre: 'Ciencias',    codigoPlaza: '25EES0007PCIE002', horasClase: 8  },
  { rfc: 'EIFR830507IJ5', materiaNombre: 'Historia',    codigoPlaza: '25EES0007DHIS001', horasClase: 8  },
];

// ── Definición de grupos (nomenclatura A/B/C) ─────────────────────────────────
const GRUPOS_DEF: { grado: number; turno: 'M' | 'V'; letra: string }[] = [
  // Matutino: 3 grupos por grado
  { grado: 1, turno: 'M', letra: 'A' }, { grado: 1, turno: 'M', letra: 'B' }, { grado: 1, turno: 'M', letra: 'C' },
  { grado: 2, turno: 'M', letra: 'A' }, { grado: 2, turno: 'M', letra: 'B' }, { grado: 2, turno: 'M', letra: 'C' },
  { grado: 3, turno: 'M', letra: 'A' }, { grado: 3, turno: 'M', letra: 'B' }, { grado: 3, turno: 'M', letra: 'C' },
  // Vespertino: 2 grupos por grado
  { grado: 1, turno: 'V', letra: 'A' }, { grado: 1, turno: 'V', letra: 'B' },
  { grado: 2, turno: 'V', letra: 'A' }, { grado: 2, turno: 'V', letra: 'B' },
  { grado: 3, turno: 'V', letra: 'A' }, { grado: 3, turno: 'V', letra: 'B' },
];

// Estadísticas por índice dentro del grado (0-2 mat, 3-4 ves)
const STATS: Record<number, { inscH: number; inscM: number; altasH: number; altasM: number; bajasH: number; bajasM: number }[]> = {
  1: [
    { inscH: 18, inscM: 17, altasH: 1, altasM: 0, bajasH: 0, bajasM: 1 },
    { inscH: 16, inscM: 19, altasH: 0, altasM: 1, bajasH: 1, bajasM: 0 },
    { inscH: 17, inscM: 16, altasH: 0, altasM: 0, bajasH: 0, bajasM: 0 },
    { inscH: 15, inscM: 18, altasH: 1, altasM: 0, bajasH: 0, bajasM: 0 },
    { inscH: 16, inscM: 15, altasH: 0, altasM: 1, bajasH: 0, bajasM: 0 },
  ],
  2: [
    { inscH: 14, inscM: 16, altasH: 0, altasM: 0, bajasH: 0, bajasM: 0 },
    { inscH: 15, inscM: 15, altasH: 1, altasM: 0, bajasH: 1, bajasM: 0 },
    { inscH: 13, inscM: 17, altasH: 0, altasM: 0, bajasH: 0, bajasM: 1 },
    { inscH: 14, inscM: 14, altasH: 0, altasM: 0, bajasH: 0, bajasM: 0 },
    { inscH: 13, inscM: 15, altasH: 0, altasM: 1, bajasH: 0, bajasM: 0 },
  ],
  3: [
    { inscH: 12, inscM: 15, altasH: 0, altasM: 0, bajasH: 1, bajasM: 0 },
    { inscH: 14, inscM: 13, altasH: 0, altasM: 0, bajasH: 0, bajasM: 1 },
    { inscH: 13, inscM: 14, altasH: 0, altasM: 0, bajasH: 0, bajasM: 0 },
    { inscH: 12, inscM: 13, altasH: 1, altasM: 0, bajasH: 0, bajasM: 0 },
    { inscH: 11, inscM: 14, altasH: 0, altasM: 0, bajasH: 1, bajasM: 0 },
  ],
};

const BLOQUES = [
  { hInicio: '07:00', hFin: '07:50' }, { hInicio: '07:50', hFin: '08:40' },
  { hInicio: '08:40', hFin: '09:30' }, { hInicio: '09:30', hFin: '10:20' },
  { hInicio: '10:40', hFin: '11:30' }, { hInicio: '11:30', hFin: '12:20' },
  { hInicio: '12:20', hFin: '13:10' },
];
const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

async function main() {
  console.log('=== Seed Escuela 2 — Secundaria General No. 7 ===\n');

  const plan = await db.planEstudios.findFirst({ where: { nombre: 'Plan 2017' } });
  if (!plan) { console.error('Primero corre npm run seed'); process.exit(1); }

  const grados        = await db.grado.findMany({ where: { idPlan: plan.id }, orderBy: { numero: 'asc' } });
  const materias      = await db.materia.findMany({ where: { idPlan: plan.id } });
  const rolesEmp      = await db.rolEmpleado.findMany();
  const nombramientos = await db.nombramiento.findMany();
  const rolUsuDir     = await db.rolUsuario.findFirst({ where: { nombre: 'director' } });
  if (!rolUsuDir) { console.error('Rol director no encontrado'); process.exit(1); }

  const gradoMap = Object.fromEntries(grados.map(g => [g.numero, g]));
  const matMap   = Object.fromEntries(materias.map(m => [m.nombre, m.id]));
  const rolEmpMap = Object.fromEntries(rolesEmp.map(r => [r.nombre, r.id]));
  const nombMap  = Object.fromEntries(nombramientos.map(n => [n.nombre, n.id]));

  // ── 1. Escuela ──────────────────────────────────────────────────────────────
  let esc2 = await db.escuela.findFirst({ where: { clave: CLAVE_ESC2 } });
  if (!esc2) {
    esc2 = await db.escuela.create({
      data: {
        nombre: 'Secundaria General No. 7 Lazaro Cardenas',
        clave: CLAVE_ESC2, zonaEscolar: 'Z006', nivel: 'Secundaria',
        numTel: '6671550007', correo: 'sec7@sepycsinaloa.edu.mx',
        domicilio: 'Av. Alvaro Obregon 540', localidad: 'Culiacan',
        municipio: 'Culiacan', estado: 'Sinaloa', codigoPostal: '80000',
      },
    });
    console.log(`✓ Escuela: ${esc2.nombre} (${esc2.clave})`);
  } else {
    console.log(`  Escuela ya existe: ${esc2.nombre}`);
  }

  // ── 2. Usuario director ────────────────────────────────────────────────────
  if (!await db.usuario.findFirst({ where: { correo: 'director@sec7.edu.mx' } })) {
    const hash = await bcrypt.hash('director123', 12);
    await db.usuario.create({
      data: {
        nombre: 'Marco Antonio Leyva Ochoa',
        correo: 'director@sec7.edu.mx', contra: hash,
        idRol: rolUsuDir.id, idEsc: esc2.id,
      },
    });
    console.log('✓ Usuario: director@sec7.edu.mx / director123');
  }

  // ── 3. Ciclo ────────────────────────────────────────────────────────────────
  let ciclo2 = await db.ciclo.findFirst({ where: { idEsc: esc2.id, nombre: '2025-2026' } });
  if (!ciclo2) {
    ciclo2 = await db.ciclo.create({
      data: {
        idPlan: plan.id, idEsc: esc2.id, nombre: '2025-2026',
        fInicio: f(2025, 8, 25), fFin: f(2026, 7, 17), activo: true,
      },
    });
    console.log(`✓ Ciclo: ${ciclo2.nombre} (activo)`);
  }

  // ── 4. Turnos ───────────────────────────────────────────────────────────────
  let turnoM = await db.turno.findFirst({ where: { idEsc: esc2.id, nombre: 'Matutino' } });
  if (!turnoM) turnoM = await db.turno.create({
    data: { idEsc: esc2.id, nombre: 'Matutino', hInicio: '07:00', hFin: '13:10' },
  });
  let turnoV = await db.turno.findFirst({ where: { idEsc: esc2.id, nombre: 'Vespertino' } });
  if (!turnoV) turnoV = await db.turno.create({
    data: { idEsc: esc2.id, nombre: 'Vespertino', hInicio: '13:00', hFin: '19:10' },
  });
  console.log('✓ Turnos: Matutino y Vespertino');

  // ── 5. Grupos ───────────────────────────────────────────────────────────────
  const gruposMap: Record<string, string> = {};
  for (const gd of GRUPOS_DEF) {
    const grado = gradoMap[gd.grado];
    const turno = gd.turno === 'M' ? turnoM : turnoV;
    const key   = `${gd.grado}-${gd.turno}-${gd.letra}`;
    let grupo   = await db.grupo.findFirst({
      where: { idEsc: esc2.id, idGrado: grado.id, idTurno: turno!.id, nombre: gd.letra },
    });
    if (!grupo) {
      grupo = await db.grupo.create({
        data: { idEsc: esc2.id, idGrado: grado.id, idTurno: turno!.id, nombre: gd.letra },
      });
    }
    gruposMap[key] = grupo.id;
  }
  console.log(`✓ Grupos: ${Object.keys(gruposMap).length} (Mat: 1A-3C | Ves: 1A-3B)`);

  // ── 6. Estadísticas ─────────────────────────────────────────────────────────
  let numStats = 0;
  for (const gd of GRUPOS_DEF) {
    const key     = `${gd.grado}-${gd.turno}-${gd.letra}`;
    const idGrupo = gruposMap[key];
    const existe  = await db.estadisticaAlumnos.findFirst({ where: { idCiclo: ciclo2!.id, idGrupo } });
    if (existe) continue;

    const letrasM = ['A', 'B', 'C'];
    const letrasV = ['A', 'B'];
    const idx     = gd.turno === 'M' ? letrasM.indexOf(gd.letra) : 3 + letrasV.indexOf(gd.letra);
    const s       = STATS[gd.grado][idx];
    const exH     = s.inscH + s.altasH - s.bajasH;
    const exM     = s.inscM + s.altasM - s.bajasM;

    await db.estadisticaAlumnos.create({
      data: {
        idCiclo: ciclo2!.id, idGrupo, ...s,
        aprobTodosH: Math.round(exH * 0.75), aprobTodosM: Math.round(exM * 0.78),
        reprobH:     Math.round(exH * 0.15), reprobM:     Math.round(exM * 0.12),
        repetidoresH: gd.turno === 'M' && gd.grado > 1 ? 1 : 0, repetidoresM: 0,
      },
    });
    numStats++;
  }
  console.log(`✓ Estadísticas: ${numStats} registros`);

  // ── 7. Personal exclusivo ───────────────────────────────────────────────────
  console.log('\n-- Personal Escuela 2 --');
  const empE2Map: Record<string, string> = {};

  for (const p of PERSONAL_ESC2) {
    let emp = await db.empleado.findFirst({ where: { rfc: p.rfc } });
    if (emp) {
      empE2Map[p.rfc] = emp.id;
      console.log(`  — ${p.nombre} ${p.appP} (ya existe)`);
      continue;
    }

    const persona = await db.persona.create({
      data: {
        nombre: p.nombre, appP: p.appP, appM: p.appM,
        direccion: { create: { calle1: p.calle, colonia: p.colonia, ciudad: p.ciudad, codPost: p.cp, estado: 'Sinaloa', pais: 'Mexico' } },
        contacto:  { create: { numTel1: p.tel, correo: p.correo } },
      },
    });

    const idRolEmp    = rolEmpMap[p.rolNombre];
    const idNombramiento = nombMap[p.nombramientoNombre];
    const idMateria   = p.materiaNombre ? matMap[p.materiaNombre] : undefined;

    emp = await db.empleado.create({
      data: {
        idPersona: persona.id, idEsc: esc2.id,
        numControl: p.numControl, rfc: p.rfc, curp: p.curp,
        lugarNac: p.lugarNac, estadoCivil: p.estadoCivil, fIngreso: p.fIngreso,
        preparacion: {
          create: {
            estudiosPprof: p.estudiosPprof, escuelaRealiz: p.escuelaRealiz,
            tipoEstudio: p.tipoEstudio, ultimoGrado: p.ultimoGrado,
            institucion: p.institucion, especialidades: p.especialidades,
          },
        },
        roles: idRolEmp ? { create: { idRol: idRolEmp, fInicio: p.fIngreso } } : undefined,
      },
    });

    // Plaza
    if (idNombramiento) {
      const plaza = await db.plaza.create({
        data: {
          idEmpleado: emp.id, idNombramiento, idEsc: esc2.id,
          codigoPlaza: p.codigoPlaza,
          idMateria: idMateria ?? null,
          horasClase: p.horasClase ?? null,
          horasDescarga: p.horasDescarga ?? null,
          funcDescarga: p.funcDescarga ?? null,
        },
      });

      // Asignar grupos matutinos a docentes con materia
      if (p.materiaNombre) {
        const gruposTarget = GRUPOS_DEF
          .filter(g => g.turno === 'M')
          .map(g => gruposMap[`${g.grado}-M-${g.letra}`])
          .filter(Boolean)
          .slice(0, 6);
        for (const idGrupo of gruposTarget) {
          await db.plazaGrupo.create({ data: { idPlaza: plaza.id, idGrupo } }).catch(() => {});
        }
      }
    }

    empE2Map[p.rfc] = emp.id;
    console.log(`  ✓ ${p.nombre} ${p.appP} [${p.rolNombre}]`);
  }

  // ── 8. Plazas adicionales — docentes compartidos ─────────────────────────────
  console.log('\n-- Docentes compartidos con Escuela 1 --');
  const empCompartidosMap: Record<string, string> = {};

  for (const c of COMPARTIDOS) {
    const emp = await db.empleado.findFirst({ where: { rfc: c.rfc } });
    if (!emp) { console.log(`  ⚠  RFC ${c.rfc} no encontrado, omitiendo`); continue; }

    const persona = await db.persona.findFirst({ where: { id: emp.idPersona } });
    const nombre  = persona ? `${persona.nombre} ${persona.appP}` : c.rfc;
    const idNomb  = nombMap['Profesor de Educacion Secundaria'];
    const idMat   = matMap[c.materiaNombre];

    const plazaExiste = await db.plaza.findFirst({ where: { codigoPlaza: c.codigoPlaza } });
    if (!plazaExiste && idNomb && idMat) {
      const plaza = await db.plaza.create({
        data: {
          idEmpleado: emp.id, idNombramiento: idNomb, idEsc: esc2.id,
          codigoPlaza: c.codigoPlaza, idMateria: idMat, horasClase: c.horasClase,
        },
      });
      // Asignar a grupos 1A, 2A, 3A matutino
      for (const k of ['1-M-A', '2-M-A', '3-M-A']) {
        const idGrupo = gruposMap[k];
        if (idGrupo) await db.plazaGrupo.create({ data: { idPlaza: plaza.id, idGrupo } }).catch(() => {});
      }
      empCompartidosMap[c.rfc] = emp.id;
      console.log(`  ✓ ${nombre} → ${c.materiaNombre} (${c.horasClase}h en Escuela 2)`);
    } else {
      if (plazaExiste) console.log(`  — ${nombre}: plaza ya existe`);
      else console.log(`  ⚠  ${nombre}: nombramiento o materia no encontrada`);
    }
  }

  // ── 9. Horarios — docentes exclusivos de Escuela 2 con materia ───────────────
  console.log('\n-- Horarios --');
  const gruposMatIds = GRUPOS_DEF
    .filter(g => g.turno === 'M')
    .map(g => gruposMap[`${g.grado}-M-${g.letra}`])
    .filter(Boolean);

  for (const p of PERSONAL_ESC2) {
    if (!p.materiaNombre) continue;
    const empId    = empE2Map[p.rfc];
    const idMateria = matMap[p.materiaNombre];
    if (!empId || !idMateria) continue;

    const yaSlots = await db.horarioSlot.findFirst({ where: { idEmpleado: empId } });
    if (yaSlots) continue;

    let grupoIdx = 0;
    for (let d = 0; d < DIAS.length; d++) {
      for (let b = 0; b < 2; b++) {
        const bloque  = BLOQUES[(d * 2 + b) % BLOQUES.length];
        const idGrupo = gruposMatIds[grupoIdx % gruposMatIds.length];
        await db.horarioSlot.create({
          data: { idEmpleado: empId, idGrupo, idMateria,
                  diaSemana: DIAS[d], hInicio: bloque.hInicio, hFin: bloque.hFin },
        });
        grupoIdx++;
      }
    }
    console.log(`  ✓ Horario: ${p.nombre} ${p.appP} (${p.materiaNombre})`);
  }

  // Horarios para docentes compartidos en Escuela 2
  for (const c of COMPARTIDOS) {
    const empId   = empCompartidosMap[c.rfc];
    const idMat   = matMap[c.materiaNombre];
    if (!empId || !idMat) continue;

    // Solo verificar si ya tienen slots en grupos de esta escuela
    const gruposE2 = new Set(Object.values(gruposMap));
    const yaSlot   = await db.horarioSlot.findFirst({
      where: { idEmpleado: empId, idGrupo: { in: Array.from(gruposE2) } },
    });
    if (yaSlot) continue;

    // Asignar 2 días (Lunes y Miércoles)
    for (const dia of ['Lunes', 'Miercoles']) {
      const idGrupo = gruposMap[`1-M-A`];
      await db.horarioSlot.create({
        data: { idEmpleado: empId, idGrupo, idMateria: idMat,
                diaSemana: dia, hInicio: '07:00', hFin: '07:50' },
      });
    }
    console.log(`  ✓ Horario parcial: RFC ${c.rfc} → ${c.materiaNombre} en Escuela 2`);
  }

  console.log('\n✓ Seed completado.');
  console.log('\n─────────────────────────────────────────────');
  console.log(`  Escuela:  Secundaria General No. 7 (${CLAVE_ESC2})`);
  console.log(`  Login:    director@sec7.edu.mx / director123`);
  console.log(`  Grupos:   15 total — Matutino 1A/1B/1C · 2A/2B/2C · 3A/3B/3C`);
  console.log(`            Vespertino 1A/1B · 2A/2B · 3A/3B`);
  console.log(`  Compartidos con Escuela 1: Carlos Ramírez, María Elena Torres,`);
  console.log(`            Laura Mendoza, Roberto Espinoza`);
  console.log('─────────────────────────────────────────────');
}

main().catch(console.error).finally(() => db.$disconnect());
