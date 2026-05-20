import { EscuelaConTurnos, CicloConPlan } from './tipos';

export function encabezado(escuela: EscuelaConTurnos, ciclo: CicloConPlan, titulo?: string): string {
  const turnos = escuela.turnos.map(t => t.nombre).join(' / ') || '—';

  return `
    <div class="encabezado">
      <div class="enc-logo">SEPyC</div>
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
    </div>
  `;
}