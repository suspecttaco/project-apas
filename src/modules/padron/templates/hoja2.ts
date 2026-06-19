import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';
import { pie, fechaLugar } from './pie';

export function hoja2({ escuela, ciclo, empleados, grupos, roles, logoBase64, logoEscBase64, observaciones }: DatosPadron): string {

  //  Tabla A - Existencia de Recursos Humanos 
  const rolesConConteo = roles.map(rol => ({
    nombre: rol.nombre,
    count: empleados.filter(e => e.roles.some(er => er.idRol === rol.id)).length,
  })).filter(r => r.count > 0);
  const totalPersonal = empleados.length;

  //  Tabla B - Personal Docente por Asignatura 
  const docentesPorMateria = ciclo.plan.materias.map(mat => ({
    nombre: mat.nombre,
    count: empleados.filter(e => e.plazas.some(p => p.idMateria === mat.id)).length,
  })).filter(m => m.count > 0);
  const totalDocentes = new Set(
    empleados.filter(e => e.plazas.some(p => p.idMateria)).map(e => e.id)
  ).size;

  //  Tabla C - Movimientos estadísticos 
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
    const aprobH = stats.reduce((s, e) => s + (e.aprobTodosH ?? 0), 0);
    const aprobM = stats.reduce((s, e) => s + (e.aprobTodosM ?? 0), 0);
    const reprobH = stats.reduce((s, e) => s + (e.reprobH ?? 0), 0);
    const reprobM = stats.reduce((s, e) => s + (e.reprobM ?? 0), 0);
    const repH = stats.reduce((s, e) => s + (e.repetidoresH ?? 0), 0);
    const repM = stats.reduce((s, e) => s + (e.repetidoresM ?? 0), 0);
    return {
      nombre: grado.nombre,
      inscH, inscM, inscT: inscH + inscM,
      altasH, altasM, altasT: altasH + altasM,
      bajasH, bajasM, bajasT: bajasH + bajasM,
      exH, exM, exT: exH + exM,
      desH: inscH > 0 ? ((bajasH / inscH) * 100).toFixed(1) : '0.0',
      desM: inscM > 0 ? ((bajasM / inscM) * 100).toFixed(1) : '0.0',
      desT: (inscH + inscM) > 0 ? (((bajasH + bajasM) / (inscH + inscM)) * 100).toFixed(1) : '0.0',
      aprobH, aprobM, aprobT: aprobH + aprobM,
      reprobH, reprobM, reprobT: reprobH + reprobM,
      repH, repM, repT: repH + repM,
    };
  });

  const tot = statsPorGrado.reduce((acc, g) => ({
    inscH:  acc.inscH  + g.inscH,  inscM:  acc.inscM  + g.inscM,
    altasH: acc.altasH + g.altasH, altasM: acc.altasM + g.altasM,
    bajasH: acc.bajasH + g.bajasH, bajasM: acc.bajasM + g.bajasM,
    exH:    acc.exH    + g.exH,    exM:    acc.exM    + g.exM,
    aprobH: acc.aprobH + g.aprobH, aprobM: acc.aprobM + g.aprobM,
    reprobH:acc.reprobH+ g.reprobH,reprobM:acc.reprobM+ g.reprobM,
    repH:   acc.repH   + g.repH,   repM:   acc.repM   + g.repM,
  }), { inscH:0,inscM:0,altasH:0,altasM:0,bajasH:0,bajasM:0,exH:0,exM:0,aprobH:0,aprobM:0,reprobH:0,reprobM:0,repH:0,repM:0 });

  const numGruposPorGrado = ciclo.plan.grados.map(g => ({
    nombre: g.nombre.replace('Grado', '').trim(),
    count: grupos.filter(gr => gr.idGrado === g.id).length,
  }));

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo, 'ESTADÍSTICA DE INICIO DE CICLO ESCOLAR', logoBase64, logoEscBase64)}

      <h3>A) EXISTENCIA DE RECURSOS HUMANOS</h3>
      <table>
        <tr>
          <th>NO. ESC.</th>
          ${rolesConConteo.map(r => `<th>${r.nombre.toUpperCase()}</th>`).join('')}
          <th>TOTAL</th>
        </tr>
        <tr>
          <td class="center">${escuela.clave}</td>
          ${rolesConConteo.map(r => `<td class="center">${r.count}</td>`).join('')}
          <td class="center bold">${totalPersonal}</td>
        </tr>
      </table>
      <p class="nota">* El personal será considerado de acuerdo a la función que desempeñe en la escuela.</p>

      <h3>B) DISTRIBUCIÓN DEL PERSONAL DOCENTE POR ASIGNATURA</h3>
      <table>
        <tr>
          ${docentesPorMateria.map(m => `<th>${m.nombre.toUpperCase()}</th>`).join('')}
          <th>TOTAL</th>
        </tr>
        <tr>
          ${docentesPorMateria.map(m => `<td class="center">${m.count}</td>`).join('')}
          <td class="center bold">${totalDocentes}</td>
        </tr>
      </table>
      <p class="nota">* Los docentes que impartan dos o más asignaturas serán considerados en cada una de ellas.</p>

      <h3>C) MOVIMIENTOS ESTADÍSTICOS DE ALUMNOS</h3>
      <table>
        <tr>
          <th rowspan="3">GRADO</th>
          <th colspan="3">INSCRIPCIÓN INICIAL</th>
          <th colspan="3">ALTAS</th>
          <th colspan="3">BAJAS</th>
          <th colspan="3">EXISTENCIA</th>
          <th colspan="3">% DESERCIÓN</th>
          <th colspan="9">APROVECHAMIENTO ESCOLAR</th>
        </tr>
        <tr>
          <th colspan="3"></th>
          <th colspan="3"></th>
          <th colspan="3"></th>
          <th colspan="3"></th>
          <th colspan="3"></th>
          <th colspan="3">APROBADOS EN TODAS LAS MATERIAS</th>
          <th colspan="3">REPROBADOS DE 1 A 4 MATERIAS</th>
          <th colspan="3">REPETIDORES</th>
        </tr>
        <tr>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
          <th>H</th><th>M</th><th>T</th>
        </tr>
        ${statsPorGrado.map((g, i) => `
        <tr>
          <td class="center">${i + 1}</td>
          <td class="center">${g.inscH}</td><td class="center">${g.inscM}</td><td class="center">${g.inscT}</td>
          <td class="center">${g.altasH}</td><td class="center">${g.altasM}</td><td class="center">${g.altasT}</td>
          <td class="center">${g.bajasH}</td><td class="center">${g.bajasM}</td><td class="center">${g.bajasT}</td>
          <td class="center">${g.exH}</td><td class="center">${g.exM}</td><td class="center">${g.exT}</td>
          <td class="center">${g.desH}%</td><td class="center">${g.desM}%</td><td class="center">${g.desT}%</td>
          <td class="center">${g.aprobH}</td><td class="center">${g.aprobM}</td><td class="center">${g.aprobT}</td>
          <td class="center">${g.reprobH}</td><td class="center">${g.reprobM}</td><td class="center">${g.reprobT}</td>
          <td class="center">${g.repH}</td><td class="center">${g.repM}</td><td class="center">${g.repT}</td>
        </tr>`).join('')}
        <tr class="fila-total">
          <td class="center">TOTAL</td>
          <td class="center">${tot.inscH}</td><td class="center">${tot.inscM}</td><td class="center">${tot.inscH+tot.inscM}</td>
          <td class="center">${tot.altasH}</td><td class="center">${tot.altasM}</td><td class="center">${tot.altasH+tot.altasM}</td>
          <td class="center">${tot.bajasH}</td><td class="center">${tot.bajasM}</td><td class="center">${tot.bajasH+tot.bajasM}</td>
          <td class="center">${tot.exH}</td><td class="center">${tot.exM}</td><td class="center">${tot.exH+tot.exM}</td>
          <td class="center">${tot.inscH>0?((tot.bajasH/tot.inscH)*100).toFixed(1):0}%</td>
          <td class="center">${tot.inscM>0?((tot.bajasM/tot.inscM)*100).toFixed(1):0}%</td>
          <td class="center">${(tot.inscH+tot.inscM)>0?(((tot.bajasH+tot.bajasM)/(tot.inscH+tot.inscM))*100).toFixed(1):0}%</td>
          <td class="center">${tot.aprobH}</td><td class="center">${tot.aprobM}</td><td class="center">${tot.aprobH+tot.aprobM}</td>
          <td class="center">${tot.reprobH}</td><td class="center">${tot.reprobM}</td><td class="center">${tot.reprobH+tot.reprobM}</td>
          <td class="center">${tot.repH}</td><td class="center">${tot.repM}</td><td class="center">${tot.repH+tot.repM}</td>
        </tr>
      </table>
      <p class="nota">* Serán considerados repetidores aquellos alumnos que tengan 5 o más materias reprobadas.</p>

      ${observaciones ? `
      <div style="margin-top:6px; border:1px solid #000; padding:4px 8px;">
        <strong style="font-size:10px;">OBSERVACIONES:</strong>
        <p style="font-size:10px; margin-top:4px; white-space:pre-wrap;">${observaciones}</p>
      </div>` : `
      <div style="margin-top:6px; border:1px solid #000; padding:4px 8px; min-height:18mm;">
        <strong style="font-size:10px;">OBSERVACIONES:</strong>
      </div>`}

      ${pie(['NOMBRE Y FIRMA DEL DIRECTOR DE LA ESCUELA'], fechaLugar(escuela.localidad ?? '', escuela.municipio ?? '', escuela.estado ?? ''))}
    </div>
  `;
}