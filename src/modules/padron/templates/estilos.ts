export const estilos = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 8.5px; color: #000; }
  .pagina { padding: 10mm 8mm; }
  .pagina + .pagina { page-break-before: always; break-before: page; }
  .encabezado { display: flex; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 8px; gap: 8px; }
  .logo { font-weight: bold; font-size: 11px; border: 1px solid #000; padding: 4px 6px; text-align: center; white-space: nowrap; }
  .info-esc { flex: 1; font-size: 7.5px; line-height: 1.5; }
  .info-esc .titulo { font-size: 10px; font-weight: bold; text-align: center; margin-bottom: 3px; }
  h2 { font-size: 10px; text-align: center; margin: 6px 0 4px; text-transform: uppercase; font-weight: bold; }
  h3 { font-size: 8.5px; margin: 6px 0 3px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th, td { border: 1px solid #000; padding: 2px 3px; vertical-align: top; }
  th { background-color: #d8d8d8; text-align: center; font-size: 7.5px; font-weight: bold; }
  td { font-size: 7.5px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .label { font-weight: bold; background-color: #ececec; white-space: nowrap; }
  .portada { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220mm; text-align: center; gap: 10px; }
  .portada .inst { font-size: 12px; font-weight: bold; }
  .portada h1 { font-size: 18px; margin: 8px 0; }
  .portada .subtitulo { font-size: 13px; font-weight: bold; }
  .portada p { font-size: 11px; }
  .pie { margin-top: 16px; display: flex; justify-content: space-around; align-items: flex-end; }
  .firma { text-align: center; min-width: 120px; }
  .firma-linea { border-top: 1px solid #000; padding-top: 2px; margin-top: 20px; font-size: 7px; }
  small { font-size: 6.5px; }
`;
