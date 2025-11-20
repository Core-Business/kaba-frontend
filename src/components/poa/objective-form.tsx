
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateObjective } from "@/ai/flows/generate-objective";
import type { GenerateObjectiveInput } from "@/ai/flows/generate-objective";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Trash2, Brain, Wand2, Lightbulb, Undo2 } from "lucide-react"; 
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POAObjectiveHelperData } from "@/lib/schema";
import { defaultPOAObjectiveHelperData } from "@/lib/schema";


export function ObjectiveForm() {
  const { poa, updateField, saveCurrentPOA, setIsDirty, updateObjectiveHelperData: updatePoaObjectiveHelperData } = usePOA();
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [maxWords, setMaxWords] = useState(30);
  const { toast } = useToast();
  const [objectiveBeforeAi, setObjectiveBeforeAi] = useState<string | null>(null);
  const [showHelperSection, setShowHelperSection] = useState(false); 

  const [helperData, setHelperData] = useState<POAObjectiveHelperData>(() => {
    const initialSource = poa?.objectiveHelperData || defaultPOAObjectiveHelperData;
    let kpisFromInitialSource: string[];
    if (initialSource.kpis && initialSource.kpis.length > 0) {
        kpisFromInitialSource = [...initialSource.kpis];
    } else {
        kpisFromInitialSource = [''];
    }
    return {
      generalDescription: initialSource.generalDescription || '',
      needOrProblem: initialSource.needOrProblem || '',
      purposeOrExpectedResult: initialSource.purposeOrExpectedResult || '',
      targetAudience: initialSource.targetAudience || '',
      desiredImpact: initialSource.desiredImpact || '',
      kpis: kpisFromInitialSource,
    };
  });

  // Sync from context to local state
  useEffect(() => {
    const contextSource = poa?.objectiveHelperData || defaultPOAObjectiveHelperData;
    let kpisFromContext: string[];
    if (contextSource.kpis && contextSource.kpis.length > 0) {
        kpisFromContext = [...contextSource.kpis];
    } else {
        kpisFromContext = ['']; // Ensure at least one empty string if context has no kpis or empty array
    }

    const newLocalStateCandidate = {
      generalDescription: contextSource.generalDescription || '',
      needOrProblem: contextSource.needOrProblem || '',
      purposeOrExpectedResult: contextSource.purposeOrExpectedResult || '',
      targetAudience: contextSource.targetAudience || '',
      desiredImpact: contextSource.desiredImpact || '',
      kpis: kpisFromContext,
    };

    if (JSON.stringify(helperData) !== JSON.stringify(newLocalStateCandidate)) {
      setHelperData(newLocalStateCandidate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poa?.objectiveHelperData]);

  // Sync from local state to context
  useEffect(() => {
    if (poa && (JSON.stringify(helperData) !== JSON.stringify(poa.objectiveHelperData || defaultPOAObjectiveHelperData))) {
      updatePoaObjectiveHelperData(helperData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helperData, poa?.id]); // Added poa.id to dependencies to ensure context is stable

  const handleHelperInputChange = (field: keyof Omit<POAObjectiveHelperData, 'kpis'>, value: string) => {
    setHelperData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleKpiChange = (index: number, value: string) => {
    setHelperData(prev => {
      const newKpis = [...prev.kpis];
      newKpis[index] = value;
      return { ...prev, kpis: newKpis };
    });
    setIsDirty(true);
  };

  const addKpiField = () => {
    setHelperData(prev => ({ ...prev, kpis: [...prev.kpis, ''] }));
    setIsDirty(true);
  };

  const removeKpiField = (index: number) => {
    setHelperData(prev => {
      const newKpis = prev.kpis.filter((_, i) => i !== index);
      return { ...prev, kpis: newKpis.length > 0 ? newKpis : [''] }; 
    });
    setIsDirty(true);
  };

  const handleAiEnhance = async () => {
    if (!poa) return;
    if (!poa.objective && !showHelperSection) { 
        toast({ title: "Texto Requerido", description: "Por favor, escribe un objetivo para editarlo con IA.", variant: "destructive" });
        return;
    }

    setObjectiveBeforeAi(poa.objective || ""); 
    setIsLoadingAiEnhance(true);
    try {
      const enhanceInput: Parameters<typeof enhanceText>[0] = {
        text: poa.objective || "", 
        maxWords: maxWords, 
        context: "objective",
      };

      if (showHelperSection) {
        enhanceInput.generalDescription = helperData.generalDescription;
        enhanceInput.needOrProblem = helperData.needOrProblem;
        enhanceInput.purposeOrExpectedResult = helperData.purposeOrExpectedResult;
        enhanceInput.targetAudience = helperData.targetAudience;
        enhanceInput.desiredImpact = helperData.desiredImpact;
        enhanceInput.kpis = helperData.kpis.filter(kpi => kpi.trim() !== '');
      }

      const result = await enhanceText(enhanceInput);
      updateField("objective", result.enhancedText);
      toast({ title: "Objetivo Editado con IA", description: "El texto del objetivo ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando objetivo con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar el texto del objetivo.", variant: "destructive" });
    }
    setIsLoadingAiEnhance(false);
  };

  const handleGenerateObjective = async () => {
    if (!poa) return;
    setObjectiveBeforeAi(poa.objective); 
    setIsLoadingAiGenerate(true);
    try {
      const inputForAI: GenerateObjectiveInput = {
        generalDescription: helperData.generalDescription,
        needOrProblem: helperData.needOrProblem,
        purposeOrExpectedResult: helperData.purposeOrExpectedResult,
        targetAudience: helperData.targetAudience,
        desiredImpact: helperData.desiredImpact,
        kpis: helperData.kpis.filter(kpi => kpi.trim() !== ''), 
        maxWords: maxWords,
      };

      const result = await generateObjective(inputForAI);
      updateField("objective", result.generatedObjective);
      toast({ title: "Objetivo Generado con IA", description: "Se ha generado un nuevo objetivo utilizando las preguntas de ayuda." });
    } catch (error)
    {
      console.error("Error generando objetivo con IA:", error);
      toast({ title: "Fallo al Generar Objetivo", description: "No se pudo generar el objetivo.", variant: "destructive" });
    }
    setIsLoadingAiGenerate(false);
  };

  const handleUndoAi = () => {
    if (objectiveBeforeAi !== null && poa) {
      updateField("objective", objectiveBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el texto anterior del objetivo." });
      setObjectiveBeforeAi(null);
    }
  };

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("objective", e.target.value);
    setObjectiveBeforeAi(null); 
  };

  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
    }
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  const canEnhance = (!!poa.objective && poa.objective.length > 5) || (showHelperSection && Object.values(helperData).some(val => Array.isArray(val) ? val.some(s => s?.trim() !== '') : typeof val === 'string' && val.trim() !== ''));
  const canGenerate = Object.values(helperData).some(val => Array.isArray(val) ? val.some(s => s?.trim() !== '') : typeof val === 'string' && val.trim() !== '');

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Objetivo" description="Establece claramente la meta principal o propósito de este Procedimiento POA." />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 w-full">
          <Label htmlFor="objective">Declaración del Objetivo</Label>
          <Textarea
            id="objective"
            value={poa.objective || ""}
            onChange={handleObjectiveChange}
            placeholder="Describe el objetivo principal aquí..."
            rows={5}
            className="min-h-[100px] w-full"
          />
        </div>

        <div className="mt-3 space-y-3 w-full">
          <div className="flex justify-between items-center">
            <Label htmlFor="maxWordsSliderAi">Máximo de Palabras para IA: {maxWords}</Label>
          </div>
          <Slider
            id="maxWordsSliderAi"
            min={10}
            max={100} 
            step={5}
            defaultValue={[30]}
            value={[maxWords]}
            onValueChange={(value) => setMaxWords(value[0])}
            className="w-full"
          />
        </div>

        <div className="mt-3 flex justify-end items-center w-full">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAiEnhance}
            textExists={canEnhance}
            onUndo={objectiveBeforeAi !== null && !isLoadingAiGenerate ? handleUndoAi : undefined} 
            canUndo={objectiveBeforeAi !== null && !isLoadingAiGenerate}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoadingAiEnhance ? "Editando..." : "Edición con IA"}
          </AiEnhanceButton>
        </div>

        <hr className="my-4 w-full" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="toggle-helper-section"
              checked={showHelperSection}
              onCheckedChange={setShowHelperSection}
            />
            <Label htmlFor="toggle-helper-section" className="text-md font-semibold text-primary flex items-center">
              <Lightbulb className="mr-2 h-5 w-5" /> 
              Ayuda para Redactar el Objetivo
            </Label>
          </div>
          
          {showHelperSection && (
            <div className="flex items-center gap-2">
              <Button onClick={handleGenerateObjective} disabled={isLoadingAiGenerate || !canGenerate}>
                {isLoadingAiGenerate ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Brain className="mr-2 h-4 w-4" />}
                {isLoadingAiGenerate ? "Generando..." : "Generar Objetivo con IA"}
              </Button>
               {objectiveBeforeAi !== null && !isLoadingAiEnhance && ( 
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUndoAi}
                  disabled={isLoadingAiGenerate}
                  title="Deshacer última operación de IA"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {showHelperSection && (
          <div className="space-y-3 w-full pl-2 border-l-2 border-primary/30">
            
            <div className="space-y-1 w-full">
              <Label htmlFor="generalDescription">Descripción general de la acción (¿Qué se hace?)</Label>
              <Textarea id="generalDescription" value={helperData.generalDescription} onChange={(e) => handleHelperInputChange('generalDescription', e.target.value)} rows={2} placeholder="Ej., Implementar un nuevo sistema de gestión de inventario." className="w-full min-h-[60px]"/>
            </div>
            <div className="space-y-1 w-full">
              <Label htmlFor="needOrProblem">Necesidad o problema que atiende (¿Por qué se hace?)</Label>
              <Textarea id="needOrProblem" value={helperData.needOrProblem} onChange={(e) => handleHelperInputChange('needOrProblem', e.target.value)} rows={2} placeholder="Ej., Para reducir las pérdidas por obsolescencia y mejorar la precisión del stock." className="w-full min-h-[60px]"/>
            </div>
            <div className="space-y-1 w-full">
              <Label htmlFor="purposeOrExpectedResult">Finalidad o resultado esperado (¿Para qué se hace?)</Label>
              <Textarea id="purposeOrExpectedResult" value={helperData.purposeOrExpectedResult} onChange={(e) => handleHelperInputChange('purposeOrExpectedResult', e.target.value)} rows={2} placeholder="Ej., Lograr una reducción del 15% en pérdidas y una precisión del 99% en el inventario." className="w-full min-h-[60px]"/>
            </div>
            <div className="space-y-1 w-full">
              <Label htmlFor="targetAudience">A quién va dirigido o quién se beneficia (Aplicación)</Label>
              <Textarea id="targetAudience" value={helperData.targetAudience} onChange={(e) => handleHelperInputChange('targetAudience', e.target.value)} rows={2} placeholder="Ej., El departamento de logística y finanzas." className="w-full min-h-[60px]"/>
            </div>
            <div className="space-y-1 w-full">
              <Label htmlFor="desiredImpact">Impacto que se busca generar (mejora, control, cumplimiento, eficiencia, etc.)</Label>
              <Textarea id="desiredImpact" value={helperData.desiredImpact} onChange={(e) => handleHelperInputChange('desiredImpact', e.target.value)} rows={2} placeholder="Ej., Mejora de la eficiencia operativa, control de costos y cumplimiento normativo." className="w-full min-h-[60px]"/>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="kpis" className="block mb-1">Indicadores Clave de Desempeño (KPIs)</Label>
              {helperData.kpis.map((kpi, index) => (
                <div key={index} className="flex items-center gap-2 w-full">
                  <Input
                    id={`kpi-${index}`}
                    value={kpi}
                    onChange={(e) => handleKpiChange(index, e.target.value)}
                    placeholder={`KPI ${index + 1}`}
                    className="flex-grow"
                  />
                  {helperData.kpis.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeKpiField(index)} className="text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addKpiField} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir KPI
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-start border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Objetivo
        </Button>
      </CardFooter>
    </Card>
  );
}
