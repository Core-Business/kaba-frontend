import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/http';

interface OrganizationContext {
  id: string;
  name: string;
  role: 'OWNER' | 'ORG_ADMIN' | 'ORG_MEMBER';
}

interface WorkspaceContext {
  id: string;
  name: string;
  organizationId: string;
  role: 'WORKSPACE_ADMIN' | 'EDITOR' | 'VIEWER';
}

interface ContextsResponse {
  userId: string;
  currentOrganization: string;
  currentWorkspace: string;
  currentRole: string;
  organizations: OrganizationContext[];
  availableContexts: WorkspaceContext[];
}

/**
 * Hook para obtener los contextos disponibles del usuario
 * Usa React Query para cachear la respuesta
 */
export function useContexts() {
  return useQuery({
    queryKey: ['auth', 'contexts'],
    queryFn: async (): Promise<ContextsResponse> => {
      const response = await api.get('/auth/contexts');
      return response.data;
    },
    staleTime: 60 * 1000,     // 60 segundos para evitar llamadas excesivas
    gcTime: 5 * 60 * 1000,    // 5 minutos
    retry: (failureCount, error: any) => {
      // No reintentar en errores de auth
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('kaba.token'),
  });
}

/**
 * Hook para invalidar/refrescar contextos manualmente
 */
export function useRefreshContexts() {
  const { refetch } = useContexts();
  return refetch;
} 