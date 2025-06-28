import { api } from "./http";
import type { POA, POAResponsible, POADefinition, POAReference } from "@/lib/schema";

export interface CreatePOARequest {
  name: string;
  userId?: string;
  header?: any;
  objective?: string;
  procedureDescription?: string;
  introduction?: string;
  scope?: string;
  activities?: any[];
}

export interface UpdatePOARequest extends Partial<CreatePOARequest> {}

// Nuevos tipos para Responsabilidades
export interface GenerateResponsibilitiesRequest {
  regenerate?: boolean;
}

export interface CreateManualResponsibleRequest {
  responsibleName: string;
  role: string;
  summary: string;
}

export interface UpdateResponsibleRequest {
  responsibleName?: string;
  role?: string;
  summary?: string;
}

export interface UpdateDefinitionsRequest {
  definitions: POADefinition[];
}

export interface UpdateReferencesRequest {
  references: POAReference[];
}

// Función para transformar POA del frontend al formato del backend
function transformPOAForBackend(poa: POA): UpdatePOARequest {
  return {
    name: poa.name,
    userId: poa.userId,
    header: poa.header ? {
      title: poa.header.title,
      author: poa.header.author,
      companyName: poa.header.companyName,
      documentCode: poa.header.documentCode,
      departmentArea: poa.header.departmentArea,
      status: poa.header.status,
      fileLocation: poa.header.fileLocation,
      version: poa.header.version,
      date: poa.header.date,
      logoUrl: poa.header.logoUrl,
      logoFileName: poa.header.logoFileName,
    } : undefined,
    objective: poa.objective,
    procedureDescription: poa.procedureDescription,
    introduction: poa.introduction,
    scope: poa.scope,
    activities: poa.activities || [],
    // Excluir campos que no debe manejar el frontend
    // id, createdAt, updatedAt, procedureId se manejan en el backend
  };
}

export const POAAPI = {
  async getByProcedureId(procedureId: string): Promise<POA> {
    const response = await api.get(`/procedures/${procedureId}/poa`);
    // El backend devuelve: { statusCode, message, data: { POA } }
    return response.data?.data;
  },

  async create(procedureId: string, poa: CreatePOARequest): Promise<POA> {
    const response = await api.post(`/procedures/${procedureId}/poa`, poa);
    return response.data?.data;
  },

  async autoCreate(procedureId: string, partialPoa?: Partial<CreatePOARequest>): Promise<POA> {
    const response = await api.post(`/procedures/${procedureId}/poa/auto-create`, partialPoa || {});
    return response.data?.data;
  },

  async update(procedureId: string, poa: POA): Promise<POA> {
    const transformedPoa = transformPOAForBackend(poa);
    console.log('🔄 Enviando POA al backend:', { procedureId, transformedPoa });
    const response = await api.put(`/procedures/${procedureId}/poa`, transformedPoa);
    console.log('✅ Respuesta del backend:', response.data);
    return response.data?.data;
  },

  async partialUpdate(procedureId: string, poa: POA): Promise<POA> {
    const transformedPoa = transformPOAForBackend(poa);
    const response = await api.patch(`/procedures/${procedureId}/poa`, transformedPoa);
    return response.data?.data;
  },

  async delete(procedureId: string): Promise<void> {
    await api.delete(`/procedures/${procedureId}/poa`);
  },

  async generateDocument(procedureId: string): Promise<{ html: string }> {
    const response = await api.post(`/procedures/${procedureId}/poa/generate-document`);
    return response.data?.data;
  },

  // --- Métodos para Responsabilidades ---

  async generateResponsibilities(
    procedureId: string,
    req: GenerateResponsibilitiesRequest = {}
  ): Promise<POAResponsible[]> {
    const response = await api.post(`/procedures/${procedureId}/poa/responsibilities/generate`, req);
    return response.data?.data || []; // El backend devuelve { statusCode, message, data: array }
  },

  async addManualResponsible(
    procedureId: string,
    req: CreateManualResponsibleRequest
  ): Promise<POAResponsible> {
    const response = await api.post(`/procedures/${procedureId}/poa/responsibilities/manual`, req);
    return response.data?.data;
  },

  async updateResponsible(
    procedureId: string,
    responsibleId: string,
    req: UpdateResponsibleRequest
  ): Promise<POAResponsible> {
    const response = await api.patch(`/procedures/${procedureId}/poa/responsibilities/${responsibleId}`, req);
    return response.data?.data;
  },

  async deleteResponsible(
    procedureId: string,
    responsibleId: string
  ): Promise<void> {
    await api.delete(`/procedures/${procedureId}/poa/responsibilities/${responsibleId}`);
  },

  // --- Métodos para Definiciones ---

  async updateDefinitions(
    procedureId: string,
    req: UpdateDefinitionsRequest
  ): Promise<POA> {
    const response = await api.patch(`/procedures/${procedureId}/poa/definitions`, req);
    return response.data?.data;
  },

  // --- Métodos para Referencias ---

  async updateReferences(
    procedureId: string,
    req: UpdateReferencesRequest
  ): Promise<POA> {
    try {
      console.log('🔄 API: Enviando referencias al backend:', { procedureId, req });
      const response = await api.patch(`/procedures/${procedureId}/poa/references`, req);
      console.log('✅ API: Respuesta del backend:', response.data);
      return response.data?.data;
    } catch (error: any) {
      console.error('❌ API: Error al actualizar referencias:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },
}; 