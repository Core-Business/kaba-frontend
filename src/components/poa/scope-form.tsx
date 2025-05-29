
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ScopeForm() {
  const { poa, updateField } = usePOA();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!poa?.scope) return;
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: poa.scope });
      updateField("scope", result.enhancedText);
      toast({ title: "Alcance Mejorado", description: "El texto del alcance ha sido mejorado por IA." });
    } catch (error) {
      console.error("Error mejorando alcance:", error);
      toast({ title: "Fallo al Mejorar con IA", description: "No se pudo mejorar el texto del alcance.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };
  
  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Alcance" description="Define los límites de este Procedimiento POA. Esto puede ser generado por IA desde la Descripción del Procedimiento o ingresado/editado manualmente." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="scope">Definición del Alcance</Label>
          <Textarea
            id="scope"
            value={poa.scope || ""}
            onChange={(e) => updateField("scope", e.target.value)}
            placeholder="Describe el alcance, incluyendo departamentos, procesos, roles involucrados y cualquier exclusión..."
            rows={10}
            className="min-h-[200px]"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!poa.scope && poa.scope.length > 10}
          />
        </div>
        {poa.introduction && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="font-semibold text-lg mb-2 text-primary">Introducción Generada:</h4>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{poa.introduction}</p>
            <p className="text-xs text-muted-foreground mt-2">Esta introducción fue generada automáticamente. Puedes copiarla y refinarla según sea necesario.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
