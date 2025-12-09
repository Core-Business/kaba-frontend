'use server';

/**
 * @fileOverview A flow to generate the scope of a POA based on its activities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ActivitySchema = z.object({
  responsible: z.string().optional(),
  description: z.string().optional(),
});

const GenerateScopeFromActivitiesInputSchema = z.object({
  procedureName: z.string().describe('Nombre del procedimiento.'),
  companyName: z.string().optional().describe('Nombre de la empresa.'),
  objective: z.string().optional().describe('Objetivo del procedimiento.'),
  activities: z.array(ActivitySchema).describe('Lista de actividades del procedimiento.'),
  maxWords: z.number().optional().default(200).describe('Número máximo de palabras para el alcance generado.'),
});

export type GenerateScopeFromActivitiesInput = z.infer<typeof GenerateScopeFromActivitiesInputSchema>;

const GenerateScopeFromActivitiesOutputSchema = z.object({
  generatedScope: z.string().describe('El alcance generado en español.'),
});

export type GenerateScopeFromActivitiesOutput = z.infer<typeof GenerateScopeFromActivitiesOutputSchema>;

export async function generateScopeFromActivities(input: GenerateScopeFromActivitiesInput): Promise<GenerateScopeFromActivitiesOutput> {
  return generateScopeFromActivitiesFlow(input);
}

const generateScopeFromActivitiesPrompt = ai.definePrompt({
  name: 'generateScopeFromActivitiesPrompt',
  input: { schema: GenerateScopeFromActivitiesInputSchema },
  output: { schema: GenerateScopeFromActivitiesOutputSchema },
  prompt: `Eres un experto redactor de documentos técnicos y procedimientos operativos (POA).
Tu tarea es redactar la sección de "Alcance" de un procedimiento, basándote en la información proporcionada.

Información del Procedimiento:
- Nombre del Procedimiento: {{procedureName}}
{{#if companyName}}- Empresa: {{companyName}}{{/if}}
{{#if objective}}- Objetivo: {{objective}}{{/if}}

Actividades del Procedimiento:
{{#each activities}}
- Responsable: {{responsible}}, Actividad: {{description}}
{{/each}}

Instrucciones para la redacción del Alcance:
1. Analiza las actividades para determinar los límites del proceso: dónde empieza (primera actividad/input) y dónde termina (última actividad/output).
2. Identifica todas las áreas, departamentos o roles involucrados mencionados en las actividades.
3. Redacta un alcance claro y profesional que explique qué cubre este procedimiento.
4. Menciona explícitamente a quiénes aplica (roles/áreas).
5. Si es evidente qué NO cubre el procedimiento basándote en las actividades, puedes mencionar exclusiones generales, pero prioriza lo que SÍ cubre.
6. El tono debe ser formal, directo y objetivo.
7. La longitud debe ser de aproximadamente {{maxWords}} palabras.

Respuesta (solo el texto del alcance):`,
});

const generateScopeFromActivitiesFlow = ai.defineFlow(
  {
    name: 'generateScopeFromActivitiesFlow',
    inputSchema: GenerateScopeFromActivitiesInputSchema,
    outputSchema: GenerateScopeFromActivitiesOutputSchema,
  },
  async (input: GenerateScopeFromActivitiesInput) => {
    const { output } = await generateScopeFromActivitiesPrompt(input);
    return output!;
  }
);

