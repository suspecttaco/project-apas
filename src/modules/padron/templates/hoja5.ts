import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';
import { pie, fechaLugar } from './pie';

// Hoja 5 — misma tabla de personal que hoja 4 pero sin distribución de alumnos
export function hoja5({ escuela, ciclo, empleados, grupos }: DatosPadron): string {
  const grados = ciclo.plan.grados;
  const gruposPorGrado = grados.map(g => ({
    nombre: g.nombre.replace(' Grado', ''),
    count: grupos.filter(gr => gr.idGrado === g.id).length,
  }));
  const gruposLabel = gruposPorGrado.map(g => `${g.nombre}s: ${g.count}`).join('  ');

  const filasPersonal = empleados.map(emp => {
    const nombre        = `${emp.persona.appP} ${emp.persona.appM ?? ''} ${emp.persona.nombre}`.trim();
    const horasNombr    = emp.plazas.reduce((s, p) => s + (p.horasClase ?? 0) + (p.horasDescarga ?? 0) + (p.horasFortalec ?? 0), 0);
    const horasClase    = emp.plazas.reduce((s, p) => s + (p.horasClase    ?? 0), 0);
    const horasDescarga = emp.plazas.reduce((s, p) => s + (p.horasDescarga ?? 0), 0);
    const horasFortalec = emp.plazas.reduce((s, p) => s + (p.horasFortalec ?? 0), 0);
    const funcDescarga  = emp.plazas.map(p => p.funcDescarga).filter(Boolean).join('; ');
    const obs           = emp.plazas.map(p => p.observaciones).filter(Boolean).join('; ');
    return { numControl: emp.numControl, nombre, horasNombr, horasClase, horasDescarga, horasFortalec, funcDescarga, obs };
  });

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo, 'ESTRUCTURA OCUPACIONAL DE PERSONAL')}
      <div style="font-size:7px; text-align:right; margin-bottom:3px;">GRUPOS: ${gruposLabel}</div>

      <table>
        <tr>
          <th rowspan="2">Nº PROG.</th>
          <th rowspan="2">NOMBRE</th>
          <th colspan="5">TOTAL DE HORAS</th>
          <th rowspan="2">FUNCIONES QUE DESEMPEÑA CON HORAS DE DESCARGA O FORT. CURRIC.</th>
          <th rowspan="2">HRS POR FUNCIÓN</th>
          <th rowspan="2">PLAZA DE APOYO Y ASIST. A LA EDUCACIÓN</th>
          <th rowspan="2">OBSERVACIONES</th>
        </tr>
        <tr>
          <th>POR NOMBR.</th>
          <th>EN LA ESC.</th>
          <th>FRENTE A GRUPO</th>
          <th>DE DESCARGA</th>
          <th>DE FORT. CURRIC.</th>
        </tr>
        ${filasPersonal.map(p => `
        <tr>
          <td class="center">${p.numControl}</td>
          <td>${p.nombre}</td>
          <td class="center">${p.horasNombr    || ''}</td>
          <td class="center">${p.horasNombr    || ''}</td>
          <td class="center">${p.horasClase    || ''}</td>
          <td class="center">${p.horasDescarga || ''}</td>
          <td class="center">${p.horasFortalec || ''}</td>
          <td style="font-size:7px;">${p.funcDescarga}</td>
          <td></td>
          <td></td>
          <td style="font-size:7px;">${p.obs}</td>
        </tr>`).join('')}
      </table>

      ${pie(['NOMBRE Y FIRMA DEL DIRECTOR', 'NOMBRE Y FIRMA DEL SUPERVISOR ESCOLAR'], fechaLugar(escuela.localidad ?? '', escuela.municipio ?? '', escuela.estado ?? ''))}
    </div>
  `;
}