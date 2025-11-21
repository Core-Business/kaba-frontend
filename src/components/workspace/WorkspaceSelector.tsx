"use client";

import { useState } from "react";
import { Building, ChevronDown, Check } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHydrated } from "@/hooks/use-hydrated";
import { AuthAPI } from "@/api/auth";
import { cn } from "@/lib/utils";
import type { OrganizationContext, WorkspaceCtx } from "@/contexts/AuthContext";

export function WorkspaceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();
  const { workspace, setWorkspace, availableWorkspaces, isLoading } = useAuth();
  const isHydrated = useHydrated();

  // Extraer workspaces de todas las organizaciones del AuthContext
  const organizations: OrganizationContext[] = availableWorkspaces ?? [];
  const flatWorkspaces: Array<WorkspaceCtx & { orgName?: string }> = organizations.flatMap(
    (org) => {
      const workspaces = Array.isArray(org.workspaces) ? org.workspaces : [];
      return workspaces.map((ws) => ({
        orgId: org.id,
        wsId: ws.id,
        wsName: ws.name,
        role: ws.role,
        orgName: org.name ?? "",
      }));
    },
  );
  const currentWorkspaceName = workspace?.wsName || "Seleccionar Workspace";

  // DEBUG: Log para verificar el flujo
  console.log('🔍 WorkspaceSelector - availableWorkspaces (AuthContext):', availableWorkspaces);
  console.log('🔍 WorkspaceSelector - flatWorkspaces:', flatWorkspaces);
  console.log('🔍 WorkspaceSelector - workspace actual:', workspace);
  console.log('🔍 WorkspaceSelector - isLoading:', isLoading);
  console.log('🔍 WorkspaceSelector - token en localStorage:', 
    typeof window !== 'undefined' && localStorage.getItem('kaba.token') ? 'SÍ' : 'NO');

  const handleWorkspaceSwitch = async (selectedWorkspace: WorkspaceCtx & { orgName?: string }) => {
    if (selectedWorkspace.wsId === workspace?.wsId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      // Llamar al API para cambiar workspace
      await AuthAPI.switchWorkspace(selectedWorkspace.wsId);
      
      // Obtener la organización del workspace seleccionado
      const organization = organizations.find((org) =>
        org.workspaces.some((ws) => ws.id === selectedWorkspace.wsId),
      );

      // Actualizar el contexto de auth
      const newWorkspaceCtx = {
        orgId: organization?.id || selectedWorkspace.orgId,
        wsId: selectedWorkspace.wsId,
        wsName: selectedWorkspace.wsName,
        role: selectedWorkspace.role,
      };
      
      setWorkspace(newWorkspaceCtx);
      
      // Mostrar toast de éxito
      toast({
        title: "Workspace cambiado",
        description: `Ahora estás trabajando en "${selectedWorkspace.wsName}".`,
      });

      // Recargar la página para rehidratar la SPA
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error switching workspace:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el workspace. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
      setIsOpen(false);
    }
  };

  // Contenedor consistente que siempre renderiza la misma estructura
  // Solo cambia el contenido interno después de la hidratación
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 h-auto",
        "rounded-md bg-slate-100 hover:bg-slate-200 transition-colors",
        "text-sm font-medium border-0 cursor-pointer",
        isSwitching && "opacity-50 cursor-not-allowed"
      )}
      data-testid="workspace-selector"
    >
      <Building className="h-4 w-4" />
      
      {/* Estado de loading o no hidratado */}
      {!isHydrated || isLoading ? (
        <>
          <span>Cargando...</span>
        </>
      ) : (
        /* Estado hidratado con funcionalidad completa */
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="max-w-[150px] truncate">{currentWorkspaceName}</span>
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="start" className="w-64">
            {flatWorkspaces.length === 0 ? (
              <DropdownMenuItem disabled>
                No hay workspaces disponibles
              </DropdownMenuItem>
            ) : (
              flatWorkspaces.map((ws) => (
                <DropdownMenuItem
                  key={`${ws.orgId}-${ws.wsId}`}
                  onClick={() => handleWorkspaceSwitch(ws)}
                  className="flex items-center justify-between cursor-pointer"
                  disabled={isSwitching}
                >
                  <div className="flex flex-col">
                  <span className="font-medium">{ws.wsName}</span>
                    <span className="text-xs text-muted-foreground">
                      {ws.role === 'WORKSPACE_ADMIN' ? 'Administrador' : 
                       ws.role === 'EDITOR' ? 'Editor' : 'Visualizador'}
                    </span>
                  </div>
                  {ws.wsId === workspace?.wsId && (
                    <Check className="h-4 w-4 text-green-600" data-testid="check-icon" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
} 