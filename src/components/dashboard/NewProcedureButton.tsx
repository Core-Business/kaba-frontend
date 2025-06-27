"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewProcedureButtonProps {
  onClick: () => void;
  className?: string;
}

export function NewProcedureButton({ onClick, className }: NewProcedureButtonProps) {
  return (
    <Button 
      data-testid="new-procedure-button"
      onClick={onClick}
      style={{ backgroundColor: '#10367D' }}
      className={cn("hover:opacity-90", className)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Nuevo Procedimiento
    </Button>
  );
} 