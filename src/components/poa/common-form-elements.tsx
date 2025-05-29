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
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
}

export function AiEnhanceButton({ onClick, isLoading, textExists, className, buttonText = "Enhance with AI", disabled = false }: AiEnhanceButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isLoading || !textExists || disabled}
      className={className}
    >
      {isLoading ? (
        <LoadingSpinner className="mr-2 h-4 w-4" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Enhancing..." : buttonText}
    </Button>
  );
}
