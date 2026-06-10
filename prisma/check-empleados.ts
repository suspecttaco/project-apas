import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const esc = await db.escuela.findFirst({ where: { clave: '0123456789' } });
  if (!esc) { console.log('Escuela no encontrada'); return; }
  const emps = await db.empleado.findMany({
    where: { idEsc: esc.id },
    include: { persona: true, roles: { include: { rol: true } } },
    orderBy: { numControl: 'asc' },
  });
  for (const e of emps) {
    const rol = e.roles[0]?.rol?.nombre ?? '—';
    console.log(`${e.persona.nombre} ${e.persona.appP} | RFC: ${e.rfc} | Rol: ${rol}`);
  }
}
main().catch(console.error).finally(() => db.$disconnect());
