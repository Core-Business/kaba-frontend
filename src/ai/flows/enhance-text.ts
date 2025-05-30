
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
  context: z.enum(['default', 'objective', 'introduction', 'scope', 'activity_description']).default('default').optional()
    .describe('El contexto del texto para aplicar reglas de estilo específicas. Por ejemplo, "objective" para objetivos de POA.'),
  // Boolean flags derived from context, to be used in Handlebars
  isObjectiveContext: z.boolean().optional().describe('Set to true if context is "objective".'),
  isIntroductionContext: z.boolean().optional().describe('Set to true if context is "introduction".'),
  isScopeContext: z.boolean().optional().describe('Set to true if context is "scope".'),
  isActivityDescriptionContext: z.boolean().optional().describe('Set to true if context is "activity_description".'),
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
Evita frases introductorias innecesarias como "El presente texto...", "El texto proporcionado..." o "El objetivo de este texto es...".
{{#if maxWords}}El texto mejorado no debe exceder las {{{maxWords}}} palabras.{{/if}}
La respuesta DEBE estar en español.

{{#if isObjectiveContext}}
Para este OBJETIVO, aplica las siguientes reglas adicionales:
- El objetivo debe describir el propósito del procedimiento, explicando por qué existe y qué se espera lograr.
- Debe redactarse de manera clara y concisa, indicando el alcance y los objetivos específicos.
- DEBE iniciar con un verbo en infinitivo (terminación -ar, -er o -ir).
- Evita el uso de gerundios (terminaciones -ando, -iendo) y adjetivos calificativos innecesarios.
- Debe ser breve, claro y preciso.
No incluyas frases como "El objetivo es..." o "Este documento tiene como objetivo...". Ve directamente al objetivo redactado.
{{/if}}

{{#if isIntroductionContext}}
Para esta INTRODUCCIÓN, asegúrate de que sea una visión general clara y directa del procedimiento. No uses frases como "La presente introducción..." o "Este documento describe...". Resume el procedimiento directamente.
{{/if}}

{{#if isScopeContext}}
Para este ALCANCE, define los límites del procedimiento, incluyendo departamentos, procesos y roles involucrados, y cualquier exclusión. Sé directo y conciso.
{{/if}}

{{#if isActivityDescriptionContext}}
Para esta DESCRIPCIÓN DE ACTIVIDAD, sé claro, directo y enfocado en la acción a realizar.
{{/if}}

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
  async (input: EnhanceTextInput) => {
    // Prepare input for the prompt by setting boolean context flags
    const processedInput = {
      ...input,
      isObjectiveContext: input.context === 'objective',
      isIntroductionContext: input.context === 'introduction',
      isScopeContext: input.context === 'scope',
      isActivityDescriptionContext: input.context === 'activity_description',
    };
    
    const {output} = await enhanceTextPrompt(processedInput);
    return output!;
  }
);
    
