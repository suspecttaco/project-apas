import { EmpleadoReporte } from './tipos';
import { encabezadoReporte } from './encabezado';
import { pie } from './pie';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

export function paginaReporteMaestro(emp: EmpleadoReporte, logoBase64?: string): string {
  const { persona, preparacion, plazas, trabajoExterno, horarioSlots } = emp;
  const nombreCompleto = `${persona.appP} ${persona.appM ?? ''} ${persona.nombre}`.trim();
  const dir = persona.direccion;
  const con = persona.contacto;

  // ── C) Escuelas y materias ──────────────────────────────────────────────────
  // Agrupar plazas por escuela
  const plazasPorEscuela = plazas.reduce<Record<string, {
    escuelaNombre: string; escuelaClave: string; items: typeof plazas
  }>>((acc, p) => {
    const esc = (p as any).escuela;
    const key = esc?.id ?? 'desconocida';
    if (!acc[key]) acc[key] = { escuelaNombre: esc?.nombre ?? '—', escuelaClave: esc?.clave ?? '—', items: [] };
    acc[key].items.push(p);
    return acc;
  }, {});

  const filasEscuelas = Object.values(plazasPorEscuela).flatMap(({ escuelaNombre, escuelaClave, items }) =>
    items.map((p, i) => {
      const grupos = p.grupos.map(pg => {
        const g = (pg as any).grupo;
        return g ? `${g.grado?.nombre?.charAt(0) ?? ''}° ${g.nombre}` : '';
      }).filter(Boolean).join(', ');
      return `
        <tr>
          ${i === 0 ? `<td rowspan="${items.length}" style="vertical-align:top; font-weight:bold;">${escuelaNombre}<br><small>${escuelaClave}</small></td>` : ''}
          <td>${p.nombramiento?.nombre ?? '—'}</td>
          <td>${(p as any).materia?.nombre ?? '—'}</td>
          <td class="center">${p.horasClase ?? 0}</td>
          <td class="center">${p.horasDescarga ?? 0}</td>
          <td class="center">${(p.horasClase ?? 0) + (p.horasDescarga ?? 0) + (p.horasFortalec ?? 0)}</td>
          <td>${p.codigoPlaza}</td>
          <td>${grupos || '—'}</td>
        </tr>`;
    })
  ).join('');

  // ── D) Horario semanal ───────────────────────────────────────────────────────
  const horasUnicas = [...new Set(horarioSlots.map(s => s.hInicio))].sort();
  const tablaHorario = horasUnicas.length > 0 ? `
    <table>
      <tr>
        <th style="width:12mm;">SLOT</th>
        <th style="width:20mm;">HORA</th>
        ${DIAS.map(d => `<th>${d.toUpperCase()}</th>`).join('')}
      </tr>
      ${horasUnicas.map((hInicio, idx) => {
        const ejemplo = horarioSlots.find(s => s.hInicio === hInicio);
        const hFin    = ejemplo?.hFin ?? '';
        return `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="center">${hInicio}–${hFin}</td>
          ${DIAS.map(dia => {
            const slot = horarioSlots.find(s => s.diaSemana === dia && s.hInicio === hInicio);
            if (!slot) return '<td></td>';
            const g   = (slot as any).grupo;
            const esc = g?.escuela?.nombre ?? '';
            const gr  = g ? `${g.grado?.nombre?.charAt(0) ?? ''}° ${g.nombre}` : '';
            return `<td class="center">${slot.materia?.nombre ?? ''}<br><small>${gr}</small>${esc ? `<br><small style="color:#555">${esc}</small>` : ''}</td>`;
          }).join('')}
        </tr>`;
      }).join('')}
    </table>` : '<p class="nota">Sin horario registrado.</p>';

  // Trabajos externos
  const externos = trabajoExterno.length > 0 ? `
    <h3>E) TRABAJO EXTERNO</h3>
    <table>
      <tr><th>INSTITUCIÓN</th><th>FUNCIÓN</th><th>HORAS</th></tr>
      ${trabajoExterno.map(t => `
        <tr>
          <td>${(t as any).institucion ?? '—'}</td>
          <td>${(t as any).funcion ?? '—'}</td>
          <td class="center">${(t as any).horas ?? '—'}</td>
        </tr>`).join('')}
    </table>` : '';

  const totalHorasClase    = plazas.reduce((s, p) => s + (p.horasClase    ?? 0), 0);
  const totalHorasDescarga = plazas.reduce((s, p) => s + (p.horasDescarga ?? 0), 0);
  const totalHorasFortalec = plazas.reduce((s, p) => s + (p.horasFortalec ?? 0), 0);

  return `
    <div class="pagina">
      ${encabezadoReporte('REPORTE DE PERSONAL DOCENTE', logoBase64)}

      <h3>A) DATOS PERSONALES</h3>
      <table>
        <tr>
          <td class="label" style="width:110px;">NOMBRE COMPLETO</td>
          <td colspan="3">${nombreCompleto}</td>
          <td class="label" style="width:90px;">NO. DE CONTROL</td>
          <td class="center bold" style="width:40px;">${emp.numControl ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">DOMICILIO</td>
          <td colspan="2">${dir?.calle1 ?? '—'}</td>
          <td class="label">COLONIA</td>
          <td colspan="2">${dir?.colonia ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">LUGAR DE NACIMIENTO</td>
          <td colspan="2">${emp.lugarNac ?? '—'}</td>
          <td class="label">ESTADO CIVIL</td>
          <td colspan="2">${emp.estadoCivil ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">MUNICIPIO</td>
          <td>${dir?.ciudad ?? '—'}</td>
          <td class="label">C.P.</td>
          <td>${dir?.codPost ?? '—'}</td>
          <td class="label">TELÉFONO</td>
          <td>${con?.numTel1 ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">RFC</td>
          <td>${emp.rfc}</td>
          <td class="label">CURP</td>
          <td colspan="3">${emp.curp}</td>
        </tr>
        <tr>
          <td class="label">CORREO</td>
          <td colspan="2">${con?.correo ?? '—'}</td>
          <td class="label">FECHA DE INGRESO</td>
          <td colspan="2">${emp.fIngreso ? new Date(emp.fIngreso).toLocaleDateString('es-MX') : '—'}</td>
        </tr>
      </table>

      <h3>B) PREPARACIÓN PROFESIONAL</h3>
      <table>
        <tr>
          <td class="label" style="width:120px;">ESTUDIOS PROFESIONALES</td>
          <td colspan="2">${preparacion?.estudiosPprof ?? '—'}</td>
          <td class="label" style="width:80px;">TIPO DE ESTUDIO</td>
          <td>${preparacion?.tipoEstudio ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">ÚLTIMO GRADO</td>
          <td>${preparacion?.ultimoGrado ?? '—'}</td>
          <td class="label">INSTITUCIÓN</td>
          <td colspan="2">${preparacion?.institucion ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">ESPECIALIDADES</td>
          <td colspan="4">${preparacion?.especialidades ?? '—'}</td>
        </tr>
        <tr>
          <td class="label">ROL LABORAL</td>
          <td colspan="4">${emp.roles.map(r => r.rol.nombre).join(', ') || '—'}</td>
        </tr>
        <tr>
          <td class="label">TOTAL HORAS</td>
          <td>Clase: <strong>${totalHorasClase}</strong></td>
          <td>Descarga: <strong>${totalHorasDescarga}</strong></td>
          <td>Fortalecimiento: <strong>${totalHorasFortalec}</strong></td>
          <td class="bold">TOTAL: ${totalHorasClase + totalHorasDescarga + totalHorasFortalec}</td>
        </tr>
      </table>

      <h3>C) ESCUELAS Y MATERIAS QUE IMPARTE</h3>
      <table>
        <tr>
          <th>ESCUELA</th>
          <th>NOMBRAMIENTO</th>
          <th>MATERIA</th>
          <th>H. CLASE</th>
          <th>H. DESCARGA</th>
          <th>H. TOTAL</th>
          <th>CÓDIGO PLAZA</th>
          <th>GRUPOS</th>
        </tr>
        ${filasEscuelas || '<tr><td colspan="8" class="center">Sin plazas registradas</td></tr>'}
      </table>

      <h3>D) HORARIO SEMANAL</h3>
      ${tablaHorario}

      ${externos}

      ${pie(['NOMBRE Y FIRMA DEL EMPLEADO', 'NOMBRE Y FIRMA DEL DIRECTOR'])}
    </div>
  `;
}
