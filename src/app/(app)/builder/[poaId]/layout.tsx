
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
  ClipboardEdit,
  Target,
  ListChecks,
  ScanSearch,
  ListTree,
  Printer,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePOA } from "@/hooks/use-poa";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POA as POASchemaType } from "@/lib/schema"; // For mock structure

const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Descripción del Procedimiento", href: "procedure-description", icon: ListChecks },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Vista Previa del Documento", href: "document", icon: Printer },
];

const LOCAL_STORAGE_KEY_BUILDER = "poaApp_poas";
type StoredPOASummary = {
  id: string;
  name: string;
  logo?: string;
  // Add other relevant summary fields if needed
};

// These are the original mock POAs, used as a fallback if localStorage is empty
// to allow accessing them by ID before the dashboard populates localStorage.
const ORIGINAL_MOCK_POAS_SUMMARIES: StoredPOASummary[] = [
  { id: "1", name: "Plan de Despliegue de Software" },
  { id: "2", name: "Incorporación de Nuevos Empleados" },
  { id: "3", name: "Campaña de Marketing Q3" },
];


export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { poa, loadPoa, createNew } = usePOA();
  const poaId = params.poaId as string;

  useEffect(() => {
    if (poaId && typeof window !== 'undefined') {
      if (poaId === "new" && (!poa || poa.id !== "new")) {
        createNew('new', 'Nuevo Procedimiento POA Sin Título');
      } else if (poaId !== "new" && (!poa || poa.id !== poaId)) {
        const storedPoasRaw = localStorage.getItem(LOCAL_STORAGE_KEY_BUILDER);
        let poaSummaryFromStorage: StoredPOASummary | undefined = undefined;

        if (storedPoasRaw) {
          try {
            const storedPoas: StoredPOASummary[] = JSON.parse(storedPoasRaw);
            poaSummaryFromStorage = storedPoas.find(p => p.id === poaId);
          } catch (e) {
            console.error("Error parsing POAs from localStorage in builder:", e);
            // Fallback strategy might be needed if critical
          }
        }

        if (poaSummaryFromStorage) {
          // POA found in localStorage, load it (even if it's just a summary for the mock)
          console.log(`Cargando Procedimiento POA ID: ${poaId} (desde localStorage)`);
          const mockLoadedPoa: POASchemaType = { 
              id: poaId,
              name: poaSummaryFromStorage.name || `Procedimiento POA Cargado ${poaId.substring(0,6)}`,
              header: { 
                title: poaSummaryFromStorage.name || `Procedimiento POA Cargado ${poaId.substring(0,6)}`, 
                author: 'Sistema (localStorage)', 
                version: '1.0', 
                date: new Date().toISOString().split('T')[0],
                logoUrl: poaSummaryFromStorage.logo || ''
              },
              objective: 'Objetivo cargado (mock desde localStorage).',
              procedureDescription: 'Descripción cargada (mock desde localStorage).',
              introduction: 'Introducción cargada (mock desde localStorage).',
              scope: 'Alcance cargado (mock desde localStorage).',
              activities: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
          };
          loadPoa(mockLoadedPoa);
        } else if (storedPoasRaw && !poaSummaryFromStorage) {
          // localStorage exists, but POA ID is not in it (implies deleted)
          console.warn(`Procedimiento POA ID: ${poaId} no encontrado en localStorage. Pudo haber sido borrado. Redirigiendo al dashboard.`);
          router.push('/dashboard');
        } else if (!storedPoasRaw) {
          // localStorage is empty. Check if it's one of the original hardcoded mocks.
          const originalMockSummary = ORIGINAL_MOCK_POAS_SUMMARIES.find(p => p.id === poaId);
          if (originalMockSummary) {
            console.log(`Cargando Procedimiento POA ID: ${poaId} (mock original, localStorage vacío)`);
            const mockLoadedPoa: POASchemaType = {
                id: poaId,
                name: originalMockSummary.name,
                header: { title: originalMockSummary.name, author: 'Sistema (mock original)', version: '1.0', date: new Date().toISOString().split('T')[0] },
                objective: 'Este es un objetivo de mock original.',
                procedureDescription: 'Descripción de mock original.',
                introduction: 'Introducción de mock original.',
                scope: 'Alcance de mock original.',
                activities: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            loadPoa(mockLoadedPoa);
          } else {
            console.warn(`Procedimiento POA ID: ${poaId} no es un mock original y localStorage está vacío. Redirigiendo.`);
            router.push('/dashboard');
          }
        }
      }
    }
  }, [poaId, poa, loadPoa, createNew, router]);


  if (!poa && poaId !== "new") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Cargando datos del Procedimiento POA...</p>
      </div>
    );
  }
  
  if (poaId === "new" && !poa) {
    // This state might occur briefly while createNew is initializing
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Inicializando nuevo Procedimiento POA...</p>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-[calc(100vh-4rem)]"> {/* Adjust for header height */}
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
                const itemPath = `/builder/${poaId}/${item.href}`;
                const isActive = pathname === itemPath || (item.href === 'header' && pathname === `/builder/${poaId}`);
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
        <SidebarInset className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

