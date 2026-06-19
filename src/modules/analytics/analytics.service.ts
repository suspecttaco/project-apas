import * as fs from 'fs';
import * as path from 'path';
import { db } from '../../lib/db';

const LOGO_PATH = path.join(__dirname, '../../assets/sinaloa2.png');

export function getLogoBase64(): string | null {
  try {
    if (fs.existsSync(LOGO_PATH)) {
      return `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`;
    }
    return null;
  } catch { return null; }
}

export async function getLogoEscBase64(idEsc: string): Promise<string | null> {
  try {
    const esc = await db.escuela.findFirst({ where: { id: idEsc }, select: { logoUrl: true } });
    if (!esc?.logoUrl) return null;
    const filePath = path.join(process.cwd(), esc.logoUrl.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) return null;
    const buf  = fs.readFileSync(filePath);
    const ext  = path.extname(filePath).slice(1).toLowerCase();
    const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch { return null; }
}

export class AnalyticsService {

  static async getZona(idEsc?: string) {
    const whereEscuela = idEsc ? { id: idEsc, activo: true } : { activo: true };
    const escuelas = await db.escuela.findMany({ where: whereEscuela, orderBy: { nombre: 'asc' } });

    const resultado = await Promise.all(escuelas.map(async (esc) => {

      // Alumnos: existencia H/M del ciclo activo
      const cicloActivo = await db.ciclo.findFirst({ where: { idEsc: esc.id, activo: true } });
      let alumnos = { H: 0, M: 0, total: 0 };
      if (cicloActivo) {
        const stats = await db.estadisticaAlumnos.findMany({
          where: { grupo: { idEsc: esc.id, activo: true } },
        });
        stats.forEach(s => {
          alumnos.H += Math.max(0, s.inscH + s.altasH - s.bajasH);
          alumnos.M += Math.max(0, s.inscM + s.altasM - s.bajasM);
        });
        alumnos.total = alumnos.H + alumnos.M;
      }

      // Empleados totales
      const totalEmpleados = await db.empleado.count({ where: { idEsc: esc.id, activo: true } });

      // Docentes por materia — plazas activas con materia asignada
      const plazas = await db.plaza.findMany({
        where:   { idEsc: esc.id, activo: true, idMateria: { not: null } },
        include: {
          materia:  true,
          empleado: { include: { persona: true } },
        },
      });

      // Agrupar por materia, deduplicando empleados por materia
      const materiaMap = new Map<string, { materia: string; empleados: string[] }>();
      for (const plaza of plazas) {
        if (!plaza.materia) continue;
        const key = plaza.materia.id;
        if (!materiaMap.has(key)) materiaMap.set(key, { materia: plaza.materia.nombre, empleados: [] });
        const entry  = materiaMap.get(key)!;
        const nombre = `${plaza.empleado.persona.appP} ${plaza.empleado.persona.appM ?? ''} ${plaza.empleado.persona.nombre}`.trim();
        if (!entry.empleados.includes(nombre)) entry.empleados.push(nombre);
      }

      const docentesPorMateria = Array.from(materiaMap.values())
        .map(e => ({ materia: e.materia, count: e.empleados.length, empleados: e.empleados }))
        .sort((a, b) => b.count - a.count);

      return {
        id:         esc.id,
        nombre:     esc.nombre,
        clave:      esc.clave,
        zonaEscolar: esc.zonaEscolar,
        municipio:  esc.municipio,
        logoUrl:    esc.logoUrl ?? null,
        totalEmpleados,
        alumnos,
        docentesPorMateria,
      };
    }));

    const totales = {
      escuelas:  resultado.length,
      empleados: resultado.reduce((s, e) => s + e.totalEmpleados, 0),
      alumnos: {
        H:     resultado.reduce((s, e) => s + e.alumnos.H, 0),
        M:     resultado.reduce((s, e) => s + e.alumnos.M, 0),
        total: resultado.reduce((s, e) => s + e.alumnos.total, 0),
      },
    };

    return { escuelas: resultado, totales };
  }
}
