import { api } from "./http";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  workspace: {
    orgId: string;
    wsId: string;
    wsName: string;
    role: 'WORKSPACE_ADMIN' | 'EDITOR' | 'VIEWER';
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface RegisterResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  workspace: {
    orgId: string;
    wsId: string;
    wsName: string;
    role: 'WORKSPACE_ADMIN' | 'EDITOR' | 'VIEWER';
  };
}

export interface UserContextsResponse {
  userId: string;
  currentOrganization: string;
  currentWorkspace: string;
  currentRole: string;
  availableContexts: {
    id: string;
    name: string;
    workspaces: {
      id: string;
      name: string;
      role: string;
      isActive: boolean;
    }[];
  }[];
}

export interface SwitchWorkspaceRequest {
  workspaceId: string;
}

export interface SwitchWorkspaceResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export const AuthAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post("/auth/login", { email, password });
    
    // El backend devuelve: { statusCode, message, data: { accessToken, ... } }
    const authData = response.data?.data;
    
    // Validate response structure
    if (!authData?.accessToken) {
      console.error('Respuesta del login:', response.data);
      throw new Error("Token de acceso no recibido del servidor");
    }
    
    // Decodificar el JWT para obtener información del usuario y contexto
    let userInfo = { id: 'unknown', email: email, name: undefined };
    let workspaceInfo = { orgId: '', wsId: '', wsName: '', role: 'VIEWER' as const };
    
    try {
      const payload = JSON.parse(atob(authData.accessToken.split('.')[1]));
      userInfo = {
        id: payload.sub || 'unknown',
        email: payload.email || email,
        name: payload.name
      };
      
      // Extraer contexto del JWT
      if (payload.org && payload.ws && payload.role) {
        workspaceInfo = {
          orgId: payload.org,
          wsId: payload.ws,
          wsName: 'Default Workspace', // Será actualizado por getContexts
          role: payload.role
        };
      }
    } catch (error) {
      console.warn('No se pudo decodificar el JWT:', error);
    }
    
    return {
      accessToken: authData.accessToken,
      user: userInfo,
      workspace: workspaceInfo
    };
  },

  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post("/auth/register", registerData);
    
    // El backend devuelve: { statusCode, message, data: { accessToken, ... } }
    const authData = response.data?.data;
    
    // Validate response structure
    if (!authData?.accessToken) {
      console.error('Respuesta del registro:', response.data);
      throw new Error("Token de acceso no recibido del servidor");
    }
    
    // Decodificar el JWT para obtener información del usuario y contexto
    let userInfo = { 
      id: 'unknown', 
      email: registerData.email, 
      firstName: registerData.firstName,
      lastName: registerData.lastName
    };
    let workspaceInfo = { orgId: '', wsId: '', wsName: registerData.organizationName, role: 'WORKSPACE_ADMIN' as const };
    
    try {
      const payload = JSON.parse(atob(authData.accessToken.split('.')[1]));
      userInfo = {
        id: payload.sub || 'unknown',
        email: payload.email || registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName
      };
      
      // Extraer contexto del JWT
      if (payload.org && payload.ws && payload.role) {
        workspaceInfo = {
          orgId: payload.org,
          wsId: payload.ws,
          wsName: registerData.organizationName,
          role: payload.role
        };
      }
    } catch (error) {
      console.warn('No se pudo decodificar el JWT:', error);
    }
    
    return {
      accessToken: authData.accessToken,
      user: userInfo,
      workspace: workspaceInfo
    };
  },

  async getContexts(): Promise<UserContextsResponse> {
    const response = await api.get("/auth/contexts");
    return response.data;
  },

  async switchWorkspace(workspaceId: string): Promise<SwitchWorkspaceResponse> {
    const response = await api.post("/auth/switch-workspace", {
      workspaceId
    });
    return response.data;
  },

  async getUserPermissions() {
    const response = await api.get("/auth/permissions");
    return response.data;
  },

  async checkPermissions(action: string, resource: string, resourceId?: string) {
    const response = await api.post("/auth/check-permissions", {
      action,
      resource,
      resourceId
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem("kaba.token");
    localStorage.removeItem("kaba.user");
    localStorage.removeItem("kaba.lastWorkspace");
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  async logoutFromServer() {
    try {
      const token = this.getToken();
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error('Error during server logout:', error);
    } finally {
      this.logout(); // Siempre limpiar el storage local
    }
  },

  getToken(): string | null {
    return localStorage.getItem("kaba.token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
}; 