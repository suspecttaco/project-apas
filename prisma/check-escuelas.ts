import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
db.escuela.findMany({ select: { clave: true, nombre: true, activo: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); db.$disconnect(); });
