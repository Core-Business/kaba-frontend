
"use client";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SectionTitleProps {
  title: string;
  description?: string;
}

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className="mb-3"> {/* Reduced mb-6 to mb-3 */}
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>} {/* Added mt-1 for slight separation if description exists */}
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
  children?: React.ReactNode; // Allow children to override icon and text
}

export function AiEnhanceButton({ onClick, isLoading, textExists, className, buttonText = "Edición con IA", disabled = false, children }: AiEnhanceButtonProps) {
  return (
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
  );
}
