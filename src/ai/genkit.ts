import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Configuración condicional de Genkit
const hasApiKey = !!(
  process.env.GOOGLE_API_KEY || 
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY
);

export const ai = hasApiKey ? genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
}) : null;

// Función helper para verificar si AI está disponible
export const isAIAvailable = () => hasApiKey && ai !== null;
