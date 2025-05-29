
// src/ai/flows/generate-introduction.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating an introduction for a Plan of Action (POA).
 *
 * The flow takes a procedure description as input and uses AI to create a concise introduction (up to 200 words).
 *
 * @interface GenerateIntroductionInput - Input schema for the generateIntroduction function.
 * @interface GenerateIntroductionOutput - Output schema for the generateIntroduction function.
 * @function generateIntroduction - The main function to generate the introduction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIntroductionInputSchema = z.object({
  procedureDescription: z
    .string()
    .describe('The detailed description of the procedure for which the introduction is to be generated.'),
});

export type GenerateIntroductionInput = z.infer<typeof GenerateIntroductionInputSchema>;

const GenerateIntroductionOutputSchema = z.object({
  introduction: z
    .string()
    .describe('Una introducción concisa (hasta 200 palabras) que resume la descripción del procedimiento. La respuesta DEBE ser en español y directa, sin frases introductorias genéricas.'),
});

export type GenerateIntroductionOutput = z.infer<typeof GenerateIntroductionOutputSchema>;

const generateIntroductionPrompt = ai.definePrompt({
  name: 'generateIntroductionPrompt',
  input: {schema: GenerateIntroductionInputSchema},
  output: {schema: GenerateIntroductionOutputSchema},
  prompt: `Eres un experto en crear introducciones concisas e informativas para Procedimientos POA.
  Basado en la siguiente descripción del procedimiento, crea una introducción que no tenga más de 200 palabras.
  La introducción debe proporcionar una visión general clara y directa del procedimiento para el lector.
  Evita frases introductorias como "La presente introducción..." o "Este documento describe...". Ve directamente al resumen del procedimiento.
  La respuesta DEBE estar en español.

  Descripción del Procedimiento: {{{procedureDescription}}}

  Introducción en español (directa y concisa):`,
});

const generateIntroductionFlow = ai.defineFlow(
  {
    name: 'generateIntroductionFlow',
    inputSchema: GenerateIntroductionInputSchema,
    outputSchema: GenerateIntroductionOutputSchema,
  },
  async input => {
    const {output} = await generateIntroductionPrompt(input);
    return output!;
  }
);

export async function generateIntroduction(input: GenerateIntroductionInput): Promise<GenerateIntroductionOutput> {
  return generateIntroductionFlow(input);
}
