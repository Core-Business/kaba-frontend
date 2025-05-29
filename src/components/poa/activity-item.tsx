
"use client";

import type { POAActivity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, Wand2 } from "lucide-react";
import { AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";


interface ActivityItemProps {
  activity: POAActivity;
  onUpdate: (id: string, updates: Partial<POAActivity>) => void;
  onDelete: (id: string) => void;
  index: number;
  totalActivities: number;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => void;
  isDragging?: boolean;
}

export function ActivityItem({ 
  activity, 
  onUpdate, 
  onDelete, 
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: ActivityItemProps) {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [descriptionBeforeAi, setDescriptionBeforeAi] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!activity.description) return;
    setDescriptionBeforeAi(activity.description);
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: activity.description, context: "activity_description" }); 
      onUpdate(activity.id, { description: result.enhancedText });
      toast({ title: "Actividad Editada con IA", description: "La descripción de la actividad ha sido editada por IA." });
    } catch (error) {
      console.error("Error editando actividad con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar la actividad.", variant: "destructive" });
      setDescriptionBeforeAi(null);
    }
    setIsLoadingAi(false);
  };

  const handleUndoAi = () => {
    if (descriptionBeforeAi !== null) {
      onUpdate(activity.id, { description: descriptionBeforeAi });
      toast({ title: "Acción Deshecha", description: "Se restauró la descripción anterior de la actividad." });
      setDescriptionBeforeAi(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(activity.id, { [e.target.name]: e.target.value });
    if (e.target.name === "description") {
      setDescriptionBeforeAi(null); // Clear undo if user types manually
    }
  };

  const handleTypeChange = (value: string) => {
    onUpdate(activity.id, { type: value as POAActivity['type'] });
  };

  return (
    <Card 
      className={`w-full mb-3 p-1 bg-card shadow-md border rounded-lg transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
    >
      <CardContent className="p-3 space-y-3"> {/* Reduced padding and space */}
        <div className="flex items-start gap-2"> {/* Reduced gap */}
          {onDragStart && (
             <button type="button" className="cursor-grab p-1 text-muted-foreground hover:text-foreground" title="Arrastrar para reordenar">
                <GripVertical className="h-5 w-5 mt-1" />
             </button>
          )}
          <div className="flex-grow space-y-2"> {/* Reduced space */}
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-start"> {/* Reduced gap */}
                <div className="sm:col-span-2">
                    <Label htmlFor={`activity-number-${activity.id}`}>Número/ID de Actividad</Label>
                    <Input
                        id={`activity-number-${activity.id}`}
                        name="number"
                        value={activity.number}
                        onChange={handleInputChange}
                        placeholder="Ej., 1.1, A.2"
                        className="mt-1 w-full"
                    />
                </div>
            </div>
            
            <div>
              <Label htmlFor={`activity-description-${activity.id}`}>Descripción</Label>
              <Textarea
                id={`activity-description-${activity.id}`}
                name="description"
                value={activity.description}
                onChange={handleInputChange}
                placeholder="Describe la actividad o tarea"
                rows={2} // Reduced rows
                className="mt-1 w-full min-h-[60px]" // Reduced min-height
              />
            </div>

            <div>
              <Label htmlFor={`activity-type-${activity.id}`}>Tipo</Label>
              <Select value={activity.type} onValueChange={handleTypeChange}>
                <SelectTrigger id={`activity-type-${activity.id}`} className="w-full mt-1">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Tarea Individual</SelectItem>
                  <SelectItem value="decision">Punto de Decisión</SelectItem>
                  <SelectItem value="alternatives">Rutas Alternativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {activity.type === 'decision' && (
              <div className="p-2 border-l-4 border-blue-500 bg-blue-50 rounded-md"> {/* Reduced padding */}
                <p className="text-sm text-blue-700">
                  Punto de Decisión: Define resultados (ej., rutas Sí/No) usando sub-actividades o enlaces.
                  (UI detallada de ramificación por implementar)
                </p>
              </div>
            )}
            {activity.type === 'alternatives' && (
              <div className="p-2 border-l-4 border-green-500 bg-green-50 rounded-md"> {/* Reduced padding */}
                <p className="text-sm text-green-700">
                  Rutas Alternativas: Define diferentes opciones y sus pasos subsecuentes.
                  (UI detallada de ramificación por implementar)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t"> {/* Reduced padding-top */}
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!activity.description && activity.description.length > 5}
            className="text-xs px-2 py-1"
            onUndo={descriptionBeforeAi !== null ? handleUndoAi : undefined}
            canUndo={descriptionBeforeAi !== null}
          >
             <Wand2 className="mr-2 h-4 w-4" />
            {isLoadingAi ? "Editando..." : "Edición con IA"}
          </AiEnhanceButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    