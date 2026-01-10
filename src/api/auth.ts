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

// ══════════════════════════════════════════════════════════════════════════════
// ██████╗ ████████╗██████╗     ██╗███╗   ██╗████████╗███████╗██████╗ ███████╗ █████╗  ██████╗███████╗███████╗
// ██╔═══██╗╚══██╔══╝██╔══██╗    ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝
// ██║   ██║   ██║   ██████╔╝    ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝█████╗  ███████║██║     █████╗  ███████╗
// ██║   ██║   ██║   ██╔═══╝     ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗██╔══╝  ██╔══██║██║     ██╔══╝  ╚════██║
// ╚██████╔╝   ██║   ██║         ██║██║ ╚████║   ██║   ███████╗██║  ██║██║     ██║  ██║╚██████╗███████╗███████║
//  ╚═════╝    ╚═╝   ╚═╝         ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface RegisterEmailRequest {
  email: string;
}

export interface RegisterEmailResponse {
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  requiresProfile: boolean;
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  message: string;
}

export interface CompleteProfileRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  role?: string;
}

export interface CompleteProfileResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ForgotPasswordOTPRequest {
  email: string;
}

export interface ForgotPasswordOTPResponse {
  message: string;
}

export interface VerifyResetOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyResetOTPResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordWithTokenRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordWithTokenResponse {
  message: string;
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

  // ══════════════════════════════════════════════════════════════════════════════
  // ██████╗ ████████╗██████╗     ███╗   ███╗███████╗████████╗██╗  ██╗ ██████╗ ██████╗ ███████╗
  // ██╔═══██╗╚══██╔══╝██╔══██╗    ████╗ ████║██╔════╝╚══██╔══╝██║  ██║██╔═══██╗██╔══██╗██╔════╝
  // ██║   ██║   ██║   ██████╔╝    ██╔████╔██║█████╗     ██║   ███████║██║   ██║██║  ██║███████╗
  // ██║   ██║   ██║   ██╔═══╝     ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║   ██║██║  ██║╚════██║
  // ╚██████╔╝   ██║   ██║         ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝██████╔╝███████║
  //  ╚═════╝    ╚═╝   ╚═╝         ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
  // ══════════════════════════════════════════════════════════════════════════════════════════

  async registerEmail(email: string): Promise<RegisterEmailResponse> {
    const response = await api.post("/auth/register-email", { email });
    return response.data?.data || response.data;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data?.data || response.data;
  },

  async resendOTP(email: string): Promise<ResendOTPResponse> {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data?.data || response.data;
  },

  async completeProfile(profileData: CompleteProfileRequest): Promise<CompleteProfileResponse> {
    const response = await api.post("/auth/complete-profile", profileData);
    return response.data?.data || response.data;
  },

  async forgotPasswordOTP(email: string): Promise<ForgotPasswordOTPResponse> {
    const response = await api.post("/auth/forgot-password-otp", { email });
    return response.data?.data || response.data;
  },

  async verifyResetOTP(email: string, otp: string): Promise<VerifyResetOTPResponse> {
    const response = await api.post("/auth/verify-reset-otp", { email, otp });
    return response.data?.data || response.data;
  },

  async resetPasswordWithToken(resetToken: string, newPassword: string): Promise<ResetPasswordWithTokenResponse> {
    const response = await api.post("/auth/reset-password-with-token", { 
      resetToken, 
      newPassword 
    });
    return response.data?.data || response.data;
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