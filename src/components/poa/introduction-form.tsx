
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function IntroductionForm() { 
  const { poa, saveToBackend, isBackendLoading, backendProcedureId, updateField, setIsDirty } = usePOA();
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
    setIsDirty(true);
  };

  const handleEnhanceText = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, escribe primero una introducción.", variant: "destructive" });
      return;
    }
    setProcedureDescriptionBeforeAi(poa.procedureDescription);
    setIsEnhancingText(true);
    try {
      const enhanceInput: Parameters<typeof enhanceText>[0] = {
        text: poa.procedureDescription,
        context: "introduction",
        maxWords: 150,
      };
      const result = await enhanceText(enhanceInput);
      updateField("procedureDescription", result.enhancedText);
      toast({ title: "Texto Editado con IA", description: "La introducción ha sido editada por IA." });
    } catch (error) {
      console.error("Error editing introduction:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar la introducción.", variant: "destructive" });
      setProcedureDescriptionBeforeAi(null);
    }
    setIsEnhancingText(false);
  };

  const handleGenerateIntroduction = async () => {
    if (!poa?.procedureDescription) {
      toast({ title: "Información Faltante", description: "Por favor, escribe primero una introducción en el campo de arriba.", variant: "destructive" });
      return;
    }
    setIntroductionSuggestionBeforeAi(poa.introduction || "");
    setIsGeneratingAiIntro(true);
    try {
      const result = await generateIntroduction({ procedureDescription: poa.procedureDescription });
      updateField("introduction", result.introduction);
      toast({ title: "Introducción Generada con IA", description: "Se ha generado una nueva introducción." });
    } catch (error) {
      console.error("Error generating introduction:", error);
      toast({ title: "Fallo al Generar Introducción", description: "No se pudo generar la introducción.", variant: "destructive" });
      setIntroductionSuggestionBeforeAi(null);
    }
    setIsGeneratingAiIntro(false);
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

  const handleSave = async () => {
    if (!poa || !backendProcedureId) {
      toast({
        title: "Error",
        description: "No hay datos para guardar o falta el ID del procedimiento.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Guardando introducción con procedureId:', backendProcedureId);
      await saveToBackend();
      toast({
        title: "Introducción Guardada",
        description: "La introducción ha sido guardada exitosamente en el servidor.",
      });
    } catch (error) {
      console.error('Error al guardar introducción:', error);
      toast({
        title: "Error al Guardar",
        description: `No se pudo guardar la introducción: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };
  
  if (isBackendLoading || !poa) return <div className="flex justify-center items-center h-64"><LoadingSpinner className="h-8 w-8" /><p className="ml-2">Cargando datos...</p></div>;

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
            onClick={handleEnhanceText}
            isLoading={isEnhancingText}
            textExists={userIntroTextExists}
            buttonText="Editar Introducción con IA"
            onUndo={procedureDescriptionBeforeAi !== null ? () => updateField("procedureDescription", procedureDescriptionBeforeAi) : undefined}
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
              onClick={handleGenerateIntroduction}
              disabled={!userIntroTextExists || isGeneratingAiIntro}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {isGeneratingAiIntro ? "Generando..." : "Sugerir Introducción (IA)"}
            </Button>
            {introductionSuggestionBeforeAi !== null && (
               <Button variant="outline" size="icon" onClick={() => updateField("introduction", introductionSuggestionBeforeAi)} title="Deshacer sugerencia de IA">
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

    