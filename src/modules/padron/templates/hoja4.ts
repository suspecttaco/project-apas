import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';
import { pie, fechaLugar } from './pie';

export function hoja4({ escuela, ciclo, empleados, grupos }: DatosPadron): string {
  const grados = ciclo.plan.grados;

  const gruposPorGrado = grados.map(g => ({
    nombre: g.nombre.replace(' Grado', ''),
    count: grupos.filter(gr => gr.idGrado === g.id).length,
  }));
  const gruposLabel = gruposPorGrado.map(g => `${g.nombre}s: ${g.count}`).join('  ');

  // ── Distribución alumnos por turno ───────────────────────────────────────
  const filasTurno = escuela.turnos.map(turno => {
    const gruposTurno = grupos.filter(g => g.idTurno === turno.id);
    const porGrado = grados.map(grado => {
      const gg    = gruposTurno.filter(g => g.idGrado === grado.id);
      const stats = gg.flatMap(g => g.estadisticas);
      const h = stats.reduce((s, e) => s + e.inscH + e.altasH - e.bajasH, 0);
      const m = stats.reduce((s, e) => s + e.inscM + e.altasM - e.bajasM, 0);
      return { numGrupos: gg.length, h, m };
    });
    const totalGrupos = porGrado.reduce((s, g) => s + g.numGrupos, 0);
    const totalH      = porGrado.reduce((s, g) => s + g.h, 0);
    const totalM      = porGrado.reduce((s, g) => s + g.m, 0);
    return { turno, porGrado, totalGrupos, totalH, totalM };
  });

  const totGrupos = filasTurno.reduce((s, t) => s + t.totalGrupos, 0);
  const totH      = filasTurno.reduce((s, t) => s + t.totalH, 0);
  const totM      = filasTurno.reduce((s, t) => s + t.totalM, 0);

  const letrasGrupos = [...new Set(grupos.map(g => g.nombre))].sort();

  // ── Relación de personal ─────────────────────────────────────────────────
  const filasPersonal = empleados.map(emp => {
    const nombre          = `${emp.persona.appP} ${emp.persona.appM ?? ''} ${emp.persona.nombre}`.trim();
    const horasNombr      = emp.plazas.reduce((s, p) => s + (p.horasClase ?? 0) + (p.horasDescarga ?? 0) + (p.horasFortalec ?? 0), 0);
    const horasClase      = emp.plazas.reduce((s, p) => s + (p.horasClase    ?? 0), 0);
    const horasDescarga   = emp.plazas.reduce((s, p) => s + (p.horasDescarga ?? 0), 0);
    const horasFortalec   = emp.plazas.reduce((s, p) => s + (p.horasFortalec ?? 0), 0);
    const funcDescarga    = emp.plazas.map(p => p.funcDescarga).filter(Boolean).join('; ');
    const obs             = emp.plazas.map(p => p.observaciones).filter(Boolean).join('; ');
    return { numControl: emp.numControl, nombre, horasNombr, horasClase, horasDescarga, horasFortalec, funcDescarga, obs };
  });

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo, 'ESTRUCTURA OCUPACIONAL DE PERSONAL')}
      <div style="font-size:7px; text-align:right; margin-bottom:3px;">GRUPOS: ${gruposLabel}</div>

      <h3>DISTRIBUCIÓN DE ALUMNOS POR TURNO</h3>
      <table>
        <tr>
          <th rowspan="2">TURNO</th>
          <th colspan="${grados.length}">TOTAL DE GRUPOS</th>
          <th colspan="3">TOTAL GENERAL</th>
          ${grados.map(g => `<th colspan="3">${g.nombre.replace(' Grado','').toUpperCase()}</th>`).join('')}
          ${letrasGrupos.map(l => `<th>GRU.<br>${l}</th>`).join('')}
        </tr>
        <tr>
          ${grados.map(g => `<th>${g.numero}°</th>`).join('')}
          <th>H</th><th>M</th><th>T</th>
          ${grados.map(() => '<th>H</th><th>M</th><th>T</th>').join('')}
          ${letrasGrupos.map(() => '<th>ALU.</th>').join('')}
        </tr>
        ${filasTurno.map(ft => `
        <tr>
          <td>${ft.turno.nombre}</td>
          ${ft.porGrado.map(c => `<td class="center">${c.numGrupos || ''}</td>`).join('')}
          <td class="center">${ft.totalH}</td>
          <td class="center">${ft.totalM}</td>
          <td class="center bold">${ft.totalH + ft.totalM}</td>
          ${ft.porGrado.map(c => `<td class="center">${c.h}</td><td class="center">${c.m}</td><td class="center bold">${c.h + c.m}</td>`).join('')}
          ${letrasGrupos.map(l => {
            const gg = grupos.filter(g => g.nombre === l && g.idTurno === ft.turno.id);
            const stats = gg.flatMap(g => g.estadisticas);
            const tot = stats.reduce((s, e) => s + e.inscH + e.altasH - e.bajasH + e.inscM + e.altasM - e.bajasM, 0);
            return `<td class="center">${tot || ''}</td>`;
          }).join('')}
        </tr>`).join('')}
        <tr class="fila-total">
          <td>TOTAL</td>
          ${grados.map(g => {
            const c = filasTurno.reduce((s,t) => s + (t.porGrado[grados.findIndex(gr=>gr.id===g.id)]?.numGrupos ?? 0), 0);
            return `<td class="center">${c}</td>`;
          }).join('')}
          <td class="center">${totH}</td>
          <td class="center">${totM}</td>
          <td class="center bold">${totH + totM}</td>
          ${grados.map(g => {
            const idx = grados.findIndex(gr => gr.id === g.id);
            const h = filasTurno.reduce((s,t) => s + (t.porGrado[idx]?.h ?? 0), 0);
            const m = filasTurno.reduce((s,t) => s + (t.porGrado[idx]?.m ?? 0), 0);
            return `<td class="center">${h}</td><td class="center">${m}</td><td class="center bold">${h+m}</td>`;
          }).join('')}
          ${letrasGrupos.map(() => '<td></td>').join('')}
        </tr>
      </table>

      <h3>RELACIÓN DE PERSONAL</h3>
      <table>
        <tr>
          <th rowspan="2">Nº PROG.</th>
          <th rowspan="2">NOMBRE</th>
          <th colspan="5">TOTAL DE HORAS</th>
          <th rowspan="2">FUNCIONES CON HORAS DE DESCARGA O FORT. CURRIC.</th>
          <th rowspan="2">HRS</th>
          <th rowspan="2">PLAZA APOYO</th>
          <th rowspan="2">OBS.</th>
        </tr>
        <tr>
          <th>POR NOMBR.</th>
          <th>EN LA ESC.</th>
          <th>FRENTE GRUPO</th>
          <th>DESCARGA</th>
          <th>FORT. CURRIC.</th>
        </tr>
        ${filasPersonal.map(p => `
        <tr>
          <td class="center">${p.numControl}</td>
          <td>${p.nombre}</td>
          <td class="center">${p.horasNombr  || ''}</td>
          <td class="center">${p.horasNombr  || ''}</td>
          <td class="center">${p.horasClase     || ''}</td>
          <td class="center">${p.horasDescarga  || ''}</td>
          <td class="center">${p.horasFortalec  || ''}</td>
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