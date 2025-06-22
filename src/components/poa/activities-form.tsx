
"use client";

import { usePOA } from "@/hooks/use-poa";
import { usePOABackend } from "@/hooks/use-poa-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { ActivityItem } from "./activity-item";
import { PlusCircle, ListChecks, Save } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import type { POAActivity } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";
import { getActivitiesInProceduralOrder } from '@/lib/activity-utils';
import { useParams } from "next/navigation";

export function ActivitiesForm() {
  // Extraer procedureId igual que en HeaderForm
  const params = useParams();
  const poaId = params.poaId as string;
  
  const procedureId = (() => {
    if (!poaId || poaId === 'new') return null;
    
    if (poaId.startsWith('proc-')) {
      const withoutPrefix = poaId.replace('proc-', '');
      const parts = withoutPrefix.split('-');
      return parts.length >= 2 ? parts.slice(0, -1).join('-') : withoutPrefix;
    } else {
      return poaId;
    }
  })();
  
  console.log('ActivitiesForm - poaId:', poaId, 'procedureId:', procedureId);
  
  // Usar usePOABackend para obtener datos del backend, usePOA para operaciones locales
  const { poa: poaBackend, saveToBackend, isLoading } = usePOABackend(procedureId);
  const { addActivity, updateActivity, deleteActivity, setActivities } = usePOA();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const topLevelActivities = poaBackend?.activities.filter((act: POAActivity) => !act.parentId) || [];

  useEffect(() => {
    if (poaBackend && poaBackend.activities.length > 0) {
        const needsMigration = poaBackend.activities.some((act: POAActivity) =>
            (act.nextActivityType === 'decision' && act.decisionBranches === undefined) ||
            (act.nextActivityType === 'alternatives' && act.alternativeBranches === undefined) ||
            act.responsible === undefined ||
            act.userNumber === undefined ||
            act.parentId === undefined 
        );

        if (needsMigration) {
            const migratedActivities = poaBackend.activities.map((act: POAActivity) => ({
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
  }, [poaBackend, setActivities]);


  if (isLoading || !poaBackend) return <div className="flex justify-center items-center h-64"><p>Cargando datos del Procedimiento POA...</p></div>;

  const handleAddTopLevelActivity = () => {
    if (poaBackend && poaBackend.activities.length > 0) {
      const orderedActivities = getActivitiesInProceduralOrder(poaBackend.activities);
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
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      return;
    }

    const currentTopLevelActivities = poaBackend.activities.filter((act: POAActivity) => !act.parentId);
    const draggedItemId = currentTopLevelActivities[draggedItemIndex].id;

    const reorderedAllActivities = [...poaBackend.activities];
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
    if (!poaBackend || !procedureId) {
      toast({
        title: "Error",
        description: "No hay datos para guardar o falta el ID del procedimiento.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Guardando actividades con procedureId:', procedureId);
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

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Actividades del Procedimiento" description="Define los pasos individuales, decisiones y rutas alternativas para este Procedimiento POA." />
      </CardHeader>
      <CardContent>
        {topLevelActivities.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Aún no hay actividades definidas.</p>
            <p className="text-sm text-muted-foreground">Añade tu primera actividad para comenzar.</p>
            <Button onClick={handleAddTopLevelActivity} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Actividad
            </Button>
          </div>
        ) : (
          <div className="space-y-1"> 
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
              />
            ))}
          </div>
        )}
        {topLevelActivities.length > 0 && (
           <div className="mt-3 pt-3 border-t">
            <Button onClick={handleAddTopLevelActivity} variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Actividad
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Actividades
        </Button>
      </CardFooter>
    </Card>
  );
}
