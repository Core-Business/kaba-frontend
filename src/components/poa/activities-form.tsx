
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { ActivityItem } from "./activity-item";
import { PlusCircle, ListChecks, Save } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";

export function ActivitiesForm() {
  const { poa, addActivity, updateActivity, deleteActivity, setActivities, saveCurrentPOA } = usePOA();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Filter for top-level activities (activities that are not children of other activities for now)
  // This will be refined when proper nesting is implemented.
  // For now, all activities are treated as top-level for rendering in this list.
  const topLevelActivities = poa?.activities || [];


  useEffect(() => {
    if (poa && poa.activities.length > 0) {
        // Ensure activities have default structures if they are missing
        // This is a good place for migration if old data is loaded
        const needsUpdate = poa.activities.some(act =>
            act.nextActivityType === 'decision' && act.decisionBranches === undefined ||
            act.nextActivityType === 'alternatives' && act.alternativeBranches === undefined ||
            act.responsible === undefined ||
            act.userNumber === undefined
        );

        if (needsUpdate) {
            const updatedActivities = poa.activities.map(act => ({
                userNumber: '',
                responsible: '',
                decisionBranches: { yesLabel: 'Sí', noLabel: 'No' },
                alternativeBranches: [],
                ...act, // Spread existing activity data
                // Ensure specific fields are only added if the type matches and they are missing
                ...(act.nextActivityType === 'decision' && act.decisionBranches === undefined && { decisionBranches: { yesLabel: 'Sí', noLabel: 'No' } }),
                ...(act.nextActivityType === 'alternatives' && act.alternativeBranches === undefined && { alternativeBranches: [{id: crypto.randomUUID(), label: 'Alternativa 1'}] }),
            }));
            setActivities(updatedActivities);
        }
    }
  }, [poa, setActivities]);


  if (!poa) return <div className="flex justify-center items-center h-64"><p>Cargando datos del Procedimiento POA...</p></div>;

  const handleAddActivity = () => {
    let nextSystemNumber;
    const topLevelActs = poa.activities.filter(act => !act.systemNumber.includes('.')); // Simple check for top-level
    if (topLevelActs.length === 0) {
        nextSystemNumber = "1";
    } else {
        const topLevelNumbers = topLevelActs
            .map(act => parseInt(act.systemNumber.split('.')[0]))
            .filter(num => !isNaN(num));
        const maxTopLevel = Math.max(0, ...topLevelNumbers);
        nextSystemNumber = (maxTopLevel + 1).toString();
    }
    addActivity({ systemNumber: nextSystemNumber });
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

    const newActivities = [...poa.activities];
    const draggedItem = newActivities.splice(draggedItemIndex, 1)[0];
    newActivities.splice(dropIndex, 0, draggedItem);

    // Renumber only top-level activities for now
    let topLevelCounter = 1;
    const renumberedActivities = newActivities.map((act) => {
      if(!act.systemNumber.includes('.')) { // Simple check for top-level
        return {...act, systemNumber: (topLevelCounter++).toString()};
      }
      // Child activities' numbering logic would be more complex and tied to parent
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
            <Button onClick={handleAddActivity} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Primera Actividad
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {topLevelActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onUpdate={updateActivity}
                onDelete={deleteActivity}
                index={index}
                totalActivities={topLevelActivities.length}
                onDragStart={onDragStart} // Drag and drop currently for top-level only
                onDragOver={onDragOver}
                onDrop={onDrop}
                isDragging={draggedItemIndex === index}
              />
            ))}
          </div>
        )}
        {topLevelActivities.length > 0 && (
           <div className="mt-4 pt-4 border-t">
            <Button onClick={handleAddActivity} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Otra Actividad (Nivel Principal)
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-start border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Actividades
        </Button>
      </CardFooter>
    </Card>
  );
}
