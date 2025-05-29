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
    .describe('A concise introduction (up to 200 words) summarizing the procedure description.'),
});

export type GenerateIntroductionOutput = z.infer<typeof GenerateIntroductionOutputSchema>;

const generateIntroductionPrompt = ai.definePrompt({
  name: 'generateIntroductionPrompt',
  input: {schema: GenerateIntroductionInputSchema},
  output: {schema: GenerateIntroductionOutputSchema},
  prompt: `You are an expert in creating concise and informative introductions for Plans of Action (POAs).
  Given the following procedure description, generate an introduction that is no more than 200 words.
  The introduction should provide a clear overview of the procedure for the reader.

  Procedure Description: {{{procedureDescription}}}`,
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
