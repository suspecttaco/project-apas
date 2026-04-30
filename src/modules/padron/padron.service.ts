import puppeteer from 'puppeteer';
import { db, whereEsc } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';
import { empleadoInclude, grupoInclude, DatosPadron } from './templates/tipos';
import { estilos }    from './templates/estilos';
import { hoja1 }      from './templates/hoja1';
import { hoja2 }      from './templates/hoja2';
import { hoja3 }      from './templates/hoja3';
import { hoja4 }      from './templates/hoja4';
import { hoja5 }      from './templates/hoja5';
import { hoja6 }      from './templates/hoja6';
import { hoja7 }      from './templates/hoja7';

export class PadronService {

  private static async obtenerDatos(idEsc: string, idCiclo: string): Promise<DatosPadron> {
    const [escuela, ciclo, empleados, gruposRaw, roles] = await Promise.all([
      db.escuela.findFirst({
        where:   { id: idEsc },
        include: { turnos: { where: { activo: true } } },
      }),
      db.ciclo.findFirst({
        where:   { id: idCiclo },
        include: {
          plan: {
            include: {
              materias: { where: { activo: true }, orderBy: { nombre: 'asc' } },
              grados:   { where: { activo: true }, orderBy: { numero: 'asc' } },
            },
          },
        },
      }),
      db.empleado.findMany({
        where:   whereEsc(idEsc),
        include: {
          ...empleadoInclude,
          horarioSlots: {
            where:   { activo: true },
            include: { grupo: { include: { grado: true } }, materia: true },
            orderBy: [{ diaSemana: 'asc' }, { hInicio: 'asc' }],
          },
        },
        orderBy: { numControl: 'asc' },
      }),
      db.grupo.findMany({
        where:   whereEsc(idEsc),
        include: {
          ...grupoInclude,
          horarioSlots: {
            where:   { activo: true },
            include: { empleado: { include: { persona: true } }, materia: true },
            orderBy: [{ diaSemana: 'asc' }, { hInicio: 'asc' }],
          },
          estadisticas: { where: { idCiclo } },
        },
        orderBy: [{ grado: { numero: 'asc' } }, { nombre: 'asc' }],
      }),
      db.rolEmpleado.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    ]);

    if (!escuela) throw new NotFoundError('Escuela');
    if (!ciclo)   throw new NotFoundError('Ciclo');

    return { escuela, ciclo, empleados, grupos: gruposRaw, roles };
  }

  static async generar(idEsc: string, idCiclo: string): Promise<Buffer> {
    const datos = await PadronService.obtenerDatos(idEsc, idCiclo);

    await db.padron.create({ data: { idCiclo, idEsc, status: 'generado' } });

    const secciones = [
      hoja1(datos),
      hoja2(datos),
      ...datos.empleados.map(emp => hoja3(emp, datos.escuela, datos.ciclo)),
      hoja4(datos),
      hoja5(datos),
      hoja6(datos),
      hoja7(datos),
    ];

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${estilos}</style>
</head>
<body>
  ${secciones.join('\n')}
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format:          'Letter',
        printBackground: true,
        margin:          { top: '0.5cm', bottom: '0.5cm', left: '0.5cm', right: '0.5cm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  static async historial(idEsc: string) {
    return db.padron.findMany({
      where:   { idEsc },
      include: { ciclo: true },
      orderBy: { fGen: 'desc' },
    });
  }
}
