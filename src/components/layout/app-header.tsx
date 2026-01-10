
"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { Building, FileText } from "lucide-react";
import { usePOA } from "@/hooks/use-poa";
import { usePathname } from "next/navigation";


const navItemsForTitle = [
  { name: "Encabezado", href: "header" },
  { name: "Objetivo", href: "objective" },
  { name: "Actividades", href: "activities" },
  { name: "Alcance", href: "scope" },
  { name: "Responsabilidades", href: "responsibilities" },
  { name: "Definiciones", href: "definitions" },
  { name: "Referencias", href: "references" },
  { name: "Introducción", href: "introduction" },
  { name: "Aprobaciones", href: "approvals" },
  { name: "Control de Cambios", href: "change-control" },
  { name: "Registros", href: "records" },
  { name: "Vista Previa", href: "document" },
];

export function AppHeader() {
  const { poa } = usePOA();
  const pathname = usePathname();

  let leftContent;

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
          <UserNav />
        </div>
      </div>
    </header>
  );
}
