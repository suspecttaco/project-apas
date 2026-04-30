import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

export function hoja7({ escuela, ciclo, grupos }: DatosPadron): string {
  const tablasGrupos = grupos.map(grupo => {
    const horas = [...new Set(grupo.horarioSlots.map(s => `${s.hInicio}-${s.hFin}`))].sort();

    const tabla = horas.length > 0 ? `
      <table style="margin-bottom:10px;">
        <tr>
          <th>Hora</th>
          ${DIAS.map(d => `<th>${d}</th>`).join('')}
        </tr>
        ${horas.map(rango => {
          const [hIni, hFin] = rango.split('-');
          return `
          <tr>
            <td class="center">${rango}</td>
            ${DIAS.map(dia => {
              const slot = grupo.horarioSlots.find(
                s => s.diaSemana === dia && s.hInicio === hIni && s.hFin === hFin
              );
              if (!slot) return '<td></td>';
              const docente = slot.empleado?.persona
                ? `${slot.empleado.persona.appP} ${slot.empleado.persona.nombre}`
                : '';
              return `<td class="center">${slot.materia?.nombre ?? ''}<br><small>${docente}</small></td>`;
            }).join('')}
          </tr>`;
        }).join('')}
      </table>` : '<p style="font-size:7px; margin-bottom:8px;">Sin horario registrado</p>';

    return `
      <h3>Grupo ${grupo.nombre} &nbsp;–&nbsp; ${grupo.grado.nombre} &nbsp;(${grupo.turno.nombre})</h3>
      ${tabla}`;
  });

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo)}
      <h2>Horarios de Cada Grupo</h2>
      ${tablasGrupos.join('')}
      <div class="pie">
        <div class="firma"><div class="firma-linea">Firma del Director</div></div>
        <div style="font-size:7px; align-self:flex-end;">Fecha: ____________________</div>
      </div>
    </div>
  `;
}
