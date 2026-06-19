import fs   from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { db, whereEsc } from '../../lib/db';
import { NotFoundError } from '../../lib/errors';
import { empleadoInclude, empleadoReporteInclude, grupoInclude, DatosPadron } from './templates/tipos';
import { estilos }    from './templates/estilos';
import { hoja1 }      from './templates/hoja1';
import { hoja2 }      from './templates/hoja2';
import { hoja3 }      from './templates/hoja3';
import { hoja4 }      from './templates/hoja4';
import { hoja5 }      from './templates/hoja5';
import { hoja6 }      from './templates/hoja6';
import { hoja7 }      from './templates/hoja7';
import { paginaReporteMaestro } from './templates/reporte-maestro';

const LOGO_PATH = path.join(__dirname, '../../assets/logosepyc.png');

function cargarLogo(): string | undefined {
  try {
    if (fs.existsSync(LOGO_PATH)) {
      const buf = fs.readFileSync(LOGO_PATH);
      return `data:image/png;base64,${buf.toString('base64')}`;
    }
  } catch { /* si no existe, se usa texto */ }
  return undefined;
}

function cargarLogoEsc(logoUrl: string | null | undefined): string | undefined {
  if (!logoUrl) return undefined;
  try {
    const filePath = path.join(process.cwd(), logoUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg'
                 : ext === 'webp' ? 'image/webp'
                 : 'image/png';
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  } catch {}
  return undefined;
}

async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format:          'Tabloid',
      landscape:       true,
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function buildHtml(secciones: string[]): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${estilos}</style>
</head>
<body>
  ${secciones.join('\n')}
</body>
</html>`;
}

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

  static async generar(idEsc: string, idCiclo: string, observaciones?: string): Promise<Buffer> {
    const logoBase64    = cargarLogo();
    const datosBase     = await PadronService.obtenerDatos(idEsc, idCiclo);
    const logoEscBase64 = cargarLogoEsc(datosBase.escuela.logoUrl);
    const datos: DatosPadron = {
      ...datosBase,
      logoBase64,
      logoEscBase64,
      observaciones,
    };

    await db.padron.create({ data: { idCiclo, idEsc, status: 'generado' } });

    const secciones = [
      hoja1(datos),
      hoja2(datos),
      ...datos.empleados.map(emp => hoja3(emp, datos.escuela, datos.ciclo, logoBase64, logoEscBase64)),
      hoja4(datos),
      hoja5(datos),
      hoja6(datos),
      hoja7(datos),
    ];

    return renderPdf(buildHtml(secciones));
  }

  static async generarReporteMaestros(
    idEsc: string,
    idEmpleados: string[] | 'todos',
    observaciones?: string,
  ): Promise<Buffer> {
    const logoBase64    = cargarLogo();
    const escuela       = await db.escuela.findFirst({ where: { id: idEsc } });
    const logoEscBase64 = cargarLogoEsc(escuela?.logoUrl);

    const where = idEmpleados === 'todos'
      ? { idEsc, activo: true }
      : { id: { in: idEmpleados }, activo: true };

    const empleados = await db.empleado.findMany({
      where,
      include: {
        ...empleadoReporteInclude,
        horarioSlots: {
          where:   { activo: true },
          include: {
            grupo:   { include: { grado: true, turno: true, escuela: true } },
            materia: true,
          },
          orderBy: [{ diaSemana: 'asc' }, { hInicio: 'asc' }],
        },
      },
      orderBy: { numControl: 'asc' },
    });

    if (empleados.length === 0) throw new NotFoundError('Empleados');

    const secciones = empleados.map(emp => paginaReporteMaestro(emp as any, logoBase64, logoEscBase64));

    // Portada del reporte
    const hoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    const logosHtml = (logoEscBase64 || logoBase64) ? `
      <div style="display:flex; align-items:center; justify-content:center; gap:40px;">
        ${logoEscBase64 ? `<img src="${logoEscBase64}" style="width:160px; height:160px; object-fit:contain;" />` : '<div style="width:160px;"></div>'}
        ${logoBase64    ? `<img src="${logoBase64}"    style="width:160px; height:160px; object-fit:contain;" />` : ''}
      </div>` : `<div style="font-size:24px; font-weight:bold;">SEPyC</div>`;

    const portada = `
      <div class="pagina" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:20px;">
        ${logosHtml}
        <div style="font-size:16px; font-weight:bold; line-height:1.8;">
          Secretaría de Educación Pública y Cultura<br>
          Subsecretaría de Educación Básica
        </div>
        <div style="font-size:22px; font-weight:bold; margin:10px 0;">REPORTE DE PERSONAL DOCENTE</div>
        <div style="font-size:13px; line-height:2; color:#333;">
          Total de maestros incluidos: <strong>${empleados.length}</strong>
        </div>
        ${observaciones ? `<div style="font-size:11px; border:1px solid #ccc; padding:12px 20px; max-width:300px; text-align:left;"><strong>Observaciones:</strong><br>${observaciones}</div>` : ''}
        <div style="font-size:12px; margin-top:20px;">${hoy}</div>
      </div>`;

    secciones.unshift(portada);

    return renderPdf(buildHtml(secciones));
  }

  static async historial(idEsc: string) {
    return db.padron.findMany({
      where:   { idEsc },
      include: { ciclo: true },
      orderBy: { fGen: 'desc' },
    });
  }
}
