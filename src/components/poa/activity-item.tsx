
"use client";

import type { POAActivity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, GripVertical, Wand2, PlusCircle, ChevronDown, ChevronRight } from "lucide-react";
import { AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { usePOA } from "@/hooks/use-poa";


interface ActivityItemProps {
  activity: POAActivity;
  onUpdate: (id: string, updates: Partial<POAActivity>) => void;
  onDelete: (id: string) => void;
  index?: number;
  totalActivities?: number;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => void;
  isDragging?: boolean;
  isSubActivity?: boolean;
}

export function ActivityItem({
  activity,
  onUpdate,
  onDelete,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isSubActivity = false,
}: ActivityItemProps) {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [descriptionBeforeAi, setDescriptionBeforeAi] = useState<string | null>(null);
  const { toast } = useToast();
  const { addActivity, updateActivityBranchLabel, addAlternativeBranch, removeAlternativeBranch, getChildActivities } = usePOA();
  const [isExpanded, setIsExpanded] = useState(true);

  const yesChildren = activity.nextActivityType === 'decision' ? getChildActivities(activity.id, 'yes') : [];
  const noChildren = activity.nextActivityType === 'decision' ? getChildActivities(activity.id, 'no') : [];
  const alternativeChildren = (branchId: string) => activity.nextActivityType === 'alternatives' ? getChildActivities(activity.id, branchId) : [];


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
    const { name, value } = e.target;
    onUpdate(activity.id, { [name]: value });
    if (name === "description") {
      setDescriptionBeforeAi(null); 
    }
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow empty string for clearing the input, or a valid number
    if (value === "" || /^\d+$/.test(value)) {
      onUpdate(activity.id, { [name]: value });
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
    if (newType !== 'individual') {
        updates.nextIndividualActivityRef = undefined; // Clear if not individual
    } else if (newType === 'individual' && activity.nextIndividualActivityRef === undefined) {
        updates.nextIndividualActivityRef = 'No Aplica'; // Set default if switching to individual
    }
    onUpdate(activity.id, updates);
  };

  const handleDecisionBranchLabelChange = (branch: 'yes' | 'no', value: string) => {
    // Directly update the activity via onUpdate for simplicity with nested structure
    const newDecisionBranches = { ...(activity.decisionBranches || { yesLabel: 'Sí', noLabel: 'No' }) };
    if (branch === 'yes') {
      newDecisionBranches.yesLabel = value;
    } else {
      newDecisionBranches.noLabel = value;
    }
    onUpdate(activity.id, { decisionBranches: newDecisionBranches });
  };

  const handleAlternativeBranchLabelChange = (branchIndex: number, value: string) => {
     const newAlternativeBranches = (activity.alternativeBranches || []).map((branch, i) =>
        i === branchIndex ? { ...branch, label: value } : branch
      );
    onUpdate(activity.id, { alternativeBranches: newAlternativeBranches });
  };


  const handleAddSubActivity = (parentBranchCondition: string) => {
    addActivity({ parentId: activity.id, parentBranchCondition });
  };

  return (
    <Card
      className={`w-full mb-2 p-0.5 bg-card shadow-sm border rounded-md transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'} ${isSubActivity ? 'ml-4 border-l-2 border-primary/30' : ''}`}
      draggable={!!onDragStart && !isSubActivity}
      onDragStart={(e) => !isSubActivity && onDragStart?.(e, index!)}
      onDragOver={onDragOver}
      onDrop={(e) => !isSubActivity && onDrop?.(e, index!)}
    >
      <CardContent className="p-2 space-y-2">
        <div className="flex items-start gap-1.5">
          {!isSubActivity && onDragStart && (
             <button type="button" className="cursor-grab p-1 text-muted-foreground hover:text-foreground" title="Arrastrar para reordenar">
                <GripVertical className="h-4 w-4 mt-0.5" />
             </button>
          )}
           <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-muted-foreground hover:text-foreground" title={isExpanded ? "Colapsar" : "Expandir"}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex-grow space-y-1.5">
            {isExpanded && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
                    <div>
                        <Label htmlFor={`activity-systemNumber-${activity.id}`}>No. Sistema</Label>
                        <Input
                            id={`activity-systemNumber-${activity.id}`}
                            name="systemNumber"
                            value={activity.systemNumber}
                            onChange={handleInputChange}
                            placeholder="Ej., 1.1, A.2"
                            className="mt-0.5 w-full text-xs"
                            readOnly // System number should be auto-generated
                        />
                    </div>
                     <div>
                        <Label htmlFor={`activity-userNumber-${activity.id}`}>No. Usuario (Opcional)</Label>
                        <Input
                            id={`activity-userNumber-${activity.id}`}
                            name="userNumber"
                            type="number"
                            value={activity.userNumber || ""}
                            onChange={handleNumberInputChange}
                            placeholder="Ej., 1, 25"
                            className="mt-0.5 w-full text-xs"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor={`activity-responsible-${activity.id}`}>Responsable <span className="text-destructive">*</span></Label>
                    <Input
                        id={`activity-responsible-${activity.id}`}
                        name="responsible"
                        value={activity.responsible || ""}
                        onChange={handleInputChange}
                        placeholder="Ej., Gerente de TI, Líder de Equipo"
                        className="mt-0.5 w-full text-xs"
                    />
                </div>

                <div>
                  <Label htmlFor={`activity-description-${activity.id}`}>Descripción <span className="text-destructive">*</span></Label>
                  <Textarea
                    id={`activity-description-${activity.id}`}
                    name="description"
                    value={activity.description}
                    onChange={handleInputChange}
                    placeholder="Describe la actividad o tarea"
                    rows={2}
                    className="mt-0.5 w-full min-h-[50px] text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor={`activity-nextActivityType-${activity.id}`}>Siguiente Actividad Tipo</Label>
                  <RadioGroup
                    id={`activity-nextActivityType-${activity.id}`}
                    value={activity.nextActivityType}
                    onValueChange={handleNextActivityTypeChange}
                    className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 mt-0.5"
                  >
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="individual" id={`type-individual-${activity.id}`} />
                      <Label htmlFor={`type-individual-${activity.id}`} className="font-normal text-xs">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="decision" id={`type-decision-${activity.id}`} />
                      <Label htmlFor={`type-decision-${activity.id}`} className="font-normal text-xs">Decisión (Sí/No)</Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="alternatives" id={`type-alternatives-${activity.id}`} />
                      <Label htmlFor={`type-alternatives-${activity.id}`} className="font-normal text-xs">Alternativas</Label>
                    </div>
                  </RadioGroup>
                </div>

                {activity.nextActivityType === 'individual' && (
                    <div className="mt-2">
                        <Label htmlFor={`activity-nextIndividualActivityRef-${activity.id}`}>Siguiente Actividad (No. Sistema, FIN, o No Aplica)</Label>
                        <Input
                            id={`activity-nextIndividualActivityRef-${activity.id}`}
                            name="nextIndividualActivityRef"
                            value={activity.nextIndividualActivityRef || "No Aplica"}
                            onChange={handleInputChange}
                            placeholder="Ej: 2.1, FIN, No Aplica"
                            className="mt-0.5 w-full text-xs"
                        />
                    </div>
                )}
              </>
            )}
            {!isExpanded && (
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                        {activity.systemNumber} - {activity.description || "Actividad sin descripción"}
                    </p>
                </div>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <>
            {activity.nextActivityType === 'decision' && (
              <div className="mt-2 space-y-2">
                <div className="p-2 border-l-2 border-green-500 bg-green-50/50 rounded-r-md space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`decision-yesLabel-${activity.id}`} className="text-xs text-green-700 font-medium">Etiqueta Rama Sí</Label>
                  </div>
                  <Input
                    id={`decision-yesLabel-${activity.id}`}
                    value={activity.decisionBranches?.yesLabel || 'Sí'}
                    onChange={(e) => handleDecisionBranchLabelChange('yes', e.target.value)}
                    placeholder="Ej., Sí, continuar"
                    className="w-full text-xs h-8"
                  />
                  <div className="ml-2 space-y-1.5">
                    {yesChildren.map((child) => (
                      <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} isSubActivity />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity('yes')} className="text-xs h-7 px-2 py-1 border-green-600 text-green-700 hover:bg-green-100">
                    <PlusCircle className="mr-1 h-3 w-3" /> Agregar a Rama Sí
                  </Button>
                </div>

                <div className="p-2 border-l-2 border-red-500 bg-red-50/50 rounded-r-md space-y-1.5">
                   <div className="flex justify-between items-center">
                    <Label htmlFor={`decision-noLabel-${activity.id}`} className="text-xs text-red-700 font-medium">Etiqueta Rama No</Label>
                   </div>
                  <Input
                    id={`decision-noLabel-${activity.id}`}
                    value={activity.decisionBranches?.noLabel || 'No'}
                    onChange={(e) => handleDecisionBranchLabelChange('no', e.target.value)}
                    placeholder="Ej., No, finalizar"
                    className="w-full text-xs h-8"
                  />
                  <div className="ml-2 space-y-1.5">
                    {noChildren.map((child) => (
                      <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} isSubActivity />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity('no')} className="text-xs h-7 px-2 py-1 border-red-600 text-red-700 hover:bg-red-100">
                    <PlusCircle className="mr-1 h-3 w-3" /> Agregar a Rama No
                  </Button>
                </div>
              </div>
            )}

            {activity.nextActivityType === 'alternatives' && (
              <div className="p-2 border-l-2 border-blue-500 bg-blue-50/50 rounded-r-md space-y-1.5 mt-2">
                <p className="text-xs text-blue-700 font-medium">
                  Configuración de Alternativas:
                </p>
                {(activity.alternativeBranches || []).map((branch, branchIndex) => (
                  <div key={branch.id || branchIndex} className="p-1.5 border rounded-md bg-background/50 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-grow">
                        <Label htmlFor={`alternative-label-${activity.id}-${branch.id}`} className="text-xs text-blue-600">
                          Etiqueta Alternativa {branchIndex + 1}
                        </Label>
                        <Input
                          id={`alternative-label-${activity.id}-${branch.id}`}
                          value={branch.label || ''}
                          onChange={(e) => handleAlternativeBranchLabelChange(branchIndex, e.target.value)}
                          placeholder={`Ej., Opción ${branchIndex + 1}`}
                          className="mt-0.5 w-full text-xs h-8"
                        />
                      </div>
                      {(activity.alternativeBranches || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAlternativeBranch(activity.id, branch.id)}
                          className="text-destructive hover:bg-destructive/10 self-end h-7 w-7"
                          title="Eliminar alternativa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="ml-2 space-y-1.5">
                      {alternativeChildren(branch.id).map((child) => (
                         <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} isSubActivity />
                      ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity(branch.id)} className="text-xs h-7 px-2 py-1 border-blue-600 text-blue-700 hover:bg-blue-100">
                        <PlusCircle className="mr-1 h-3 w-3" /> Agregar a Alternativa
                     </Button>
                  </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAlternativeBranch(activity.id)}
                    className="mt-1 text-xs h-7 px-2 py-1"
                  >
                  <PlusCircle className="mr-1 h-3 w-3" /> Añadir Otra Alternativa
                </Button>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center pt-1.5 border-t mt-1.5">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!activity.description && activity.description.length > 5}
            className="text-xs px-1.5 py-0.5 h-7"
            onUndo={descriptionBeforeAi !== null ? handleUndoAi : undefined}
            canUndo={descriptionBeforeAi !== null}
          >
             <Wand2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{isLoadingAi ? "Editando..." : "Edición IA"}</span>
            <span className="sm:hidden">{isLoadingAi ? "..." : "IA"}</span>
          </AiEnhanceButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity.id)}
            className="text-destructive hover:bg-destructive/10 text-xs h-7 px-1.5 py-0.5"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
