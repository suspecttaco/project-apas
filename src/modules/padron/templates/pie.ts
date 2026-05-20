export function fechaLugar(localidad: string, municipio: string, estado: string): string {
  const fecha = new Date().toLocaleDateString('es-MX', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
  return `${localidad}, ${municipio}, ${estado}, a ${fecha}`;
}

export function pie(firmas: string[], lugar?: string): string {
  const fechaHtml = lugar
    ? `<div style="font-size:10px; align-self:flex-end;"><strong>${lugar}</strong></div>`
    : '';
  return `
    <div class="pie">
      ${firmas.map(f => `
        <div class="firma">
          <div class="firma-nombre">&nbsp;</div>
          <div class="firma-linea">${f}</div>
        </div>`).join('')}
      ${fechaHtml}
    </div>
  `;
}