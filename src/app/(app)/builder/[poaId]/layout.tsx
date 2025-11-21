"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardEdit,
  Target,
  ListTree,
  ScanSearch,
  BookOpenText,
  Printer,
  Home,
  ChevronLeft,
  Users,
  BookOpen,
  ExternalLink,
  CheckCircle,
  FileEdit,
  FileText,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePOA } from "@/hooks/use-poa";
import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AppHeader } from "@/components/layout/app-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Responsabilidades", href: "responsibilities", icon: Users },
  { name: "Definiciones", href: "definitions", icon: BookOpen },
  { name: "Referencias", href: "references", icon: ExternalLink },
  { name: "Registros", href: "records", icon: FileText },
  { name: "Introducción", href: "introduction", icon: BookOpenText },
  { name: "Control de Cambios", href: "change-control", icon: FileEdit },
  { name: "Aprobaciones", href: "approvals", icon: CheckCircle },
  { name: "Anexos", href: "attachments", icon: Paperclip },
  { name: "Vista Previa", href: "document", icon: Printer },
];

const gatedSections = new Set([
  "responsibilities",
  "definitions",
  "references",
  "records",
  "introduction",
  "change-control",
  "approvals",
  "attachments",
  "document",
]);

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  
  const poaId = params.poaId as string;
  
  // Extraer procedureId del formato: proc-{procedureId}-{timestamp} o directamente {procedureId}
  const procedureId = (() => {
    if (!poaId || poaId === 'new') return null;
    
    if (poaId.startsWith('proc-')) {
      // Formato: proc-{procedureId}-{timestamp}
      const withoutPrefix = poaId.replace('proc-', '');
      const parts = withoutPrefix.split('-');
      // Si hay al menos 2 partes, el último es timestamp, el resto es procedureId
      return parts.length >= 2 ? parts.slice(0, -1).join('-') : withoutPrefix;
    } else {
      // Formato directo: {procedureId}
      return poaId;
    }
  })();
  
  const {
    poa,
    isDirty,
    setIsDirty,
    setBackendProcedureId,
    isBackendLoading,
    saveToBackend,
    createNew,
    completion,
  } = usePOA();

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const hasAttemptedAutoCreation = useRef(false);

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSection =
    pathSegments.length >= 3 ? pathSegments[2] : "header";

  useEffect(() => {
    if (poaId === "new") {
      setBackendProcedureId(null);
    } else {
      setBackendProcedureId(procedureId);
    }

    return () => {
      setBackendProcedureId(null);
    };
  }, [poaId, procedureId, setBackendProcedureId]);

  // El hook centralizado maneja la lógica de carga/guardado
  useEffect(() => {
    if (poaId === "new") {
      if (hasAttemptedAutoCreation.current) {
        return;
      }

      hasAttemptedAutoCreation.current = true;

      // Auto-crear procedimiento en el backend y redirigir al ID real
      const autoCreateNewProcedure = async () => {
        try {
          console.log('🔄 Auto-creando procedimiento desde /builder/new...');
          // No podemos usar hooks aquí, así que haremos la llamada directa a la API
          const response = await fetch('/api/procedures', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('kaba.token')}`,
              'X-Organization-Id': JSON.parse(localStorage.getItem('kaba.lastWorkspace') || '{}').orgId || '',
              'X-Workspace-Id': JSON.parse(localStorage.getItem('kaba.lastWorkspace') || '{}').wsId || '',
            },
            body: JSON.stringify({
              title: `Nuevo Procedimiento ${new Date().toLocaleDateString()}`,
              description: "Procedimiento creado automáticamente",
              code: `PROC-${Date.now()}`,
              version: 1,
              status: "draft"
            }),
          });

          if (!response.ok) {
            throw new Error('No se pudo crear el procedimiento');
          }

          const result = await response.json();
          const newProcedure = result.data;
          
          console.log('✅ Procedimiento auto-creado:', newProcedure.id);
          
          // Redirigir al ID real del procedimiento creado
          router.push(`/builder/${newProcedure.id}`);
        } catch (error) {
          console.error('❌ Error auto-creando procedimiento:', error);
          // Fallback: usar localStorage como antes
          createNew('new', 'Nuevo Procedimiento POA Sin Título');
        }
      };
      
      autoCreateNewProcedure();
      return;
    }

    // Resetear el intento al abandonar la ruta /builder/new
    if (hasAttemptedAutoCreation.current) {
      hasAttemptedAutoCreation.current = false;
    }
    
    if (!procedureId && poaId !== 'new') {
      console.error('No se pudo extraer procedureId de:', poaId);
      console.error('Redirigiendo al dashboard...');
      router.push('/dashboard');
      return;
    }
  }, [poaId, procedureId, createNew, router]);

  useEffect(() => {
    if (!poaId) return;
    if (!completion.allCriticalComplete && gatedSections.has(currentSection)) {
      router.replace(`/builder/${poaId}/header`);
    }
  }, [completion.allCriticalComplete, currentSection, poaId, router]);


  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const confirmNavigation = async (discardChanges: boolean) => {
    if (nextPath) {
      if (discardChanges) {
        setShowUnsavedDialog(false);
        setIsDirty(false);
        router.push(nextPath);
        setNextPath(null);
      } else {
        setIsSaving(true);
        try {
          // Guardar realmente en el backend antes de navegar
          await saveToBackend();
          setShowUnsavedDialog(false);
          router.push(nextPath);
          setNextPath(null);
        } catch (error) {
          console.error('Error guardando antes de navegar:', error);
          // Si falla el guardado, mantener el modal abierto para que el usuario decida
          setShowUnsavedDialog(true);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleDashboardNavigationClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDirty) {
          e.preventDefault();
          setNextPath('/dashboard');
          setShowUnsavedDialog(true);
      } else {
          router.push('/dashboard');
      }
  };


  if (!poaId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Cargando identificador...</p>
      </div>
    );
  }

  if (poaId === "new" && (!poa || poa.id !== "new")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Inicializando nuevo Procedimiento POA...</p>
      </div>
    );
  }

  // Mostrar loading mientras se carga desde el backend
  if (poaId !== "new" && (isBackendLoading || !poa)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">
          {isBackendLoading ? 'Cargando desde el servidor...' : 'Preparando editor...'}
        </p>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1 min-h-screen bg-background p-4 md:p-6 lg:p-8 gap-4 md:gap-6 lg:gap-8">
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r shadow-md shrink-0">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleDashboardNavigationClick} className="text-sidebar-foreground hover:bg-sidebar-accent">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Volver al Panel
                </Button>
                <SidebarTrigger className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Siempre usar el poaId original de la URL para mantener consistencia
                const currentPoaIdForLink = poaId;
                const itemPath = `/builder/${currentPoaIdForLink}/${item.href}`;
                const isActive = pathname === itemPath ||
                                (item.href === 'header' && pathname === `/builder/${currentPoaIdForLink}`) ||
                                (item.href === 'header' && pathname === `/builder/${currentPoaIdForLink}/header`);
                const isLockedSection = gatedSections.has(item.href) && !completion.allCriticalComplete;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="justify-start text-sm"
                      tooltip={{ children: item.name, side: 'right', className: 'bg-primary text-primary-foreground' }}
                    >
                       <Link
                        href={itemPath}
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          if (isLockedSection) {
                            e.preventDefault();
                            setShowLockedDialog(true);
                            return;
                          }
                          if (isDirty) {
                            e.preventDefault();
                            setNextPath(itemPath);
                            setShowUnsavedDialog(true);
                          }
                        }}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
              <SidebarMenuButton
                  asChild
                  className="justify-start text-sm w-full"
                  tooltip={{ children: "POA - Inicio", side: 'right', className: 'bg-primary text-primary-foreground' }}
              >
                <Link
                  href="/dashboard"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (isDirty) {
                      e.preventDefault();
                      setNextPath('/dashboard');
                      setShowUnsavedDialog(true);
                    }
                  }}
                >
                  <Home className="h-5 w-5" />
                  <span>POA - Inicio</span>
                </Link>
              </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <AppHeader />
          <main className="flex-1 w-full overflow-y-auto bg-muted/40 rounded-lg shadow-md">
            {children}
          </main>
        </div>
      </div>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="sm:max-w-[700px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin Guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar en esta sección. ¿Quieres guardar los cambios antes de salir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => { setShowUnsavedDialog(false); setNextPath(null); }}
              disabled={isSaving}
            >
              Cancelar Navegación
            </AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={() => confirmNavigation(true)}
              disabled={isSaving}
            >
              Descartar Cambios y Salir
            </Button>
            <AlertDialogAction 
              onClick={() => confirmNavigation(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                'Guardar y Salir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLockedDialog} onOpenChange={setShowLockedDialog}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Completa los primeros pasos</AlertDialogTitle>
            <AlertDialogDescription>
              Antes de avanzar a este paso debes completar el Encabezado, Objetivo y agregar Actividades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLockedDialog(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
    

      

    