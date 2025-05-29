
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

const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Descripción del Procedimiento", href: "procedure-description", icon: ListChecks },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Vista Previa del Documento", href: "document", icon: Printer },
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
    if (poaId) {
      if (poaId === "new" && (!poa || poa.id !== "new")) {
        createNew('new', 'Nuevo POA Sin Título');
      } else if (poaId !== "new" && (!poa || poa.id !== poaId)) {
        console.log(`Simulando carga para POA ID: ${poaId}`);
        const mockLoadedPoa = { 
            id: poaId,
            name: `POA Cargado ${poaId.substring(0,6)}`,
            header: { title: `POA Cargado ${poaId.substring(0,6)}`, author: 'Sistema', version: '1.0', date: new Date().toISOString().split('T')[0] },
            objective: 'Este es un objetivo cargado.',
            procedureDescription: 'Descripción detallada del procedimiento cargada desde el mock.',
            introduction: 'Introducción autogenerada para el POA cargado.',
            scope: 'Alcance definido para el POA cargado.',
            activities: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        loadPoa(mockLoadedPoa);
      }
    }
  }, [poaId, poa, loadPoa, createNew]);


  if (!poa && poaId !== "new") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Cargando datos del POA...</p>
      </div>
    );
  }
  
  if (poaId === "new" && !poa) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Inicializando nuevo POA...</p>
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
                <h2 className="text-lg font-semibold text-sidebar-foreground truncate" title={poa?.name || "Plan de Acción"}>
                  {poa?.name || "Plan de Acción"}
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
