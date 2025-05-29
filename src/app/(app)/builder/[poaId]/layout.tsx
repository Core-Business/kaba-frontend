
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardEdit, // Encabezado
  Target,         // Objetivo
  ListTree,       // Actividades (antes ListChecks for Procedure Desc)
  ScanSearch,     // Alcance
  BookOpenText,   // Introducción (nuevo icono, antes ListChecks for Procedure Desc)
  Printer,        // Vista Previa
  FileText,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePOA } from "@/hooks/use-poa";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POA as POASchemaType } from "@/lib/schema"; 

const LOCAL_STORAGE_POA_LIST_KEY = "poaApp_poas";
const LOCAL_STORAGE_POA_DETAIL_PREFIX = "poaApp_poa_detail_";

const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Introducción", href: "introduction", icon: BookOpenText }, // Changed from "Descripción del Procedimiento", new href
  { name: "Vista Previa", href: "document", icon: Printer }, // Renamed
];

type StoredPOASummary = {
  id: string;
  name: string;
  logo?: string;
  updatedAt?: string; // Added for consistency
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
  const { poa, loadPoa, createNew, saveCurrentPOA } = usePOA();
  const poaId = params.poaId as string;

  useEffect(() => {
    if (poaId && typeof window !== 'undefined') {
      if (poaId === "new") {
        if (!poa || poa.id !== "new") { // Only create if not already set or different
          const newPoaInstance = createNew('new', 'Nuevo Procedimiento POA Sin Título');
          // The dashboard is responsible for adding the summary to poaApp_poas.
          // Here, we ensure the full detail is saved if it's truly new.
           // Saving is now handled by the save button or when navigating away.
           // For a brand new "new" poa, it's just in memory until first save.
        }
      } else if (!poa || poa.id !== poaId) {
        const fullPoaRaw = localStorage.getItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaId}`);
        if (fullPoaRaw) {
          try {
            const parsedFullPoa: POASchemaType = JSON.parse(fullPoaRaw);
            loadPoa(parsedFullPoa);
          } catch (e) {
            console.error("Error parsing full POA from localStorage:", e);
            // Fallback to summary or mock if full parse fails
            loadFromSummaryOrMock();
          }
        } else {
          loadFromSummaryOrMock();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poaId, loadPoa, createNew]); // Removed poa, saveCurrentPOA from deps to avoid loops on save

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
      console.log(`Construyendo Procedimiento POA ID: ${poaId} (desde resumen localStorage)`);
      poaToLoad = { 
          id: poaId,
          name: poaSummaryFromStorage.name || `Procedimiento POA Cargado ${poaId.substring(0,6)}`,
          header: { 
            title: poaSummaryFromStorage.name || `Procedimiento POA Cargado ${poaId.substring(0,6)}`, 
            author: 'Sistema (localStorage)', 
            version: '1.0', 
            date: new Date().toISOString().split('T')[0],
            logoUrl: poaSummaryFromStorage.logo || ''
          },
          objective: 'Objetivo cargado (desde resumen). Edita y guarda para más detalles.',
          procedureDescription: 'Introducción cargada (desde resumen). Edita y guarda para más detalles.',
          introduction: '', // AI generated intro
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
        console.log(`Construyendo Procedimiento POA ID: ${poaId} (mock original, localStorage vacío)`);
        poaToLoad = {
            id: poaId,
            name: originalMockSummary.name,
            header: { title: originalMockSummary.name, author: 'Sistema (mock original)', version: '1.0', date: new Date().toISOString().split('T')[0] },
            objective: 'Este es un objetivo de mock original. Edita y guarda.',
            procedureDescription: 'Descripción de mock original que servirá de introducción. Edita y guarda.',
            introduction: '', // AI generated intro
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
      // Save this constructed/mock version to detail storage so subsequent saves work on a full object
      // This is tricky, as saveCurrentPOA is useCallback and might not have the latest poaToLoad.
      // A better approach is that `loadPoa` itself doesn't save, but the first "Save Section" action will.
      // Or, if we want to ensure it's saved on load if not present:
      // setTimeout(() => saveCurrentPOA(), 0); // Defer to ensure poa state is updated
    }
  }

  if (!poa && poaId !== "new") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Cargando datos del Procedimiento POA...</p>
      </div>
    );
  }
  
  if (poaId === "new" && !poa) {
     // This case should be handled by the createNew call above, 
     // but as a fallback if poa isn't set yet by createNew.
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Inicializando nuevo Procedimiento POA...</p>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 gap-4 md:gap-6 lg:gap-8">
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r shadow-md">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-sidebar-foreground hover:bg-sidebar-accent">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Volver al Panel
                </Button>
                <SidebarTrigger className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-sidebar-primary" />
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground truncate" title={poa?.name || "Procedimiento POA"}>
                  {poa?.name || "Procedimiento POA"}
                </h2>
                <p className="text-xs text-sidebar-foreground/80">Modo Edición</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Ensure poaId used for link construction is the actual current poaId, not "new" if it has been assigned one
                const currentPoaId = poa?.id && poa.id !== "new" ? poa.id : poaId;
                const itemPath = `/builder/${currentPoaId}/${item.href}`;
                const isActive = pathname === itemPath || 
                                 (item.href === 'header' && pathname === `/builder/${currentPoaId}`) ||
                                 (item.href === 'introduction' && pathname.endsWith('/introduction')); // Handle potential trailing slash or exact match

                return (
                  <SidebarMenuItem key={item.name}>
                    <Link href={itemPath} legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={isActive}
                        className="justify-start text-sm"
                        tooltip={{ children: item.name, side: 'right', className: 'bg-primary text-primary-foreground' }}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 overflow-y-auto bg-background rounded-lg shadow-md p-0">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

