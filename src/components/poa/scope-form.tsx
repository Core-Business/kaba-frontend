
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateScope } from "@/ai/flows/generate-scope";
import type { GenerateScopeInput } from "@/ai/flows/generate-scope";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Brain, Wand2, Lightbulb, Undo2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { defaultPOAScopeHelperData } from "@/lib/schema";

export function ScopeForm() {
  const { poa, updateField, saveCurrentPOA, setIsDirty } = usePOA();
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [maxWords, setMaxWords] = useState(60);
  const { toast } = useToast();
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);
  const [showHelperSection, setShowHelperSection] = useState(false);

  const handleMainScopeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("scope", e.target.value);
    setScopeBeforeAi(null);
    setIsDirty(true);
  }, [updateField, setIsDirty]);

  const handleAiEnhance = useCallback(async () => {
    if (!poa?.scope) {
      toast({ title: "Texto Requerido", description: "Por favor, escribe un alcance para editarlo con IA.", variant: "destructive" });
      return;
    }
    setScopeBeforeAi(poa.scope);
    setIsLoadingAiEnhance(true);
    try {
      const result = await enhanceText({ text: poa.scope, context: "scope", maxWords });
      updateField("scope", result.enhancedText);
      toast({ title: "Alcance Editado con IA", description: "El texto del alcance ha sido editado por IA." });
    } catch (error) {
      console.error("Error editando alcance con IA:", error);
      toast({ title: "Fallo en Edición con IA", description: "No se pudo editar el texto del alcance.", variant: "destructive" });
      setScopeBeforeAi(null); 
    }
    setIsLoadingAiEnhance(false);
  }, [poa, updateField, toast, maxWords]);

  const handleGenerateScope = useCallback(async () => {
    if (!poa) return;
    
    const currentHelperData = poa.scopeHelperData || defaultPOAScopeHelperData;

    setScopeBeforeAi(poa.scope);
    setIsLoadingAiGenerate(true);
    try {
      const inputForAI: GenerateScopeInput = {
        ...currentHelperData,
        maxWords,
        // Ensure arrays are filtered even if they come from defaults or context
        departamentosOAreas: (currentHelperData.departamentosOAreas || []).filter(d => d.trim() !== ''),
        productosOServicios: (currentHelperData.productosOServicios || []).filter(p => p.trim() !== ''),
        usuariosYRoles: (currentHelperData.usuariosYRoles || []).filter(u => u.usuario?.trim() !== '' || u.rol?.trim() !== ''),
        conexionesDocumentales: (currentHelperData.conexionesDocumentales || []).filter(c => c.documento?.trim() !== '' || c.codigo?.trim() !== ''),
        referenciaANormas: (currentHelperData.referenciaANormas || []).filter(r => r.referencia?.trim() !== '' || r.codigo?.trim() !== ''),
      };
      const result = await generateScope(inputForAI);
      updateField("scope", result.generatedScope);
      toast({ title: "Alcance Generado con IA", description: "Se ha generado un nuevo alcance." });
    } catch (error) {
      console.error("Error generando alcance con IA:", error);
      toast({ title: "Fallo al Generar Alcance", description: "No se pudo generar el alcance.", variant: "destructive" });
      setScopeBeforeAi(null); 
    }
    setIsLoadingAiGenerate(false);
  }, [poa, updateField, toast, maxWords]);

  const handleUndoAi = useCallback(() => {
    if (scopeBeforeAi !== null && poa) {
      updateField("scope", scopeBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el texto anterior del alcance." });
      setScopeBeforeAi(null);
    }
  }, [scopeBeforeAi, poa, updateField, toast]);

  const handleSave = useCallback(() => {
    if (poa) {
      saveCurrentPOA();
    }
  }, [poa, saveCurrentPOA]);

  if (!poa) return <div className="flex justify-center items-center h-64"><LoadingSpinner className="h-8 w-8" /><p className="ml-2">Cargando datos...</p></div>;

  const canEnhanceMainScope = !!poa.scope && poa.scope.length > 5;
  
  // For "Generar Alcance con IA", we might not have inputs anymore, 
  // so its enablement might depend on whether poa.scopeHelperData has content or if AI can generate from scratch/other fields.
  // For now, let's assume it can always be attempted if the section is visible.
  const canGenerateFromHelper = showHelperSection;


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Alcance" description="Define los límites de este Procedimiento POA. Puede ser generado por IA o ingresado manualmente." />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="scope">Definición del Alcance</Label>
          <Textarea
            id="scope"
            value={poa.scope || ""}
            onChange={handleMainScopeChange}
            placeholder="Describe el alcance, incluyendo departamentos, procesos, roles involucrados y cualquier exclusión..."
            rows={8}
            className="min-h-[150px] w-full"
          />
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="maxWordsSliderScopeAi">Máximo de Palabras para IA: {maxWords}</Label>
          </div>
          <Slider
            id="maxWordsSliderScopeAi"
            min={20}
            max={200}
            step={10}
            defaultValue={[60]}
            value={[maxWords]}
            onValueChange={(value) => setMaxWords(value[0])}
            className="w-full"
          />
        </div>

        <div className="mt-3 flex justify-end items-center">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAiEnhance}
            textExists={canEnhanceMainScope}
            onUndo={scopeBeforeAi !== null && !isLoadingAiGenerate ? handleUndoAi : undefined}
            canUndo={scopeBeforeAi !== null && !isLoadingAiGenerate}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoadingAiEnhance ? "Editando..." : "Edición con IA"}
          </AiEnhanceButton>
        </div>

        <hr className="my-4" />

        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
                <Switch
                id="toggle-scope-helper-section"
                checked={showHelperSection}
                onCheckedChange={setShowHelperSection}
                />
                <Label htmlFor="toggle-scope-helper-section" className="text-md font-semibold text-primary flex items-center">
                <Lightbulb className="mr-2 h-5 w-5" />
                Ayuda para Redactar el Alcance
                </Label>
            </div>
            {showHelperSection && (
                <div className="flex items-center gap-2">
                <Button onClick={handleGenerateScope} disabled={isLoadingAiGenerate || !canGenerateFromHelper}>
                    {isLoadingAiGenerate ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Brain className="mr-2 h-4 w-4" />}
                    {isLoadingAiGenerate ? "Generando..." : "Generar Alcance con IA"}
                </Button>
                {scopeBeforeAi !== null && !isLoadingAiEnhance && (
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
          <div className="space-y-4 w-full pl-2 border-l-2 border-primary/30">
            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">1. Definición del Ámbito de Aplicación</h4>
                <div className="space-y-3">
                    <div>
                        <Label>Procesos y actividades clave cubiertos</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Gestión de incidencias de TI, desarrollo de nuevo software, atención al cliente post-venta.</p>
                    </div>
                    <div>
                        <Label>Departamentos o Áreas Involucradas</Label>
                         <p className="text-xs text-muted-foreground mt-1 italic">Ej., TI, Desarrollo, Soporte</p>
                    </div>
                    <div>
                        <Label>Productos o Servicios Afectados</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Sistema CRM, App Móvil X</p>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">2. Aplicabilidad y Responsables</h4>
                <div className="space-y-3">
                    <div>
                        <Label>Usuarios y Roles Específicos</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <div className="flex-grow"><p className="text-xs text-muted-foreground italic">Usuario/Puesto (Ej. Analista de Soporte N1)</p></div>
                            <div className="flex-grow"><p className="text-xs text-muted-foreground italic">Rol en el Procedimiento (Ej. Ejecutor, Revisor)</p></div>
                        </div>
                    </div>
                     <div>
                        <Label>Grado de inclusión o exclusión</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Aplica a todos los empleados del departamento X, excluye personal temporal.</p>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">3. Límites y Exclusiones</h4>
                <div className="space-y-3">
                     <div>
                        <Label>Delimitación precisa (inicio/fin)</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Inicia con la recepción de la solicitud del cliente y finaliza con la confirmación de la solución.</p>
                    </div>
                    <div>
                        <Label>Condiciones de exclusión</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., No aplica para solicitudes de hardware, no cubre fallos de infraestructura de red.</p>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">4. Condiciones y Contexto de Aplicación</h4>
                <div className="space-y-3">
                    <div>
                        <Label>Criterios de activación</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Al recibir una alerta de sistema crítico, cuando un cliente reporta un error de tipo A.</p>
                    </div>
                    <div>
                        <Label>Contexto operativo</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Se aplica en el sistema de ticketing Jira, utilizando la base de conocimiento Confluence.</p>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">5. Interrelación con Otros Procesos y Normas</h4>
                <div className="space-y-3">
                     <div>
                        <Label>Conexiones Documentales</Label>
                         <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <div className="flex-grow"><p className="text-xs text-muted-foreground italic">Nombre del Documento (Ej. POA de Gestión de Cambios)</p></div>
                            <div className="flex-grow"><p className="text-xs text-muted-foreground italic">Código/ID (Opcional, Ej. GC-POA-002)</p></div>
                        </div>
                    </div>
                    <div>
                        <Label>Referencia a Normativas o Estándares</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <div className="flex-grow"><p className="text-xs text-muted-foreground italic">Norma/Estándar (Ej. ISO 27001)</p></div>
                            <div className="flex-grow"><p className="text-xs text-muted-foreground italic">Cláusula/Sección (Opcional, Ej. Anexo A.12.1)</p></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">6. Vigencia y Revisión (Opcional)</h4>
                <div className="space-y-3">
                     <div>
                        <Label>Duración y Periodicidad</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Vigente hasta 31/12/2025, aplicable durante el Q3 de cada año.</p>
                    </div>
                     <div>
                        <Label>Revisión del Alcance</Label>
                        <p className="text-xs text-muted-foreground mt-1 italic">Ej., Revisión anual o tras cambios significativos en los sistemas involucrados.</p>
                    </div>
                </div>
            </div>
          </div>
        )}
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
