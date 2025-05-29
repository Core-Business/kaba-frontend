
"use client";

import type { POAActivity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Wand2, GripVertical } from "lucide-react";
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
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!activity.description) return;
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: activity.description });
      onUpdate(activity.id, { description: result.enhancedText });
      toast({ title: "Actividad Mejorada", description: "La descripción de la actividad ha sido mejorada por IA." });
    } catch (error) {
      console.error("Error mejorando actividad:", error);
      toast({ title: "Fallo al Mejorar con IA", description: "No se pudo mejorar la actividad.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(activity.id, { [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    onUpdate(activity.id, { type: value as POAActivity['type'] });
  };

  return (
    <Card 
      className={`mb-4 p-1 bg-card shadow-md border rounded-lg transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          {onDragStart && (
             <button type="button" className="cursor-grab p-1 text-muted-foreground hover:text-foreground" title="Arrastrar para reordenar">
                <GripVertical className="h-5 w-5 mt-1" />
             </button>
          )}
          <div className="flex-grow space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start">
                <div className="sm:col-span-2">
                    <Label htmlFor={`activity-number-${activity.id}`}>Número/ID de Actividad</Label>
                    <Input
                        id={`activity-number-${activity.id}`}
                        name="number"
                        value={activity.number}
                        onChange={handleInputChange}
                        placeholder="Ej., 1.1, A.2"
                        className="mt-1 w-full sm:w-40"
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
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`activity-type-${activity.id}`}>Tipo</Label>
              <Select value={activity.type} onValueChange={handleTypeChange}>
                <SelectTrigger id={`activity-type-${activity.id}`} className="w-full sm:w-[180px] mt-1">
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
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  Punto de Decisión: Define resultados (ej., rutas Sí/No) usando sub-actividades o enlaces.
                  (UI detallada de ramificación por implementar)
                </p>
              </div>
            )}
            {activity.type === 'alternatives' && (
              <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  Rutas Alternativas: Define diferentes opciones y sus pasos subsecuentes.
                  (UI detallada de ramificación por implementar)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!activity.description && activity.description.length > 5}
            className="text-xs px-2 py-1"
          />
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
