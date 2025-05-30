
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
      'Un nombre corto para la actividad (máximo 8 palabras). Debe ser un extractor de nombre, sin sujetos ni recomendaciones, directo y conciso, en español.'
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
  prompt: `Dada la siguiente descripción de una actividad, extrae un nombre corto y conciso para ella.
El nombre debe tener un MÁXIMO de 8 palabras.
Debe ser un extractor de nombre, NO incluyas sujetos (ej. "El usuario...", "El sistema...") ni recomendaciones (ej. "Se debe...", "Verificar que...").
El nombre debe ser directo y en español.

Descripción de la Actividad:
{{{description}}}

Nombre Corto de la Actividad (máximo 8 palabras, directo, en español):`,
});

const generateActivityNameFlow = ai.defineFlow(
  {
    name: 'generateActivityNameFlow',
    inputSchema: GenerateActivityNameInputSchema,
    outputSchema: GenerateActivityNameOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
