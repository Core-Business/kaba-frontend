
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateIntroduction } from "@/ai/flows/generate-introduction";
import { defineScope } from "@/ai/flows/define-scope";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, BookOpen, Target as ScopeIcon } from "lucide-react"; 

export function ProcedureDescriptionForm() {
  const { poa, updateField } = usePOA();
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [isGeneratingIntro, setIsGeneratingIntro] = useState(false);
  const [isDefiningScope, setIsDefiningScope] = useState(false);
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!poa?.procedureDescription) return;
    setIsEnhancingText(true);
    try {
      const result = await enhanceText({ text: poa.procedureDescription });
      updateField("procedureDescription", result.enhancedText);
      toast({ title: "Descripción del Procedimiento Mejorada", description: "El texto ha sido mejorado por IA." });
    } catch (error) {
      console.error("Error mejorando descripción del procedimiento:", error);
      toast({ title: "Fallo al Mejorar con IA", description: "No se pudo mejorar el texto.", variant: "destructive" });
    }
    setIsEnhancingText(false);
  };

  const handleGenerateIntroduction = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, proporciona primero una descripción del procedimiento.", variant: "destructive" });
      return;
    }
    setIsGeneratingIntro(true);
    try {
      const result = await generateIntroduction({ procedureDescription: poa.procedureDescription });
      updateField("introduction", result.introduction);
      toast({ title: "Introducción Generada", description: "Se ha generado una introducción por IA y añadido al campo Introducción." });
    } catch (error) {
      console.error("Error generando introducción:", error);
      toast({ title: "Fallo al Generar Introducción", description: "No se pudo generar una introducción.", variant: "destructive" });
    }
    setIsGeneratingIntro(false);
  };

  const handleDefineScope = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, proporciona primero una descripción del procedimiento.", variant: "destructive" });
      return;
    }
    setIsDefiningScope(true);
    try {
      const result = await defineScope({ procedureDescription: poa.procedureDescription });
      updateField("scope", result.scopeDefinition);
      toast({ title: "Alcance Definido", description: "El alcance ha sido definido por IA y añadido al campo Alcance." });
    } catch (error) {
      console.error("Error definiendo alcance:", error);
      toast({ title: "Fallo al Definir Alcance", description: "No se pudo definir el alcance.", variant: "destructive" });
    }
    setIsDefiningScope(false);
  };
  
  if (!poa) return <div>Cargando datos del POA...</div>;

  const procedureTextExists = !!poa.procedureDescription && poa.procedureDescription.length > 10;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Descripción del Procedimiento" description="Detalla el procedimiento general. Esta información puede ser usada por IA para ayudar a generar otras secciones." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="procedureDescription">Procedimiento Detallado</Label>
          <Textarea
            id="procedureDescription"
            value={poa.procedureDescription || ""}
            onChange={(e) => updateField("procedureDescription", e.target.value)}
            placeholder="Describe el procedimiento paso a paso, incluyendo contexto relevante, partes involucradas o sistemas..."
            rows={12}
            className="min-h-[250px]"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isEnhancingText}
            textExists={procedureTextExists}
          />
          <AiEnhanceButton
            onClick={handleGenerateIntroduction}
            isLoading={isGeneratingIntro}
            textExists={procedureTextExists}
            buttonText="Generar Introducción"
            disabled={!procedureTextExists || isGeneratingIntro}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
          >
             <BookOpen className="mr-2 h-4 w-4" />
          </AiEnhanceButton>
           <AiEnhanceButton
            onClick={handleDefineScope}
            isLoading={isDefiningScope}
            textExists={procedureTextExists}
            buttonText="Definir Alcance"
            disabled={!procedureTextExists || isDefiningScope}
            className="bg-accent/10 hover:bg-accent/20 text-accent-foreground border-accent/30"
          >
            <ScopeIcon className="mr-2 h-4 w-4" />
          </AiEnhanceButton>
        </div>
         {poa.introduction && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="font-semibold text-lg mb-2 text-primary">Vista Previa de Introducción Generada:</h4>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{poa.introduction}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
