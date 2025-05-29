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

  if (!poa) return <div>Loading POA data...</div>;

  const handleAddActivity = () => {
    // Determine the next number. This logic needs to be more sophisticated for sub-activities.
    // For now, simple top-level numbering.
    let nextNumber;
    if (poa.activities.length === 0) {
        nextNumber = "1";
    } else {
        // Attempt to find the largest top-level number and increment
        const topLevelNumbers = poa.activities
            .map(act => parseInt(act.number.split('.')[0]))
            .filter(num => !isNaN(num));
        const maxTopLevel = Math.max(0, ...topLevelNumbers);
        nextNumber = (maxTopLevel + 1).toString();
    }
    addActivity({ number: nextNumber });
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
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
    
    // Update numbering after reorder (simplified for now)
    // This simple re-numbering works for a flat list.
    // For hierarchical numbering, this would need to be much more complex.
    const renumberedActivities = newActivities.map((act, index) => {
        // Only re-number top-level items for simplicity.
        // If an item looks like a sub-item (e.g., "1.1"), keep its relative sub-numbering logic
        // This part needs careful thought for real hierarchical re-numbering
        if (!act.number.includes('.')) {
            return { ...act, number: (index + 1).toString() };
        }
        return act; // Keep sub-item numbers as is, user might need to adjust
    });

    setActivities(renumberedActivities);
    setDraggedItemIndex(null);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Procedural Activities" description="Define the individual steps, decisions, and alternative paths for this POA." />
      </CardHeader>
      <CardContent>
        {poa.activities.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">No activities defined yet.</p>
            <p className="text-sm text-muted-foreground">Add your first activity to get started.</p>
            <Button onClick={handleAddActivity} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-0"> {/* Reduced space for tighter packing */}
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
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
