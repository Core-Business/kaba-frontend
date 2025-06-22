
"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { Building, FileText, PlusSquare, MinusSquare } from "lucide-react"; 
import { usePOA } from "@/hooks/use-poa";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItemsForTitle = [
  { name: "Encabezado", href: "header" },
  { name: "Objetivo", href: "objective" },
  { name: "Actividades", href: "activities" },
  { name: "Alcance", href: "scope" },
  { name: "Introducción", href: "introduction" }, 
  { name: "Vista Previa", href: "document" },
];

export function AppHeader() {
  const { poa, expandAllActivitiesInContext, collapseAllActivitiesInContext } = usePOA();
  const pathname = usePathname();

  let leftContent;
  let activityControls = null;

  if (poa && pathname.startsWith('/builder/')) {
    const pathSegments = pathname.split('/');
    const currentSectionSlug = pathSegments[pathSegments.length - 1];
    let currentSectionName = "";

    if (currentSectionSlug === poa.id || pathSegments.length === 3) {
      currentSectionName = "Encabezado";
    } else {
      const currentNavItem = navItemsForTitle.find(item => item.href === currentSectionSlug);
      currentSectionName = currentNavItem ? currentNavItem.name : "";
    }
    
    leftContent = (
      <div className="flex items-center space-x-3">
        <FileText className="h-7 w-7 text-primary flex-shrink-0" />
        <div className="flex items-baseline min-w-0">
          <span className="text-lg font-semibold text-primary truncate" title={poa.name}>
            {poa.name}
          </span>
          {currentSectionName && (
            <span className="text-lg text-muted-foreground ml-1.5">
              / {currentSectionName}
            </span>
          )}
        </div>
      </div>
    );

    if (pathname.endsWith('/activities')) {
      activityControls = (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAllActivitiesInContext} title="Expandir Todas las Actividades">
            <PlusSquare className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Expandir Todo</span>
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAllActivitiesInContext} title="Contraer Todas las Actividades">
            <MinusSquare className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Contraer Todo</span>
          </Button>
        </div>
      );
    }

  } else {
    leftContent = (
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Building className="h-7 w-7 text-primary" />
                  <span className="text-xl font-bold text-primary">KABA Services</span>
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {leftContent}
        </div>
        <div className="flex flex-shrink-0 items-center space-x-4">
          {activityControls}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
