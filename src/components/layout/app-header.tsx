"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { Building } from "lucide-react"; // Business-themed icon

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">POA Builder</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
