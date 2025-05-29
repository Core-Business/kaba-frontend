
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Button } from "@/components/ui/button";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Wand2 } from "lucide-react";

export function ScopeForm() {
  const { poa, updateField, saveCurrentPOA, setIsDirty } = usePOA();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScopeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("scope", e.target.value);
    setScopeBeforeAi(null); // Clear undo if user types manually
  };

  const handleAiEnhance = async () => {
    if (!poa?.scope) return;
    setScopeBeforeAi(poa.scope);
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: poa.scope, context: "scope" });
      updateField("scope", result.enhancedText);
      toast({ title: "Alcance Editado con IA", description: "El texto del alcance ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando alcance con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar el texto del alcance.", variant: "destructive" });
      setScopeBeforeAi(null);
    }
    setIsLoadingAi(false);
  };

  const handleUndoAi = () => {
    if (scopeBeforeAi !== null) {
      updateField("scope", scopeBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el texto anterior del alcance." });
      setScopeBeforeAi(null);
    }
  };
  
  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
    }
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Alcance" description="Define los límites de este Procedimiento POA. Esto puede ser generado por IA desde la Introducción o ingresado/editado manualmente." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="scope">Definición del Alcance</Label>
          <Textarea
            id="scope"
            value={poa.scope || ""}
            onChange={handleScopeChange}
            placeholder="Describe el alcance, incluyendo departamentos, procesos, roles involucrados y cualquier exclusión..."
            rows={8} // Reduced rows
            className="min-h-[150px] w-full" // Reduced min-height
          />
        </div>
        <div className="mt-3 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!poa.scope && poa.scope.length > 10}
            onUndo={scopeBeforeAi !== null ? handleUndoAi : undefined}
            canUndo={scopeBeforeAi !== null}
          >
             <Wand2 className="mr-2 h-4 w-4" />
            {isLoadingAi ? "Editando..." : "Edición con IA"}
          </AiEnhanceButton>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Alcance
        </Button>
      </CardFooter>
    </Card>
  );
}

    