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
      'A coherent and informative summary that defines the scope of the procedure, including involved departments, processes, and roles.'
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
  prompt: `You are an expert in defining the scope of procedures.

  Based on the procedure description provided, your task is to create a concise and informative scope definition that includes the involved departments, processes, and roles.

  Procedure Description: {{{procedureDescription}}}

  Scope Definition:`, // The output schema description will automatically be appended.
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
