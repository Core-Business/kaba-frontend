
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
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (poaId && typeof window !== 'undefined') {
      if (poaId === "new") {
        if (!poa || poa.id !== "new") { 
          const newPoaInstance = createNew('new', 'Nuevo Procedimiento POA Sin Título');
          // BuilderLayout no debe guardar automáticamente, eso lo hace el dashboard o un botón de guardar explícito
        }
      } else if (!poa || poa.id !== poaId) {
        const fullPoaRaw = localStorage.getItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaId}`);
        if (fullPoaRaw) {
          try {
            const parsedFullPoa: POASchemaType = JSON.parse(fullPoaRaw);
            loadPoa(parsedFullPoa);
          } catch (e) {
            console.error("Error parsing full POA from localStorage:", e);
            loadFromSummaryOrMock();
          }
        } else {
          loadFromSummaryOrMock();
        }
      }
    }
  }, [poaId, loadPoa, createNew, poa]);

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

  function loadFromSummaryOrMock() {
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
          introduction: poa?.introduction || '', 
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
  }

  const handleNavigationAttempt = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, href: string) => {
    if (isDirty) {
      e.preventDefault();
      setNextPath(href);
      setShowUnsavedDialog(true);
    }
  };
  
  const handleDashboardNavigation = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDirty) {
      e.preventDefault();
      setNextPath('/dashboard');
      setShowUnsavedDialog(true);
    } else {
      router.push('/dashboard');
    }
  };


  const confirmNavigation = (discardChanges: boolean) => {
    setShowUnsavedDialog(false);
    if (nextPath) {
      if (discardChanges) {
        setIsDirty(false); 
        router.push(nextPath);
      } else {
        saveCurrentPOA(); 
        // Use a very short timeout to allow state to update before navigation
        // This helps ensure isDirty is false before the next route's logic runs
        setTimeout(() => router.push(nextPath), 50); 
      }
    }
    setNextPath(null);
  };


  if (!poa && poaId !== "new") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Cargando datos del Procedimiento POA...</p>
      </div>
    );
  }
  
  if (poaId === "new" && !poa) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Inicializando nuevo Procedimiento POA...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* This is the main flex container for the builder view. It will hold Sidebar and the content panel. */}
      {/* It gets the overall padding and gap. */}
      <div className="flex flex-1 min-h-screen bg-background p-4 md:p-6 lg:p-8 gap-4 md:gap-6 lg:gap-8">
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r shadow-md shrink-0">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleDashboardNavigation} className="text-sidebar-foreground hover:bg-sidebar-accent">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Volver al Panel
                </Button>
                <SidebarTrigger className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const currentPoaId = poa?.id && poa.id !== "new" ? poa.id : poaId;
                const itemPath = `/builder/${currentPoaId}/${item.href}`;
                const isActive = pathname === itemPath || 
                                (item.href === 'header' && pathname === `/builder/${currentPoaId}`) || 
                                (item.href === 'header' && pathname === `/builder/${currentPoaId}/header`); 
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <Link href={itemPath} passHref legacyBehavior>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="justify-start text-sm"
                        tooltip={{ children: item.name, side: 'right', className: 'bg-primary text-primary-foreground' }}
                      >
                         <a onClick={(e) => handleNavigationAttempt(e, itemPath)}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <Link href="/dashboard" legacyBehavior passHref>
                <SidebarMenuButton
                    asChild
                    className="justify-start text-sm w-full"
                    tooltip={{ children: "POA - Inicio", side: 'right', className: 'bg-primary text-primary-foreground' }}
                >
                  <a onClick={(e) => handleNavigationAttempt(e, '/dashboard')}>
                    <Home className="h-5 w-5" />
                    <span>POA - Inicio</span>
                  </a>
                </SidebarMenuButton>
            </Link>
          </SidebarFooter>
        </Sidebar>

        {/* Content Panel: Contains AppHeader and the scrollable main content area */}
        <div className="flex flex-col flex-1 min-w-0"> {/* This div takes remaining space */}
          <AppHeader />
          {/* Main scrollable content area. NO PADDING HERE. */}
          {/* It gets rounded corners and shadow to look like the grey area in the screenshot. */}
          <main className="flex-1 w-full overflow-y-auto bg-muted/40 rounded-lg shadow-md">
            {children} {/* Card components will be rendered here, they have their own padding */}
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
