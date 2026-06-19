import { EscuelaConTurnos, CicloConPlan } from './tipos';

export function encabezado(
  escuela: EscuelaConTurnos,
  ciclo: CicloConPlan,
  titulo?: string,
  logoBase64?: string,
  logoEscBase64?: string,
): string {
  const turnos = escuela.turnos.map(t => t.nombre).join(' / ') || '—';

  // Con logo de escuela: escuela a la izquierda, SEPyC a la derecha
  // Sin logo de escuela: SEPyC a la izquierda (comportamiento anterior)
  const leftHtml = logoEscBase64
    ? `<img src="${logoEscBase64}" style="max-width:26mm; max-height:24mm; object-fit:contain;" alt="Escuela" />`
    : logoBase64
    ? `<img src="${logoBase64}" style="max-width:26mm; max-height:24mm; object-fit:contain;" alt="SEPyC" />`
    : `<span style="font-weight:bold; font-size:14px; text-align:center;">SEPyC</span>`;

  const rightHtml = logoEscBase64 && logoBase64
    ? `<div class="enc-logo" style="border-left:1px solid #ddd;"><img src="${logoBase64}" style="max-width:26mm; max-height:24mm; object-fit:contain;" alt="SEPyC" /></div>`
    : '';

  return `
    <div class="encabezado">
      <div class="enc-logo">${leftHtml}</div>
      <div class="enc-cuerpo">
        <div class="enc-titulo">SUBSECRETARÍA DE EDUCACIÓN BÁSICA</div>
        <div class="enc-subtitulo">DIRECCIÓN DE EDUCACIÓN ${escuela.nivel.toUpperCase()}${titulo ? ` &nbsp;·&nbsp; ${titulo}` : ''}</div>
        <div class="enc-subtitulo">CICLO ESCOLAR ${ciclo.nombre}</div>
        <div class="enc-fila">
          <span class="enc-campo"><span class="enc-label">ESCUELA:</span> ${escuela.nombre}</span>
          <span class="enc-campo"><span class="enc-label">CLAVE:</span> ${escuela.clave}</span>
          <span class="enc-campo"><span class="enc-label">TURNO:</span> ${turnos}</span>
          <span class="enc-campo"><span class="enc-label">TEL:</span> ${escuela.numTel ?? '—'}</span>
          <span class="enc-campo"><span class="enc-label">CORREO:</span> ${escuela.correo ?? '—'}</span>
        </div>
        <div class="enc-fila">
          <span class="enc-campo"><span class="enc-label">DOMICILIO:</span> ${escuela.domicilio ?? '—'}</span>
          <span class="enc-campo"><span class="enc-label">LOCALIDAD Y MUNICIPIO:</span> ${escuela.localidad ?? '—'}, ${escuela.municipio ?? '—'}</span>
          <span class="enc-campo"><span class="enc-label">ZONA ESCOLAR:</span> ${escuela.zonaEscolar}</span>
        </div>
      </div>
      ${rightHtml}
    </div>
  `;
}

// Encabezado simplificado para reporte de maestros (sin datos de escuela específica)
export function encabezadoReporte(titulo: string, logoBase64?: string, logoEscBase64?: string): string {
  const leftHtml = logoEscBase64
    ? `<img src="${logoEscBase64}" style="max-width:26mm; max-height:24mm; object-fit:contain;" alt="Escuela" />`
    : logoBase64
    ? `<img src="${logoBase64}" style="max-width:26mm; max-height:24mm; object-fit:contain;" alt="SEPyC" />`
    : `<span style="font-weight:bold; font-size:14px; text-align:center;">SEPyC</span>`;

  const rightHtml = logoEscBase64 && logoBase64
    ? `<div class="enc-logo" style="border-left:1px solid #ddd;"><img src="${logoBase64}" style="max-width:26mm; max-height:24mm; object-fit:contain;" alt="SEPyC" /></div>`
    : '';

  const hoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  return `
    <div class="encabezado">
      <div class="enc-logo">${leftHtml}</div>
      <div class="enc-cuerpo">
        <div class="enc-titulo">SECRETARÍA DE EDUCACIÓN PÚBLICA Y CULTURA</div>
        <div class="enc-subtitulo">SUBSECRETARÍA DE EDUCACIÓN BÁSICA</div>
        <div class="enc-subtitulo">${titulo}</div>
        <div class="enc-fila" style="justify-content:flex-end;">
          <span class="enc-campo"><span class="enc-label">FECHA:</span> ${hoy}</span>
        </div>
      </div>
      ${rightHtml}
    </div>
  `;
}
