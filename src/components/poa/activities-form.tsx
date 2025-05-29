
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { ActivityItem } from "./activity-item";
import { PlusCircle, ListChecks } from "lucide-react";
import type React from "react";
import { useState } from "react";

export function ActivitiesForm() {
  const { poa, addActivity, updateActivity, deleteActivity, setActivities } = usePOA();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  const handleAddActivity = () => {
    let nextNumber;
    if (poa.activities.length === 0) {
        nextNumber = "1";
    } else {
        const topLevelNumbers = poa.activities
            .map(act => parseInt(act.number.split('.')[0]))
            .filter(num => !isNaN(num));
        const maxTopLevel = Math.max(0, ...topLevelNumbers);
        nextNumber = (maxTopLevel + 1).toString();
    }
    addActivity({ number: nextNumber });
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
    
    const renumberedActivities = newActivities.map((act, index) => {
        // Only renumber top-level activities (those without a dot in their number)
        // Sub-activities maintain their relative numbering based on their parent
        // This simplistic approach might need refinement for complex nested reordering
        if (!act.number.includes('.')) { 
             // Find previous top-level activity to infer the new top-level number
            let currentTopLevel = 0;
            for (let i = 0; i < index; i++) {
                if (!newActivities[i].number.includes('.')) {
                    currentTopLevel = parseInt(newActivities[i].number);
                }
            }
            // This logic is still flawed for robust renumbering of mixed top/sub levels.
            // A more robust solution would parse all numbers, identify hierarchy, and rebuild.
            // For now, this renumbers top-level and assumes sub-activities are manually adjusted or handled by a future feature.
            return { ...act, number: (currentTopLevel + 1).toString() };
        }
        return act; // Keep sub-activity numbers as they are, assuming they are relative or will be adjusted
    });
    
    // A simpler renumbering for now for only top level:
    const renumberedTopLevelActivities = newActivities.map((act, idx) => {
      if(!act.number.includes('.')) { // Only renumber top level items
        return {...act, number: (idx + 1).toString()};
      }
      return act;
    });


    setActivities(renumberedTopLevelActivities);
    setDraggedItemIndex(null);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Actividades del Procedimiento" description="Define los pasos individuales, decisiones y rutas alternativas para este Procedimiento POA." />
      </CardHeader>
      <CardContent>
        {poa.activities.length === 0 ? (
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
            {poa.activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onUpdate={updateActivity}
                onDelete={deleteActivity}
                index={index}
                totalActivities={poa.activities.length}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isDragging={draggedItemIndex === index}
              />
            ))}
          </div>
        )}
        {poa.activities.length > 0 && (
           <div className="mt-6 pt-6 border-t">
            <Button onClick={handleAddActivity} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Otra Actividad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
