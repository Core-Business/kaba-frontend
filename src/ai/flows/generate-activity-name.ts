
'use server';
/**
 * @fileOverview AI flow to generate a short name for an activity.
 *
 * - generateActivityName - Generates a short name from the activity description.
 * - GenerateActivityNameInput - Input type.
 * - GenerateActivityNameOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActivityNameInputSchema = z.object({
  description: z.string().describe('La descripción detallada de la actividad.'),
});
export type GenerateActivityNameInput = z.infer<typeof GenerateActivityNameInputSchema>;

const GenerateActivityNameOutputSchema = z.object({
  activityName: z
    .string()
    .describe(
      'Un TÍTULO corto y conciso para la actividad (máximo 8 palabras). Debe ser solo el nombre de la acción, sin sujetos, recomendaciones, propósitos, ni explicaciones adicionales (ej. después de dos puntos). En español.'
    ),
});
export type GenerateActivityNameOutput = z.infer<typeof GenerateActivityNameOutputSchema>;

export async function generateActivityName(input: GenerateActivityNameInput): Promise<GenerateActivityNameOutput> {
  return generateActivityNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityNamePrompt',
  input: {schema: GenerateActivityNameInputSchema},
  output: {schema: GenerateActivityNameOutputSchema},
  prompt: `Tu tarea es extraer un TÍTULO corto y conciso para la siguiente actividad, basándote en su descripción.
El título debe ser un NOMBRE o una FRASE NOMINAL que represente la acción principal.
REGLAS ESTRICTAS:
1.  MÁXIMO 8 palabras.
2.  EXTREMADAMENTE DIRECTO: Solo el nombre de la acción.
3.  SIN SUJETOS: No incluyas "El usuario...", "El sistema...", etc.
4.  SIN RECOMENDACIONES NI PROPÓSITOS: No incluyas "Se debe...", "Verificar que...", "para asegurar...", "con el fin de...", etc.
5.  SIN EXPLICACIONES ADICIONALES: No añadas texto después de dos puntos (:) que explique o detalle el título. Si la acción es "Diseñar Moodboard", el título es "Diseñar Moodboard", no "Diseñar Moodboard: paleta de colores". Si la descripción dice "Realizar análisis para determinar viabilidad", el título es "Realizar análisis", no "Realizar análisis: determinar viabilidad".
6.  EN ESPAÑOL.

Ejemplo de lo que NO HACER:
- "Verificación de Documentación: asegurar conformidad" (Incorrecto: incluye explicación después de ':')
- "Elaborar reporte para la gerencia" (Incorrecto: incluye 'para la gerencia')
- "Revisar el plan: con el objetivo de encontrar errores" (Incorrecto: incluye explicación de propósito)

Ejemplo de lo que SÍ HACER (solo el nombre de la acción):
- "Verificación de Documentación"
- "Elaborar Reporte"
- "Revisar Plan"
- "Diseñar Moodboard"

Descripción de la Actividad:
{{{description}}}

TÍTULO Corto de la Actividad (máximo 8 palabras, solo el nombre de la acción, directo, en español):`,
});

const generateActivityNameFlow = ai.defineFlow(
  {
    name: 'generateActivityNameFlow',
    inputSchema: GenerateActivityNameInputSchema,
    outputSchema: GenerateActivityNameOutputSchema,
    retry: {
      maxAttempts: 3,
      backoff: {
        initialDelayMs: 500,
        maxDelayMs: 5000,
        multiplier: 2,
      },
    },
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
