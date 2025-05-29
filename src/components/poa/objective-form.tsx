"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ObjectiveForm() {
  const { poa, updateField } = usePOA();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!poa?.objective) return;
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: poa.objective });
      updateField("objective", result.enhancedText);
      toast({ title: "Objective Enhanced", description: "The objective text has been improved by AI." });
    } catch (error) {
      console.error("Error enhancing objective:", error);
      toast({ title: "AI Enhancement Failed", description: "Could not enhance the objective text.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };

  if (!poa) return <div>Loading POA data...</div>;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Objective" description="Clearly state the main goal or purpose of this Plan of Action." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="objective">Objective Statement</Label>
          <Textarea
            id="objective"
            value={poa.objective || ""}
            onChange={(e) => updateField("objective", e.target.value)}
            placeholder="Describe the primary objective here..."
            rows={8}
            className="min-h-[150px]"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!poa.objective && poa.objective.length > 10} // Only enable if there's enough text
          />
        </div>
      </CardContent>
    </Card>
  );
}
