import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';

export function hoja6({ escuela, ciclo, empleados, grupos }: DatosPadron): string {
  const grados = ciclo.plan.grados;

  const filas = ciclo.plan.materias.map(mat => {
    const docenteTotal = empleados.filter(e => e.plazas.some(p => p.idMateria === mat.id)).length;

    const celdas = grados.map(grado => {
      const gruposGrado = grupos.filter(g => g.idGrado === grado.id);
      const docentes = empleados.filter(e =>
        e.plazas.some(p =>
          p.idMateria === mat.id &&
          p.grupos.some(pg => gruposGrado.some(gg => gg.id === pg.idGrupo))
        )
      ).length;
      return `<td class="center">${gruposGrado.length}</td><td class="center">${docentes}</td>`;
    }).join('');

    return `
      <tr>
        <td>${mat.nombre}</td>
        ${celdas}
        <td class="center bold">${docenteTotal}</td>
      </tr>`;
  });

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo)}
      <h2>Concentrado de Docentes por Asignatura</h2>
      <table>
        <tr>
          <th rowspan="2">Materia</th>
          ${grados.map(g => `<th colspan="2">${g.nombre}</th>`).join('')}
          <th rowspan="2">Total Profesores</th>
        </tr>
        <tr>
          ${grados.map(() => '<th>Grupos</th><th>Docentes</th>').join('')}
        </tr>
        ${filas.join('')}
      </table>
      <div class="pie">
        <div class="firma"><div class="firma-linea">Firma del Director</div></div>
        <div class="firma"><div class="firma-linea">Firma del Supervisor</div></div>
        <div style="font-size:7px; align-self:flex-end;">Fecha: ____________________</div>
      </div>
    </div>
  `;
}
