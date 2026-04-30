import { DatosPadron } from './tipos';
import { encabezado } from './encabezado';

export function hoja5({ escuela, ciclo, empleados }: DatosPadron): string {
  const filas = empleados.map(emp => {
    const nombre = `${emp.persona.appP} ${emp.persona.appM ?? ''}, ${emp.persona.nombre}`.trim();
    const horasClase    = emp.plazas.reduce((s, p) => s + (p.horasClase    ?? 0), 0);
    const horasDescarga = emp.plazas.reduce((s, p) => s + (p.horasDescarga ?? 0), 0);
    const horasFortalec = emp.plazas.reduce((s, p) => s + (p.horasFortalec ?? 0), 0);
    const total         = horasClase + horasDescarga + horasFortalec;
    const funcDescarga  = emp.plazas.map(p => p.funcDescarga).filter(Boolean).join('; ');
    const obs           = emp.plazas.map(p => p.observaciones).filter(Boolean).join('; ');

    return `
      <tr>
        <td class="center">${emp.numControl}</td>
        <td>${nombre}</td>
        <td class="center">${total || ''}</td>
        <td class="center">${horasClase || ''}</td>
        <td class="center">${horasDescarga || ''}</td>
        <td class="center">${horasFortalec || ''}</td>
        <td>${funcDescarga}</td>
        <td>${obs}</td>
      </tr>`;
  });

  return `
    <div class="pagina">
      ${encabezado(escuela, ciclo)}
      <h2>Estructura de Personal</h2>
      <table>
        <tr>
          <th>No. Control</th>
          <th>Nombre</th>
          <th>Total Horas</th>
          <th>Horas Frente Grupo</th>
          <th>Horas Descarga</th>
          <th>Horas Fortalecimiento</th>
          <th>Funciones con Descarga</th>
          <th>Observaciones</th>
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
