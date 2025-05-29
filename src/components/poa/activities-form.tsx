
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { ActivityItem } from "./activity-item";
import { PlusCircle, ListChecks, Save } from "lucide-react";
import type React from "react";
import { useState } from "react";

export function ActivitiesForm() {
  const { poa, addActivity, updateActivity, deleteActivity, setActivities, saveCurrentPOA } = usePOA();
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
    
    let topLevelCounter = 1;
    const renumberedActivities = newActivities.map((act) => {
      if(!act.number.includes('.')) { 
        return {...act, number: (topLevelCounter++).toString()};
      }
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
      <CardFooter className="flex justify-end border-t pt-6">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Actividades
        </Button>
      </CardFooter>
    </Card>
  );
}
