"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { FileText, Wand2, Undo2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ScopeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoadingAi: boolean;
  onAiAction: () => void;
  onUndoAi: () => void;
  canUndoAi: boolean;
  onGenerateFromActivities: () => void;
  isLoadingActivities: boolean;
  isActivitiesLocked: boolean;
  maxWords: number;
  onMaxWordsChange: (val: number) => void;
}

export function ScopeEditor({
  value,
  onChange,
  isLoadingAi,
  onAiAction,
  onUndoAi,
  canUndoAi,
  onGenerateFromActivities,
  isLoadingActivities,
  isActivitiesLocked,
  maxWords,
  onMaxWordsChange
}: ScopeEditorProps) {
  
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-semibold text-gray-900">Definición del Alcance</Label>
          
          <div className="flex items-center gap-2">
            {canUndoAi && (
                 <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUndoAi}
                  disabled={isLoadingAi || isLoadingActivities}
                  title="Deshacer cambios"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
            )}
            
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                            <Button 
                                onClick={onGenerateFromActivities} 
                                disabled={!isActivitiesLocked || isLoadingActivities}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                            >
                                {isLoadingActivities ? <LoadingSpinner className="mr-2 h-3 w-3" /> : <FileText className="mr-2 h-3 w-3" />}
                                Generar desde Actividades
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {!isActivitiesLocked && (
                        <TooltipContent>
                            <p>Completa las Actividades primero</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
          </div>
       </div>
       
       <div className="flex-1 relative mb-4">
           <Textarea 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Describe el alcance detallado del procedimiento, incluyendo límites, excepciones y áreas involucradas..." 
              className="w-full h-full min-h-[400px] resize-none text-base p-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl transition-all"
           />
       </div>

       <div className="space-y-4 pt-4 border-t border-gray-100">
           
           <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Extensión deseada (IA): {maxWords} palabras</span>
                <Slider
                    value={[maxWords]}
                    onValueChange={(val) => onMaxWordsChange(val[0])}
                    min={50}
                    max={500}
                    step={10}
                    className="w-full"
                />
           </div>

           <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400 font-medium">
                  {wordCount} palabras actuales
              </div>
              
              <Button 
                onClick={onAiAction}
                disabled={isLoadingAi || value.length < 10}
                variant="ghost" 
                size="sm" 
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                  {isLoadingAi ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Mejorar Redacción con IA
              </Button>
           </div>
       </div>
    </div>
  );
}
