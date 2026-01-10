"use client";

import { Textarea } from "@/components/ui/textarea";
import { AiToolbar } from "./AiToolbar";

interface ObjectiveEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoadingAi?: boolean;
  onAiAction: (action: 'refine' | 'shorten' | 'expand' | 'generate') => void;
  onUndoAi?: () => void;
  canUndoAi?: boolean;
}

export function ObjectiveEditor({
  value,
  onChange,
  isLoadingAi,
  onAiAction,
  onUndoAi,
  canUndoAi,
}: ObjectiveEditorProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 flex flex-col h-full min-h-[500px] shadow-sm">
      <AiToolbar
        onRefine={() => onAiAction('refine')}
        onShorten={() => onAiAction('shorten')}
        onExpand={() => onAiAction('expand')}
        // generate is usually triggered from context panel, but can be here too
        onUndo={onUndoAi}
        canUndo={canUndoAi}
        isLoading={isLoadingAi}
      />
      
      <div className="flex-1 relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe el objetivo principal aquí... (Ej: Establecer un proceso estandarizado para la gestión de inventarios...)"
          className="w-full h-full min-h-[400px] resize-none border-none focus-visible:ring-0 text-lg leading-relaxed p-0 placeholder:text-gray-300"
          style={{ boxShadow: 'none' }}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <span>{value.length} caracteres</span>
        <span>{value.split(/\s+/).filter(w => w.length > 0).length} palabras</span>
      </div>
    </div>
  );
}
