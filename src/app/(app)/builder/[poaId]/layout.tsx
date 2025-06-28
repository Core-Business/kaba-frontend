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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePOA } from "@/hooks/use-poa";
import { usePOABackend } from "@/hooks/use-poa-backend";
import { useEffect, useState, useCallback } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POA as POASchemaType } from "@/lib/schema";
import { AppHeader } from "@/components/layout/app-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const LOCAL_STORAGE_POA_LIST_KEY = "poaApp_poas";
const LOCAL_STORAGE_POA_DETAIL_PREFIX = "poaApp_poa_detail_";

const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Responsabilidades", href: "responsibilities", icon: Users },
  { name: "Definiciones", href: "definitions", icon: BookOpen },
  { name: "Referencias", href: "references", icon: ExternalLink },
  { name: "Introducción", href: "introduction", icon: BookOpenText },
  { name: "Aprobaciones", href: "approvals", icon: CheckCircle },
  { name: "Control de Cambios", href: "change-control", icon: FileEdit },
  { name: "Registros", href: "records", icon: FileText },
  { name: "Vista Previa", href: "document", icon: Printer },
];

type StoredPOASummary = {
  id: string;
  name: string;
  logo?: string;
  updatedAt?: string;
};

const ORIGINAL_MOCK_POAS_SUMMARIES: StoredPOASummary[] = [
  { id: "1", name: "Plan de Despliegue de Software", updatedAt: new Date().toISOString() },
  { id: "2", name: "Incorporación de Nuevos Empleados", updatedAt: new Date().toISOString() },
  { id: "3", name: "Campaña de Marketing Q3", updatedAt: new Date().toISOString() },
];


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
  
  // Usar el hook del backend en lugar del localStorage
  const { 
    poa, 
    isDirty, 
    isLoading: isLoadingBackend,
    saveToBackend 
  } = usePOABackend(procedureId);
  
  // Mantener el hook local como fallback
  const { loadPoa, createNew, setIsDirty, saveCurrentPOA } = usePOA();

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  // El hook usePOABackend maneja toda la lógica de carga/guardado
  // Solo necesitamos manejar casos especiales como "new"
  useEffect(() => {
    if (poaId === "new") {
      createNew('new', 'Nuevo Procedimiento POA Sin Título');
      return;
    }
    
    if (!procedureId && poaId !== 'new') {
      console.error('No se pudo extraer procedureId de:', poaId);
      console.error('Redirigiendo al dashboard...');
      router.push('/dashboard');
      return;
    }
  }, [poaId, procedureId, createNew, router]);


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

  const confirmNavigation = (discardChanges: boolean) => {
    setShowUnsavedDialog(false);
    if (nextPath) {
      if (discardChanges) {
        setIsDirty(false);
        router.push(nextPath);
      } else {
        saveCurrentPOA();
        router.push(nextPath);
      }
    }
    setNextPath(null);
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
  if (poaId !== "new" && (isLoadingBackend || !poa)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">
          {isLoadingBackend ? 'Cargando desde el servidor...' : 'Preparando editor...'}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin Guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar en esta sección. ¿Quieres guardar los cambios antes de salir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowUnsavedDialog(false); setNextPath(null); }}>Cancelar Navegación</AlertDialogCancel>
            <Button variant="outline" onClick={() => confirmNavigation(true)}>Descartar Cambios y Salir</Button>
            <AlertDialogAction onClick={() => confirmNavigation(false)}>Guardar y Salir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
    

      

    