
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { ActivityItem } from "./activity-item";
import { PlusCircle, ListChecks, Save } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import type { POAActivity } from "@/lib/schema";

export function ActivitiesForm() {
  const { poa, addActivity, updateActivity, deleteActivity, setActivities, saveCurrentPOA } = usePOA();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Filter for top-level activities
  const topLevelActivities = poa?.activities.filter(act => !act.parentId) || [];

  useEffect(() => {
    if (poa && poa.activities.length > 0) {
        const needsMigration = poa.activities.some(act =>
            (act.nextActivityType === 'decision' && act.decisionBranches === undefined) ||
            (act.nextActivityType === 'alternatives' && act.alternativeBranches === undefined) ||
            act.responsible === undefined ||
            act.userNumber === undefined ||
            act.parentId === undefined // Check for new nesting fields
        );

        if (needsMigration) {
            const migratedActivities = poa.activities.map(act => ({
                userNumber: '',
                responsible: '',
                decisionBranches: { yesLabel: 'Sí', noLabel: 'No' },
                alternativeBranches: [],
                parentId: null,
                parentBranchCondition: null,
                ...act, 
                ...(act.nextActivityType === 'decision' && act.decisionBranches === undefined && { decisionBranches: { yesLabel: 'Sí', noLabel: 'No' } }),
                ...(act.nextActivityType === 'alternatives' && act.alternativeBranches === undefined && { alternativeBranches: [{id: crypto.randomUUID(), label: 'Alternativa 1'}] }),
            }));
            setActivities(migratedActivities);
        }
    }
  }, [poa, setActivities]);


  if (!poa) return <div className="flex justify-center items-center h-64"><p>Cargando datos del Procedimiento POA...</p></div>;

  const handleAddTopLevelActivity = () => {
    // No parentId or parentBranchCondition for top-level
    addActivity({}); 
  };

  // Drag and drop is simplified for top-level activities only for now
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

    const currentTopLevelActivities = poa.activities.filter(act => !act.parentId);
    const draggedItemId = currentTopLevelActivities[draggedItemIndex].id;

    const reorderedAllActivities = [...poa.activities];
    const actualDraggedItemIndexInAll = reorderedAllActivities.findIndex(act => act.id === draggedItemId);
    const draggedItem = reorderedAllActivities.splice(actualDraggedItemIndexInAll, 1)[0];
    
    // Find the ID of the item at the dropIndex in the top-level list
    const itemAtDropIndexId = currentTopLevelActivities[dropIndex].id;
    const actualDropIndexInAll = reorderedAllActivities.findIndex(act => act.id === itemAtDropIndexId);

    // Insert the dragged item at the correct position in the full list
    if (draggedItemIndex < dropIndex) {
        reorderedAllActivities.splice(actualDropIndexInAll, 0, draggedItem);
    } else {
        reorderedAllActivities.splice(actualDropIndexInAll, 0, draggedItem);
    }
    
    let topLevelCounter = 1;
    const renumberedActivities = reorderedAllActivities.map((act) => {
      if (!act.parentId) { // Renumber only top-level activities
        return { ...act, systemNumber: (topLevelCounter++).toString() };
      }
      // Sub-activity numbering is handled during creation or would need more complex logic here
      return act;
    });

    setActivities(renumberedActivities);
    setDraggedItemIndex(null);
  };

  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
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
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Primera Actividad
            </Button>
          </div>
        ) : (
          <div className="space-y-1"> {/* Reduced space-y */}
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
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Otra Actividad (Nivel Principal)
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
