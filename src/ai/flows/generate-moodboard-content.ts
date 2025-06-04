
'use server';
/**
 * @fileOverview Un flujo de IA para generar sugerencias de colores y materiales para un Moodboard.
 *
 * - generateMoodboardContent - Genera contenido para un Moodboard.
 * - GenerateMoodboardContentInput - El tipo de entrada para la función.
 * - GenerateMoodboardContentOutput - El tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMoodboardContentInputSchema = z.object({
  collectionTheme: z.string().describe('El tema o concepto principal de la colección de moda.'),
});
export type GenerateMoodboardContentInput = z.infer<typeof GenerateMoodboardContentInputSchema>;

const GenerateMoodboardContentOutputSchema = z.object({
  suggestedColors: z.array(z.string()).describe('Una lista de colores sugeridos para el Moodboard, en español.'),
  suggestedMaterials: z.array(z.string()).describe('Una lista de materiales sugeridos para el Moodboard, en español.'),
  moodboardTitle: z.string().describe('Un título sugerido para el Moodboard, basado en el tema, en español.'),
});
export type GenerateMoodboardContentOutput = z.infer<typeof GenerateMoodboardContentOutputSchema>;

export async function generateMoodboardContent(input: GenerateMoodboardContentInput): Promise<GenerateMoodboardContentOutput> {
  return generateMoodboardContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMoodboardContentPrompt',
  input: {schema: GenerateMoodboardContentInputSchema},
  output: {schema: GenerateMoodboardContentOutputSchema},
  prompt: `Eres un asistente experto en diseño de moda y creación de Moodboards.
Basado en el tema de la colección proporcionado, genera un título para el Moodboard y listas de colores y materiales adecuados.
Las sugerencias deben ser inspiradoras y relevantes para el diseño de moda.
La respuesta DEBE estar en español.

Tema de la Colección: {{{collectionTheme}}}

Sugerencias para el Moodboard:
`,
});

const generateMoodboardContentFlow = ai.defineFlow(
  {
    name: 'generateMoodboardContentFlow',
    inputSchema: GenerateMoodboardContentInputSchema,
    outputSchema: GenerateMoodboardContentOutputSchema,
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
