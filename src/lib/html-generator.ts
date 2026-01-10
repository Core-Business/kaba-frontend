
import type { POA, POAActivity, POAAttachment } from './schema';

const translateActivityType = (type: POAActivity['nextActivityType']): string => {
  switch (type) {
    case 'decision':
      return 'Decisión';
    case 'alternatives':
      return 'Alternativas';
    case 'individual':
    default:
      return 'Individual'; 
  }
}

export function generatePOAHTML(poa: POA, attachments: POAAttachment[] = []): string {
  const logoUrl = poa.header.logoUrl || '';
  const title = poa.header.title || 'Procedimiento POA';
  const code = poa.header.documentCode || 'N/A';
  const version = poa.header.version || 'N/A';
  const date = poa.header.date ? new Date(poa.header.date + 'T00:00:00').toLocaleDateString('es-ES', {timeZone: 'UTC'}) : 'N/A';
  const area = poa.header.departmentArea || 'N/A';
  const companyName = poa.header.companyName || '';

  // Helper to generate table rows
  const generateTableRows = <T>(items: T[], columns: (item: T, index: number) => (string | number)[]) => {
    if (!items || items.length === 0) return '<tr><td colspan="100%" style="text-align:center;">No hay información disponible</td></tr>';
    return items.map((item, index) => `
      <tr>
        ${columns(item, index).map(col => `<td>${col}</td>`).join('')}
      </tr>
    `).join('');
  };

  // 6. Definiciones
  const definitionsHtml = poa.definitions.length > 0 ? `
    <div id="definitions" class="section">
      <h2>4. Definiciones</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Término</th>
            <th>Definición</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(poa.definitions, def => [def.term, def.definition])}
        </tbody>
      </table>
    </div>
  ` : '';

  // 7. Actividades
  const activitiesHtml = poa.activities.length > 0 ? `
    <div id="activities" class="section">
      <h2>5. Actividades</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">No.</th>
            <th style="width: 15%;">Tipo</th>
            <th style="width: 20%;">Responsable</th>
            <th>Actividad / Descripción</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(poa.activities, act => {
            const activityNumber = act.userNumber || act.systemNumber || '';
            const typeDisplay = translateActivityType(act.nextActivityType);
            const description = act.description ? act.description.replace(/\n/g, '<br>') : '';
            const name = act.activityName ? `<strong>${act.activityName}</strong><br>` : '';
            return [
              activityNumber,
              typeDisplay,
              act.responsible,
              `${name}${description}`
            ];
          })}
        </tbody>
      </table>
    </div>
  ` : '';

  // 8. Responsabilidades
  const responsibilitiesHtml = poa.responsibilities.length > 0 ? `
    <div id="responsibilities" class="section">
      <h2>6. Responsabilidades</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Rol Responsable</th>
            <th>Resumen de Responsabilidades</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(poa.responsibilities, resp => [resp.role || resp.responsibleName, resp.summary])}
        </tbody>
      </table>
    </div>
  ` : '';

  // 9. Referencias
  const referencesHtml = poa.references.length > 0 ? `
    <div id="references" class="section">
      <h2>7. Referencias</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Código</th>
            <th style="width: 30%;">Nombre</th>
            <th style="width: 20%;">Tipo</th>
            <th>Enlace</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(poa.references, ref => [
            ref.codigo || '',
            ref.nombreReferencia,
            ref.tipoReferencia,
            ref.enlace ? `<a href="${ref.enlace}" target="_blank">${ref.enlace}</a>` : ''
          ])}
        </tbody>
      </table>
    </div>
  ` : '';

  // 10. Registros
  const recordsHtml = poa.records.length > 0 ? `
    <div id="records" class="section">
      <h2>8. Registros</h2>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Formato</th>
            <th>Responsable</th>
            <th>Frecuencia</th>
            <th>Tiempo Retención</th>
            <th>Medio Almacenamiento</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(poa.records, rec => [
            rec.title,
            rec.format,
            rec.responsible,
            rec.frequency,
            rec.retentionTime,
            rec.storageMethod || ''
          ])}
        </tbody>
      </table>
    </div>
  ` : '';

  // 11. Control de Cambios
  const changeControlHtml = poa.changeControl.length > 0 ? `
    <div id="change-control" class="section">
      <h2>9. Control de Cambios</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">No.</th>
            <th style="width: 15%;">Fecha</th>
            <th>Motivo del Cambio</th>
            <th style="width: 20%;">Firma</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(poa.changeControl, (entry, index) => [
            entry.entryNumber || index + 1,
            entry.changeDate,
            entry.changeReason,
            entry.signature || ''
          ])}
        </tbody>
      </table>
    </div>
  ` : '';

  // 12. Aprobaciones
  const approvalsHtml = poa.approvals ? `
    <div id="approvals" class="section">
      <h2>10. Aprobaciones</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="width: 33%; border: 1px solid #000; padding: 10px; background-color: #10367D; text-align: center;">Elaboró</th>
            <th style="width: 33%; border: 1px solid #000; padding: 10px; background-color: #10367D; text-align: center;">Revisó</th>
            <th style="width: 33%; border: 1px solid #000; padding: 10px; background-color: #10367D ; text-align: center;">Autorizó</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 20px; vertical-align: top; height: 100px;">
              ${poa.approvals.elaborated.map(p => `<div><strong>${p.name}</strong><br><span style="font-size: 0.9em;">${p.position}</span></div>`).join('<br>') || '<div style="color: #999; text-align: center; margin-top: 30px;">(Sin firmar)</div>'}
            </td>
            <td style="border: 1px solid #000; padding: 20px; vertical-align: top; height: 100px;">
              ${poa.approvals.reviewed.map(p => `<div><strong>${p.name}</strong><br><span style="font-size: 0.9em;">${p.position}</span></div>`).join('<br>') || '<div style="color: #999; text-align: center; margin-top: 30px;">(Sin firmar)</div>'}
            </td>
            <td style="border: 1px solid #000; padding: 20px; vertical-align: top; height: 100px;">
              ${poa.approvals.authorized.map(p => `<div><strong>${p.name}</strong><br><span style="font-size: 0.9em;">${p.position}</span></div>`).join('<br>') || '<div style="color: #999; text-align: center; margin-top: 30px;">(Sin firmar)</div>'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : '';

  // 13. Anexos
  const attachmentsHtml = attachments.length > 0 ? `
    <div id="attachments" class="section">
      <h2>11. Anexos</h2>
      <ul>
        ${attachments.map(att => `
          <li>
            <a href="${att.url}" target="_blank"><strong>${att.originalName}</strong></a>
            ${att.description ? ` - ${att.description}` : ''}
          </li>
        `).join('')}
      </ul>
    </div>
  ` : '';

  // Índice
  const indexHtml = `
    <div class="section page-break-after">
      <h2>Índice</h2>
      <ul class="toc">
        ${poa.procedureDescription ? '<li><a href="#introduction">1. Introducción</a></li>' : ''}
        ${poa.objective ? '<li><a href="#objective">2. Objetivo</a></li>' : ''}
        ${poa.scope ? '<li><a href="#scope">3. Alcance</a></li>' : ''}
        ${poa.definitions.length > 0 ? '<li><a href="#definitions">4. Definiciones</a></li>' : ''}
        ${poa.activities.length > 0 ? '<li><a href="#activities">5. Actividades</a></li>' : ''}
        ${poa.responsibilities.length > 0 ? '<li><a href="#responsibilities">6. Responsabilidades</a></li>' : ''}
        ${poa.references.length > 0 ? '<li><a href="#references">7. Referencias</a></li>' : ''}
        ${poa.records.length > 0 ? '<li><a href="#records">8. Registros</a></li>' : ''}
        ${poa.changeControl.length > 0 ? '<li><a href="#change-control">9. Control de cambios</a></li>' : ''}
        ${poa.approvals ? '<li><a href="#approvals">10. Aprobaciones</a></li>' : ''}
        ${attachments.length > 0 ? '<li><a href="#attachments">11. Anexos</a></li>' : ''}
      </ul>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @page {
          margin: 20mm;
          size: letter;
        }
        body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; font-size: 12px; }
        
        /* Header Table Styles */
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #000; }
        .header-table td { border: 1px solid #000; padding: 5px; vertical-align: middle; }
        .header-logo { width: 150px; text-align: center; }
        .header-logo img { max-width: 120px; max-height: 60px; }
        .header-title { text-align: center; font-weight: bold; font-size: 16px; background-color: #10367D; color: white; text-transform: uppercase; }
        .header-subtitle { text-align: center; font-weight: bold; font-size: 14px; }
        .header-info { width: 100px; font-size: 10px; }
        .header-label { font-weight: bold; }
        
        /* Content Tables */
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; page-break-inside: auto; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #10367D; color: white; font-weight: bold; text-align: center; } /* Magenta color from screenshot */
        tr { page-break-inside: avoid; page-break-after: auto; }
        
        /* Sections */
        .section { margin-bottom: 20px; }
        h2 { font-size: 14px; font-weight: bold; color: #000; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        p { margin-bottom: 10px; text-align: justify; }
        
        /* TOC */
        .toc { list-style-type: none; padding: 0; }
        .toc li { margin-bottom: 5px; border-bottom: 1px dotted #ccc; }
        .toc a { text-decoration: none; color: #333; display: flex; justify-content: space-between; }
        .toc a::after { content: "Ir"; color: #002060; font-size: 0.8em; }

        /* Footer */
        .footer { 
          position: fixed; 
          bottom: 0; 
          left: 0; 
          right: 0; 
          font-size: 10px; 
          text-align: center; 
          color: #666; 
          border-top: 1px solid #ccc; 
          padding-top: 5px; 
          background: white;
        }
        
        /* Print specifics */
        @media print {
          .page-break-after { page-break-after: always; }
          .no-print { display: none; }
          
          /* Repeat header on every page using thead trick */
          .print-header-container { display: table-header-group; }
          .print-content-container { display: table-row-group; }
          
          /* Ensure background colors print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      </style>
    </head>
    <body>
      
      <!-- Fixed Footer for all pages -->
      <div class="footer">
        La información contenida en este documento es confidencial, destinada únicamente para fines de control interno e informativo para el personal de ${companyName} y sus filiales. Cualquier uso distinto está prohibido; así como su distribución, copia o manipulación no autorizada.
      </div>

      <!-- Main Layout Table to support repeating headers -->
      <table style="width: 100%; border: none;">
        <thead class="print-header-container">
          <tr>
            <td style="border: none; padding: 0;">
              <table class="header-table">
                <tr>
                  <td rowspan="3" class="header-logo">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo">` : ''}
                  </td>
                  <td class="header-title">PROCEDIMIENTO</td>
                  <td class="header-info"><span class="header-label">Código</span></td>
                  <td class="header-info">${code}</td>
                </tr>
                <tr>
                  <td class="header-subtitle">${title}</td>
                  <td class="header-info"><span class="header-label">Versión</span></td>
                  <td class="header-info">${version}</td>
                </tr>
                <tr>
                  <td class="header-subtitle">${area}</td>
                  <td class="header-info"><span class="header-label">Fecha</span></td>
                  <td class="header-info">${date}</td>
                </tr>
              </table>
            </td>
          </tr>
        </thead>
        <tbody class="print-content-container">
          <tr>
            <td style="border: none; padding: 0;">
              
              ${indexHtml}

              ${poa.procedureDescription ? `
              <div id="introduction" class="section">
                <h2>1. Introducción</h2>
                <p>${poa.procedureDescription.replace(/\n/g, '<br>')}</p>
              </div>` : ''}

              ${poa.objective ? `
              <div id="objective" class="section">
                <h2>2. Objetivo</h2>
                <p>${poa.objective.replace(/\n/g, '<br>')}</p>
              </div>` : ''}

              ${poa.scope ? `
              <div id="scope" class="section">
                <h2>3. Alcance</h2>
                <p>${poa.scope.replace(/\n/g, '<br>')}</p>
              </div>` : ''}

              ${definitionsHtml}
              ${activitiesHtml}
              ${responsibilitiesHtml}
              ${referencesHtml}
              ${recordsHtml}
              ${changeControlHtml}
              ${approvalsHtml}
              ${attachmentsHtml}

            </td>
          </tr>
        </tbody>
      </table>

    </body>
    </html>
  `;
}
