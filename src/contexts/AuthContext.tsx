"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Tipos
interface WorkspaceCtx {
  orgId: string;
  wsId: string;
  wsName: string;
  role: 'WORKSPACE_ADMIN' | 'EDITOR' | 'VIEWER';
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  workspace: WorkspaceCtx | null;
  availableWorkspaces: any[] | null;
  isLoading: boolean;
  setWorkspace: (workspace: WorkspaceCtx) => void;
  setAvailableWorkspaces: (workspaces: any[]) => void;
  setAuth: (token: string, user: User, workspace: WorkspaceCtx) => void;
  clearAuth: () => void;
  refreshContexts: () => Promise<void>;
}

// Constantes para localStorage
const STORAGE_KEYS = {
  TOKEN: 'kaba.token',
  WORKSPACE: 'kaba.lastWorkspace',
  USER: 'kaba.user'
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspaceState] = useState<WorkspaceCtx | null>(null);
  const [availableWorkspaces, setAvailableWorkspacesState] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar datos desde localStorage al montar
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedWorkspace = localStorage.getItem(STORAGE_KEYS.WORKSPACE);

        if (storedToken) {
          setToken(storedToken);
          
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          
          if (storedWorkspace) {
            setWorkspaceState(JSON.parse(storedWorkspace));
          }

          // Refrescar contextos disponibles si tenemos token
          await refreshContexts();
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  // Función para refrescar contextos disponibles
  const refreshContexts = async () => {
    const currentToken = localStorage.getItem('kaba.token');
    const currentWorkspace = localStorage.getItem('kaba.lastWorkspace');
    
    if (!currentToken) return;
    
    try {
      let headers: Record<string, string> = {
        'Authorization': `Bearer ${currentToken}`,
      };

      if (currentWorkspace) {
        const ws = JSON.parse(currentWorkspace);
        headers['X-Organization-Id'] = ws.orgId || '';
        headers['X-Workspace-Id'] = ws.wsId || '';
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/auth/contexts`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableWorkspacesState(data.availableContexts || []);
      }
    } catch (error) {
      console.error('Error refreshing contexts:', error);
    }
  };

  // Función para establecer autenticación completa
  const setAuth = (newToken: string, newUser: User, newWorkspace: WorkspaceCtx) => {
    setToken(newToken);
    setUser(newUser);
    setWorkspace(newWorkspace);
    
    // Persistir en localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(newWorkspace));
  };

  // Función para cambiar workspace
  const setWorkspace = (newWorkspace: WorkspaceCtx) => {
    setWorkspaceState(newWorkspace);
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(newWorkspace));
  };

  // Función para establecer workspaces disponibles
  const setAvailableWorkspaces = (workspaces: any[]) => {
    setAvailableWorkspacesState(workspaces);
  };

  // Función para limpiar autenticación
  const clearAuth = () => {
    setToken(null);
    setUser(null);
    setWorkspaceState(null);
    setAvailableWorkspacesState(null);
    
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.WORKSPACE);
    
    // Redirigir al login
    router.push('/login');
  };

  const contextValue: AuthContextType = {
    token,
    user,
    workspace,
    availableWorkspaces,
    isLoading,
    setWorkspace,
    setAvailableWorkspaces,
    setAuth,
    clearAuth,
    refreshContexts
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
} 