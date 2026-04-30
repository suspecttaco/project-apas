import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';

export function hoja2({ escuela, ciclo, empleados, grupos, roles }: DatosPadron): string {
  // Tabla A - conteo por rol
  const conteoRoles = roles.map(rol => ({
    nombre: rol.nombre,
    count:  empleados.filter(e => e.roles.some(er => er.idRol === rol.id)).length,
  }));

  // Tabla B - docentes por materia
  const docentesPorMateria = ciclo.plan.materias.map(mat => ({
    nombre: mat.nombre,
    count:  empleados.filter(e => e.plazas.some(p => p.idMateria === mat.id)).length,
  }));
  const totalDocentes = empleados.filter(e => e.plazas.some(p => p.idMateria)).length;

  // Tabla C - estadistica por grado
  const statsPorGrado = ciclo.plan.grados.map(grado => {
    const gruposGrado = grupos.filter(g => g.idGrado === grado.id);
    const stats = gruposGrado.flatMap(g => g.estadisticas);
    const inscH  = stats.reduce((s, e) => s + e.inscH,  0);
    const inscM  = stats.reduce((s, e) => s + e.inscM,  0);
    const altasH = stats.reduce((s, e) => s + e.altasH, 0);
    const altasM = stats.reduce((s, e) => s + e.altasM, 0);
    const bajasH = stats.reduce((s, e) => s + e.bajasH, 0);
    const bajasM = stats.reduce((s, e) => s + e.bajasM, 0);
    const exH = inscH + altasH - bajasH;
    const exM = inscM + altasM - bajasM;
    return {
      nombre: grado.nombre,
      inscH, inscM, inscT: inscH + inscM,
      altasH, altasM, altasT: altasH + altasM,
      bajasH, bajasM, bajasT: bajasH + bajasM,
      exH, exM, exT: exH + exM,
      desH: inscH > 0 ? ((bajasH / inscH) * 100).toFixed(1) : '0.0',
      desM: inscM > 0 ? ((bajasM / inscM) * 100).toFixed(1) : '0.0',
    };
  });

  const tInscH  = statsPorGrado.reduce((s, g) => s + g.inscH,  0);
  const tInscM  = statsPorGrado.reduce((s, g) => s + g.inscM,  0);
  const tAltasH = statsPorGrado.reduce((s, g) => s + g.altasH, 0);
  const tAltasM = statsPorGrado.reduce((s, g) => s + g.altasM, 0);
  const tBajasH = statsPorGrado.reduce((s, g) => s + g.bajasH, 0);
  const tBajasM = statsPorGrado.reduce((s, g) => s + g.bajasM, 0);
  const tExH = tInscH + tAltasH - tBajasH;
  const tExM = tInscM + tAltasM - tBajasM;

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo)}
      <h2>Estadística de Inicio de Ciclo Escolar</h2>

      <h3>Tabla A - Existencia de Recursos Humanos</h3>
      <table>
        <tr>
          ${conteoRoles.map(r => `<th>${r.nombre}</th>`).join('')}
          <th>Total</th>
        </tr>
        <tr>
          ${conteoRoles.map(r => `<td class="center">${r.count}</td>`).join('')}
          <td class="center bold">${empleados.length}</td>
        </tr>
      </table>

      <h3>Tabla B - Distribución del Personal Docente por Asignaturas</h3>
      <table>
        <tr>
          ${docentesPorMateria.map(m => `<th>${m.nombre}</th>`).join('')}
          <th>Total</th>
        </tr>
        <tr>
          ${docentesPorMateria.map(m => `<td class="center">${m.count}</td>`).join('')}
          <td class="center bold">${totalDocentes}</td>
        </tr>
      </table>

      <h3>Tabla C - Movimiento Estadístico de Alumnos</h3>
      <table>
        <tr>
          <th rowspan="2">Grado</th>
          <th colspan="3">Inscripción Inicial</th>
          <th colspan="3">Altas</th>
          <th colspan="3">Bajas</th>
          <th colspan="3">Existencia</th>
          <th colspan="2">% Deserción</th>
        </tr>
        <tr>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th>
        </tr>
        ${statsPorGrado.map(g => `
        <tr>
          <td>${g.nombre}</td>
          <td class="center">${g.inscH}</td><td class="center">${g.inscM}</td><td class="center">${g.inscT}</td>
          <td class="center">${g.altasH}</td><td class="center">${g.altasM}</td><td class="center">${g.altasT}</td>
          <td class="center">${g.bajasH}</td><td class="center">${g.bajasM}</td><td class="center">${g.bajasT}</td>
          <td class="center">${g.exH}</td><td class="center">${g.exM}</td><td class="center">${g.exT}</td>
          <td class="center">${g.desH}%</td><td class="center">${g.desM}%</td>
        </tr>`).join('')}
        <tr class="bold">
          <td>Total</td>
          <td class="center">${tInscH}</td><td class="center">${tInscM}</td><td class="center">${tInscH + tInscM}</td>
          <td class="center">${tAltasH}</td><td class="center">${tAltasM}</td><td class="center">${tAltasH + tAltasM}</td>
          <td class="center">${tBajasH}</td><td class="center">${tBajasM}</td><td class="center">${tBajasH + tBajasM}</td>
          <td class="center">${tExH}</td><td class="center">${tExM}</td><td class="center">${tExH + tExM}</td>
          <td class="center">${tInscH > 0 ? ((tBajasH / tInscH) * 100).toFixed(1) : '0.0'}%</td>
          <td class="center">${tInscM > 0 ? ((tBajasM / tInscM) * 100).toFixed(1) : '0.0'}%</td>
        </tr>
      </table>

      <div class="pie">
        <div class="firma"><div class="firma-linea">Nombre y Firma del Director</div></div>
        <div style="font-size:7px; align-self:flex-end;">Fecha: ____________________</div>
      </div>
    </div>
  `;
}
