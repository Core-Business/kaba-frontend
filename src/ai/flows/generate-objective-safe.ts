'use server';

import { isAIAvailable } from '@/ai/genkit';
import { generateObjective } from './generate-objective';
import type { GenerateObjectiveInput, GenerateObjectiveOutput } from './generate-objective';

export async function generateObjectiveSafe(input: GenerateObjectiveInput): Promise<GenerateObjectiveOutput> {
  if (!isAIAvailable()) {
    // Fallback: generar objetivo básico sin IA
    const { generalDescription, needOrProblem, purposeOrExpectedResult, targetAudience } = input;
    
    let generatedObjective = "Establecer un procedimiento";
    
    if (generalDescription) {
      generatedObjective += ` para ${generalDescription.toLowerCase()}`;
    }
    
    if (needOrProblem) {
      generatedObjective += `, con el fin de atender ${needOrProblem.toLowerCase()}`;
    }
    
    if (purposeOrExpectedResult) {
      generatedObjective += ` y lograr ${purposeOrExpectedResult.toLowerCase()}`;
    }
    
    if (targetAudience) {
      generatedObjective += `, dirigido a ${targetAudience.toLowerCase()}`;
    }
    
    generatedObjective += ".";
    
    return {
      generatedObjective: generatedObjective.charAt(0).toUpperCase() + generatedObjective.slice(1)
    };
  }
  
  // Si AI está disponible, usar la función original
  return generateObjective(input);
}

export { type GenerateObjectiveInput, type GenerateObjectiveOutput }; 