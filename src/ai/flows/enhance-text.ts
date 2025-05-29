
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

{{#ifCond context "===" "objective"}}
Para este OBJETIVO, aplica las siguientes reglas adicionales:
- El objetivo debe describir el propósito del procedimiento, explicando por qué existe y qué se espera lograr.
- Debe redactarse de manera clara y concisa, indicando el alcance y los objetivos específicos.
- DEBE iniciar con un verbo en infinitivo (terminación -ar, -er o -ir).
- Evita el uso de gerundios (terminaciones -ando, -iendo) y adjetivos calificativos innecesarios.
- Debe ser breve, claro y preciso.
No incluyas frases como "El objetivo es..." o "Este documento tiene como objetivo...". Ve directamente al objetivo redactado.
{{/ifCond}}

{{#ifCond context "===" "introduction"}}
Para esta INTRODUCCIÓN, asegúrate de que sea una visión general clara y directa del procedimiento. No uses frases como "La presente introducción..." o "Este documento describe...". Resume el procedimiento directamente.
{{/ifCond}}

{{#ifCond context "===" "scope"}}
Para este ALCANCE, define los límites del procedimiento, incluyendo departamentos, procesos y roles involucrados, y cualquier exclusión. Sé directo y conciso.
{{/ifCond}}

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
    // Helper for Handlebars conditional block
    ai.handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
      switch (operator) {
        case '===':
          // @ts-ignore
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        default:
          // @ts-ignore
          return options.inverse(this);
      }
    });
    const {output} = await enhanceTextPrompt(input);
    return output!;
  }
);

    