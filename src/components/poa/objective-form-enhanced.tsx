"use client";

import { usePOA } from "@/hooks/use-poa";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectiveEditor } from "./objective/ObjectiveEditor";
import { ContextPanel, type HelperData } from "./objective/ContextPanel";

const defaultHelperData: HelperData = {
  generalDescription: '',
  needOrProblem: '',
  purposeOrExpectedResult: '',
  targetAudience: '',
  desiredImpact: '',
  kpis: ['']
};

export function ObjectiveFormEnhanced() {
  const { poa, saveToBackend, isBackendLoading, backendProcedureId, updateField, setIsDirty } = usePOA();
  const { toast } = useToast();
  
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [objectiveBeforeAi, setObjectiveBeforeAi] = useState<string | null>(null);
  const [helperData, setHelperData] = useState<HelperData>(defaultHelperData);

  // Sync helper data with POA
  useEffect(() => {
    if (poa?.objectiveHelperData) {
      setHelperData({
        generalDescription: poa.objectiveHelperData.generalDescription || '',
        needOrProblem: poa.objectiveHelperData.needOrProblem || '',
        purposeOrExpectedResult: poa.objectiveHelperData.purposeOrExpectedResult || '',
        targetAudience: poa.objectiveHelperData.targetAudience || '',
        desiredImpact: poa.objectiveHelperData.desiredImpact || '',
        kpis: poa.objectiveHelperData.kpis && poa.objectiveHelperData.kpis.length > 0 
          ? [...poa.objectiveHelperData.kpis] 
          : ['']
      });
    }
  }, [poa?.objectiveHelperData]);

  const handleObjectiveChange = (value: string) => {
    updateField("objective", value);
    setObjectiveBeforeAi(null);
  };

  const handleHelperDataChange = (newData: HelperData) => {
    setHelperData(newData);
    setIsDirty(true);
    // In a real app we might want to update the POA context here too, 
    // but the current hook structure seems to handle main fields mostly.
    // Ideally we'd have an updateHelperData method in usePOA.
  };

  const handleSave = async () => {
    if (!poa || !backendProcedureId) return;
    
    setIsSaving(true);
    try {
      // Also save helper data if possible (assuming backend supports it)
      // For now we just save the objective text via saveToBackend
      await saveToBackend();
      toast({ 
        title: "Objetivo Guardado", 
        description: "El objetivo se ha guardado correctamente." 
      });
    } catch (error) {
      console.error("Error guardando objetivo:", error);
      toast({ 
        title: "Error al Guardar", 
        description: "No se pudo guardar el objetivo.", 
        variant: "destructive" 
      });
    }
    setIsSaving(false);
  };

  const handleAiAction = async (action: 'refine' | 'shorten' | 'expand' | 'generate') => {
    if (!poa?.objective && action !== 'generate') {
      toast({ title: "Texto Requerido", description: "Escribe algo primero.", variant: "destructive" });
      return;
    }

    const currentText = poa?.objective || "";
    setObjectiveBeforeAi(currentText);
    setIsLoadingAiEnhance(true);

    try {
      const { enhanceText } = await import('@/ai/flows/enhance-text');

      const wordCount = currentText.split(/\s+/).filter(Boolean).length;
      const enhanceInput: Parameters<typeof enhanceText>[0] = {
        text: currentText,
        context: "objective",
      };

      if (action === "shorten") {
        enhanceInput.maxWords = Math.max(20, Math.floor(wordCount * 0.7));
      } else if (action === "expand") {
        enhanceInput.expandByPercent = 40;
        enhanceInput.maxWords = Math.max(50, Math.floor(wordCount * 1.4));
      } else {
        enhanceInput.maxWords = 100; // Mejora general
      }

      const cleanedKpis = helperData.kpis.filter(kpi => kpi.trim() !== "");
      const hasHelperData =
        helperData.generalDescription.trim() ||
        helperData.needOrProblem.trim() ||
        helperData.purposeOrExpectedResult.trim() ||
        helperData.targetAudience.trim() ||
        helperData.desiredImpact.trim() ||
        cleanedKpis.length > 0;

      if (hasHelperData) {
        if (helperData.generalDescription.trim()) enhanceInput.generalDescription = helperData.generalDescription;
        if (helperData.needOrProblem.trim()) enhanceInput.needOrProblem = helperData.needOrProblem;
        if (helperData.purposeOrExpectedResult.trim()) enhanceInput.purposeOrExpectedResult = helperData.purposeOrExpectedResult;
        if (helperData.targetAudience.trim()) enhanceInput.targetAudience = helperData.targetAudience;
        if (helperData.desiredImpact.trim()) enhanceInput.desiredImpact = helperData.desiredImpact;
        if (cleanedKpis.length > 0) enhanceInput.kpis = cleanedKpis;
      }

      const result = await enhanceText(enhanceInput);

      updateField("objective", result.enhancedText);
      toast({ title: "Objetivo Actualizado", description: "El texto ha sido procesado con IA." });
    } catch (error) {
      console.error("AI Error:", error);
      toast({ title: "Error", description: "No se pudo procesar la solicitud.", variant: "destructive" });
    } finally {
      setIsLoadingAiEnhance(false);
    }
  };

  const handleGenerateFromContext = async () => {
    setIsLoadingAiGenerate(true);
    setObjectiveBeforeAi(poa?.objective || "");

    try {
      const { generateObjectiveSafe } = await import('@/ai/flows/generate-objective-safe');
      
      const result = await generateObjectiveSafe({
        ...helperData,
        kpis: helperData.kpis.filter(k => k.trim() !== ""),
        maxWords: 50
      });

      updateField("objective", result.generatedObjective);
      toast({ title: "Objetivo Generado", description: "Se ha creado un nuevo objetivo." });
    } catch (error) {
      console.error("AI Generate Error:", error);
      toast({ title: "Error", description: "No se pudo generar el objetivo.", variant: "destructive" });
    } finally {
      setIsLoadingAiGenerate(false);
    }
  };

  const handleUndoAi = () => {
    if (objectiveBeforeAi !== null) {
      updateField("objective", objectiveBeforeAi);
      setObjectiveBeforeAi(null);
      toast({ title: "Deshecho", description: "Se restauró la versión anterior." });
    }
  };

  if (isBackendLoading || !poa) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Objetivo del Procedimiento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define claramente el propósito y alcance de este documento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Editor Column */}
        <div className="lg:col-span-2 space-y-4 h-full">
          <ObjectiveEditor 
            value={poa.objective || ""}
            onChange={handleObjectiveChange}
            isLoadingAi={isLoadingAiEnhance}
            onAiAction={handleAiAction}
            onUndoAi={handleUndoAi}
            canUndoAi={objectiveBeforeAi !== null}
          />
          
          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-sm hover:shadow transition-all"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Guardando..." : "Guardar Objetivo"}
            </Button>
          </div>
        </div>

        {/* Helper Column */}
        <div className="lg:col-span-1 h-full">
            {/* Sticky behavior for large screens if needed */}
            <div className="sticky top-6">
                <ContextPanel 
                    data={helperData} 
                    onChange={handleHelperDataChange}
                    onGenerate={handleGenerateFromContext}
                    isGenerating={isLoadingAiGenerate}
                />
            </div>
        </div>
      </div>
    </div>
  );
}