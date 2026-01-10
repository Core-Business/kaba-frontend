import { api } from './http';

// ========== REQUEST TYPES ==========

export interface GenerateIntroductionRequest {
  procedureName?: string;
  companyName?: string;
  department?: string;
  objective?: string;
  activities?: string[];
  scope?: string;
  procedureDescription?: string;
}

export interface GenerateObjectiveRequest {
  procedureName?: string;
  companyName?: string;
  department?: string;
  activities?: string[];
  scope?: string;
}

export interface GenerateScopeRequest {
  procedureName?: string;
  objective?: string;
}

export interface GenerateScopeFromActivitiesRequest {
  activities: string[];
}

export interface GenerateActivityNameRequest {
  activityDescription: string;
  procedureName?: string;
}

export type EnhanceTextContext =
  | 'default'
  | 'objective'
  | 'introduction'
  | 'scope'
  | 'activity_description';

export interface EnhanceTextRequest {
  text: string;
  maxWords?: number;
  context?: EnhanceTextContext;
  generalDescription?: string;
  needOrProblem?: string;
  purposeOrExpectedResult?: string;
  targetAudience?: string;
  desiredImpact?: string;
  kpis?: string[];
  expandByPercent?: number;
}

// ========== RESPONSE TYPES ==========

export interface GenerateIntroductionResponse {
  introduction: string;
}

export interface GenerateObjectiveResponse {
  objective: string;
}

export interface GenerateScopeResponse {
  scope: string;
}

export interface GenerateActivityNameResponse {
  activityName: string;
}

export interface EnhanceTextResponse {
  enhancedText: string;
}

export interface GenerateDefinitionResponse {
  definition: string;
}

// ========== API CLIENT ==========

export const aiApi = {
  /**
   * Genera una introducción para un procedimiento POA
   */
  generateIntroduction: async (
    data: GenerateIntroductionRequest,
  ): Promise<GenerateIntroductionResponse> => {
    const response = await api.post('/ai/generate-introduction', data);
    return response.data;
  },

  /**
   * Genera un objetivo para un procedimiento POA
   */
  generateObjective: async (
    data: GenerateObjectiveRequest,
  ): Promise<GenerateObjectiveResponse> => {
    console.log('=== DEBUG API: generateObjective request ===');
    console.log('Request data:', data);

    const response = await api.post('/ai/generate-objective', data);

    console.log('=== DEBUG API: generateObjective response ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    console.log('typeof response.data:', typeof response.data);
    console.log('Keys in response.data:', Object.keys(response.data || {}));

    return response.data;
  },

  /**
   * Genera el alcance de un procedimiento
   */
  generateScope: async (
    data: GenerateScopeRequest,
  ): Promise<GenerateScopeResponse> => {
    const response = await api.post('/ai/generate-scope', data);
    return response.data;
  },

  /**
   * Genera el alcance basándose en actividades
   */
  generateScopeFromActivities: async (
    data: GenerateScopeFromActivitiesRequest,
  ): Promise<GenerateScopeResponse> => {
    const response = await api.post('/ai/generate-scope-from-activities', data);
    return response.data;
  },

  /**
   * Genera un nombre conciso para una actividad
   */
  generateActivityName: async (
    data: GenerateActivityNameRequest,
  ): Promise<GenerateActivityNameResponse> => {
    const response = await api.post('/ai/generate-activity-name', data);
    return response.data;
  },

  /**
   * Mejora un texto aplicando reglas de estilo
   */
  enhanceText: async (data: EnhanceTextRequest): Promise<EnhanceTextResponse> => {
    const response = await api.post('/ai/enhance-text', data);
    return response.data;
  },

  /**
   * Genera una definición para un término (legacy, ya existía)
   */
  generateDefinition: async (
    term: string,
    procedureId?: string,
  ): Promise<GenerateDefinitionResponse> => {
    const response = await api.post('/ai/generate-definition', {
      term,
      procedureId,
    });
    return response.data;
  },
};
