
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateObjective } from "@/ai/flows/generate-objective";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Trash2, Brain, Wand2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ObjectiveHelperData {
  generalDescription: string;
  needOrProblem: string;
  purposeOrExpectedResult: string;
  targetAudience: string;
  desiredImpact: string;
  kpis: string[];
}

export function ObjectiveForm() {
  const { poa, updateField, saveCurrentPOA, setIsDirty } = usePOA();
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [maxWords, setMaxWords] = useState(30); 
  const { toast } = useToast();
  const [objectiveBeforeAi, setObjectiveBeforeAi] = useState<string | null>(null);

  const [helperData, setHelperData] = useState<ObjectiveHelperData>({
    generalDescription: '',
    needOrProblem: '',
    purposeOrExpectedResult: '',
    targetAudience: '',
    desiredImpact: '',
    kpis: [''],
  });

  const handleHelperInputChange = (field: keyof Omit<ObjectiveHelperData, 'kpis'>, value: string) => {
    setHelperData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true); // Consider helper fields as part of main form dirtiness for now
  };

  const handleKpiChange = (index: number, value: string) => {
    const newKpis = [...helperData.kpis];
    newKpis[index] = value;
    setHelperData(prev => ({ ...prev, kpis: newKpis }));
    setIsDirty(true);
  };

  const addKpiField = () => {
    setHelperData(prev => ({ ...prev, kpis: [...prev.kpis, ''] }));
    setIsDirty(true);
  };

  const removeKpiField = (index: number) => {
    const newKpis = helperData.kpis.filter((_, i) => i !== index);
    setHelperData(prev => ({ ...prev, kpis: newKpis.length > 0 ? newKpis : [''] })); // Ensure at least one KPI field
    setIsDirty(true);
  };

  const handleAiEnhance = async () => {
    if (!poa?.objective) return;
    setObjectiveBeforeAi(poa.objective);
    setIsLoadingAiEnhance(true);
    try {
      const result = await enhanceText({ text: poa.objective, maxWords: maxWords, context: "objective" });
      updateField("objective", result.enhancedText);
      toast({ title: "Objetivo Editado con IA", description: "El texto del objetivo ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando objetivo con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar el texto del objetivo.", variant: "destructive" });
      setObjectiveBeforeAi(null); // Clear undo state on error
    }
    setIsLoadingAiEnhance(false);
  };

  const handleGenerateObjective = async () => {
    if (!poa) return;
    setObjectiveBeforeAi(poa.objective); // Store current objective for potential undo
    setIsLoadingAiGenerate(true);
    try {
      const result = await generateObjective({
        generalDescription: helperData.generalDescription,
        needOrProblem: helperData.needOrProblem,
        purposeOrExpectedResult: helperData.purposeOrExpectedResult,
        targetAudience: helperData.targetAudience,
        desiredImpact: helperData.desiredImpact,
        kpis: helperData.kpis.filter(kpi => kpi.trim() !== ''), // Send only non-empty KPIs
        maxWords: maxWords,
      });
      updateField("objective", result.generatedObjective);
      toast({ title: "Objetivo Generado con IA", description: "Se ha generado un nuevo objetivo utilizando las preguntas de ayuda." });
    } catch (error)
    {
      console.error("Error generando objetivo con IA:", error);
      toast({ title: "Fallo al Generar Objetivo", description: "No se pudo generar el objetivo.", variant: "destructive" });
      setObjectiveBeforeAi(null);
    }
    setIsLoadingAiGenerate(false);
  };

  const handleUndoAi = () => {
    if (objectiveBeforeAi !== null) {
      updateField("objective", objectiveBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el texto anterior del objetivo." });
      setObjectiveBeforeAi(null);
    }
  };
  
  const handleObjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("objective", e.target.value);
    setObjectiveBeforeAi(null); // Clear undo state if user types manually
  };

  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
      // Clear helper fields after save if needed, or persist them as part of POA schema
      // For now, helper fields are component state and not saved with POA
    }
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  const canEnhance = !!poa.objective && poa.objective.length > 10;
  const canGenerate = Object.values(helperData).some(val => Array.isArray(val) ? val.some(s => s.trim() !== '') : typeof val === 'string' && val.trim() !== '');


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
            onChange={handleObjectiveChange}
            placeholder="Describe el objetivo principal aquí..."
            rows={5}
            className="min-h-[100px] w-full"
          />
        </div>

        <div className="mt-3 space-y-3">
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
        
        <div className="mt-3 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAiEnhance}
            textExists={canEnhance}
            onUndo={objectiveBeforeAi !== null ? handleUndoAi : undefined}
            canUndo={objectiveBeforeAi !== null}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoadingAiEnhance ? "Editando..." : "Edición con IA"}
          </AiEnhanceButton>
        </div>

        <hr className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Ayuda para Redactar el Objetivo</h3>
          
          <div className="space-y-1">
            <Label htmlFor="generalDescription">Descripción general de la acción (¿Qué se hace?)</Label>
            <Textarea id="generalDescription" value={helperData.generalDescription} onChange={(e) => handleHelperInputChange('generalDescription', e.target.value)} rows={3} placeholder="Ej., Implementar un nuevo sistema de gestión de inventario."/>
          </div>
          <div className="space-y-1">
            <Label htmlFor="needOrProblem">Necesidad o problema que atiende (¿Por qué se hace?)</Label>
            <Textarea id="needOrProblem" value={helperData.needOrProblem} onChange={(e) => handleHelperInputChange('needOrProblem', e.target.value)} rows={3} placeholder="Ej., Para reducir las pérdidas por obsolescencia y mejorar la precisión del stock."/>
          </div>
          <div className="space-y-1">
            <Label htmlFor="purposeOrExpectedResult">Finalidad o resultado esperado (¿Para qué se hace?)</Label>
            <Textarea id="purposeOrExpectedResult" value={helperData.purposeOrExpectedResult} onChange={(e) => handleHelperInputChange('purposeOrExpectedResult', e.target.value)} rows={3} placeholder="Ej., Lograr una reducción del 15% en pérdidas y una precisión del 99% en el inventario."/>
          </div>
          <div className="space-y-1">
            <Label htmlFor="targetAudience">A quién va dirigido o quién se beneficia (Aplicación)</Label>
            <Textarea id="targetAudience" value={helperData.targetAudience} onChange={(e) => handleHelperInputChange('targetAudience', e.target.value)} rows={3} placeholder="Ej., El departamento de logística y finanzas."/>
          </div>
          <div className="space-y-1">
            <Label htmlFor="desiredImpact">Impacto que se busca generar (mejora, control, cumplimiento, eficiencia, etc.)</Label>
            <Textarea id="desiredImpact" value={helperData.desiredImpact} onChange={(e) => handleHelperInputChange('desiredImpact', e.target.value)} rows={3} placeholder="Ej., Mejora de la eficiencia operativa, control de costos y cumplimiento normativo."/>
          </div>

          <div className="space-y-2">
            <Label>Indicadores Clave de Desempeño (KPIs)</Label>
            {helperData.kpis.map((kpi, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  value={kpi} 
                  onChange={(e) => handleKpiChange(index, e.target.value)} 
                  placeholder={`KPI ${index + 1}`}
                  className="flex-grow"
                />
                {helperData.kpis.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeKpiField(index)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addKpiField}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir KPI
            </Button>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleGenerateObjective} disabled={isLoadingAiGenerate || !canGenerate}>
              {isLoadingAiGenerate ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Brain className="mr-2 h-4 w-4" />}
              {isLoadingAiGenerate ? "Generando..." : "Generar Objetivo con IA"}
            </Button>
          </div>
        </div>

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

    