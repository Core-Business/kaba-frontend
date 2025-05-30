
"use client";

import type { POAActivity, POAActivityAlternativeBranch } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, GripVertical, Wand2, PlusCircle } from "lucide-react";
import { AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { usePOA } from "@/hooks/use-poa";


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
  const { updateActivityBranchLabel, addAlternativeBranch, removeAlternativeBranch } = usePOA();


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

  const handleNextActivityTypeChange = (value: string) => {
    const newType = value as POAActivity['nextActivityType'];
    const updates: Partial<POAActivity> = { nextActivityType: newType };
    if (newType === 'decision' && !activity.decisionBranches) {
      updates.decisionBranches = { yesLabel: 'Sí', noLabel: 'No' };
    }
    if (newType === 'alternatives' && (!activity.alternativeBranches || activity.alternativeBranches.length === 0)) {
      updates.alternativeBranches = [{ id: crypto.randomUUID(), label: 'Alternativa 1' }];
    }
    onUpdate(activity.id, updates);
  };

  const handleDecisionBranchLabelChange = (branch: 'yes' | 'no', value: string) => {
    updateActivityBranchLabel(activity.id, 'decision', branch, value);
  };

  const handleAlternativeBranchLabelChange = (branchIndex: number, value: string) => {
    updateActivityBranchLabel(activity.id, 'alternative', branchIndex, value);
  };


  return (
    <Card
      className={`w-full mb-3 p-1 bg-card shadow-md border rounded-lg transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start gap-2">
          {onDragStart && (
             <button type="button" className="cursor-grab p-1 text-muted-foreground hover:text-foreground" title="Arrastrar para reordenar">
                <GripVertical className="h-5 w-5 mt-1" />
             </button>
          )}
          <div className="flex-grow space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                    <Label htmlFor={`activity-systemNumber-${activity.id}`}>No. Sistema</Label>
                    <Input
                        id={`activity-systemNumber-${activity.id}`}
                        name="systemNumber"
                        value={activity.systemNumber}
                        onChange={handleInputChange}
                        placeholder="Ej., 1.1, A.2"
                        className="mt-1 w-full"
                    />
                </div>
                 <div>
                    <Label htmlFor={`activity-userNumber-${activity.id}`}>No. Usuario (Opcional)</Label>
                    <Input
                        id={`activity-userNumber-${activity.id}`}
                        name="userNumber"
                        value={activity.userNumber || ""}
                        onChange={handleInputChange}
                        placeholder="Ej., REF-001"
                        className="mt-1 w-full"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor={`activity-responsible-${activity.id}`}>Responsable (Opcional)</Label>
                <Input
                    id={`activity-responsible-${activity.id}`}
                    name="responsible"
                    value={activity.responsible || ""}
                    onChange={handleInputChange}
                    placeholder="Ej., Gerente de TI, Líder de Equipo"
                    className="mt-1 w-full"
                />
            </div>

            <div>
              <Label htmlFor={`activity-description-${activity.id}`}>Descripción</Label>
              <Textarea
                id={`activity-description-${activity.id}`}
                name="description"
                value={activity.description}
                onChange={handleInputChange}
                placeholder="Describe la actividad o tarea"
                rows={2}
                className="mt-1 w-full min-h-[60px]"
              />
            </div>

            <div>
              <Label htmlFor={`activity-nextActivityType-${activity.id}`}>Siguiente Actividad Tipo</Label>
              <RadioGroup
                id={`activity-nextActivityType-${activity.id}`}
                value={activity.nextActivityType}
                onValueChange={handleNextActivityTypeChange}
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id={`type-individual-${activity.id}`} />
                  <Label htmlFor={`type-individual-${activity.id}`} className="font-normal">Paso Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decision" id={`type-decision-${activity.id}`} />
                  <Label htmlFor={`type-decision-${activity.id}`} className="font-normal">Decisión (Sí/No)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alternatives" id={`type-alternatives-${activity.id}`} />
                  <Label htmlFor={`type-alternatives-${activity.id}`} className="font-normal">Rutas Alternativas</Label>
                </div>
              </RadioGroup>
            </div>

            {activity.nextActivityType === 'decision' && (
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-md space-y-2 mt-2">
                <p className="text-sm text-blue-700 font-medium">
                  Configuración de Ramas de Decisión:
                </p>
                <div>
                  <Label htmlFor={`decision-yesLabel-${activity.id}`} className="text-sm text-blue-600">Etiqueta Rama Sí</Label>
                  <Input
                    id={`decision-yesLabel-${activity.id}`}
                    value={activity.decisionBranches?.yesLabel || 'Sí'}
                    onChange={(e) => handleDecisionBranchLabelChange('yes', e.target.value)}
                    placeholder="Ej., Sí, continuar"
                    className="mt-1 w-full text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor={`decision-noLabel-${activity.id}`} className="text-sm text-blue-600">Etiqueta Rama No</Label>
                  <Input
                    id={`decision-noLabel-${activity.id}`}
                    value={activity.decisionBranches?.noLabel || 'No'}
                    onChange={(e) => handleDecisionBranchLabelChange('no', e.target.value)}
                    placeholder="Ej., No, finalizar"
                    className="mt-1 w-full text-sm"
                  />
                </div>
                 {/* Placeholder for rendering child activities for YES branch */}
                 {/* <div className="mt-2 pl-4 border-l-2 border-green-300"> ... Child activities for YES ... </div> */}
                 {/* Placeholder for rendering child activities for NO branch */}
                 {/* <div className="mt-2 pl-4 border-l-2 border-red-300"> ... Child activities for NO ... </div> */}
              </div>
            )}

            {activity.nextActivityType === 'alternatives' && (
              <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-md space-y-2 mt-2">
                <p className="text-sm text-green-700 font-medium">
                  Configuración de Rutas Alternativas:
                </p>
                {(activity.alternativeBranches || []).map((branch, branchIndex) => (
                  <div key={branch.id || branchIndex} className="flex items-center gap-2">
                    <div className="flex-grow">
                      <Label htmlFor={`alternative-label-${activity.id}-${branch.id}`} className="text-sm text-green-600">
                        Etiqueta Alternativa {branchIndex + 1}
                      </Label>
                      <Input
                        id={`alternative-label-${activity.id}-${branch.id}`}
                        value={branch.label || ''}
                        onChange={(e) => handleAlternativeBranchLabelChange(branchIndex, e.target.value)}
                        placeholder={`Ej., Opción ${branchIndex + 1}`}
                        className="mt-1 w-full text-sm"
                      />
                    </div>
                    {(activity.alternativeBranches || []).length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAlternativeBranch(activity.id, branch.id)}
                        className="text-destructive hover:bg-destructive/10 self-end h-9 w-9"
                        title="Eliminar alternativa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Placeholder for rendering child activities for this alternative */}
                    {/* <div className="mt-2 pl-4 border-l-2 border-gray-300"> ... Child activities for this alt ... </div> */}
                  </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAlternativeBranch(activity.id)}
                    className="mt-2"
                  >
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Alternativa
                </Button>
              </div>
            )}

          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!activity.description && activity.description.length > 5}
            className="text-xs px-2 py-1"
            onUndo={descriptionBeforeAi !== null ? handleUndoAi : undefined}
            canUndo={descriptionBeforeAi !== null}
          >
             <Wand2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{isLoadingAi ? "Editando..." : "Edición con IA"}</span>
            <span className="sm:hidden">{isLoadingAi ? "..." : "IA"}</span>
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
