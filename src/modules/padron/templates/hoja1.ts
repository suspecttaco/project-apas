import { DatosPadron } from './tipos';

export function hoja1({ escuela, ciclo }: DatosPadron): string {
  const hoy = new Date();
  const fechaStr = hoy.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const lugarFecha = `${escuela.localidad ?? escuela.municipio ?? ''}, ${escuela.municipio ?? ''}, ${escuela.estado ?? ''}, ${fechaStr}`;

  return `
    <div class="pagina">
      <div class="portada">
        <div class="inst">Secretaría de Educación Pública y Cultura<br>Dirección de Educación ${escuela.nivel}</div>
        <h1>${escuela.nombre}</h1>
        <p>Clave CCT: <strong>${escuela.clave}</strong></p>
        <p>Zona Escolar: <strong>${escuela.zonaEscolar}</strong></p>
        <div class="subtitulo" style="margin-top:16px;">ESTRUCTURA OCUPACIONAL</div>
        <p>Nivel: Intermedia</p>
        <p style="margin-top:12px;">Ciclo Escolar: <strong>${ciclo.nombre}</strong></p>
        <p style="margin-top:40px; font-size:10px;">${lugarFecha}</p>
      </div>
    </div>
  `;
}
