import { api } from './http';

interface GenerateDefinitionResponse {
  definition: string;
}

export const aiApi = {
  generateDefinition: async (term: string): Promise<GenerateDefinitionResponse> => {
    console.log("🔄 Enviando request a IA con término:", term);
    const response = await api.post('/ai/generate-definition', { term });
    console.log("📦 Respuesta completa del backend:", response);
    console.log("📦 response.data:", response.data);
    console.log("📦 Tipo de response.data:", typeof response.data);
    
    // El backend devuelve la respuesta directamente como { definition: string }
    const result = response.data;
    console.log("✅ Resultado final a retornar:", result);
    return result;
  },
}; 