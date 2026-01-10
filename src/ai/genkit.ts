import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';

// Configuración condicional de Genkit
const hasApiKey = !!(
  process.env.OPENAI_API_KEY ||
  process.env.NEXT_PUBLIC_OPENAI_API_KEY
);

export const ai = hasApiKey ? genkit({
  plugins: [openAICompatible({
    name: 'openai',
    apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
  })],
  model: 'openai/gpt-4o-mini',
}) : null;

// Función helper para verificar si AI está disponible
export const isAIAvailable = () => hasApiKey && ai !== null;
