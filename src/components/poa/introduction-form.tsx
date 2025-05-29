
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
import { BookOpen, Target as ScopeIcon, Save, Wand2, Undo2 } from "lucide-react"; 

export function IntroductionForm() { 
  const { poa, updateField, saveCurrentPOA, setIsDirty } = usePOA();
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [isGeneratingAiIntro, setIsGeneratingAiIntro] = useState(false); 
  const [isDefiningScope, setIsDefiningScope] = useState(false);
  const { toast } = useToast();

  const [procedureDescriptionBeforeAi, setProcedureDescriptionBeforeAi] = useState<string | null>(null);
  const [introductionSuggestionBeforeAi, setIntroductionSuggestionBeforeAi] = useState<string | null>(null);
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);


  const handleProcedureDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("procedureDescription", e.target.value);
    setProcedureDescriptionBeforeAi(null); 
  };

  const handleAiEnhanceUserIntro = async () => {
    if (!poa?.procedureDescription) return;
    setProcedureDescriptionBeforeAi(poa.procedureDescription);
    setIsEnhancingText(true);
    try {
      const result = await enhanceText({ text: poa.procedureDescription, context: "introduction" });
      updateField("procedureDescription", result.enhancedText);
      toast({ title: "Introducción Editada con IA", description: "El texto de la introducción ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando introducción con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar la introducción.", variant: "destructive" });
      setProcedureDescriptionBeforeAi(null);
    }
    setIsEnhancingText(false);
  };
   const handleUndoProcedureDescriptionAi = () => {
    if (procedureDescriptionBeforeAi !== null && poa) {
      updateField("procedureDescription", procedureDescriptionBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el texto original de la introducción." });
      setProcedureDescriptionBeforeAi(null);
    }
  };


  const handleGenerateAiIntroduction = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, escribe primero una introducción.", variant: "destructive" });
      return;
    }
    setIntroductionSuggestionBeforeAi(poa.introduction || ""); // Store current suggestion
    setIsGeneratingAiIntro(true);
    try {
      const result = await generateIntroduction({ procedureDescription: poa.procedureDescription });
      updateField("introduction", result.introduction); 
      toast({ title: "Sugerencia de Introducción Generada", description: "Se ha generado una sugerencia de introducción por IA." });
    } catch (error) {
      console.error("Error generando sugerencia de introducción:", error);
      toast({ title: "Fallo al Generar Sugerencia", description: "No se pudo generar una sugerencia de introducción.", variant: "destructive" });
      setIntroductionSuggestionBeforeAi(null);
    }
    setIsGeneratingAiIntro(false);
  };
  const handleUndoIntroductionSuggestionAi = () => {
    if (introductionSuggestionBeforeAi !== null && poa) {
      updateField("introduction", introductionSuggestionBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró la sugerencia de introducción anterior." });
      setIntroductionSuggestionBeforeAi(null);
    }
  };


  const handleDefineScope = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, escribe primero una introducción.", variant: "destructive" });
      return;
    }
    setScopeBeforeAi(poa.scope || ""); // Store current scope
    setIsDefiningScope(true);
    try {
      const result = await defineScope({ procedureDescription: poa.procedureDescription });
      updateField("scope", result.scopeDefinition);
      toast({ title: "Alcance Definido con IA", description: "Se ha definido un alcance usando la introducción y añadido al campo Alcance." });
    } catch (error) {
      console.error("Error definiendo alcance:", error);
      toast({ title: "Fallo al Definir Alcance", description: "No se pudo definir el alcance.", variant: "destructive" });
      setScopeBeforeAi(null);
    }
    setIsDefiningScope(false);
  };
  const handleUndoScopeAi = () => {
    if (scopeBeforeAi !== null && poa) {
      updateField("scope", scopeBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el alcance anterior." });
      setScopeBeforeAi(null);
    }
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
            onChange={handleProcedureDescriptionChange}
            placeholder="Escribe aquí la introducción del procedimiento..."
            rows={10} // Reduced rows
            className="min-h-[200px] w-full" // Reduced min-height
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-start items-center">
          <AiEnhanceButton
            onClick={handleAiEnhanceUserIntro}
            isLoading={isEnhancingText}
            textExists={userIntroTextExists}
            buttonText="Editar Introducción con IA"
            onUndo={procedureDescriptionBeforeAi !== null ? handleUndoProcedureDescriptionAi : undefined}
            canUndo={procedureDescriptionBeforeAi !== null}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isEnhancingText ? "Editando..." : "Editar Introducción con IA"}
          </AiEnhanceButton>
        </div>
        
        <hr className="my-4" />
        
        <h4 className="font-semibold text-md mb-2 text-primary">Asistentes de IA basados en la Introducción:</h4>
        <div className="flex flex-wrap gap-2 justify-start items-center">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateAiIntroduction}
              disabled={!userIntroTextExists || isGeneratingAiIntro}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {isGeneratingAiIntro ? "Generando..." : "Sugerir Introducción (IA)"}
            </Button>
            {introductionSuggestionBeforeAi !== null && (
               <Button variant="outline" size="icon" onClick={handleUndoIntroductionSuggestionAi} title="Deshacer sugerencia de IA">
                 <Undo2 className="h-4 w-4" />
               </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDefineScope}
              disabled={!userIntroTextExists || isDefiningScope}
              className="bg-accent/10 hover:bg-accent/20 text-accent-foreground border-accent/30"
            >
              <ScopeIcon className="mr-2 h-4 w-4" />
              {isDefiningScope ? "Definiendo..." : "Definir Alcance (IA)"}
            </Button>
             {scopeBeforeAi !== null && (
               <Button variant="outline" size="icon" onClick={handleUndoScopeAi} title="Deshacer definición de alcance con IA">
                 <Undo2 className="h-4 w-4" />
               </Button>
            )}
          </div>
        </div>

         {poa.introduction && ( 
          <div className="mt-4 p-3 border rounded-md bg-secondary/50">
            <h4 className="font-semibold text-md mb-1 text-primary">Sugerencia de Introducción por IA:</h4>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{poa.introduction}</p>
            <Label htmlFor="poaIntroductionSuggestion" className="sr-only">Sugerencia de Introducción por IA</Label>
            <Textarea id="poaIntroductionSuggestion" value={poa.introduction} readOnly className="hidden"/>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-start border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Introducción
        </Button>
      </CardFooter>
    </Card>
  );
}

    