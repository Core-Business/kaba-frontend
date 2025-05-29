
"use client";
import { Button } from "@/components/ui/button";
import { Wand2, Undo2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type React from "react";

interface SectionTitleProps {
  title: string;
  description?: string;
}

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>} 
    </div>
  );
}

interface AiEnhanceButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  textExists: boolean;
  className?: string;
  buttonText?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onUndo?: () => void;
  canUndo?: boolean;
}

export function AiEnhanceButton({ 
  onClick, 
  isLoading, 
  textExists, 
  className, 
  buttonText = "Edición con IA", 
  disabled = false, 
  children,
  onUndo,
  canUndo
}: AiEnhanceButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isLoading || !textExists || disabled}
        className={className}
      >
        {children ? (
          isLoading ? <><LoadingSpinner className="mr-2 h-4 w-4" /> Editando...</> : children
        ) : (
          <>
            {isLoading ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Editando..." : buttonText}
          </>
        )}
      </Button>
      {canUndo && onUndo && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onUndo}
          disabled={isLoading}
          title="Deshacer última edición con IA"
        >
          <Undo2 className="h-4 w-4" />
          <span className="sr-only">Deshacer</span>
        </Button>
      )}
    </div>
  );
}

    