"use client";

import { Button } from "@/components/ui/button";
import { Wand2, Brain, Sparkles, Minimize2, Maximize2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AiToolbarProps {
  onRefine: () => void;
  onShorten?: () => void;
  onExpand?: () => void;
  onGenerate?: () => void;
  onUndo?: () => void;
  isLoading?: boolean;
  canUndo?: boolean;
}

export function AiToolbar({
  onRefine,
  onShorten,
  onExpand,
  onGenerate,
  onUndo,
  isLoading,
  canUndo,
}: AiToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-purple-50/50 rounded-lg border border-purple-100">
      <div className="flex items-center gap-2 mr-2">
        <div className="bg-purple-100 p-1.5 rounded-md">
          <Sparkles className="h-4 w-4 text-purple-600" />
        </div>
        <span className="text-xs font-semibold text-purple-700">AI Assistant</span>
      </div>

      <div className="h-4 w-px bg-purple-200 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onRefine}
        disabled={isLoading}
        className="h-8 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-100"
      >
        <Wand2 className="h-3.5 w-3.5 mr-1.5" />
        Mejorar
      </Button>

      {onShorten && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShorten}
          disabled={isLoading}
          className="h-8 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-100"
        >
          <Minimize2 className="h-3.5 w-3.5 mr-1.5" />
          Acortar
        </Button>
      )}

      {onExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          disabled={isLoading}
          className="h-8 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-100"
        >
          <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
          Expandir
        </Button>
      )}

      {onGenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="h-8 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-100"
        >
          <Brain className="h-3.5 w-3.5 mr-1.5" />
          Generar
        </Button>
      )}

      {canUndo && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={isLoading}
          className="h-8 w-8 ml-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="Deshacer cambio de IA"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
