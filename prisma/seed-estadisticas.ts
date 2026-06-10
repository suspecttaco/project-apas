import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const ESCUELA_CLAVE = '0123456789';

// Datos realistas por grupo: [inscH, inscM, altasH, altasM, bajasH, bajasM, aprobTodosH, aprobTodosM, reprobH, reprobM, repetidoresH, repetidoresM]
const DATOS_GRUPOS: Record<string, [number, number, number, number, number, number, number, number, number, number, number, number]> = {
  '101': [15, 20, 1, 0, 0, 1, 14, 18, 1, 1, 0, 0],
  '102': [18, 17, 0, 1, 1, 0, 16, 16, 1, 2, 1, 0],
  '201': [14, 16, 0, 0, 0, 0, 13, 15, 1, 1, 2, 1],
  '202': [16, 15, 1, 0, 0, 1, 15, 13, 1, 1, 1, 1],
  '301': [13, 18, 0, 0, 1, 0, 11, 16, 2, 2, 1, 0],
  '302': [17, 14, 0, 1, 0, 0, 15, 13, 2, 1, 0, 1],
};

async function main() {
  const escuela = await db.escuela.findFirst({ where: { clave: ESCUELA_CLAVE } });
  if (!escuela) throw new Error(`Escuela ${ESCUELA_CLAVE} no encontrada`);

  const cicloActivo = await db.ciclo.findFirst({ where: { idEsc: escuela.id, activo: true } });
  if (!cicloActivo) throw new Error('No hay ciclo activo');

  console.log(`Escuela: ${escuela.nombre}`);
  console.log(`Ciclo activo: ${cicloActivo.nombre}`);

  const grupos = await db.grupo.findMany({
    where: { idEsc: escuela.id, activo: true },
    include: { grado: true },
    orderBy: { nombre: 'asc' },
  });

  console.log(`\nGrupos encontrados: ${grupos.map(g => g.nombre).join(', ')}`);

  for (const grupo of grupos) {
    const datos = DATOS_GRUPOS[grupo.nombre];
    if (!datos) {
      console.log(`  ⚠  Sin datos para grupo ${grupo.nombre}, omitiendo`);
      continue;
    }

    const [inscH, inscM, altasH, altasM, bajasH, bajasM, aprobTodosH, aprobTodosM, reprobH, reprobM, repetidoresH, repetidoresM] = datos;

    const stat = await db.estadisticaAlumnos.findFirst({
      where: { idCiclo: cicloActivo.id, idGrupo: grupo.id },
    });

    if (stat) {
      await db.estadisticaAlumnos.update({
        where: { id: stat.id },
        data: { inscH, inscM, altasH, altasM, bajasH, bajasM, aprobTodosH, aprobTodosM, reprobH, reprobM, repetidoresH, repetidoresM },
      });
      console.log(`  ✓  Grupo ${grupo.nombre}: actualizado (${inscH}H/${inscM}M inscritos)`);
    } else {
      await db.estadisticaAlumnos.create({
        data: { idCiclo: cicloActivo.id, idGrupo: grupo.id, inscH, inscM, altasH, altasM, bajasH, bajasM, aprobTodosH, aprobTodosM, reprobH, reprobM, repetidoresH, repetidoresM },
      });
      console.log(`  ✓  Grupo ${grupo.nombre}: creado (${inscH}H/${inscM}M inscritos)`);
    }
  }

  console.log('\n✓ Estadísticas insertadas correctamente.');
}

main().catch(console.error).finally(() => db.$disconnect());
