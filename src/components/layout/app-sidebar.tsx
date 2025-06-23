"use client";

import { Building, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

export function AppSidebar() {
  const pathname = usePathname();
  
  const menuItems: MenuItem[] = [
    { 
      icon: FileText, 
      label: "Procedimientos", 
      href: "/dashboard" 
    },
    { 
      icon: Settings, 
      label: "Configuraciones", 
      href: "/settings" 
    }
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 border-r bg-background h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building className="h-8 w-8" style={{ color: '#10367D' }} />
          <span className="text-xl font-bold" style={{ color: '#10367D' }}>KABA Services</span>
        </Link>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              isActive(item.href)
                ? "text-white font-medium" 
                : "text-gray-600 hover:bg-gray-100"
            )}
            style={isActive(item.href) ? { backgroundColor: '#10367D' } : {}}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 