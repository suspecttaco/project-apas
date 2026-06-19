import { DatosPadron } from './tipos';

export function hoja1({ escuela, ciclo, logoBase64, logoEscBase64 }: DatosPadron): string {
  const hoy    = new Date();
  const lugFec = `${escuela.localidad ?? escuela.municipio ?? ''}, ${escuela.municipio ?? ''}, ${escuela.estado ?? ''}, a ${hoy.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`;

  const logosHtml = (logoEscBase64 || logoBase64) ? `
    <div style="display:flex; align-items:center; justify-content:center; gap:40px; margin-bottom:8px;">
      ${logoEscBase64 ? `<img src="${logoEscBase64}" style="width:110px; height:110px; object-fit:contain;" />` : '<div style="width:110px;"></div>'}
      ${logoBase64    ? `<img src="${logoBase64}"    style="width:110px; height:110px; object-fit:contain;" />` : '<div style="width:110px;"></div>'}
    </div>` : '';

  return `
    <div class="pagina" style="padding-bottom: 0; height: 279mm; overflow: hidden;">
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 240mm;
        text-align: center;
        gap: 14px;
      ">
        ${logosHtml}
        <div style="font-size:18px; font-weight:bold; line-height:1.7;">
          Secretaría de Educación Pública y Cultura<br>
          Subsecretaría de Educación Básica<br>
          Dirección de Educación ${escuela.nivel}
        </div>
        <h1 style="font-size:26px; margin:10px 0;">${escuela.nombre}</h1>
        <div style="font-size:15px; line-height:2;">
          Clave CCT: <strong>${escuela.clave}</strong><br>
          Zona Escolar: <strong>${escuela.zonaEscolar}</strong><br>
          ${escuela.domicilio ?? ''}<br>
          ${escuela.localidad ?? ''}, ${escuela.municipio ?? ''}, ${escuela.estado ?? ''}
        </div>
        <div style="font-size:20px; font-weight:bold; margin-top:20px;">ESTRUCTURA OCUPACIONAL</div>
        <div style="font-size:16px;">Nivel: Intermedia</div>
        <div style="font-size:18px; font-weight:bold;">Ciclo Escolar: ${ciclo.nombre}</div>
        <div style="font-size:13px; margin-top:20px;">${lugFec}</div>
      </div>
    </div>
  `;
}