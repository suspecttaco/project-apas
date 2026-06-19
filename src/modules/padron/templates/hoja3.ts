import { EmpleadoCompleto, EscuelaConTurnos, CicloConPlan } from './tipos';
import { encabezado } from './encabezado';
import { pie, fechaLugar } from './pie';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

export function hoja3(emp: EmpleadoCompleto, escuela: EscuelaConTurnos, ciclo: CicloConPlan, logoBase64?: string, logoEscBase64?: string): string {
  const { persona, preparacion, plazas, trabajoExterno, horarioSlots } = emp;
  const nombreCompleto = `${persona.appP} ${persona.appM ?? ''} ${persona.nombre}`.trim();
  const dir = persona.direccion;
  const con = persona.contacto;

  // Slots ordenados por hora, numerados
  const horasUnicas = [...new Set(horarioSlots.map(s => s.hInicio))].sort();
  const slotNumero: Record<string, number> = {};
  horasUnicas.forEach((h, i) => { slotNumero[h] = i + 1; });

  const tablaHorario = horasUnicas.length > 0 ? `
    <table>
      <tr>
        <th style="width:12mm;">SLOT</th>
        <th style="width:18mm;">HORA</th>
        ${DIAS.map(d => `<th>${d.toUpperCase()}</th>`).join('')}
      </tr>
      ${horasUnicas.map((hInicio) => {
        const slotEjemplo = horarioSlots.find(s => s.hInicio === hInicio);
        const hFin = slotEjemplo?.hFin ?? '';
        return `
        <tr>
          <td class="center">${slotNumero[hInicio]}</td>
          <td class="center">${hInicio}–${hFin}</td>
          ${DIAS.map(dia => {
            const slot = horarioSlots.find(s => s.diaSemana === dia && s.hInicio === hInicio);
            if (!slot) return '<td></td>';
            const grupo = slot.grupo ? `${slot.grupo.grado.nombre.charAt(0)}° ${slot.grupo.nombre}` : '';
            return `<td class="center">${slot.materia?.nombre ?? ''}<br><small>${grupo}</small></td>`;
          }).join('')}
        </tr>`;
      }).join('')}
    </table>` : '<p class="nota">Sin horario registrado</p>';

  const totalHorasClase    = plazas.reduce((s, p) => s + (p.horasClase    ?? 0), 0);
  const totalHorasDescarga = plazas.reduce((s, p) => s + (p.horasDescarga ?? 0), 0);
  const totalHorasFortalec = plazas.reduce((s, p) => s + (p.horasFortalec ?? 0), 0);
  const totalHoras = totalHorasClase + totalHorasDescarga + totalHorasFortalec;

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo, 'ESTRUCTURA OCUPACIONAL DEL PERSONAL', logoBase64, logoEscBase64)}

      <h3>A) DATOS PERSONALES</h3>
      <table>
        <tr>
          <td class="label" style="width:110px;">NOMBRE COMPLETO</td>
          <td colspan="3">${nombreCompleto}</td>
          <td class="label" style="width:90px;">NO. DE CONTROL</td>
          <td class="center bold" style="width:40px;">${emp.numControl}</td>
        </tr>
        <tr>
          <td class="label">DOMICILIO (CALLE Y NÚM.)</td>
          <td colspan="3">${dir?.calle1 ?? ''} ${dir?.calle2 ?? ''}</td>
          <td class="label">COLONIA</td>
          <td>${dir?.colonia ?? ''}</td>
        </tr>
        <tr>
          <td class="label">LUGAR DE NACIMIENTO</td>
          <td>${emp.lugarNac ?? ''}</td>
          <td class="label">ESTADO CIVIL</td>
          <td>${emp.estadoCivil ?? ''}</td>
          <td class="label">C.P.</td>
          <td>${dir?.codPost ?? ''}</td>
        </tr>
        <tr>
          <td class="label">MUNICIPIO / LOCALIDAD</td>
          <td>${dir?.ciudad ?? ''}</td>
          <td class="label">TELÉFONO</td>
          <td>${con?.numTel1 ?? ''}</td>
          <td class="label">CORREO ELECTRÓNICO</td>
          <td>${con?.correo ?? ''}</td>
        </tr>
        <tr>
          <td class="label">FECHA DE INGRESO AL SERVICIO</td>
          <td>${emp.fIngreso.toLocaleDateString('es-MX')}</td>
          <td class="label">RFC / FILIACIÓN</td>
          <td>${emp.rfc}</td>
          <td class="label">CURP</td>
          <td>${emp.curp}</td>
        </tr>
      </table>

      <h3>B) DATOS LABORALES</h3>
      <table>
        <tr>
          <th rowspan="2">PREPARACIÓN PROFESIONAL</th>
          <th rowspan="2">NOMBRAMIENTO</th>
          <th rowspan="2">CLAVE / NO. PLAZA</th>
          <th colspan="4">HORAS SEMANA DE CLASES</th>
          <th rowspan="2">GRADOS Y GRUPOS</th>
          <th rowspan="2">DISCIPLINAS QUE IMPARTE</th>
          <th rowspan="2">EVALUADO</th>
          <th rowspan="2">OBSERVACIONES</th>
        </tr>
        <tr>
          <th>TOTAL</th>
          <th>FRENTE A GRUPO</th>
          <th>DESCARGA</th>
          <th>FORTALEC.</th>
        </tr>
        ${plazas.map(p => {
          const grupos = p.grupos.map(pg => `${pg.grupo.grado.nombre.charAt(0)}°${pg.grupo.nombre}`).join(', ');
          const hTotal = (p.horasClase ?? 0) + (p.horasDescarga ?? 0) + (p.horasFortalec ?? 0);
          return `
          <tr>
            <td>
              ${preparacion ? [
                preparacion.estudiosPprof ?? '',
                preparacion.escuelaRealiz ? `(${preparacion.escuelaRealiz})` : '',
                preparacion.tipoEstudio   ?? '',
                preparacion.ultimoGrado   ?? '',
                preparacion.institucion   ? `Inst.: ${preparacion.institucion}` : '',
                preparacion.especialidades ? `Esp.: ${preparacion.especialidades}` : '',
              ].filter(Boolean).join('<br>') : ''}
            </td>
            <td>${p.nombramiento.nombre}</td>
            <td class="center">${p.codigoPlaza}</td>
            <td class="center">${hTotal || ''}</td>
            <td class="center">${p.horasClase ?? ''}</td>
            <td class="center">${p.horasDescarga ?? ''}</td>
            <td class="center">${p.horasFortalec ?? ''}</td>
            <td class="center">${grupos}</td>
            <td>${p.materia?.nombre ?? p.funcDescarga ?? ''}</td>
            <td>${p.evaluado ?? ''}</td>
            <td>${p.observaciones ?? ''}</td>
          </tr>`;
        }).join('')}
        <tr class="fila-total">
          <td colspan="3" class="right bold">TOTAL HORAS:</td>
          <td class="center bold">${totalHoras}</td>
          <td class="center bold">${totalHorasClase}</td>
          <td class="center bold">${totalHorasDescarga}</td>
          <td class="center bold">${totalHorasFortalec}</td>
          <td colspan="4"></td>
        </tr>
      </table>

      <h3>C) HORARIO SEMANAL</h3>
      ${tablaHorario}

      ${trabajoExterno.length > 0 ? `
        <h3>D) TRABAJO EN OTRA INSTITUCIÓN</h3>
        <table>
          <tr><th>INSTITUCIÓN</th><th style="width:30mm;">HORAS SEMANALES</th></tr>
          ${trabajoExterno.map(t => `<tr><td>${t.institucion}</td><td class="center">${t.horas}</td></tr>`).join('')}
        </table>
      ` : ''}

      ${pie(['FIRMA DEL TRABAJADOR', 'NOMBRE Y FIRMA DEL DIRECTOR', 'NOMBRE Y FIRMA DEL SUPERVISOR'], fechaLugar(escuela.localidad ?? '', escuela.municipio ?? '', escuela.estado ?? ''))}
    </div>
  `;
}