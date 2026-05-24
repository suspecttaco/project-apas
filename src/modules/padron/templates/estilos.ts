export const estilos = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }

  .pagina {
    width: 431mm;
    min-height: 279mm;
    padding: 10mm 12mm 30mm 12mm;
    position: relative;
    page-break-after: always;
    break-after: page;
  }
  .pagina:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  /*  Encabezado  */
  .encabezado {
    display: flex;
    align-items: stretch;
    border: 1px solid #000;
    margin-bottom: 8px;
  }
  .enc-logo {
    width: 30mm;
    min-height: 28mm;
    border-right: 1px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    text-align: center;
    padding: 6px;
  }
  .enc-cuerpo {
    flex: 1;
    padding: 4px 8px;
    font-size: 10px;
    line-height: 1.7;
  }
  .enc-titulo {
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 2px;
  }
  .enc-subtitulo {
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 4px;
  }
  .enc-fila {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .enc-campo { white-space: nowrap; }
  .enc-label { font-weight: bold; }

  /*  Títulos de sección  */
  h2 {
    font-size: 12px;
    text-align: center;
    margin: 6px 0 5px;
    text-transform: uppercase;
    font-weight: bold;
    text-decoration: underline;
  }
  h3 { font-size: 11px; margin: 6px 0 3px; font-weight: bold; }

  /*  Tablas  */
  table { width: 100%; border-collapse: collapse; margin-bottom: 7px; }
  th, td { border: 1px solid #000; padding: 4px 5px; vertical-align: middle; }
  th {
    background-color: #d0d0d0;
    text-align: center;
    font-size: 10px;
    font-weight: bold;
    line-height: 1.4;
  }
  td { font-size: 10.5px; }
  .center { text-align: center; }
  .bold   { font-weight: bold; }
  .right  { text-align: right; }
  .label  { font-weight: bold; background-color: #ececec; white-space: nowrap; width: 1%; }
  .nota   { font-size: 9px; font-style: italic; margin-bottom: 4px; }

  /*  Portada  */
  .portada {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 240mm;
    text-align: center;
    gap: 16px;
  }
  .portada .inst    { font-size: 18px; font-weight: bold; line-height: 1.7; }
  .portada h1       { font-size: 26px; margin: 10px 0; }
  .portada .escdata { font-size: 15px; line-height: 2; }
  .portada .doc     { font-size: 20px; font-weight: bold; margin-top: 20px; }
  .portada .lugfec  { font-size: 13px; margin-top: 20px; }

  /*  Pie de firmas  */
  .pie {
    position: absolute;
    bottom: 10mm;
    left: 12mm;
    right: 12mm;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    padding-top: 6px;
  }
  .firma { text-align: center; min-width: 130px; }
  .firma-nombre { font-size: 10px; margin-bottom: 2px; }
  .firma-linea  { border-top: 1px solid #000; padding-top: 3px; font-size: 9px; }

  /*  Utilidades  */
  .fila-total { background-color: #e8e8e8; font-weight: bold; }
  small { font-size: 8.5px; }
`;