
'use server';
/**
 * @fileOverview An AI agent that generates a scope definition for a POA document
 * based on structured helper data.
 *
 * - generateScope - A function that generates the scope definition for a POA.
 * - GenerateScopeInput - The input type for the generateScope function.
 * - GenerateScopeOutput - The return type for the generateScope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the Zod schema for the input based on POAScopeHelperData fields
// This needs to match the structure of POAScopeHelperData from lib/schema.ts
const GenerateScopeInputSchema = z.object({
  procesosYActividades: z.string().optional().describe('Procesos y actividades clave cubiertos por el procedimiento.'),
  usuariosYRoles: z.array(z.object({ id: z.string(), usuario: z.string().optional(), rol: z.string().optional() })).optional().describe('Usuarios o roles específicos responsables o afectados.'),
  gradoDeInclusion: z.string().optional().describe('Grado de inclusión o exclusión de ciertos roles o situaciones.'),
  delimitacionPrecisa: z.string().optional().describe('Delimitación precisa del inicio y fin del procedimiento (qué marca el comienzo y el final).'),
  condicionesDeExclusion: z.string().optional().describe('Condiciones o escenarios específicos bajo los cuales el procedimiento NO aplica.'),
  criteriosDeActivacion: z.string().optional().describe('Criterios, eventos o condiciones que activan la aplicación del procedimiento.'),
  contextoOperativo: z.string().optional().describe('Contexto operativo, como sistemas, herramientas, software o entornos físicos específicos relevantes.'),
  conexionesDocumentales: z.array(z.object({ id: z.string(), documento: z.string().optional(), codigo: z.string().optional() })).optional().describe('Otros documentos, POAs, guías o manuales relacionados o referenciados.'),
  referenciaANormas: z.array(z.object({ id: z.string(), referencia: z.string().optional(), codigo: z.string().optional() })).optional().describe('Normativas, estándares, políticas internas o regulaciones externas que el procedimiento debe cumplir o considerar.'),
  duracionYPeriodicidad: z.string().optional().describe('Duración de la aplicabilidad del procedimiento, fechas de inicio/fin, o periodicidad de su aplicación (si aplica).'),
  revision: z.string().optional().describe('Frecuencia o condiciones para la revisión y actualización del alcance del procedimiento.'),
  maxWords: z.number().optional().describe('El número máximo de palabras para el alcance generado. Debe ser conciso y directo.')
});

export type GenerateScopeInput = z.infer<typeof GenerateScopeInputSchema>;

const GenerateScopeOutputSchema = z.object({
  generatedScope: z
    .string()
    .describe(
      'Una definición de alcance coherente, informativa y directa para el procedimiento, redactada en español. Debe integrar la información proporcionada de manera fluida y evitar frases introductorias genéricas. Debe ser concisa y respetar el máximo de palabras si se especifica.'
    ),
});
export type GenerateScopeOutput = z.infer<typeof GenerateScopeOutputSchema>;

export async function generateScope(input: GenerateScopeInput): Promise<GenerateScopeOutput> {
  return generateScopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScopePrompt',
  input: {schema: GenerateScopeInputSchema},
  output: {schema: GenerateScopeOutputSchema},
  prompt: `Eres un experto en definir el alcance de Procedimientos Operativos de Acción (POA).
A partir de la información estructurada proporcionada, tu tarea es redactar una definición de alcance coherente, informativa y directa.
La respuesta DEBE estar en español.
Evita frases como "El alcance de este procedimiento es..." o "Este documento define el alcance como...". Ve directamente a la definición del alcance.
Integra la información de las diferentes secciones de ayuda de manera fluida y natural en un texto cohesivo. No listes la información, redáctala.
Sé conciso y, si se especifica un máximo de palabras, ajústate a él lo más posible.

Información para definir el alcance:
{{#if procesosYActividades}}
- Procesos y actividades clave: {{{procesosYActividades}}}
{{/if}}
{{#if usuariosYRoles.length}}
- Usuarios y roles:
  {{#each usuariosYRoles}}
  - Usuario: {{#if usuario}}{{{usuario}}}{{else}}No especificado{{/if}}, Rol: {{#if rol}}{{{rol}}}{{else}}No especificado{{/if}}
  {{/each}}
{{/if}}
{{#if gradoDeInclusion}}
- Grado de inclusión/exclusión: {{{gradoDeInclusion}}}
{{/if}}
{{#if delimitacionPrecisa}}
- Delimitación del procedimiento (inicio/fin): {{{delimitacionPrecisa}}}
{{/if}}
{{#if condicionesDeExclusion}}
- Exclusiones explícitas: {{{condicionesDeExclusion}}}
{{/if}}
{{#if criteriosDeActivacion}}
- Criterios de activación: {{{criteriosDeActivacion}}}
{{/if}}
{{#if contextoOperativo}}
- Contexto operativo: {{{contextoOperativo}}}
{{/if}}
{{#if conexionesDocumentales.length}}
- Documentos relacionados:
  {{#each conexionesDocumentales}}
  - Documento: {{#if documento}}{{{documento}}}{{else}}No especificado{{/if}}{{#if codigo}} (Código: {{{codigo}}}){{/if}}
  {{/each}}
{{/if}}
{{#if referenciaANormas.length}}
- Normativas/Estándares aplicables:
  {{#each referenciaANormas}}
  - Norma: {{#if referencia}}{{{referencia}}}{{else}}No especificada{{/if}}{{#if codigo}} (Cláusula/Sección: {{{codigo}}}){{/if}}
  {{/each}}
{{/if}}
{{#if duracionYPeriodicidad}}
- Vigencia y periodicidad: {{{duracionYPeriodicidad}}}
{{/if}}
{{#if revision}}
- Revisión del alcance: {{{revision}}}
{{/if}}
{{#if maxWords}}

Recuerda, el alcance generado debe tener un máximo aproximado de {{{maxWords}}} palabras.
{{/if}}

Definición del Alcance (directa, concisa, en español, integrando la información):
`,
  retry: {
    maxAttempts: 3,
    backoff: {
      initialDelayMs: 500,
      maxDelayMs: 5000,
      multiplier: 2,
    },
  },
});

const generateScopeFlow = ai.defineFlow(
  {
    name: 'generateScopeFlow',
    inputSchema: GenerateScopeInputSchema,
    outputSchema: GenerateScopeOutputSchema,
    retry: {
      maxAttempts: 3,
      backoff: {
        initialDelayMs: 500,
        maxDelayMs: 5000,
        multiplier: 2,
      },
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
