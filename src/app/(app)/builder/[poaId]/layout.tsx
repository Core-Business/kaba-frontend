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
  { name: "Header", href: "header", icon: ClipboardEdit },
  { name: "Objective", href: "objective", icon: Target },
  { name: "Procedure Description", href: "procedure-description", icon: ListChecks },
  { name: "Scope", href: "scope", icon: ScanSearch },
  { name: "Activities", href: "activities", icon: ListTree },
  { name: "Document Preview", href: "document", icon: Printer },
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
        // If navigating to /builder/new directly or context is stale
        createNew('new', 'New Untitled POA');
      } else if (poaId !== "new" && (!poa || poa.id !== poaId)) {
        // This is where you would fetch existing POA data
        // For now, simulate loading or create a new one if not found
        console.log(`Simulating load for POA ID: ${poaId}`);
        // Mock: if it's not 'new' and not loaded, create it with its ID.
        // In a real app, you'd fetch from a DB. If not found, redirect or show error.
        const mockLoadedPoa = { // Replace with actual fetch logic
            id: poaId,
            name: `Loaded POA ${poaId.substring(0,6)}`,
            header: { title: `Loaded POA ${poaId.substring(0,6)}`, author: 'System', version: '1.0', date: new Date().toISOString().split('T')[0] },
            objective: 'This is a loaded objective.',
            procedureDescription: 'Detailed procedure description loaded from mock.',
            introduction: 'Auto-generated intro for loaded POA.',
            scope: 'Scope defined for loaded POA.',
            activities: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        loadPoa(mockLoadedPoa);
      }
    }
  }, [poaId, poa, loadPoa, createNew]);


  if (!poa && poaId !== "new") {
     // Still loading or poaId is invalid (not "new" and not found)
     // For "new", context handles it. For existing IDs, we show loading.
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Loading POA data...</p>
      </div>
    );
  }
  
  // If poaId is 'new' and poa context is not yet initialized for 'new'
  if (poaId === "new" && !poa) {
     // This case should ideally be handled by useEffect initializing it.
     // But as a fallback or if useEffect hasn't run yet:
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
        <p className="ml-4 text-lg">Initializing new POA...</p>
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
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Dashboard
                </Button>
                <SidebarTrigger className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-sidebar-primary" />
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground truncate" title={poa?.name || "Plan of Action"}>
                  {poa?.name || "Plan of Action"}
                </h2>
                <p className="text-xs text-sidebar-foreground/80">Editing Mode</p>
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
