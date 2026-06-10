import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';
import { pie, fechaLugar } from './pie';

export function hoja6({ escuela, ciclo, empleados, grupos, logoBase64 }: DatosPadron): string {
  const grados   = ciclo.plan.grados;
  const materias = ciclo.plan.materias;

  const gruposPorGrado = grados.map(g => ({
    nombre: g.nombre.replace(' Grado', ''),
    count: grupos.filter(gr => gr.idGrado === g.id).length,
  }));
  const gruposLabel = gruposPorGrado.map(g => `${g.nombre}s: ${g.count}`).join('  ');

  // Letras de grupos por grado
  const letrasPorGrado = grados.map(g => {
    const letras = [...new Set(grupos.filter(gr => gr.idGrado === g.id).map(gr => gr.nombre))].sort();
    return letras;
  });

  // Horas por materia por grado (de materia_grado en el plan)
  // Lo sacamos del mismo ciclo.plan si está disponible, de lo contrario dejamos vacío
  const horasPorMatGrado = (mat: { id: string }, gradoIdx: number): string => {
    // No tenemos materiaGrado en el tipo actual, dejamos guión
    return '—';
  };

  // Docente que imparte la materia en cada grupo
  const docenteEnGrupo = (idMateria: string, idGrupo: string): string => {
    const emp = empleados.find(e =>
      e.plazas.some(p =>
        p.idMateria === idMateria &&
        p.grupos.some(pg => pg.idGrupo === idGrupo)
      )
    );
    if (!emp) return '';
    return `${emp.persona.appP} ${emp.persona.nombre}`;
  };

  const totalHorasPorGrado = grados.map(() => 0); // placeholder

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo, 'ESTRUCTURA OCUPACIONAL DE PERSONAL', logoBase64)}
      <div style="font-size:7px; text-align:right; margin-bottom:3px;">GRUPOS: ${gruposLabel}</div>

      <h3>PLAN DE ESTUDIOS — PROFESORES QUE ATIENDEN CADA GRUPO (NORMA ES-1)</h3>
      <table>
        <tr>
          <th rowspan="3">DISCIPLINAS</th>
          <th colspan="${grados.length * 2}">HORAS SEMANA DE CLASES</th>
          ${grados.map((g, i) => `<th colspan="${letrasPorGrado[i].length}">${g.nombre.replace(' Grado','').toUpperCase()}</th>`).join('')}
          <th rowspan="3">TOTAL<br>PROFES.</th>
        </tr>
        <tr>
          ${grados.map(g => `<th colspan="2">${g.numero}°</th>`).join('')}
          ${grados.map((g, i) => letrasPorGrado[i].map(l => `<th>${l}</th>`).join('')).join('')}
        </tr>
        <tr>
          ${grados.map(() => '<th>GRADO</th><th>GRUPO</th>').join('')}
          ${grados.map((g, i) => letrasPorGrado[i].map(() => '<th>PROF.</th>').join('')).join('')}
        </tr>
        ${materias.map(mat => {
          const totalProfs = new Set(
            empleados.filter(e => e.plazas.some(p => p.idMateria === mat.id)).map(e => e.id)
          ).size;
          return `
          <tr>
            <td>${mat.nombre}</td>
            ${grados.map((g, i) => `
              <td class="center">—</td>
              <td class="center">—</td>
            `).join('')}
            ${grados.map((g, i) => letrasPorGrado[i].map(l => {
              const grupo = grupos.find(gr => gr.idGrado === g.id && gr.nombre === l);
              const docente = grupo ? docenteEnGrupo(mat.id, grupo.id) : '';
              return `<td style="font-size:6.5px;">${docente}</td>`;
            }).join('')).join('')}
            <td class="center bold">${totalProfs || ''}</td>
          </tr>`;
        }).join('')}
        <tr class="fila-total">
          <td class="bold">TOTAL DE HORAS</td>
          ${grados.map(() => '<td></td><td></td>').join('')}
          ${grados.map((g, i) => letrasPorGrado[i].map(() => '<td></td>').join('')).join('')}
          <td></td>
        </tr>
      </table>

      ${pie(['NOMBRE Y FIRMA DEL DIRECTOR', 'NOMBRE Y FIRMA DEL SUPERVISOR ESCOLAR'], fechaLugar(escuela.localidad ?? '', escuela.municipio ?? '', escuela.estado ?? ''))}
    </div>
  `;
}