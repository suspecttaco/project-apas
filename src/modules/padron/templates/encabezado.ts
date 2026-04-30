import { EscuelaConTurnos, CicloConPlan } from './tipos';

export function encabezado(escuela: EscuelaConTurnos, ciclo: CicloConPlan): string {
  return `
    <div class="encabezado">
      <div class="logo">SEPyC</div>
      <div class="info-esc">
        <div class="titulo">Dirección de Educación ${escuela.nivel}</div>
        <div>Ciclo Escolar: <strong>${ciclo.nombre}</strong> &nbsp;|&nbsp; ${escuela.nombre} &nbsp;|&nbsp; Clave: ${escuela.clave}</div>
        <div>Domicilio: ${escuela.domicilio ?? ''} &nbsp;|&nbsp; Localidad: ${escuela.localidad ?? ''} &nbsp;|&nbsp; Municipio: ${escuela.municipio ?? ''}</div>
        <div>Zona Escolar: ${escuela.zonaEscolar} &nbsp;|&nbsp; Correo: ${escuela.correo ?? ''} &nbsp;|&nbsp; Tel: ${escuela.numTel ?? ''}</div>
      </div>
    </div>
  `;
}
