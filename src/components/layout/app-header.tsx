
"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { Building, FileText } from "lucide-react"; 
import { usePOA } from "@/hooks/use-poa";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const { poa } = usePOA();
  const pathname = usePathname();

  let leftContent;
  if (poa && pathname.startsWith('/builder/')) {
    leftContent = (
      <div className="flex items-center space-x-3">
        <FileText className="h-7 w-7 text-primary flex-shrink-0" />
        <div className="flex flex-col min-w-0"> {/* min-w-0 for truncation */}
          <span className="text-lg font-semibold text-primary truncate" title={poa.name}>
            {poa.name}
          </span>
          <span className="text-xs text-muted-foreground">Modo Edición</span>
        </div>
      </div>
    );
  } else {
    leftContent = (
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Building className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold text-primary">POA Builder</span>
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 flex-1 min-w-0"> {/* flex-1 and min-w-0 for leftContent to truncate */}
          {leftContent}
        </div>
        <div className="flex flex-shrink-0 items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
