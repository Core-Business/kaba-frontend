
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Button } from "@/components/ui/button";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateIntroduction } from "@/ai/flows/generate-introduction";
import { defineScope } from "@/ai/flows/define-scope";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Target as ScopeIcon, Save, Wand2 } from "lucide-react"; 

export function IntroductionForm() { 
  const { poa, updateField, saveCurrentPOA } = usePOA();
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [isGeneratingAiIntro, setIsGeneratingAiIntro] = useState(false); 
  const [isDefiningScope, setIsDefiningScope] = useState(false);
  const { toast } = useToast();

  const handleAiEnhanceUserIntro = async () => {
    if (!poa?.procedureDescription) return;
    setIsEnhancingText(true);
    try {
      const result = await enhanceText({ text: poa.procedureDescription });
      updateField("procedureDescription", result.enhancedText);
      toast({ title: "Introducción Editada con IA", description: "El texto de la introducción ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando introducción con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar la introducción.", variant: "destructive" });
    }
    setIsEnhancingText(false);
  };

  const handleGenerateAiIntroduction = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, escribe primero una introducción.", variant: "destructive" });
      return;
    }
    setIsGeneratingAiIntro(true);
    try {
      const result = await generateIntroduction({ procedureDescription: poa.procedureDescription });
      updateField("introduction", result.introduction); 
      toast({ title: "Sugerencia de Introducción Generada", description: "Se ha generado una sugerencia de introducción por IA." });
    } catch (error) {
      console.error("Error generando sugerencia de introducción:", error);
      toast({ title: "Fallo al Generar Sugerencia", description: "No se pudo generar una sugerencia de introducción.", variant: "destructive" });
    }
    setIsGeneratingAiIntro(false);
  };

  const handleDefineScope = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, escribe primero una introducción.", variant: "destructive" });
      return;
    }
    setIsDefiningScope(true);
    try {
      const result = await defineScope({ procedureDescription: poa.procedureDescription });
      updateField("scope", result.scopeDefinition);
      toast({ title: "Alcance Definido con IA", description: "Se ha definido un alcance usando la introducción y añadido al campo Alcance." });
    } catch (error) {
      console.error("Error definiendo alcance:", error);
      toast({ title: "Fallo al Definir Alcance", description: "No se pudo definir el alcance.", variant: "destructive" });
    }
    setIsDefiningScope(false);
  };

  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
    }
  };
  
  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  const userIntroTextExists = !!poa.procedureDescription && poa.procedureDescription.length > 10;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Introducción" description="Detalla la introducción del procedimiento. Esta información puede ser usada por IA para ayudar a generar otras secciones o refinar esta misma." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="procedureDescription">Contenido de la Introducción</Label>
          <Textarea
            id="procedureDescription" 
            value={poa.procedureDescription || ""}
            onChange={(e) => updateField("procedureDescription", e.target.value)}
            placeholder="Escribe aquí la introducción del procedimiento..."
            rows={12}
            className="min-h-[250px] w-full"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhanceUserIntro}
            isLoading={isEnhancingText}
            textExists={userIntroTextExists}
            buttonText="Editar Introducción con IA"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isEnhancingText ? "Editando..." : "Editar Introducción con IA"}
          </AiEnhanceButton>
          <AiEnhanceButton
            onClick={handleGenerateAiIntroduction}
            isLoading={isGeneratingAiIntro}
            textExists={userIntroTextExists}
            buttonText="Sugerir por IA"
            disabled={!userIntroTextExists || isGeneratingAiIntro}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
          >
             <BookOpen className="mr-2 h-4 w-4" />
             {isGeneratingAiIntro ? "Generando..." : "Sugerir por IA"}
          </AiEnhanceButton>
           <AiEnhanceButton
            onClick={handleDefineScope}
            isLoading={isDefiningScope}
            textExists={userIntroTextExists}
            buttonText="Definir Alcance con IA"
            disabled={!userIntroTextExists || isDefiningScope}
            className="bg-accent/10 hover:bg-accent/20 text-accent-foreground border-accent/30"
          >
            <ScopeIcon className="mr-2 h-4 w-4" />
            {isDefiningScope ? "Definiendo..." : "Definir Alcance con IA"}
          </AiEnhanceButton>
        </div>
         {poa.introduction && ( 
          <div className="mt-4 p-4 border rounded-md bg-secondary/50">
            <h4 className="font-semibold text-lg mb-2 text-primary">Sugerencia de Introducción por IA:</h4>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{poa.introduction}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Introducción
        </Button>
      </CardFooter>
    </Card>
  );
}
