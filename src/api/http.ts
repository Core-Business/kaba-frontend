import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "@/hooks/use-toast";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
});

// Interceptor de request - Agregar headers contextuales
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Leer token desde nuevo localStorage key
  const token = localStorage.getItem("kaba.token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Leer contexto de workspace desde localStorage
  try {
    const workspaceCtx = localStorage.getItem("kaba.lastWorkspace");
    if (workspaceCtx) {
      const workspace = JSON.parse(workspaceCtx);
      if (workspace.orgId && workspace.wsId && config.headers) {
        config.headers['X-Organization-Id'] = workspace.orgId;
        config.headers['X-Workspace-Id'] = workspace.wsId;
      }
    }
  } catch (error) {
    console.warn('Error parsing workspace context from localStorage:', error);
  }
  
  return config;
});

// Interceptor de response - Manejo de errores contextuales
const extractErrorMessage = (error: AxiosError): string | null => {
  const data = error.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return null;
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const requestMethod = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const backendMessage = extractErrorMessage(error);
    
    switch (status) {
      case 401:
        // Token expirado - limpiar auth y redirigir
        localStorage.removeItem("kaba.token");
        localStorage.removeItem("kaba.user");
        localStorage.removeItem("kaba.lastWorkspace");
        window.location.href = '/login';
        break;
        
      case 403:
        // Sin permisos para workspace - redirigir a página de error
        window.location.href = '/workspace-revoked';
        break;
        
      case 429: {
        console.warn(
          `[API 429] ${requestMethod} ${requestUrl} -> ${backendMessage ?? 'Rate limit exceeded'}`,
        );
        const isWorkspaceSwitch = requestUrl.includes('/auth/switch-workspace');
        toast({
          title: isWorkspaceSwitch ? "Demasiados cambios" : "Demasiadas solicitudes",
          description: backendMessage
            || (isWorkspaceSwitch
              ? "Demasiados cambios de Workspace. Intenta más tarde."
              : "Has excedido el límite de solicitudes. Intenta más tarde."),
          variant: "destructive"
        });
        break;
      }
        
      default:
        // Otros errores se propagan normalmente
        break;
    }
    
    return Promise.reject(error);
  }
); 