import { EmpleadoCompleto, EscuelaConTurnos, CicloConPlan } from './tipos';
import { encabezado } from './encabezado';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'] as const;

export function hoja3(emp: EmpleadoCompleto, escuela: EscuelaConTurnos, ciclo: CicloConPlan): string {
  const { persona, preparacion, plazas, trabajoExterno, horarioSlots } = emp;
  const nombreCompleto = `${emp.persona.appP} ${emp.persona.appM ?? ''}, ${emp.persona.nombre}`.trim();
  const dir = persona.direccion;
  const con = persona.contacto;

  // Horario semanal
  const horas = [...new Set(horarioSlots.map(s => `${s.hInicio}-${s.hFin}`))].sort();
  const tablaHorario = horas.length > 0 ? `
    <table>
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
            const slot = horarioSlots.find(s => s.diaSemana === dia && s.hInicio === hIni && s.hFin === hFin);
            if (!slot) return '<td></td>';
            const grupo = slot.grupo ? `${slot.grupo.nombre}` : '';
            return `<td class="center">${grupo}<br><small>${slot.materia?.nombre ?? ''}</small></td>`;
          }).join('')}
        </tr>`;
      }).join('')}
    </table>` : '<p>Sin horario registrado</p>';

  const cargasLaborales = plazas.map(p => ({
    nombramiento: p.nombramiento.nombre,
    codigo:       p.codigoPlaza,
    horas:        p.horasClase?.toString() ?? '-',
    grupos:       p.grupos.map(pg => `${pg.grupo.nombre} (${pg.grupo.grado.nombre})`).join(', '),
    materia:      p.materia?.nombre ?? '-',
    evaluado:     p.evaluado ?? '',
    obs:          p.observaciones ?? '',
  }));

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo)}
      <h2>Estructura Ocupacional del Personal</h2>

      <h3>Tabla A - Datos Personales</h3>
      <table>
        <tr>
          <td class="label">Nombre Completo</td>
          <td colspan="3">${nombreCompleto}</td>
          <td class="label">No. Control</td>
          <td>${emp.numControl}</td>
        </tr>
        <tr>
          <td class="label">Domicilio (Calle y Núm.)</td>
          <td colspan="3">${dir?.calle1 ?? ''} ${dir?.calle2 ?? ''}</td>
          <td class="label">Colonia</td>
          <td>${dir?.colonia ?? ''}</td>
        </tr>
        <tr>
          <td class="label">Lugar de Nacimiento</td>
          <td>${emp.lugarNac ?? ''}</td>
          <td class="label">Estado Civil</td>
          <td>${emp.estadoCivil ?? ''}</td>
          <td class="label">Localidad</td>
          <td>${dir?.ciudad ?? ''}</td>
        </tr>
        <tr>
          <td class="label">Municipio</td>
          <td>${dir?.ciudad ?? ''}</td>
          <td class="label">C.P.</td>
          <td>${dir?.codPost ?? ''}</td>
          <td class="label">RFC</td>
          <td>${emp.rfc}</td>
        </tr>
        <tr>
          <td class="label">Teléfono</td>
          <td>${con?.numTel1 ?? ''}</td>
          <td class="label">Fecha de Ingreso</td>
          <td>${emp.fIngreso.toLocaleDateString('es-MX')}</td>
          <td class="label">CURP</td>
          <td>${emp.curp}</td>
        </tr>
        <tr>
          <td class="label">Correo</td>
          <td colspan="5">${con?.correo ?? ''}</td>
        </tr>
      </table>

      <h3>Tabla B - Datos Laborales</h3>
      <table>
        <tr>
          <th>Preparación Profesional</th>
          <th>Nombramiento</th>
          <th>Categoría y No. Plaza</th>
          <th>Horas</th>
          <th>Grados y Grupos</th>
          <th>Disciplinas</th>
          <th>Evaluado</th>
          <th>Observaciones</th>
        </tr>
        <tr>
          <td>
            ${preparacion ? [
              preparacion.estudiosPprof ?? '',
              preparacion.escuelaRealiz ?? '',
              preparacion.tipoEstudio   ?? '',
              preparacion.ultimoGrado   ?? '',
              preparacion.especialidades ?? '',
            ].filter(Boolean).join('<br>') : ''}
          </td>
          <td>${cargasLaborales.map(c => c.nombramiento).join('<br>')}</td>
          <td>${cargasLaborales.map(c => c.codigo).join('<br>')}</td>
          <td class="center">${cargasLaborales.map(c => c.horas).join('<br>')}</td>
          <td>${cargasLaborales.map(c => c.grupos).join('<br>')}</td>
          <td>${cargasLaborales.map(c => c.materia).join('<br>')}</td>
          <td>${cargasLaborales.map(c => c.evaluado).join('<br>')}</td>
          <td>${cargasLaborales.map(c => c.obs).join('<br>')}</td>
        </tr>
      </table>

      <h3>Tabla C - Horario y Trabajo Externo</h3>
      <p style="font-size:7.5px; margin-bottom:3px;"><strong>Sección 1 - Horario Semanal</strong></p>
      ${tablaHorario}

      ${trabajoExterno.length > 0 ? `
        <p style="font-size:7.5px; margin-bottom:3px;"><strong>Sección 2 - Trabajo en Otra Institución</strong></p>
        <table>
          <tr><th>Institución</th><th>Horas</th></tr>
          ${trabajoExterno.map(t => `<tr><td>${t.institucion}</td><td class="center">${t.horas}</td></tr>`).join('')}
        </table>
      ` : ''}

      <div class="pie">
        <div class="firma"><div class="firma-linea">Firma del Trabajador</div></div>
        <div class="firma"><div class="firma-linea">Firma del Director</div></div>
        <div class="firma"><div class="firma-linea">Firma del Supervisor</div></div>
        <div style="font-size:7px; align-self:flex-end;">Fecha: _______________</div>
      </div>
    </div>
  `;
}
