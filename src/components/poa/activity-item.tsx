"use client";

import type { POAActivity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, GripVertical, Wand2, PlusCircle, ChevronDown, ChevronRight, Sparkles, Expand } from "lucide-react";
import { AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateActivityName } from "@/ai/flows/generate-activity-name";
import React, { useState, useEffect, useRef } from "react"; 
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { usePOA } from "@/hooks/use-poa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  isLastActivity?: boolean; // New prop
  isLocked?: boolean; // New prop
}

export const ActivityItem = React.forwardRef<HTMLDivElement, ActivityItemProps>(
  ({
  activity,
  onUpdate,
  onDelete,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isSubActivity = false,
  isLastActivity = false,
  isLocked = false,
}, ref) => { 
  const [isLoadingAiEnhanceDesc, setIsLoadingAiEnhanceDesc] = useState(false);
  const [isLoadingAiExpandDesc, setIsLoadingAiExpandDesc] = useState(false);
  const [descriptionBeforeAi, setDescriptionBeforeAi] = useState<string | null>(null);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [nameBeforeAi, setNameBeforeAi] = useState<string | null>(null);
  const [showEndProcessDialog, setShowEndProcessDialog] = useState(false);
  const { toast } = useToast();
  const { 
    addActivity, 
    addAlternativeBranch, 
    removeAlternativeBranch, 
    getChildActivities,
    expandedActivityIds,
    toggleActivityExpansion,
    poa,
    scrollToActivityId, 
    setScrollToActivityId, 
  } = usePOA(); 
  
  const isExpanded = expandedActivityIds.has(activity.id);
  const itemScrollRef = useRef<HTMLDivElement>(null); 
  const isSummaryEnabled =
    Boolean(activity.responsible?.trim()) &&
    Boolean(activity.description?.trim());

  useEffect(() => {
    if (activity.id === scrollToActivityId && itemScrollRef.current) {
      itemScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setScrollToActivityId(null); 
    }
  }, [activity.id, scrollToActivityId, setScrollToActivityId]);

  const handleCardRef = (instance: HTMLDivElement | null) => {
    (itemScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = instance;
    if (typeof ref === 'function') {
      ref(instance);
    } else if (ref) {
      ref.current = instance;
    }
  };


  const yesChildren = activity.nextActivityType === 'decision' ? getChildActivities(activity.id, 'yes') : [];
  const noChildren = activity.nextActivityType === 'decision' ? getChildActivities(activity.id, 'no') : [];
  const alternativeChildren = (branchId: string) => activity.nextActivityType === 'alternatives' && activity.alternativeBranches ? getChildActivities(activity.id, branchId) : [];


  const handleAiEnhanceDescription = async () => {
    if (!activity.description || isLocked) return;
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
    if (!activity.description || isLocked) return;
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
    if (descriptionBeforeAi !== null && !isLocked) {
      onUpdate(activity.id, { description: descriptionBeforeAi });
      toast({ title: "Acción Deshecha", description: "Se restauró la descripción anterior." });
      setDescriptionBeforeAi(null);
    }
  };
  
  const handleGenerateName = async () => {
    if (isLocked) return;
    if (!activity.responsible?.trim() || !activity.description?.trim()) {
        toast({
            title: "Información Incompleta",
            description: "Registra un responsable y una descripción antes de generar un nombre.",
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
    if (nameBeforeAi !== null && !isLocked) {
        onUpdate(activity.id, { activityName: nameBeforeAi });
        toast({ title: "Acción Deshecha", description: "Se restauró el nombre anterior de la actividad." });
        setNameBeforeAi(null);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isLocked) return;
    const { name, value } = e.target;
    onUpdate(activity.id, { [name]: value });
    if (name === "description") {
      setDescriptionBeforeAi(null);
    }
    if (name === "activityName") {
      setNameBeforeAi(null);
    }
  };

  const confirmProcessEnd = () => {
      setShowEndProcessDialog(false);
      // The actual update is done here after confirmation
       const updates: Partial<POAActivity> = { 
        nextActivityType: 'process_end',
        nextIndividualActivityRef: '',
        decisionBranches: undefined,
        alternativeBranches: undefined
      };
      onUpdate(activity.id, updates);
  };

  const handleNextActivityTypeChange = (value: string) => {
    if (isLocked) return;
    
    if (value === 'process_end') {
        setShowEndProcessDialog(true);
        return;
    }

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
    } else if (newType === 'alternative_end') {
        updates.nextIndividualActivityRef = '';
        updates.decisionBranches = undefined;
        updates.alternativeBranches = undefined;
    }
    
    onUpdate(activity.id, updates);
  };

  const handleAlternativeBranchLabelChange = (branchIndex: number, value: string) => {
     if (activity.alternativeBranches && !isLocked) {
        const newAlternativeBranches = activity.alternativeBranches.map((branch, i) =>
            i === branchIndex ? { ...branch, label: value } : branch
        );
        onUpdate(activity.id, { alternativeBranches: newAlternativeBranches });
     }
  };


  const handleAddSubActivity = (parentBranchCondition: string) => {
    if (isLocked) return;
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
    <>
    <Card
      ref={handleCardRef} 
      className={`w-full mb-2 p-0.5 bg-card shadow-sm border rounded-md transition-opacity 
        ${isDragging ? 'opacity-50' : 'opacity-100'} 
        ${isSubActivity ? 'ml-4 border-l-2 border-primary/30' : ''}
        ${isLocked ? 'opacity-80 pointer-events-none' : ''}
      `}
      draggable={!!onDragStart && !isSubActivity && !isLocked}
      onDragStart={(e) => !isSubActivity && !isLocked && index !== undefined && onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => !isSubActivity && !isLocked && index !== undefined && onDrop?.(e, index)}
    >
      <CardContent className="p-2 space-y-1.5">
        <div className="flex items-start gap-1.5">
          {!isSubActivity && onDragStart && (
             <button type="button" className={`cursor-grab p-1 text-muted-foreground hover:text-foreground ${isLocked ? 'invisible' : ''}`} title="Arrastrar para reordenar">
                <GripVertical className="h-4 w-4 mt-1" /> 
             </button>
          )}
           <button type="button" onClick={() => toggleActivityExpansion(activity.id)} className="p-1 text-muted-foreground hover:text-foreground mt-0.5 pointer-events-auto" title={isExpanded ? "Colapsar" : "Expandir"}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex-grow space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-primary mr-1">No.</span>
                <Input
                    id={`activity-userNumber-${activity.id}`}
                    name="userNumber"
                    value={activity.userNumber || ""}
                    readOnly
                    placeholder="Auto"
                    className="w-10 text-base font-semibold text-primary bg-card border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 read-only:cursor-default text-center"
                    disabled={isLocked}
                />
                <div className="flex-grow">
                  {isSummaryEnabled ? (
                    <Input
                      id={`activity-name-${activity.id}`}
                      name="activityName"
                      value={activity.activityName || ""}
                      onChange={handleInputChange}
                      placeholder="Nombre corto de actividad (Opcional)"
                      className="w-full text-sm h-8 font-medium"
                      disabled={isLocked}
                    />
                  ) : (
                    <div className="text-xs italic text-muted-foreground">
                      Completa la información del responsable y la descripción de la actividad para agregar el titúlo de la actividad.
                    </div>
                  )}
                </div>
                {!isLocked && (
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
                )}
                {isSummaryEnabled && !isLocked && (
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
                )}
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
                        disabled={isLocked}
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
                    disabled={isLocked}
                  />
                   <div className="mt-1.5 flex flex-wrap gap-2">
                       {!isLocked && (
                        <>
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
                        </>
                       )}
                    </div>
                </div>

                <div>
                  <Label htmlFor={`activity-nextActivityType-${activity.id}`}>Siguiente Actividad Tipo</Label>
                  <RadioGroup
                    id={`activity-nextActivityType-${activity.id}`}
                    value={activity.nextActivityType || 'individual'}
                    onValueChange={handleNextActivityTypeChange}
                    className="flex flex-col mt-0.5 gap-1.5"
                    disabled={isLocked}
                  >
                    <div className="flex flex-wrap gap-3">
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
                        
                        <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="alternative_end" id={`type-alternative_end-${activity.id}`} />
                        <Label htmlFor={`type-alternative_end-${activity.id}`} className="font-normal text-xs">Fin Alternativo</Label>
                        </div>

                        {(isLastActivity || activity.nextActivityType === 'process_end') && (
                            <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="process_end" id={`type-process_end-${activity.id}`} />
                            <Label htmlFor={`type-process_end-${activity.id}`} className="font-normal text-xs">Fin del Procedimiento</Label>
                            </div>
                        )}
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
                            disabled={isLocked}
                        />
                    </div>
                )}

                {activity.nextActivityType === 'alternative_end' && (
                    <div className="mt-2 p-2 border border-yellow-200 bg-yellow-50 rounded-md">
                        <p className="text-xs text-yellow-800">
                            Esta actividad marca un fin alternativo o una salida del flujo principal. 
                        </p>
                    </div>
                )}

                {activity.nextActivityType === 'process_end' && (
                     <div className="mt-2 p-2 border border-green-200 bg-green-50 rounded-md">
                        <p className="text-xs text-green-800 font-medium">
                            Fin del procedimiento (Cerrado)
                        </p>
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
                    disabled={isLocked}
                  />
                  <div className="ml-2 space-y-1.5">
                    {yesChildren.map((child, childIndex) => (
                      <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity isLocked={isLocked} />
                    ))}
                  </div>
                  {!isLocked && (
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity('yes')} className="text-xs h-7 px-2 py-1 border-green-600 text-green-700 hover:bg-green-100">
                    <PlusCircle className="mr-1 h-3 w-3" /> Agregar Actividad - Sí
                  </Button>
                  )}
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
                    disabled={isLocked}
                  />
                  <div className="ml-2 space-y-1.5">
                    {noChildren.map((child, childIndex) => (
                      <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity isLocked={isLocked} />
                    ))}
                  </div>
                  {!isLocked && (
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity('no')} className="text-xs h-7 px-2 py-1 border-red-600 text-red-700 hover:bg-red-100">
                    <PlusCircle className="mr-1 h-3 w-3" /> Agregar Actividad - No
                  </Button>
                  )}
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
                          disabled={isLocked}
                        />
                      </div>
                      {(activity.alternativeBranches || []).length > 1 && !isLocked && (
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
                         <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity isLocked={isLocked} />
                      ))}
                    </div>
                     {!isLocked && (
                     <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubActivity(branch.id)} className="text-xs h-7 px-2 py-1 border-blue-600 text-blue-700 hover:bg-blue-100">
                        <PlusCircle className="mr-1 h-3 w-3" /> Agregar Actividad - Alternativa
                     </Button>
                     )}
                  </div>
                ))}
                {!isLocked && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAlternativeBranch(activity.id)}
                    className="mt-1 text-xs h-7 px-2 py-1"
                  >
                  <PlusCircle className="mr-1 h-3 w-3" /> Añadir Otra Alternativa
                </Button>
                )}
              </div>
            )}
             <div className="flex justify-between items-center mt-1 mb-0.5 pt-1.5 border-t">
                <span className="text-xs text-muted-foreground">
                    Sistema: {activity.systemNumber}
                </span>
            </div>
          </>
        )}
        
      </CardContent>
    </Card>

    <AlertDialog open={showEndProcessDialog} onOpenChange={setShowEndProcessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar Fin del Procedimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Al confirmar esta acción, la sección de Actividades quedará cerrada y ya no permitirá cambios adicionales. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmProcessEnd}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
ActivityItem.displayName = 'ActivityItem';
