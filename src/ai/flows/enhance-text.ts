
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
  // Optional helper fields for objective context
  generalDescription: z.string().optional().describe('Descripción general de la acción (¿Qué se hace?) para el contexto del objetivo.'),
  needOrProblem: z.string().optional().describe('Necesidad o problema que atiende (¿Por qué se hace?) para el contexto del objetivo.'),
  purposeOrExpectedResult: z.string().optional().describe('Finalidad o resultado esperado (¿Para qué se hace?) para el contexto del objetivo.'),
  targetAudience: z.string().optional().describe('A quién va dirigido o quién se beneficia (Aplicación) para el contexto del objetivo.'),
  desiredImpact: z.string().optional().describe('Impacto que se busca generar (mejora, control, cumplimiento, eficiencia, etc.) para el contexto del objetivo.'),
  kpis: z.array(z.string()).optional().describe('Indicadores Clave de Desempeño (KPIs) asociados para el contexto del objetivo.'),
  expandByPercent: z.number().int().min(1).optional().describe('Porcentaje para expandir el texto, ej. 50 para 50% más largo. Si se provee, la tarea principal será expandir el texto.'),
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
  prompt: `Eres un asistente de escritura experto.
{{#if expandByPercent}}
Tu tarea principal es expandir el siguiente texto para que sea aproximadamente un {{{expandByPercent}}}% más largo.
La expansión debe ser CONSERVADORA y ESTRICTAMENTE RELACIONADA con el texto original.
Añade detalles directamente relevantes, elabora los puntos existentes o proporciona ejemplos concretos ÚNICAMENTE si están implícitos o son una continuación directa del texto provisto.
NO incluyas frases introductorias innecesarias. NO añadas información general, ejemplos no solicitados, o temas que no estén directamente derivados del texto original. Mantén la claridad, un tono directo y profesional.
{{else}}
Tu tarea es reformular y mejorar el siguiente texto para asegurar claridad, concisión y un tono profesional y directo.
Evita frases introductorias innecesarias como "El presente texto...", "El texto proporcionado..." o "El objetivo de este texto es...".
{{/if}}
{{#if maxWords}}El texto resultante debe tener una longitud aproximada de {{{maxWords}}} palabras, puede exceder este límite un 10%. Intenta acercarte lo más posible a este número de palabras para un desarrollo completo, manteniendo la concisión.{{/if}}
La respuesta DEBE estar en español.

{{#if isObjectiveContext}}
Para este OBJETIVO, aplica las siguientes reglas adicionales:
- El objetivo debe describir el propósito del procedimiento, explicando por qué existe y qué se espera lograr.
- Debe redactarse de manera clara y concisa, indicando el alcance y los objetivos específicos.
- DEBE iniciar con un verbo en infinitivo (terminación -ar, -er o -ir).
- Evita el uso de gerundios (terminaciones -ando, -iendo) y adjetivos calificativos innecesarios.
- Debe ser breve, claro y preciso.
No incluyas frases como "El objetivo es..." o "Este documento tiene como objetivo...". Ve directamente al objetivo redactado.

{{#if generalDescription}}
Si se proporciona información de ayuda adicional (descripción general, necesidad, etc.), utilízala como CONTEXTO para refinar y enriquecer el 'Texto original' que se te da para mejorar. Asegúrate de que el texto mejorado siga siendo una edición del 'Texto original' y no una reescritura completa basada solo en esta información de ayuda.
Información de ayuda adicional para contextualizar la edición del objetivo:
- Descripción general de la acción: {{{generalDescription}}}
{{/if}}
{{#if needOrProblem}}
- Necesidad o problema que atiende: {{{needOrProblem}}}
{{/if}}
{{#if purposeOrExpectedResult}}
- Finalidad o resultado esperado: {{{purposeOrExpectedResult}}}
{{/if}}
{{#if targetAudience}}
- A quién va dirigido o quién se beneficia: {{{targetAudience}}}
{{/if}}
{{#if desiredImpact}}
- Impacto que se busca generar: {{{desiredImpact}}}
{{/if}}
{{#if kpis.length}}
- KPIs asociados:
{{#each kpis}}
  - {{{this}}}
{{/each}}
{{/if}}

{{/if}}

{{#if isIntroductionContext}}
Para esta INTRODUCCIÓN, asegúrate de que sea una visión general clara y directa del procedimiento. No uses frases como "La presente introducción..." o "Este documento describe...". Resume el procedimiento directamente.
{{/if}}

{{#if isScopeContext}}
Para este ALCANCE, define los límites del procedimiento, incluyendo departamentos, procesos y roles involucrados, y cualquier exclusión. Sé directo y conciso.
{{/if}}

{{#if isActivityDescriptionContext}}
Para esta DESCRIPCIÓN DE ACTIVIDAD, sé extremadamente claro, directo y enfocado en la acción a realizar.
{{#if expandByPercent}}
La expansión debe ser CONSERVADORA y ESTRICTAMENTE RELACIONADA con el texto original. Añade detalles directamente relevantes, elabora los puntos existentes o proporciona ejemplos concretos ÚNICAMENTE si están implícitos o son una continuación directa del texto provisto. NO incluyas información general, ejemplos no solicitados, o temas que no estén directamente derivados del texto original.
{{/if}}
NO incluyas sujetos (ej. "El usuario...", "El sistema...", "Esta actividad..."), ni frases introductorias (ej. "El propósito de esta actividad es...", "Esta tarea consiste en..."), ni explicaciones de "para qué" se hace la actividad. Céntrate únicamente en describir la acción en sí misma.
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
    const processedInput: EnhanceTextInput = {
      ...input,
      isObjectiveContext: input.context === 'objective',
      isIntroductionContext: input.context === 'introduction',
      isScopeContext: input.context === 'scope',
      isActivityDescriptionContext: input.context === 'activity_description',
    };
    
    // For objective context, ensure helper data is passed if it exists
    if (processedInput.isObjectiveContext) {
        processedInput.generalDescription = input.generalDescription || undefined;
        processedInput.needOrProblem = input.needOrProblem || undefined;
        processedInput.purposeOrExpectedResult = input.purposeOrExpectedResult || undefined;
        processedInput.targetAudience = input.targetAudience || undefined;
        processedInput.desiredImpact = input.desiredImpact || undefined;
        processedInput.kpis = input.kpis && input.kpis.length > 0 ? input.kpis.filter(kpi => kpi.trim() !== '') : undefined;
    }

    const {output} = await enhanceTextPrompt(processedInput);
    return output!;
  }
);
    
