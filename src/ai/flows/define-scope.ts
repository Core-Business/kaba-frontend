
'use server';

/**
 * @fileOverview An AI agent that defines the scope of a POA document.
 *
 * - defineScope - A function that generates the scope definition for a POA.
 * - DefineScopeInput - The input type for the defineScope function.
 * - DefineScopeOutput - The return type for the defineScope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DefineScopeInputSchema = z.object({
  procedureDescription: z
    .string()
    .describe('The description of the procedure for which the scope is to be defined.'),
});
export type DefineScopeInput = z.infer<typeof DefineScopeInputSchema>;

const DefineScopeOutputSchema = z.object({
  scopeDefinition: z
    .string()
    .describe(
      'Una definición de alcance coherente e informativa para el procedimiento, incluyendo departamentos, procesos y roles involucrados. La respuesta DEBE ser en español.'
    ),
});
export type DefineScopeOutput = z.infer<typeof DefineScopeOutputSchema>;

export async function defineScope(input: DefineScopeInput): Promise<DefineScopeOutput> {
  return defineScopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'defineScopePrompt',
  input: {schema: DefineScopeInputSchema},
  output: {schema: DefineScopeOutputSchema},
  prompt: `Eres un experto en definir el alcance de los procedimientos.

  Basado en la descripción del procedimiento proporcionada, tu tarea es crear una definición de alcance concisa e informativa que incluya los departamentos, procesos y roles involucrados.

  La respuesta DEBE estar en español.

  Descripción del Procedimiento: {{{procedureDescription}}}

  Definición del Alcance:`,
});

const defineScopeFlow = ai.defineFlow(
  {
    name: 'defineScopeFlow',
    inputSchema: DefineScopeInputSchema,
    outputSchema: DefineScopeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
