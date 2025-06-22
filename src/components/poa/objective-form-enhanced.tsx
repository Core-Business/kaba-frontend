"use client";

import { usePOABackend } from "@/hooks/use-poa-backend";
import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Brain, Wand2, Lightbulb, PlusCircle, Trash2, Undo2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useParams } from "next/navigation";

interface HelperData {
  generalDescription: string;
  needOrProblem: string;
  purposeOrExpectedResult: string;
  targetAudience: string;
  desiredImpact: string;
  kpis: string[];
}

const defaultHelperData: HelperData = {
  generalDescription: '',
  needOrProblem: '',
  purposeOrExpectedResult: '',
  targetAudience: '',
  desiredImpact: '',
  kpis: ['']
};

export function ObjectiveFormEnhanced() {
  const params = useParams();
  const poaId = typeof params.poaId === 'string' ? params.poaId : '';
  const { poa, saveToBackend } = usePOABackend(poaId);
  const { updateField, setIsDirty } = usePOA();
  
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [maxWords, setMaxWords] = useState(30);
  const [objectiveBeforeAi, setObjectiveBeforeAi] = useState<string | null>(null);
  const [showHelperSection, setShowHelperSection] = useState(false);
  const [helperData, setHelperData] = useState<HelperData>(defaultHelperData);
  
  const { toast } = useToast();

  // Sync helper data with POA context
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

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("objective", e.target.value);
    setObjectiveBeforeAi(null);
  };

  const handleHelperInputChange = (field: keyof Omit<HelperData, 'kpis'>, value: string) => {
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

  const handleSave = async () => {
    if (!poa) return;
    
    setIsLoading(true);
    try {
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
    setIsLoading(false);
  };

  const handleAiEnhance = async () => {
    if (!poa?.objective) {
      toast({ 
        title: "Texto Requerido", 
        description: "Por favor, escribe un objetivo para editarlo con IA.", 
        variant: "destructive" 
      });
      return;
    }

    setObjectiveBeforeAi(poa.objective);
    setIsLoadingAiEnhance(true);
    
    try {
      // Importar dinámicamente para evitar errores de SSR
      const { enhanceText } = await import('@/ai/flows/enhance-text');
      
      const result = await enhanceText({
        text: poa.objective,
        maxWords: maxWords,
        context: "objective"
      });
      
      updateField("objective", result.enhancedText);
      toast({ 
        title: "Objetivo Editado con IA", 
        description: "El texto del objetivo ha sido mejorado por IA." 
      });
    } catch (error) {
      console.error("Error editando objetivo con IA:", error);
      toast({ 
        title: "Error en Edición con IA", 
        description: "No se pudo editar el texto. Verifica tu configuración de API.", 
        variant: "destructive" 
      });
    }
    
    setIsLoadingAiEnhance(false);
  };

  const handleGenerateObjective = async () => {
    const hasHelperData = Object.values(helperData).some(val => 
      Array.isArray(val) ? val.some(s => s?.trim() !== '') : val?.trim() !== ''
    );

    if (!hasHelperData) {
      toast({ 
        title: "Información Requerida", 
        description: "Por favor, completa al menos un campo de ayuda para generar el objetivo.", 
        variant: "destructive" 
      });
      return;
    }

    setObjectiveBeforeAi(poa?.objective || '');
    setIsLoadingAiGenerate(true);
    
    try {
      // Importar dinámicamente para evitar errores de SSR
      const { generateObjectiveSafe } = await import('@/ai/flows/generate-objective-safe');
      
      const result = await generateObjectiveSafe({
        generalDescription: helperData.generalDescription,
        needOrProblem: helperData.needOrProblem,
        purposeOrExpectedResult: helperData.purposeOrExpectedResult,
        targetAudience: helperData.targetAudience,
        desiredImpact: helperData.desiredImpact,
        kpis: helperData.kpis.filter(kpi => kpi.trim() !== ''),
        maxWords: maxWords
      });
      
      updateField("objective", result.generatedObjective);
      
      toast({ 
        title: "Objetivo Generado con IA", 
        description: "Se ha generado un nuevo objetivo basado en la información proporcionada." 
      });
    } catch (error) {
      console.error("Error generando objetivo con IA:", error);
      toast({ 
        title: "Error al Generar Objetivo", 
        description: "No se pudo generar el objetivo. Verifica tu configuración de API.", 
        variant: "destructive" 
      });
    }
    
    setIsLoadingAiGenerate(false);
  };

  const handleUndoAi = () => {
    if (objectiveBeforeAi !== null) {
      updateField("objective", objectiveBeforeAi);
      setObjectiveBeforeAi(null);
      toast({ 
        title: "Acción Deshecha", 
        description: "Se restauró el texto anterior del objetivo." 
      });
    }
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  const canEnhance = !!poa.objective && poa.objective.length > 5;
  const canGenerate = Object.values(helperData).some(val => 
    Array.isArray(val) ? val.some(s => s?.trim() !== '') : val?.trim() !== ''
  );

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle 
          title="Objetivo" 
          description="Establece claramente la meta principal o propósito de este Procedimiento POA." 
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 w-full">
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

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="maxWordsSlider">Máximo de Palabras para IA: {maxWords}</Label>
          </div>
          <Slider
            id="maxWordsSlider"
            min={10}
            max={100}
            step={5}
            value={[maxWords]}
            onValueChange={(value) => setMaxWords(value[0])}
            className="w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={handleAiEnhance}
            disabled={!canEnhance || isLoadingAiEnhance}
            className="flex items-center"
          >
            {isLoadingAiEnhance ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoadingAiEnhance ? "Editando..." : "Editar con IA"}
          </Button>
          
          {objectiveBeforeAi !== null && !isLoadingAiGenerate && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndoAi}
              disabled={isLoadingAiEnhance}
              title="Deshacer última operación de IA"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <hr className="my-4" />

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
              <Button 
                onClick={handleGenerateObjective} 
                disabled={isLoadingAiGenerate || !canGenerate}
                className="flex items-center"
              >
                {isLoadingAiGenerate ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                {isLoadingAiGenerate ? "Generando..." : "Generar Objetivo con IA"}
              </Button>
            </div>
          )}
        </div>

        {showHelperSection && (
          <div className="space-y-3 w-full pl-4 border-l-2 border-primary/30">
            <div className="space-y-2">
              <Label htmlFor="generalDescription">Descripción general de la acción (¿Qué se hace?)</Label>
              <Textarea 
                id="generalDescription" 
                value={helperData.generalDescription} 
                onChange={(e) => handleHelperInputChange('generalDescription', e.target.value)} 
                rows={2} 
                placeholder="Ej., Implementar un nuevo sistema de gestión de inventario."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="needOrProblem">Necesidad o problema que atiende (¿Por qué se hace?)</Label>
              <Textarea 
                id="needOrProblem" 
                value={helperData.needOrProblem} 
                onChange={(e) => handleHelperInputChange('needOrProblem', e.target.value)} 
                rows={2} 
                placeholder="Ej., Para reducir las pérdidas por obsolescencia y mejorar la precisión del stock."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purposeOrExpectedResult">Finalidad o resultado esperado (¿Para qué se hace?)</Label>
              <Textarea 
                id="purposeOrExpectedResult" 
                value={helperData.purposeOrExpectedResult} 
                onChange={(e) => handleHelperInputChange('purposeOrExpectedResult', e.target.value)} 
                rows={2} 
                placeholder="Ej., Lograr una reducción del 15% en pérdidas y una precisión del 99% en el inventario."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAudience">A quién va dirigido o quién se beneficia (Aplicación)</Label>
              <Textarea 
                id="targetAudience" 
                value={helperData.targetAudience} 
                onChange={(e) => handleHelperInputChange('targetAudience', e.target.value)} 
                rows={2} 
                placeholder="Ej., El departamento de logística y finanzas."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desiredImpact">Impacto que se busca generar</Label>
              <Textarea 
                id="desiredImpact" 
                value={helperData.desiredImpact} 
                onChange={(e) => handleHelperInputChange('desiredImpact', e.target.value)} 
                rows={2} 
                placeholder="Ej., Mejora de la eficiencia operativa, control de costos y cumplimiento normativo."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="block mb-2">Indicadores Clave de Desempeño (KPIs)</Label>
              {helperData.kpis.map((kpi, index) => (
                <div key={index} className="flex items-center gap-2 w-full">
                  <Input
                    value={kpi}
                    onChange={(e) => handleKpiChange(index, e.target.value)}
                    placeholder={`KPI ${index + 1}`}
                    className="flex-grow"
                  />
                  {helperData.kpis.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeKpiField(index)} 
                      className="text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addKpiField} 
                className="mt-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Añadir KPI
              </Button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Consejos para redactar un buen objetivo:</p>
              <ul className="space-y-1 text-xs">
                <li>• Inicia con un verbo en infinitivo (establecer, implementar, mejorar, etc.)</li>
                <li>• Sé específico y medible cuando sea posible</li>
                <li>• Indica claramente qué se quiere lograr</li>
                <li>• Mantén la redacción clara y concisa</li>
                <li>• Considera el contexto y la audiencia objetivo</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <Brain className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">✅ Funcionalidades de IA Habilitadas</p>
              <p className="text-xs">Tu clave API de Google Gemini está configurada correctamente. Puedes usar:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>• <strong>Editar con IA</strong>: Mejora el texto del objetivo existente</li>
                <li>• <strong>Generar con IA</strong>: Crea un objetivo desde las preguntas de ayuda</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Auto-guardado cada 2 minutos
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar Objetivo"}
        </Button>
      </CardFooter>
    </Card>
  );
} 