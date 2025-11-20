"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Tipos
export interface WorkspaceCtx {
  orgId: string;
  wsId: string;
  wsName: string;
  role: 'WORKSPACE_ADMIN' | 'EDITOR' | 'VIEWER';
}

interface WorkspaceSummary {
  id: string;
  name: string;
  role: WorkspaceCtx['role'];
}

export interface OrganizationContext {
  id: string;
  name?: string;
  workspaces: WorkspaceSummary[];
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

interface AuthContextType {
  token: string | null;
  user: User | null;
  workspace: WorkspaceCtx | null;
  availableWorkspaces: OrganizationContext[] | null;
  isLoading: boolean;
  setWorkspace: (workspace: WorkspaceCtx) => void;
  setAvailableWorkspaces: (workspaces: WorkspaceCtx[]) => void;
  setAuth: (token: string, user: User, workspace: WorkspaceCtx) => void;
  refreshToken: (newToken: string) => void;
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
  const [availableWorkspaces, setAvailableWorkspacesState] = useState<OrganizationContext[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar datos desde localStorage al montar
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = safeParse<User>(localStorage.getItem(STORAGE_KEYS.USER));
        const storedWorkspace = safeParse<WorkspaceCtx>(localStorage.getItem(STORAGE_KEYS.WORKSPACE));

        if (storedToken) {
          setToken(storedToken);
          
          if (storedUser) {
            setUser(storedUser);
          }
          
          if (storedWorkspace) {
            setWorkspaceState(storedWorkspace);
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
  }, [clearAuth]);

  // Función para refrescar contextos disponibles
  const refreshContexts = async () => {
    const currentToken = localStorage.getItem('kaba.token');
    const currentWorkspace = safeParse<WorkspaceCtx>(localStorage.getItem('kaba.lastWorkspace'));
    
    if (!currentToken) return;
    
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${currentToken}`,
      };

      if (currentWorkspace) {
        headers['X-Organization-Id'] = currentWorkspace.orgId || '';
        headers['X-Workspace-Id'] = currentWorkspace.wsId || '';
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/auth/contexts`, {
        headers
      });

      if (response.ok) {
        type ContextsResponse = { availableContexts?: OrganizationContext[] };
        const data: ContextsResponse = await response.json();
        setAvailableWorkspacesState(data.availableContexts ?? []);
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
  const setAvailableWorkspaces = (workspaces: OrganizationContext[]) => {
    setAvailableWorkspacesState(workspaces);
  };

  // Función para refrescar solo el token (preservando workspace)
  const refreshToken = (newToken: string) => {
    setToken(newToken);
    // Solo actualizar el token, preservar workspace y user
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
  };

  // Función para limpiar autenticación
  const clearAuth = useCallback(() => {
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
  }, [router]);

  const contextValue: AuthContextType = {
    token,
    user,
    workspace,
    availableWorkspaces,
    isLoading,
    setWorkspace,
    setAvailableWorkspaces,
    setAuth,
    refreshToken,
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