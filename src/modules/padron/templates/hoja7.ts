import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';
import { pie, fechaLugar } from './pie';

const DIAS_CORTO = ['L', 'M', 'M', 'J', 'V'] as const;
const DIAS_FULL  = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

function tablaGrupo(grupo: { nombre: string; grado: { nombre: string }; turno: { nombre: string }; horarioSlots: any[] }): string {
  const horasUnicas = [...new Set(grupo.horarioSlots.map((s: any) => s.hInicio))].sort() as string[];

  const filas = horasUnicas.map((hInicio, idx) => {
    const celdas = DIAS_FULL.map(dia => {
      const slot = grupo.horarioSlots.find((s: any) => s.diaSemana === dia && s.hInicio === hInicio);
      if (!slot) return '<td></td>';
      const mat = slot.materia?.nombre ?? '';
      return `<td style="font-size:6px; text-align:center;">${mat}</td>`;
    }).join('');
    return `<tr><td class="center" style="font-size:6.5px;">${idx + 1}</td>${celdas}</tr>`;
  });

  const gradoLetra = grupo.grado.nombre.replace(' Grado', '').charAt(0).toUpperCase();

  return `
    <div style="margin-bottom:4px;">
      <div style="font-size:7.5px; font-weight:bold; background:#d0d0d0; padding:2px 4px; border:1px solid #000;">
        ${gradoLetra}° ${grupo.nombre} &nbsp;–&nbsp; ${grupo.turno.nombre}
      </div>
      <table style="margin-bottom:0;">
        <tr>
          <th style="width:8mm;">#</th>
          ${DIAS_CORTO.map(d => `<th>${d}</th>`).join('')}
        </tr>
        ${filas.join('') || '<tr><td colspan="6" style="font-size:6px; text-align:center;">Sin horario</td></tr>'}
      </table>
    </div>`;
}

export function hoja7({ escuela, ciclo, grupos, logoBase64, logoEscBase64 }: DatosPadron): string {
  const grados = ciclo.plan.grados;
  const gruposPorGrado = grados.map(g => ({
    nombre: g.nombre.replace(' Grado', ''),
    count: grupos.filter(gr => gr.idGrado === g.id).length,
  }));
  const gruposLabel = gruposPorGrado.map(g => `${g.nombre}s: ${g.count}`).join('  ');

  // Agrupar por grado y renderizar en filas de hasta 5 columnas
  const bloques = grados.map(grado => {
    const gruposGrado = grupos.filter(g => g.idGrado === grado.id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    return { grado, grupos: gruposGrado };
  });

  // Renderizar grupos en filas de 5
  const COLS = 5;
  const filasHtml = bloques.map(({ grado, grupos: gg }) => {
    const rows: string[] = [];
    for (let i = 0; i < gg.length; i += COLS) {
      const chunk = gg.slice(i, i + COLS);
      rows.push(`
        <tr>
          ${chunk.map(g => `<td style="vertical-align:top; padding:2px; border:none;">${tablaGrupo(g)}</td>`).join('')}
          ${Array(COLS - chunk.length).fill('<td style="border:none;"></td>').join('')}
        </tr>`);
    }
    return `
      <tr>
        <td colspan="${COLS}" style="font-size:8px; font-weight:bold; padding:3px 0; border:none;">
          ${grado.nombre.toUpperCase()}
        </td>
      </tr>
      ${rows.join('')}`;
  }).join('');

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo, 'ESTRUCTURA OCUPACIONAL DE PERSONAL', logoBase64, logoEscBase64)}
      <div style="font-size:7px; text-align:right; margin-bottom:3px;">GRUPOS: ${gruposLabel}</div>

      <h3>HORARIOS DE CADA GRUPO</h3>
      <table style="border-collapse:separate; border-spacing:3px;">
        ${filasHtml}
      </table>

      ${pie(['NOMBRE Y FIRMA DEL DIRECTOR DE LA ESCUELA'], fechaLugar(escuela.localidad ?? '', escuela.municipio ?? '', escuela.estado ?? ''))}
    </div>
  `;
}