import { api } from "./http";
import type { AxiosError } from "axios";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface Procedure {
  id?: string;
  title: string;
  description?: string;
  code: string;
  version?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  metadata?: Record<string, JsonValue>;
}

export interface CreateProcedureRequest {
  title: string;
  description?: string;
  code: string;
  version?: number;
  status?: string;
}

export interface UpdateProcedureRequest {
  title?: string;
  description?: string;
  code?: string;
  version?: number;
  status?: string;
}

export const ProceduresAPI = {
  async list(): Promise<Procedure[]> {
    const { data } = await api.get("/procedures");
    // Backend returns { statusCode, message, data: { procedures: [...] } }
    const procedures = data?.data?.procedures || data;
    return Array.isArray(procedures) ? procedures : [];
  },

  async get(id: string): Promise<Procedure> {
    const { data } = await api.get(`/procedures/${id}`);
    // Backend returns { statusCode, message, data: {...} }
    return data?.data || data;
  },

  async create(procedure: CreateProcedureRequest): Promise<Procedure> {
    try {
      console.log('Creating procedure with data:', procedure);
      const { data } = await api.post("/procedures", procedure);
      console.log('Procedure created successfully:', data);
      // Backend returns { statusCode, message, data: {...} }
      const createdProcedure = data?.data || data;
      console.log('Extracted procedure:', createdProcedure);
      return createdProcedure;
    } catch (unknownError: unknown) {
      const error = unknownError as AxiosError;
      console.error('Error creating procedure:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw unknownError;
    }
  },

  async update(id: string, procedure: UpdateProcedureRequest): Promise<Procedure> {
    try {
      // Validar el formato del ID
      if (!id || id.length !== 24) {
        throw new Error(`Invalid procedure ID format: ${id}. Expected 24-character MongoDB ObjectId.`);
      }
      
      console.log('🔄 Updating procedure with data:', { id, procedure });
      console.log('🔍 Request details:', {
        url: `/procedures/${id}`,
        method: 'PATCH',
        headers: api.defaults.headers,
        data: procedure,
        token: localStorage.getItem("accessToken") ? "Present" : "Missing"
      });
      
      const { data } = await api.patch(`/procedures/${id}`, procedure);
      console.log('✅ Procedure updated successfully:', data);
      // Backend returns { statusCode, message, data: {...} }
      return data?.data || data;
    } catch (unknownError: unknown) {
      const error = unknownError as AxiosError<{ message?: string }>;
      console.error('❌ Error actualizando procedimiento:', {
        id,
        procedure,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Crear un error más descriptivo
      const enhancedError = new Error(
        `Failed to update procedure: ${error.response?.status} - ${error.response?.data?.message || 'Internal server error'}`
      );
      enhancedError.cause = error;
      throw enhancedError;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('Deleting procedure with ID:', id);
      const response = await api.delete(`/procedures/${id}`);
      console.log('Procedure deleted successfully:', response.data);
    } catch (unknownError: unknown) {
      const error = unknownError as AxiosError;
      console.error('Error deleting procedure:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw unknownError;
    }
  },
}; 