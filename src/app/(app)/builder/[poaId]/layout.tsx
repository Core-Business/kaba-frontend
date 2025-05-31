
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePOA } from "@/hooks/use-poa";
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
  { name: "Introducción", href: "introduction", icon: BookOpenText },
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
  const { poa, loadPoa, createNew, isDirty, setIsDirty, saveCurrentPOA } = usePOA();
  const poaId = params.poaId as string;

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  const loadFromSummaryOrMock = useCallback(() => {
    if (typeof window === 'undefined' || !poaId) return;

    const storedPoasRaw = localStorage.getItem(LOCAL_STORAGE_POA_LIST_KEY);
    let poaSummaryFromStorage: StoredPOASummary | undefined = undefined;

    if (storedPoasRaw) {
      try {
        const storedPoas: StoredPOASummary[] = JSON.parse(storedPoasRaw);
        poaSummaryFromStorage = storedPoas.find(p => p.id === poaId);
      } catch (e) {
        console.error("Error parsing POAs summary from localStorage:", e);
      }
    }

    let poaToLoad: POASchemaType | null = null;

    if (poaSummaryFromStorage) {
      poaToLoad = {
          id: poaId,
          name: poaSummaryFromStorage.name || `Procedimiento POA Cargado ${poaId.substring(0,6)}`,
          header: {
            title: poaSummaryFromStorage.name || `Procedimiento POA Cargado ${poaId.substring(0,6)}`,
            author: 'Sistema (localStorage)',
            version: '1.0',
            date: new Date().toISOString().split('T')[0],
            logoUrl: poaSummaryFromStorage.logo || '',
            companyName: 'Empresa Ejemplo (desde resumen)',
            departmentArea: 'Área Ejemplo (desde resumen)',
            status: 'Borrador',
            fileLocation: 'Ubicación Ejemplo (desde resumen)',
            documentCode: 'POA-RES-001',
          },
          objective: 'Objetivo cargado (desde resumen). Edita y guarda para más detalles.',
          introduction: poa?.introduction ?? '',
          procedureDescription: 'Descripción de procedimiento/introducción cargada (desde resumen). Edita y guarda para más detalles.',
          scope: 'Alcance cargado (desde resumen). Edita y guarda para más detalles.',
          activities: [],
          createdAt: new Date().toISOString(),
          updatedAt: poaSummaryFromStorage.updatedAt || new Date().toISOString(),
      };
    } else if (storedPoasRaw && !poaSummaryFromStorage) {
      console.warn(`Procedimiento POA ID: ${poaId} no encontrado en lista de localStorage. Pudo haber sido borrado. Redirigiendo al panel.`);
      router.push('/dashboard');
      return;
    } else if (!storedPoasRaw) {
      const originalMockSummary = ORIGINAL_MOCK_POAS_SUMMARIES.find(p => p.id === poaId);
      if (originalMockSummary) {
        poaToLoad = {
            id: poaId,
            name: originalMockSummary.name,
            header: {
              title: originalMockSummary.name,
              author: 'Sistema (mock original)',
              version: '1.0',
              date: new Date().toISOString().split('T')[0],
              companyName: 'Empresa Ejemplo (mock)',
              departmentArea: 'Área Ejemplo (mock)',
              status: 'Borrador',
              fileLocation: 'Ubicación Ejemplo (mock)',
              documentCode: 'POA-MOCK-001',
            },
            objective: 'Este es un objetivo de mock original. Edita y guarda.',
            introduction: '',
            procedureDescription: 'Descripción de mock original que servirá de introducción. Edita y guarda.',
            scope: 'Alcance de mock original. Edita y guarda.',
            activities: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
      } else {
        console.warn(`Procedimiento POA ID: ${poaId} no es un mock original y localStorage está vacío. Redirigiendo.`);
        router.push('/dashboard');
        return;
      }
    }

    if (poaToLoad) {
      loadPoa(poaToLoad);
      if (!localStorage.getItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaId}`)) {
        localStorage.setItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaId}`, JSON.stringify(poaToLoad));
      }
    }
  }, [poaId, loadPoa, router, poa?.introduction]);


  useEffect(() => {
    if (!poaId || typeof window === 'undefined') {
      return;
    }

    if (poa && poa.id === poaId) {
      return;
    }

    if (poaId === "new") {
      if (poa && poa.id === "new") {
        return;
      }
      createNew('new', 'Nuevo Procedimiento POA Sin Título');
      return; 
    }

    const fullPoaRaw = localStorage.getItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaId}`);
    if (fullPoaRaw) {
      try {
        const parsedFullPoa: POASchemaType = JSON.parse(fullPoaRaw);
        if (parsedFullPoa && parsedFullPoa.id === poaId) {
          loadPoa(parsedFullPoa);
        } else {
          console.warn(`ID mismatch or parse error in full POA for ${poaId}. Falling back.`);
          loadFromSummaryOrMock();
        }
      } catch (e) {
        console.error("Error parsing full POA from localStorage:", e);
        loadFromSummaryOrMock();
      }
    } else {
      loadFromSummaryOrMock();
    }
  }, [poaId, poa, loadPoa, createNew, loadFromSummaryOrMock, router]);


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
        setIsDirty(false); // Ensure isDirty is false before navigating
        router.push(nextPath);
      } else {
        saveCurrentPOA(); // This will set isDirty to false on success
        // Wait for save to complete (and isDirty to be set to false)
        // A short timeout can help, but ideally, saveCurrentPOA would return a promise
        // or a callback would be used.
        setTimeout(() => {
            router.push(nextPath)
        }, 100); // Small delay to allow state update from save
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

  if (poaId !== "new" && (!poa || poa.id !== poaId)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Cargando datos del Procedimiento POA...</p>
      </div>
    );
  }
  
  if (!poa) {
     return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Preparando editor...</p>
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
                const currentPoaIdForLink = (poa && poa.id && poa.id !== "new") ? poa.id : poaId;
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
    

      