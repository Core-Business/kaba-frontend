
'use server';
/**
 * @fileOverview A Genkit flow for generating a POA Objective based on helper questions.
 *
 * - generateObjective - The main function to generate the objective.
 * - GenerateObjectiveInput - Input schema for the generateObjective function.
 * - GenerateObjectiveOutput - Output schema for the generateObjective function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateObjectiveInputSchema = z.object({
  generalDescription: z.string().describe('Descripción general de la acción (¿Qué se hace?).'),
  needOrProblem: z.string().describe('Necesidad o problema que atiende (¿Por qué se hace?).'),
  purposeOrExpectedResult: z.string().describe('Finalidad o resultado esperado (¿Para qué se hace?).'),
  targetAudience: z.string().describe('A quién va dirigido o quién se beneficia (Aplicación).'),
  desiredImpact: z.string().describe('Impacto que se busca generar (mejora, control, cumplimiento, eficiencia, etc.).'),
  kpis: z.array(z.string()).describe('Indicadores Clave de Desempeño (KPIs) asociados.'),
  maxWords: z.number().optional().describe('El número máximo de palabras para el objetivo generado.'),
});
export type GenerateObjectiveInput = z.infer<typeof GenerateObjectiveInputSchema>;

const GenerateObjectiveOutputSchema = z.object({
  generatedObjective: z.string().describe('El objetivo del POA generado, redactado en español, claro, conciso, iniciando con un verbo en infinitivo y sin frases introductorias.'),
});
export type GenerateObjectiveOutput = z.infer<typeof GenerateObjectiveOutputSchema>;

const generateObjectivePrompt = ai.definePrompt({
  name: 'generateObjectivePrompt',
  input: {schema: GenerateObjectiveInputSchema},
  output: {schema: GenerateObjectiveOutputSchema},
  prompt: `Eres un experto en redacción de objetivos para Procedimientos Operativos de Acción (POA).
Tu tarea es generar un objetivo claro, conciso y preciso en español, basado en la siguiente información.

Reglas estrictas para la redacción del objetivo:
1.  **Propósito Principal**: El objetivo DEBE describir el propósito del procedimiento, explicando por qué existe y qué se espera lograr con su implementación.
2.  **Claridad y Concisión**: Debe redactarse de manera clara y concisa, indicando el alcance y los objetivos específicos que se pretenden alcanzar.
3.  **Verbo en Infinitivo**: DEBE iniciar con un verbo en infinitivo (terminación -ar, -er o -ir).
4.  **Evitar**: No utilices gerundios (terminaciones -ando, -iendo) ni adjetivos calificativos innecesarios.
5.  **Sin Frases Introductorias**: NO incluyas frases como "El objetivo es...", "Este documento tiene como objetivo...", "El propósito de este procedimiento es...". Ve directamente al objetivo redactado.
6.  **Idioma**: La respuesta DEBE estar en español.
{{#if maxWords}}7.  **Extensión**: El texto debe tener una longitud aproximada de {{{maxWords}}} palabras, puede exceder este límite un 10%. Intenta acercarte lo más posible a este número de palabras para un desarrollo completo, manteniendo la concisión.{{/if}}

Información proporcionada:
- Descripción general de la acción (¿Qué se hace?): {{{generalDescription}}}
- Necesidad o problema que atiende (¿Por qué se hace?): {{{needOrProblem}}}
- Finalidad o resultado esperado (¿Para qué se hace?): {{{purposeOrExpectedResult}}}
- A quién va dirigido o quién se beneficia (Aplicación): {{{targetAudience}}}
- Impacto que se busca generar: {{{desiredImpact}}}
{{#if kpis.length}}
- Indicadores Clave de Desempeño (KPIs) asociados:
  {{#each kpis}}
  - {{{this}}}
  {{/each}}
{{/if}}

Objetivo generado (siguiendo todas las reglas):
`,
});

const generateObjectiveFlow = ai.defineFlow(
  {
    name: 'generateObjectiveFlow',
    inputSchema: GenerateObjectiveInputSchema,
    outputSchema: GenerateObjectiveOutputSchema,
  },
  async (input) => {
    const {output} = await generateObjectivePrompt(input);
    return output!;
  }
);

export async function generateObjective(input: GenerateObjectiveInput): Promise<GenerateObjectiveOutput> {
  return generateObjectiveFlow(input);
}
    
