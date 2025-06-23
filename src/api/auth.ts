import { api } from "./http";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
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
    
    localStorage.setItem("accessToken", authData.accessToken);
    
    // Decodificar el JWT para obtener información del usuario
    let userInfo = { id: 'unknown', email: email, name: undefined };
    try {
      const payload = JSON.parse(atob(authData.accessToken.split('.')[1]));
      userInfo = {
        id: payload.sub || 'unknown',
        email: payload.email || email,
        name: payload.name
      };
    } catch (error) {
      console.warn('No se pudo decodificar el JWT:', error);
    }
    
    return {
      accessToken: authData.accessToken,
      user: userInfo
    };
  },

  logout() {
    localStorage.removeItem("accessToken");
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
    return localStorage.getItem("accessToken");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
}; 