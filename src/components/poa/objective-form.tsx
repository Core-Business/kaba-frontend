
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function ObjectiveForm() {
  const { poa, updateField, saveCurrentPOA } = usePOA();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [maxWords, setMaxWords] = useState(250); 
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!poa?.objective) return;
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: poa.objective, maxWords: maxWords });
      updateField("objective", result.enhancedText);
      toast({ title: "Objetivo Editado con IA", description: "El texto del objetivo ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando objetivo con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar el texto del objetivo.", variant: "destructive" });
    }
    setIsLoadingAi(false);
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
            className="min-h-[150px] w-full"
          />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="maxWordsSlider">Máximo de Palabras para IA: {maxWords}</Label>
          </div>
          <Slider
            id="maxWordsSlider"
            min={50}
            max={500}
            step={10}
            value={[maxWords]}
            onValueChange={(value) => setMaxWords(value[0])}
            className="w-full"
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
      <CardFooter className="flex justify-end border-t pt-6">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Objetivo
        </Button>
      </CardFooter>
    </Card>
  );
}
