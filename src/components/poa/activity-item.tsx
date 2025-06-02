
"use client";

import type { POAActivity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, GripVertical, Wand2, PlusCircle, ChevronDown, ChevronRight, Sparkles, Expand, Undo2 } from "lucide-react";
import { AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateActivityName } from "@/ai/flows/generate-activity-name";
import { useState } from "react";
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
  const [isLoadingAiEnhanceDesc, setIsLoadingAiEnhanceDesc] = useState(false);
  const [isLoadingAiExpandDesc, setIsLoadingAiExpandDesc] = useState(false);
  const [descriptionBeforeAi, setDescriptionBeforeAi] = useState<string | null>(null);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [nameBeforeAi, setNameBeforeAi] = useState<string | null>(null);
  const { toast } = useToast();
  const { 
    addActivity, 
    addAlternativeBranch, 
    removeAlternativeBranch, 
    getChildActivities,
    expandedActivityIds,
    toggleActivityExpansion,
    poa, 
  } = usePOA(); 
  
  const isExpanded = expandedActivityIds.has(activity.id);

  const yesChildren = activity.nextActivityType === 'decision' ? getChildActivities(activity.id, 'yes') : [];
  const noChildren = activity.nextActivityType === 'decision' ? getChildActivities(activity.id, 'no') : [];
  const alternativeChildren = (branchId: string) => activity.nextActivityType === 'alternatives' && activity.alternativeBranches ? getChildActivities(activity.id, branchId) : [];


  const handleAiEnhanceDescription = async () => {
    if (!activity.description) return;
    setDescriptionBeforeAi(activity.description);
    setIsLoadingAiEnhanceDesc(true);
    try {
      const result = await enhanceText({ text: activity.description, context: "activity_description" });
      onUpdate(activity.id, { description: result.enhancedText });
      toast({ title: "Descripción Editada con IA", description: "La descripción de la actividad ha sido editada por IA." });
    } catch (error) {
      console.error("Error editando descripción con IA:", error);
      toast({ title: "Fallo en Edición de Descripción", description: "No se pudo editar la descripción.", variant: "destructive" });
      setDescriptionBeforeAi(null); 
    }
    setIsLoadingAiEnhanceDesc(false);
  };
  
  const handleAiExpandDescription = async () => {
    if (!activity.description) return;
    setDescriptionBeforeAi(activity.description);
    setIsLoadingAiExpandDesc(true);
    try {
      const currentWords = activity.description.split(/\s+/).filter(Boolean).length;
      const targetMaxWords = Math.max(20, Math.round(currentWords * 1.5)); 

      const result = await enhanceText({ 
        text: activity.description, 
        context: "activity_description", 
        expandByPercent: 50,
        maxWords: targetMaxWords
      });
      onUpdate(activity.id, { description: result.enhancedText });
      toast({ title: "Descripción Ampliada con IA", description: "La descripción de la actividad ha sido ampliada por IA." });
    } catch (error) {
      console.error("Error ampliando descripción con IA:", error);
      toast({ title: "Fallo en Ampliación de Descripción", description: "No se pudo ampliar la descripción.", variant: "destructive" });
      setDescriptionBeforeAi(null); 
    }
    setIsLoadingAiExpandDesc(false);
  };

  const handleUndoDescriptionAi = () => {
    if (descriptionBeforeAi !== null) {
      onUpdate(activity.id, { description: descriptionBeforeAi });
      toast({ title: "Acción Deshecha", description: "Se restauró la descripción anterior." });
      setDescriptionBeforeAi(null);
    }
  };
  
  const handleGenerateName = async () => {
    if (!activity.description) {
        toast({
            title: "Descripción Requerida",
            description: "Por favor, ingresa una descripción para la actividad antes de generar un nombre.",
            variant: "destructive",
        });
        return;
    }
    setNameBeforeAi(activity.activityName || "");
    setIsGeneratingName(true);
    try {
        const result = await generateActivityName({ description: activity.description });
        onUpdate(activity.id, { activityName: result.activityName });
        toast({ title: "Nombre de Actividad Generado", description: "Se ha generado un nombre para la actividad." });
    } catch (error) {
        console.error("Error generando nombre de actividad:", error);
        toast({ title: "Fallo al Generar Nombre", description: "No se pudo generar el nombre de la actividad.", variant: "destructive" });
    }
    setIsGeneratingName(false);
  };

  const handleUndoNameAi = () => {
    if (nameBeforeAi !== null) {
        onUpdate(activity.id, { activityName: nameBeforeAi });
        toast({ title: "Acción Deshecha", description: "Se restauró el nombre anterior de la actividad." });
        setNameBeforeAi(null);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate(activity.id, { [name]: value });
    if (name === "description") {
      setDescriptionBeforeAi(null);
    }
    if (name === "activityName") {
      setNameBeforeAi(null);
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || /^[0-9]+$/.test(value)) {
      onUpdate(activity.id, { [name]: value });
    }
  };


  const handleNextActivityTypeChange = (value: string) => {
    const newType = value as POAActivity['nextActivityType'];
    const updates: Partial<POAActivity> = { nextActivityType: newType };

    if (newType === 'individual') {
        updates.nextIndividualActivityRef = activity.nextIndividualActivityRef || ''; 
        if ((!activity.nextIndividualActivityRef || activity.nextIndividualActivityRef.trim() === '') && activity.userNumber && /^\d+$/.test(activity.userNumber)) {
           const currentUserNumber = parseInt(activity.userNumber, 10);
           if(!isNaN(currentUserNumber) && currentUserNumber > 0) {
             updates.nextIndividualActivityRef = (currentUserNumber + 1).toString();
           }
        } else if (!activity.nextIndividualActivityRef || activity.nextIndividualActivityRef.trim() === ''){
             updates.nextIndividualActivityRef = '';
        }
    } else if (newType === 'decision') {
        updates.nextIndividualActivityRef = ''; 
        if (!activity.decisionBranches || (!activity.decisionBranches.yesLabel && !activity.decisionBranches.noLabel)) {
          updates.decisionBranches = { yesLabel: '', noLabel: '' };
        }
    } else if (newType === 'alternatives') {
        updates.nextIndividualActivityRef = ''; 
        if (!activity.alternativeBranches || activity.alternativeBranches.length === 0) { 
            updates.alternativeBranches = [{ id: crypto.randomUUID(), label: 'Alternativa 1' }];
        }
    }
    onUpdate(activity.id, updates);
  };

  const handleAlternativeBranchLabelChange = (branchIndex: number, value: string) => {
     if (activity.alternativeBranches) {
        const newAlternativeBranches = activity.alternativeBranches.map((branch, i) =>
            i === branchIndex ? { ...branch, label: value } : branch
        );
        onUpdate(activity.id, { alternativeBranches: newAlternativeBranches });
     }
  };


  const handleAddSubActivity = (parentBranchCondition: string) => {
    if (!poa) {
      toast({
        title: "Error de Carga",
        description: "Los datos del POA no están disponibles. Intenta recargar.",
        variant: "destructive",
      });
      return;
    }

    const currentParentActivityFromContext = poa.activities.find(a => a.id === activity.id);

    if (!currentParentActivityFromContext) {
      toast({
        title: "Error",
        description: `No se pudo encontrar la actividad padre (ID: ${activity.id.substring(0,4)}) para validación.`,
        variant: "destructive",
      });
      return;
    }
    
    const siblingActivitiesInBranch = getChildActivities(activity.id, parentBranchCondition);
    let activityToValidateId: string | undefined = undefined;
    let validationMessageContext = "";

    if (siblingActivitiesInBranch.length > 0) {
      activityToValidateId = siblingActivitiesInBranch[siblingActivitiesInBranch.length - 1].id;
      const branchLabelForMessage = currentParentActivityFromContext.nextActivityType === 'decision' 
                                      ? parentBranchCondition 
                                      : currentParentActivityFromContext.alternativeBranches?.find(b => b.id === parentBranchCondition)?.label || parentBranchCondition;
      validationMessageContext = `la última sub-actividad en la rama "${branchLabelForMessage}"`;
    } else { 
      activityToValidateId = currentParentActivityFromContext.id;
      validationMessageContext = `la actividad padre (No. ${currentParentActivityFromContext.userNumber || currentParentActivityFromContext.systemNumber})`;
    }
    
    const definitiveActivityToValidate = poa.activities.find(a => a.id === activityToValidateId);

    if (definitiveActivityToValidate && (!definitiveActivityToValidate.responsible || !definitiveActivityToValidate.description)) {
      toast({
        title: "Campos Incompletos",
        description: `Por favor, completa los campos 'Responsable' y 'Descripción' de ${validationMessageContext} antes de añadir una nueva actividad a esta rama.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    addActivity({ parentId: activity.id, parentBranchCondition });
  };


  return (
    <Card
      className={`w-full mb-2 p-0.5 bg-card shadow-sm border rounded-md transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'} ${isSubActivity ? 'ml-4 border-l-2 border-primary/30' : ''}`}
      draggable={!!onDragStart && !isSubActivity}
      onDragStart={(e) => !isSubActivity && index !== undefined && onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => !isSubActivity && index !== undefined && onDrop?.(e, index)}
    >
      <CardContent className="p-2 space-y-1.5">
        <div className="flex items-start gap-1.5">
          {!isSubActivity && onDragStart && (
             <button type="button" className="cursor-grab p-1 text-muted-foreground hover:text-foreground" title="Arrastrar para reordenar">
                <GripVertical className="h-4 w-4 mt-1" /> 
             </button>
          )}
           <button type="button" onClick={() => toggleActivityExpansion(activity.id)} className="p-1 text-muted-foreground hover:text-foreground mt-0.5" title={isExpanded ? "Colapsar" : "Expandir"}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex-grow space-y-1.5">
            <div className="flex items-center gap-2 mb-1"> {/* Changed items-baseline to items-center and gap-1 to gap-2 */}
                <span className="text-base font-semibold text-primary mr-1">No.</span>
                <Input
                    id={`activity-userNumber-${activity.id}`}
                    name="userNumber"
                    value={activity.userNumber || ""}
                    readOnly
                    placeholder="Auto"
                    className="w-10 text-base font-semibold text-primary bg-card border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 read-only:cursor-default text-center"
                />
                 <div className="flex-grow">
                    <Input
                        id={`activity-name-${activity.id}`}
                        name="activityName"
                        value={activity.activityName || ""}
                        onChange={handleInputChange}
                        placeholder="Nombre corto de actividad (Opcional)"
                        className="w-full text-sm h-8 font-medium"
                    />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon" 
                  onClick={() => onDelete(activity.id)}
                  className="text-destructive hover:bg-destructive/10 h-7 w-7" 
                  title="Eliminar actividad"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                 <AiEnhanceButton
                    onClick={handleGenerateName}
                    isLoading={isGeneratingName}
                    textExists={!!activity.description && activity.description.length > 0}
                    className="text-xs px-1 py-0.5 h-7"
                    onUndo={nameBeforeAi !== null ? handleUndoNameAi : undefined}
                    canUndo={nameBeforeAi !== null}
                >
                    <Sparkles className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">{isGeneratingName ? "Generando..." : "Generar"}</span>
                    <span className="sm:hidden">{isGeneratingName ? "..." : "AI"}</span>
                </AiEnhanceButton>
            </div>

             {isExpanded && (
              <>
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
                    value={activity.description || ""}
                    onChange={handleInputChange}
                    placeholder="Describe la actividad o tarea"
                    rows={2}
                    className="mt-0.5 w-full min-h-[50px] text-xs"
                  />
                   <div className="mt-1.5 flex flex-wrap gap-2">
                        <AiEnhanceButton
                            onClick={handleAiEnhanceDescription}
                            isLoading={isLoadingAiEnhanceDesc}
                            textExists={!!activity.description && activity.description.length > 5}
                            className="text-xs px-1.5 py-0.5 h-7"
                            onUndo={descriptionBeforeAi !== null && !isLoadingAiExpandDesc ? handleUndoDescriptionAi : undefined}
                            canUndo={descriptionBeforeAi !== null && !isLoadingAiExpandDesc}
                        >
                            <Wand2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">{isLoadingAiEnhanceDesc ? "Editando..." : "Edición IA"}</span>
                            <span className="sm:hidden">{isLoadingAiEnhanceDesc ? "..." : "IA"}</span>
                        </AiEnhanceButton>
                        <AiEnhanceButton
                            onClick={handleAiExpandDescription}
                            isLoading={isLoadingAiExpandDesc}
                            textExists={!!activity.description && activity.description.length > 5}
                            className="text-xs px-1.5 py-0.5 h-7"
                            onUndo={descriptionBeforeAi !== null && !isLoadingAiEnhanceDesc ? handleUndoDescriptionAi : undefined}
                            canUndo={descriptionBeforeAi !== null && !isLoadingAiEnhanceDesc}
                        >
                            <Expand className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">{isLoadingAiExpandDesc ? "Ampliando..." : "Ampliar IA"}</span>
                            <span className="sm:hidden">{isLoadingAiExpandDesc ? "..." : "Ampliar"}</span>
                        </AiEnhanceButton>
                    </div>
                </div>

                <div>
                  <Label htmlFor={`activity-nextActivityType-${activity.id}`}>Siguiente Actividad Tipo</Label>
                  <RadioGroup
                    id={`activity-nextActivityType-${activity.id}`}
                    value={activity.nextActivityType || 'individual'}
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
                    <div className="mt-1">
                        <Input
                            id={`activity-nextIndividualActivityRef-${activity.id}`}
                            name="nextIndividualActivityRef"
                            value={activity.nextIndividualActivityRef || ""}
                            onChange={handleInputChange}
                            placeholder="Siguiente Actividad No. (Número Entero o FIN o No Aplica)"
                            className="mt-0.5 w-full text-xs"
                        />
                    </div>
                )}
              </>
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
                    value={activity.decisionBranches?.yesLabel ?? ''}
                    onChange={(e) => {
                        const newDecisionBranches = {
                          ...(activity.decisionBranches || { yesLabel: '', noLabel: '' }),
                          yesLabel: e.target.value,
                        };
                        onUpdate(activity.id, { decisionBranches: newDecisionBranches });
                    }}
                    placeholder="Ej: Sí o Opción positiva"
                    className="w-full text-xs h-8"
                  />
                  <div className="ml-2 space-y-1.5">
                    {yesChildren.map((child, childIndex) => (
                      <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity('yes')} className="text-xs h-7 px-2 py-1 border-green-600 text-green-700 hover:bg-green-100">
                    <PlusCircle className="mr-1 h-3 w-3" /> Agregar Actividad - Sí
                  </Button>
                </div>

                <div className="p-2 border-l-2 border-red-500 bg-red-50/50 rounded-r-md space-y-1.5">
                   <div className="flex justify-between items-center">
                    <Label htmlFor={`decision-noLabel-${activity.id}`} className="text-xs text-red-700 font-medium">Etiqueta Rama No</Label>
                   </div>
                  <Input
                    id={`decision-noLabel-${activity.id}`}
                    value={activity.decisionBranches?.noLabel ?? ''}
                     onChange={(e) => {
                        const newDecisionBranches = {
                          ...(activity.decisionBranches || { yesLabel: '', noLabel: '' }),
                          noLabel: e.target.value,
                        };
                        onUpdate(activity.id, { decisionBranches: newDecisionBranches });
                    }}
                    placeholder="Ej: No o Opción negativa"
                    className="w-full text-xs h-8"
                  />
                  <div className="ml-2 space-y-1.5">
                    {noChildren.map((child, childIndex) => (
                      <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity('no')} className="text-xs h-7 px-2 py-1 border-red-600 text-red-700 hover:bg-red-100">
                    <PlusCircle className="mr-1 h-3 w-3" /> Agregar Actividad - No
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
                      {alternativeChildren(branch.id).map((child, childIndex) => (
                         <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity />
                      ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity(branch.id)} className="text-xs h-7 px-2 py-1 border-blue-600 text-blue-700 hover:bg-blue-100">
                        <PlusCircle className="mr-1 h-3 w-3" /> Agregar Actividad - Alternativa
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
             <div className="flex justify-between items-center mt-1 mb-0.5 pt-1.5 border-t"> {/* Added border-t and padding-top */}
                <span className="text-xs text-muted-foreground">
                    Sistema: {activity.systemNumber}
                </span>
                {/* The delete button was here, it has been moved up */}
            </div>
          </>
        )}
        
        {/* The old position of the delete button, now removed from here if it was expanded */}
        {/*
        <div className="flex justify-end items-center pt-1.5 border-t mt-0.5"> 
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
        */}
      </CardContent>
    </Card>
  );
}
