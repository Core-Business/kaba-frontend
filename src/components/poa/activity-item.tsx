"use client";

import type { POAActivity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, Wand2, PlusCircle, ChevronDown, ChevronRight, Sparkles, Expand } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AiEnhanceButton } from "./common-form-elements";
import { aiApi } from "@/api/ai";
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
      const result = await aiApi.enhanceText({ text: activity.description, context: "activity_description" });
      onUpdate(activity.id, { description: result.enhancedText });
      toast({ title: "Descripción Editada con IA", description: "La descripción de la actividad ha sido editada por IA." });
    } catch (error) {
      console.error("Error editando descripción con IA:", error);
      toast({
        title: "Fallo en Edición de Descripción",
        description: error instanceof Error ? error.message : "No se pudo editar la descripción.",
        variant: "destructive"
      });
      setDescriptionBeforeAi(null);
    } finally {
      setIsLoadingAiEnhanceDesc(false);
    }
  };
  
  const handleAiExpandDescription = async () => {
    if (!activity.description || isLocked) return;
    setDescriptionBeforeAi(activity.description);
    setIsLoadingAiExpandDesc(true);
    try {
      const currentWords = activity.description.split(/\s+/).filter(Boolean).length;
      const targetMaxWords = Math.max(20, Math.round(currentWords * 1.5));

      const result = await aiApi.enhanceText({
        text: activity.description,
        context: "activity_description",
        expandByPercent: 50,
        maxWords: targetMaxWords
      });
      onUpdate(activity.id, { description: result.enhancedText });
      toast({ title: "Descripción Ampliada con IA", description: "La descripción de la actividad ha sido ampliada por IA." });
    } catch (error) {
      console.error("Error ampliando descripción con IA:", error);
      toast({
        title: "Fallo en Ampliación de Descripción",
        description: error instanceof Error ? error.message : "No se pudo ampliar la descripción.",
        variant: "destructive"
      });
      setDescriptionBeforeAi(null);
    } finally {
      setIsLoadingAiExpandDesc(false);
    }
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
        const result = await aiApi.generateActivityName({
          activityDescription: activity.description
        });
        onUpdate(activity.id, { activityName: result.activityName });
        toast({ title: "Nombre de Actividad Generado", description: "Se ha generado un nombre para la actividad." });
    } catch (error) {
        console.error("Error generando nombre de actividad:", error);
        toast({
          title: "Fallo al Generar Nombre",
          description: error instanceof Error ? error.message : "No se pudo generar el nombre de la actividad.",
          variant: "destructive"
        });
    } finally {
      setIsGeneratingName(false);
    }
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
      className={cn(
        "w-full transition-all duration-normal border border-gray-200 rounded-xl shadow-none group bg-white",
        isDragging ? 'opacity-50' : 'opacity-100',
        isSubActivity ? 'ml-6 border-l-2 border-l-gray-300' : '',
        isLocked ? 'opacity-80 pointer-events-none' : ''
      )}
      draggable={!!onDragStart && !isSubActivity && !isLocked}
      onDragStart={(e) => !isSubActivity && !isLocked && index !== undefined && onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => !isSubActivity && !isLocked && index !== undefined && onDrop?.(e, index)}
    >
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="flex items-center gap-3 p-3">
          {/* Drag Handle */}
          {!isSubActivity && onDragStart && (
             <div className={cn(
               "cursor-grab p-1 text-muted-foreground/30 hover:text-foreground transition-opacity",
               isLocked ? 'invisible' : 'opacity-0 group-hover:opacity-100'
             )} title="Arrastrar para reordenar">
                <GripVertical className="h-4 w-4" /> 
             </div>
          )}

          {/* Expand/Collapse Toggle */}
           <button 
             type="button" 
             onClick={() => toggleActivityExpansion(activity.id)} 
             className="p-1 text-muted-foreground hover:text-foreground transition-colors"
             title={isExpanded ? "Colapsar" : "Expandir"}
           >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {/* Activity Number Badge */}
          <span className="text-blue-600 font-semibold text-sm min-w-[24px]">
              {activity.userNumber?.padStart(2, '0') || "00"}
          </span>

          {/* Activity Name */}
          <div className="flex-grow min-w-0">
            {isSummaryEnabled ? (
              <Input
                id={`activity-name-${activity.id}`}
                name="activityName"
                value={activity.activityName || ""}
                onChange={handleInputChange}
                placeholder="Nombre de la actividad"
                className="w-full text-sm font-medium border-none shadow-none bg-transparent h-8 px-0 focus-visible:ring-0 placeholder:text-gray-400"
                disabled={isLocked}
              />
            ) : (
              <span className="text-sm text-gray-900">
                Actividad {activity.userNumber?.padStart(2, '0') || "Nueva"}
              </span>
            )}
          </div>

          {/* Type Badge */}
          <div className="flex-shrink-0">
             {activity.nextActivityType === 'decision' && (
                <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 font-normal rounded-full px-3">Decisión</Badge>
             )}
             {activity.nextActivityType === 'alternatives' && (
                <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200 font-normal rounded-full px-3">Alternativas</Badge>
             )}
             {activity.nextActivityType === 'individual' && (
                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 font-normal rounded-full px-3">Individual</Badge>
             )}
             {activity.nextActivityType === 'process_end' && (
                <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200 font-normal rounded-full px-3">Fin</Badge>
             )}
          </div>

          {/* Actions (Hover only) */}
          <div className={cn(
              "flex items-center gap-1 transition-opacity",
              isLocked ? 'hidden' : 'opacity-0 group-hover:opacity-100'
          )}>
            {isSummaryEnabled && (
                <AiEnhanceButton
                onClick={handleGenerateName}
                isLoading={isGeneratingName}
                textExists={!!activity.description && activity.description.length > 0}
                className="h-7 w-7 p-0"
                onUndo={nameBeforeAi !== null ? handleUndoNameAi : undefined}
                canUndo={nameBeforeAi !== null}
                buttonText=""
                >
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                </AiEnhanceButton>
            )}
            <Button
                type="button"
                variant="ghost"
                size="icon" 
                onClick={() => onDelete(activity.id)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                title="Eliminar actividad"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 space-y-4 animate-accordion-down">
            
            {/* Responsible & Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`activity-responsible-${activity.id}`} className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Responsable <span className="text-danger">*</span>
                    </Label>
                    <Input
                        id={`activity-responsible-${activity.id}`}
                        name="responsible"
                        value={activity.responsible || ""}
                        onChange={handleInputChange}
                        placeholder="Ej: Coordinador de Operaciones"
                        className="h-9 bg-background"
                        disabled={isLocked}
                    />
                </div>
                <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Tipo de Siguiente Actividad
                    </Label>
                    <div className="flex flex-wrap gap-2">
                         <Badge 
                            variant={activity.nextActivityType === 'individual' ? 'default' : 'outline'}
                            className={cn(
                                "cursor-pointer font-normal hover:bg-primary/90 transition-colors",
                                activity.nextActivityType === 'individual' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-background"
                            )}
                            onClick={() => !isLocked && handleNextActivityTypeChange('individual')}
                         >
                            Individual
                         </Badge>
                         <Badge 
                            variant={activity.nextActivityType === 'decision' ? 'default' : 'outline'}
                            className={cn(
                                "cursor-pointer font-normal hover:bg-warning/90 transition-colors",
                                activity.nextActivityType === 'decision' ? "bg-warning text-white border-warning" : "text-muted-foreground hover:text-warning hover:border-warning/50 bg-background"
                            )}
                            onClick={() => !isLocked && handleNextActivityTypeChange('decision')}
                         >
                            Decisión
                         </Badge>
                         <Badge 
                            variant={activity.nextActivityType === 'alternatives' ? 'default' : 'outline'}
                            className={cn(
                                "cursor-pointer font-normal hover:bg-accent-secondary/90 transition-colors",
                                activity.nextActivityType === 'alternatives' ? "bg-accent-secondary text-white border-accent-secondary" : "text-muted-foreground hover:text-accent-secondary hover:border-accent-secondary/50 bg-background"
                            )}
                            onClick={() => !isLocked && handleNextActivityTypeChange('alternatives')}
                         >
                            Alternativas
                         </Badge>
                         {(isLastActivity || activity.nextActivityType === 'process_end') && (
                            <Badge 
                                variant={activity.nextActivityType === 'process_end' ? 'default' : 'outline'}
                                className={cn(
                                    "cursor-pointer font-normal hover:bg-muted-foreground/90 transition-colors",
                                    activity.nextActivityType === 'process_end' ? "bg-muted-foreground text-white" : "text-muted-foreground hover:text-foreground bg-background"
                                )}
                                onClick={() => !isLocked && handleNextActivityTypeChange('process_end')}
                            >
                                Fin
                            </Badge>
                         )}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="relative group/desc">
              <Label htmlFor={`activity-description-${activity.id}`} className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Descripción <span className="text-danger">*</span>
              </Label>
              <Textarea
                id={`activity-description-${activity.id}`}
                name="description"
                value={activity.description || ""}
                onChange={handleInputChange}
                placeholder="Describe detalladamente lo que debe realizarse en esta actividad..."
                rows={3}
                className="min-h-[80px] bg-background resize-y"
                disabled={isLocked}
              />
              
              {/* AI Actions Toolbar */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/desc:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm">
                   {!isLocked && (
                    <>
                    <AiEnhanceButton
                        onClick={handleAiEnhanceDescription}
                        isLoading={isLoadingAiEnhanceDesc}
                        textExists={!!activity.description && activity.description.length > 5}
                        className="h-6 px-2 text-[10px]"
                        buttonText="Editar"
                        onUndo={descriptionBeforeAi !== null && !isLoadingAiExpandDesc ? handleUndoDescriptionAi : undefined}
                        canUndo={descriptionBeforeAi !== null && !isLoadingAiExpandDesc}
                    >
                        <Wand2 className="mr-1 h-3 w-3" />
                    </AiEnhanceButton>
                    <AiEnhanceButton
                        onClick={handleAiExpandDescription}
                        isLoading={isLoadingAiExpandDesc}
                        textExists={!!activity.description && activity.description.length > 5}
                        className="h-6 px-2 text-[10px]"
                        buttonText="Ampliar"
                        onUndo={descriptionBeforeAi !== null && !isLoadingAiEnhanceDesc ? handleUndoDescriptionAi : undefined}
                        canUndo={descriptionBeforeAi !== null && !isLoadingAiEnhanceDesc}
                    >
                        <Expand className="mr-1 h-3 w-3" />
                    </AiEnhanceButton>
                    </>
                   )}
              </div>
            </div>

            {/* Conditional Fields based on Type */}
            {activity.nextActivityType === 'individual' && (
                <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border-subtle">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Siguiente:</span>
                    <Input
                        id={`activity-nextIndividualActivityRef-${activity.id}`}
                        name="nextIndividualActivityRef"
                        value={activity.nextIndividualActivityRef || ""}
                        onChange={handleInputChange}
                        placeholder="Auto"
                        className="h-7 w-20 text-xs bg-background text-center"
                        disabled={isLocked}
                    />
                </div>
            )}

            {/* Decision Branches */}
            {activity.nextActivityType === 'decision' && (
              <div className="space-y-3 mt-4">
                <div className="pl-4 border-l-2 border-warning/30 space-y-3">
                  {/* YES Branch */}
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-warning text-warning bg-warning/5">Sí</Badge>
                        <Input
                            value={activity.decisionBranches?.yesLabel ?? ''}
                            onChange={(e) => onUpdate(activity.id, { decisionBranches: { ...(activity.decisionBranches || { yesLabel: '', noLabel: '' }), yesLabel: e.target.value } })}
                            placeholder="Etiqueta (ej: Aprobado)"
                            className="h-7 text-xs w-48 bg-background"
                            disabled={isLocked}
                        />
                      </div>
                      <div className="pl-2 space-y-2">
                        {yesChildren.map((child, childIndex) => (
                          <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity isLocked={isLocked} />
                        ))}
                        {!isLocked && (
                            <Button variant="ghost" size="sm" onClick={() => handleAddSubActivity('yes')} className="w-full border border-dashed border-warning/30 text-warning hover:bg-warning/5 h-8 text-xs justify-start">
                                <PlusCircle className="mr-2 h-3.5 w-3.5" /> Agregar paso en &quot;Sí&quot;
                            </Button>
                        )}
                      </div>
                  </div>

                  {/* NO Branch */}
                  <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground bg-muted/10">No</Badge>
                        <Input
                            value={activity.decisionBranches?.noLabel ?? ''}
                            onChange={(e) => onUpdate(activity.id, { decisionBranches: { ...(activity.decisionBranches || { yesLabel: '', noLabel: '' }), noLabel: e.target.value } })}
                            placeholder="Etiqueta (ej: Rechazado)"
                            className="h-7 text-xs w-48 bg-background"
                            disabled={isLocked}
                        />
                      </div>
                      <div className="pl-2 space-y-2">
                        {noChildren.map((child, childIndex) => (
                          <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity isLocked={isLocked} />
                        ))}
                        {!isLocked && (
                            <Button variant="ghost" size="sm" onClick={() => handleAddSubActivity('no')} className="w-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/10 h-8 text-xs justify-start">
                                <PlusCircle className="mr-2 h-3.5 w-3.5" /> Agregar paso en &quot;No&quot;
                            </Button>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives Branches */}
            {activity.nextActivityType === 'alternatives' && (
              <div className="space-y-3 mt-4">
                 <div className="pl-4 border-l-2 border-accent-secondary/30 space-y-4">
                    {(activity.alternativeBranches || []).map((branch, branchIndex) => (
                        <div key={branch.id || branchIndex} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-accent-secondary text-accent-secondary bg-accent-secondary/5">Opción {branchIndex + 1}</Badge>
                                <Input
                                    value={branch.label || ''}
                                    onChange={(e) => handleAlternativeBranchLabelChange(branchIndex, e.target.value)}
                                    placeholder={`Nombre de la alternativa`}
                                    className="h-7 text-xs w-full max-w-xs bg-background"
                                    disabled={isLocked}
                                />
                                {(activity.alternativeBranches || []).length > 1 && !isLocked && (
                                    <Button variant="ghost" size="icon" onClick={() => removeAlternativeBranch(activity.id, branch.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                            <div className="pl-2 space-y-2">
                                {alternativeChildren(branch.id).map((child, childIndex) => (
                                    <ActivityItem key={child.id} activity={child} onUpdate={onUpdate} onDelete={onDelete} index={childIndex} isSubActivity isLocked={isLocked} />
                                ))}
                                {!isLocked && (
                                    <Button variant="ghost" size="sm" onClick={() => handleAddSubActivity(branch.id)} className="w-full border border-dashed border-accent-secondary/30 text-accent-secondary hover:bg-accent-secondary/5 h-8 text-xs justify-start">
                                        <PlusCircle className="mr-2 h-3.5 w-3.5" /> Agregar paso
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    {!isLocked && (
                        <Button variant="outline" size="sm" onClick={() => addAlternativeBranch(activity.id)} className="mt-2 text-xs border-dashed">
                            <PlusCircle className="mr-2 h-3.5 w-3.5" /> Añadir Nueva Alternativa
                        </Button>
                    )}
                 </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                    ID: {activity.systemNumber}
                </span>
            </div>

          </div>
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
