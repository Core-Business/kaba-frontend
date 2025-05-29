
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
      toast({ title: "Alcance Editado con IA", description: "El texto del alcance ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando alcance con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar el texto del alcance.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };
  
  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
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
            className="min-h-[200px] w-full"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!poa.scope && poa.scope.length > 10}
          />
        </div>
        {/* Displaying Introduction here might be confusing if it was generated.
            Perhaps only show it if it was recently generated or provide context.
            For now, removing it from scope form to avoid confusion.
        */}
        {/* {poa.introduction && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="font-semibold text-lg mb-2 text-primary">Introducción Generada:</h4>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{poa.introduction}</p>
            <p className="text-xs text-muted-foreground mt-2">Esta introducción fue generada automáticamente. Puedes copiarla y refinarla según sea necesario.</p>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
