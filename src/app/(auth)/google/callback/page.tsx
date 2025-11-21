'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type WorkspaceRole = 'WORKSPACE_ADMIN' | 'EDITOR' | 'VIEWER';

const decodeAccessToken = (accessToken: string) => {
  const defaultUser = {
    id: 'unknown',
    email: '',
    firstName: undefined as string | undefined,
    lastName: undefined as string | undefined,
  };

  const defaultWorkspace = {
    orgId: '',
    wsId: '',
    wsName: 'Default Workspace',
    role: 'VIEWER' as WorkspaceRole,
  };

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1] || ''));
    const user = {
      id: payload.sub || defaultUser.id,
      email: payload.email || defaultUser.email,
      firstName: payload.firstName || payload.given_name,
      lastName: payload.lastName || payload.family_name,
    };

    if (payload.org && payload.ws && payload.role) {
      return {
        user,
        workspace: {
          orgId: payload.org,
          wsId: payload.ws,
          wsName: 'Default Workspace',
          role: payload.role as WorkspaceRole,
        },
      };
    }

    return { user, workspace: defaultWorkspace };
  } catch (error) {
    console.warn('No se pudo decodificar el token de Google:', error);
    return { user: defaultUser, workspace: defaultWorkspace };
  }
};

const readHashParams = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) {
    return null;
  }

  return new URLSearchParams(hash);
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, refreshContexts } = useAuth();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }

    const fragmentParams = readHashParams();
    const accessToken =
      fragmentParams?.get('accessToken') || searchParams.get('accessToken');

    if (!accessToken) {
      router.replace('/login?error=google_oauth_failed');
      return;
    }

    hasProcessedRef.current = true;
    const { user, workspace } = decodeAccessToken(accessToken);

    setAuth(accessToken, user, workspace);
    refreshContexts()
      .catch((error) =>
        console.warn('Error actualizando contextos después de OAuth:', error),
      )
      .finally(() => {
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/google/callback');
        }
        router.replace('/dashboard');
      });
  }, [router, searchParams, setAuth, refreshContexts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-lg font-semibold text-gray-900">
          Conectando tu cuenta de Google…
        </p>
        <p className="text-sm text-gray-600">
          Esto puede tardar unos segundos. Si no continúa automáticamente,
          vuelve al login e inténtalo nuevamente.
        </p>
      </div>
    </div>
  );
}

