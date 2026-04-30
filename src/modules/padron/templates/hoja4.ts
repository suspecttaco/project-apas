import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';

export function hoja4({ escuela, ciclo, grupos }: DatosPadron): string {
  const gradosUnicos = ciclo.plan.grados;

  const tablasTurnos = escuela.turnos.map(turno => {
    const gruposTurno = grupos.filter(g => g.idTurno === turno.id);

    const filas = gradosUnicos.map(grado => {
      const gruposGrado = gruposTurno.filter(g => g.idGrado === grado.id);
      const stats = gruposGrado.flatMap(g => g.estadisticas);
      const h = stats.reduce((s, e) => s + e.inscH + e.altasH - e.bajasH, 0);
      const m = stats.reduce((s, e) => s + e.inscM + e.altasM - e.bajasM, 0);
      return `
        <tr>
          <td>${grado.nombre}</td>
          <td class="center">${gruposGrado.length}</td>
          <td class="center">${h}</td>
          <td class="center">${m}</td>
          <td class="center bold">${h + m}</td>
        </tr>`;
    });

    const totalGrupos = gruposTurno.length;
    const totalH = gruposTurno.flatMap(g => g.estadisticas).reduce((s, e) => s + e.inscH + e.altasH - e.bajasH, 0);
    const totalM = gruposTurno.flatMap(g => g.estadisticas).reduce((s, e) => s + e.inscM + e.altasM - e.bajasM, 0);

    return `
      <h3>Turno: ${turno.nombre} &nbsp; (${turno.hInicio} – ${turno.hFin})</h3>
      <table>
        <tr>
          <th>Grado</th>
          <th>No. Grupos</th>
          <th>Hombres</th>
          <th>Mujeres</th>
          <th>Total</th>
        </tr>
        ${filas.join('')}
        <tr class="bold">
          <td>Total</td>
          <td class="center">${totalGrupos}</td>
          <td class="center">${totalH}</td>
          <td class="center">${totalM}</td>
          <td class="center">${totalH + totalM}</td>
        </tr>
      </table>`;
  });

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo)}
      <h2>Distribución de Alumnos por Turno</h2>
      ${tablasTurnos.join('')}
      <div class="pie">
        <div class="firma"><div class="firma-linea">Firma del Director</div></div>
        <div class="firma"><div class="firma-linea">Firma del Supervisor</div></div>
        <div style="font-size:7px; align-self:flex-end;">Fecha: ____________________</div>
      </div>
    </div>
  `;
}
