
// Enhance the text to conform to norms and writing style.

'use server';

/**
 * @fileOverview A flow to enhance the text to conform to norms and writing style.
 *
 * - enhanceText - A function that enhances the text.
 * - EnhanceTextInput - The input type for the enhanceText function.
 * - EnhanceTextOutput - The return type for the enhanceText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceTextInputSchema = z.object({
  text: z.string().describe('The text to enhance.'),
  maxWords: z.number().optional().describe('El número máximo de palabras para el texto mejorado.'),
});

export type EnhanceTextInput = z.infer<typeof EnhanceTextInputSchema>;

const EnhanceTextOutputSchema = z.object({
  enhancedText: z.string().describe('The enhanced text, in Spanish. Debe ser directo y evitar frases introductorias innecesarias.'),
});

export type EnhanceTextOutput = z.infer<typeof EnhanceTextOutputSchema>;

export async function enhanceText(input: EnhanceTextInput): Promise<EnhanceTextOutput> {
  return enhanceTextFlow(input);
}

const enhanceTextPrompt = ai.definePrompt({
  name: 'enhanceTextPrompt',
  input: {schema: EnhanceTextInputSchema},
  output: {schema: EnhanceTextOutputSchema},
  prompt: `Eres un asistente de escritura experto. Por favor, reformula y mejora el siguiente texto para asegurar claridad, concisión y un tono profesional y directo.
  Evita frases introductorias innecesarias como "El texto proporcionado..." o "El objetivo de este texto es...".
  {{#if maxWords}}El texto mejorado no debe exceder las {{{maxWords}}} palabras.{{/if}}
  La respuesta DEBE estar en español.

Texto original:
{{{text}}}

Texto mejorado en español (directo y conciso):`,
});

const enhanceTextFlow = ai.defineFlow(
  {
    name: 'enhanceTextFlow',
    inputSchema: EnhanceTextInputSchema,
    outputSchema: EnhanceTextOutputSchema,
  },
  async input => {
    const {output} = await enhanceTextPrompt(input);
    return output!;
  }
);
