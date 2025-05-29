
import type { POA, POAActivity } from './schema';

const translateActivityType = (type: POAActivity['type']): string => {
  switch (type) {
    case 'decision':
      return 'Decisión';
    case 'alternatives':
      return 'Alternativas';
    case 'individual':
    default:
      return ''; 
  }
}

export function generatePOAHTML(poa: POA): string {
  const logoHtml = poa.header.logoUrl 
    ? `<img src="${poa.header.logoUrl}" alt="Logo" style="max-width: 150px; max-height: 150px; margin-bottom: 20px; float: right;" data-ai-hint="company logo" />` 
    : '';

  const activitiesHtml = poa.activities.map(activity => {
    const typeDisplay = translateActivityType(activity.type);
    return `
    <div class="activity-item" style="margin-bottom: 15px; padding-left: ${activity.number.includes('.') ? '20px' : '0px'};">
      <h4 style="font-size: 1.1em; margin-bottom: 5px;">Actividad ${activity.number}${typeDisplay ? `: (${typeDisplay})` : ''}</h4>
      <p style="margin-bottom: 5px;">${activity.description.replace(/\n/g, '<br>')}</p>
    </div>
  `}).join('');

  // Displaying user-written introduction (poa.procedureDescription)
  // And AI-suggested introduction (poa.introduction) if it exists
  const introductionSectionHtml = poa.procedureDescription ? `
    <div class="section">
      <h2>Introducción</h2>
      <p>${poa.procedureDescription.replace(/\n/g, '<br>')}</p>
      ${poa.introduction ? `
        <h3 style="margin-top: 15px; font-size: 1.1em; color: #444;">Sugerencia de Introducción (IA):</h3>
        <p style="font-style: italic; color: #555;">${poa.introduction.replace(/\n/g, '<br>')}</p>
      ` : ''}
    </div>` : '';


  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${poa.header.title || 'Procedimiento POA'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
        .container { max-width: 800px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
        header { border-bottom: 2px solid #002060; padding-bottom: 15px; margin-bottom: 20px; overflow: auto; }
        header h1 { color: #002060; margin: 0; font-size: 2em; }
        header p { margin: 5px 0 0; color: #555; font-size: 0.9em; }
        .section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #ccc; }
        .section:last-child { border-bottom: none; margin-bottom: 0; }
        .section h2 { color: #002060; font-size: 1.5em; margin-top: 0; margin-bottom: 10px; }
        .section h3 { color: #2C3531; font-size: 1.2em; margin-top: 0; margin-bottom: 8px; }
        p, li { margin-bottom: 10px; }
        ul { padding-left: 20px; }
        .activity-item h4 { color: #333; }
        .activity-item p { color: #444; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          ${logoHtml}
          <h1>${poa.header.title || 'Procedimiento POA'}</h1>
          <p><strong>Autor:</strong> ${poa.header.author || 'N/A'}</p>
          <p><strong>Versión:</strong> ${poa.header.version || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${poa.header.date ? new Date(poa.header.date + 'T00:00:00').toLocaleDateString('es-ES', {timeZone: 'UTC'}) : 'N/A'}</p>
        </header>

        ${introductionSectionHtml}

        ${poa.objective ? `
        <div class="section">
          <h2>Objetivo</h2>
          <p>${poa.objective.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        ${poa.scope ? `
        <div class="section">
          <h2>Alcance</h2>
          <p>${poa.scope.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

        ${poa.activities.length > 0 ? `
        <div class="section">
          <h2>Actividades</h2>
          ${activitiesHtml}
        </div>` : ''}

      </div>
    </body>
    </html>
  `;
}
