
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
      toast({ title: "Objetivo Mejorado", description: "El texto del objetivo ha sido mejorado por IA." });
    } catch (error) {
      console.error("Error mejorando objetivo:", error);
      toast({ title: "Fallo al Mejorar con IA", description: "No se pudo mejorar el texto del objetivo.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Objetivo" description="Establece claramente la meta principal o propósito de este Procedimiento POA." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="objective">Declaración del Objetivo</Label>
          <Textarea
            id="objective"
            value={poa.objective || ""}
            onChange={(e) => updateField("objective", e.target.value)}
            placeholder="Describe el objetivo principal aquí..."
            rows={8}
            className="min-h-[150px]"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!poa.objective && poa.objective.length > 10} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
