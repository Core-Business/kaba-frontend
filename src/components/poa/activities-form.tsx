"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { ActivityItem } from "./activity-item";
import { PlusCircle, ListChecks, Save, Lock, Maximize2, Minimize2 } from "lucide-react";
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import type { POAActivity } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";
import { getActivitiesInProceduralOrder } from '@/lib/activity-utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export function ActivitiesForm() {
  const {
    poa,
    backendProcedureId,
    isBackendLoading,
    saveToBackend,
    addActivity,
    updateActivity,
    deleteActivity,
    setActivities,
    expandAllActivitiesInContext,
    collapseAllActivitiesInContext,
  } = usePOA();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const { toast } = useToast();

  const topLevelActivities = poa?.activities.filter((act: POAActivity) => !act.parentId) || [];
  
  const isActivitiesLocked = useMemo(() => {
    return poa?.activities.some((act: POAActivity) => act.nextActivityType === 'process_end') || false;
  }, [poa?.activities]);

  useEffect(() => {
    if (poa && poa.activities.length > 0) {
        const needsMigration = poa.activities.some((act: POAActivity) =>
            (act.nextActivityType === 'decision' && act.decisionBranches === undefined) ||
            (act.nextActivityType === 'alternatives' && act.alternativeBranches === undefined) ||
            act.responsible === undefined ||
            act.userNumber === undefined ||
            act.parentId === undefined 
        );

        if (needsMigration) {
            const migratedActivities = poa.activities.map((act: POAActivity) => ({
                ...act,
                userNumber: act.userNumber || '',
                responsible: act.responsible || '',
                decisionBranches: act.nextActivityType === 'decision' && !act.decisionBranches 
                  ? { yesLabel: '', noLabel: '' } 
                  : act.decisionBranches,
                alternativeBranches: act.nextActivityType === 'alternatives' && !act.alternativeBranches 
                  ? [{id: crypto.randomUUID(), label: 'Alternativa 1'}] 
                  : act.alternativeBranches,
                parentId: act.parentId ?? null,
                parentBranchCondition: act.parentBranchCondition ?? null,
                nextIndividualActivityRef: act.nextIndividualActivityRef || '',
            }));
            setActivities(migratedActivities);
        }
    }
  }, [poa, setActivities]);


  if (isBackendLoading || !poa) return <div className="flex justify-center items-center h-64"><p>Cargando datos del Procedimiento POA...</p></div>;

  const handleAddTopLevelActivity = () => {
    if (isActivitiesLocked) return;

    if (poa && poa.activities.length > 0) {
      const orderedActivities = getActivitiesInProceduralOrder(poa.activities);
      if (orderedActivities.length > 0) {
        const lastActivityInFlow = orderedActivities[orderedActivities.length - 1];
        if (!lastActivityInFlow.responsible || !lastActivityInFlow.description) {
          toast({
            title: "Campos Incompletos",
            description: `Por favor, completa 'Responsable' y 'Descripción' de la última actividad del flujo (No. ${lastActivityInFlow.userNumber || lastActivityInFlow.systemNumber}) antes de añadir una nueva actividad principal.`,
            variant: "destructive",
            duration: 7000,
          });
          return;
        }
      }
    }
    addActivity({}); // Adds a top-level activity
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (isActivitiesLocked) return;
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    if (!poa || isActivitiesLocked) {
      return;
    }
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      return;
    }

    const currentTopLevelActivities = poa.activities.filter((act: POAActivity) => !act.parentId);
    const draggedItemId = currentTopLevelActivities[draggedItemIndex].id;

    const reorderedAllActivities = [...poa.activities];
    const actualDraggedItemIndexInAll = reorderedAllActivities.findIndex(act => act.id === draggedItemId);
    const draggedItem = reorderedAllActivities.splice(actualDraggedItemIndexInAll, 1)[0];

    const itemAtDropIndexId = currentTopLevelActivities[dropIndex].id;
    const actualDropIndexInAll = reorderedAllActivities.findIndex(act => act.id === itemAtDropIndexId);

    if (draggedItemIndex < dropIndex) {
        reorderedAllActivities.splice(actualDropIndexInAll, 0, draggedItem);
    } else {
        reorderedAllActivities.splice(actualDropIndexInAll, 0, draggedItem);
    }

    let topLevelCounter = 1;
    const renumberedActivities = reorderedAllActivities.map((act) => {
      if (!act.parentId) { 
        return { ...act, systemNumber: (topLevelCounter++).toString() };
      }
      return act;
    });

    setActivities(renumberedActivities);
    setDraggedItemIndex(null);
  };

  const handleSave = async () => {
    if (!poa || !backendProcedureId) {
      toast({
        title: "Error",
        description: "No hay datos para guardar o falta el ID del procedimiento.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Guardando actividades con procedureId:', backendProcedureId);
      await saveToBackend();
      toast({
        title: "Actividades Guardadas",
        description: "Las actividades han sido guardadas exitosamente en el servidor.",
      });
    } catch (error) {
      console.error('Error al guardar actividades:', error);
      toast({
        title: "Error al Guardar",
        description: `No se pudieron guardar las actividades: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const handleReopenActivities = () => {
    setShowReopenDialog(false);
    const endActivity = poa.activities.find((act: POAActivity) => act.nextActivityType === 'process_end');
    if (endActivity) {
        updateActivity(endActivity.id, { nextActivityType: 'individual' });
        toast({
            title: "Actividades Reabiertas",
            description: "Ya puedes agregar o editar actividades.",
        });
    }
  };

  return (
    <Card className="shadow-lg w-full border-none bg-transparent shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <SectionTitle title="Actividades del Procedimiento" description="Define los pasos individuales, decisiones y rutas alternativas para este Procedimiento." />
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAllActivitiesInContext} className="bg-background">
                <Maximize2 className="mr-2 h-4 w-4" /> Expandir
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAllActivitiesInContext} className="bg-background">
                <Minimize2 className="mr-2 h-4 w-4" /> Contraer
            </Button>
        </div>
      </div>
      
      <CardContent className="p-0">
        
        {isActivitiesLocked && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <Lock className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 ml-2">Actividades Cerradas</AlertTitle>
                <AlertDescription className="text-yellow-700 ml-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span>
                        Las actividades están cerradas porque marcaste un <strong>Fin del Procedimiento</strong>. 
                        Para realizar cambios, deberás reabrir el flujo.
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="whitespace-nowrap border-yellow-600 text-yellow-800 hover:bg-yellow-100"
                        onClick={() => setShowReopenDialog(true)}
                    >
                        Reabrir actividades
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        {topLevelActivities.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white">
            <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">Aún no hay actividades definidas</p>
            <p className="text-sm text-gray-500">Comienza definiendo el flujo de tu procedimiento.</p>
            <Button onClick={handleAddTopLevelActivity} className="mt-6 bg-blue-600 hover:bg-blue-700" disabled={isActivitiesLocked}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Primera Actividad
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="space-y-3">
              {topLevelActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onUpdate={updateActivity}
                  onDelete={deleteActivity}
                  index={index}
                  totalActivities={topLevelActivities.length}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  isDragging={draggedItemIndex === index}
                  isSubActivity={false}
                  isLastActivity={index === topLevelActivities.length - 1}
                  isLocked={isActivitiesLocked}
                />
              ))}
            </div>
            {!isActivitiesLocked && (
              <Button 
                onClick={handleAddTopLevelActivity} 
                variant="outline" 
                className="w-full mt-4 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 h-11 rounded-full transition-colors bg-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Actividad
              </Button>
            )}
          </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-end pt-8 px-0">
        <Button onClick={handleSave} size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="mr-2 h-4 w-4" />
          Guardar Actividades
        </Button>
      </CardFooter>

      <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reabrir actividades?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto permitirá editar y agregar actividades de nuevo. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReopenActivities}>Reabrir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}
