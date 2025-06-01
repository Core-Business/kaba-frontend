
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Changed from Switch to Checkbox
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateScope } from "@/ai/flows/generate-scope";
import type { GenerateScopeInput } from "@/ai/flows/generate-scope";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Trash2, Brain, Wand2, Lightbulb, Undo2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POAScopeHelperData, POAScopeUsuarioRol, POAScopeConexionDocumental, POAScopeReferenciaNorma } from "@/lib/schema";
import { defaultPOAScopeHelperData } from "@/lib/schema";


export function ScopeForm() {
  const { poa, updateField, saveCurrentPOA, setIsDirty, updateScopeHelperData: updatePoaScopeHelperData } = usePOA();
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [maxWords, setMaxWords] = useState(100);
  const { toast } = useToast();
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);
  const [isHelpSectionVisible, setIsHelpSectionVisible] = useState(true); 

  const [helperData, setHelperData] = useState<POAScopeHelperData>(() => {
    const initialSource = poa?.scopeHelperData || defaultPOAScopeHelperData;
    return {
      ...defaultPOAScopeHelperData,
      ...initialSource,
      usuariosYRoles: initialSource.usuariosYRoles && initialSource.usuariosYRoles.length > 0 ? initialSource.usuariosYRoles.map(item => ({...item, id: item.id || crypto.randomUUID()})) : [{ id: crypto.randomUUID(), usuario: '', rol: '' }],
      conexionesDocumentales: initialSource.conexionesDocumentales && initialSource.conexionesDocumentales.length > 0 ? initialSource.conexionesDocumentales.map(item => ({...item, id: item.id || crypto.randomUUID()})) : [{ id: crypto.randomUUID(), documento: '', codigo: '' }],
      referenciaANormas: initialSource.referenciaANormas && initialSource.referenciaANormas.length > 0 ? initialSource.referenciaANormas.map(item => ({...item, id: item.id || crypto.randomUUID()})) : [{ id: crypto.randomUUID(), referencia: '', codigo: '' }],
    };
  });

  useEffect(() => {
    if (!poa) return;
    const contextSource = poa.scopeHelperData || defaultPOAScopeHelperData;
    const newLocalStateCandidate: POAScopeHelperData = {
        ...defaultPOAScopeHelperData,
        ...contextSource,
        usuariosYRoles: contextSource.usuariosYRoles && contextSource.usuariosYRoles.length > 0 ? contextSource.usuariosYRoles.map(item => ({...item, id: item.id || crypto.randomUUID()})) : [{ id: crypto.randomUUID(), usuario: '', rol: '' }],
        conexionesDocumentales: contextSource.conexionesDocumentales && contextSource.conexionesDocumentales.length > 0 ? contextSource.conexionesDocumentales.map(item => ({...item, id: item.id || crypto.randomUUID()})) : [{ id: crypto.randomUUID(), documento: '', codigo: '' }],
        referenciaANormas: contextSource.referenciaANormas && contextSource.referenciaANormas.length > 0 ? contextSource.referenciaANormas.map(item => ({...item, id: item.id || crypto.randomUUID()})) : [{ id: crypto.randomUUID(), referencia: '', codigo: '' }],
    };
    if (JSON.stringify(helperData) !== JSON.stringify(newLocalStateCandidate)) {
        setHelperData(newLocalStateCandidate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poa?.scopeHelperData]);

  useEffect(() => {
    if (poa && (JSON.stringify(helperData) !== JSON.stringify(poa.scopeHelperData || defaultPOAScopeHelperData))) {
      updatePoaScopeHelperData(helperData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helperData, poa?.id, updatePoaScopeHelperData]);


  const handleMainScopeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("scope", e.target.value);
    setScopeBeforeAi(null);
    setIsDirty(true);
  }, [updateField, setIsDirty]);

  const handleHelperInputChange = useCallback((field: keyof Omit<POAScopeHelperData, 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas'>, value: string) => {
    setHelperData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, [setIsDirty]);

  const handleHelperObjectChange = useCallback(
    <T extends POAScopeUsuarioRol | POAScopeConexionDocumental | POAScopeReferenciaNorma>(
      field: 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas',
      index: number,
      subField: keyof T,
      value: string
    ) => {
      setHelperData(prev => {
        const currentArray = (prev[field] as T[] || []);
        const newArray = currentArray.map((item, i) =>
          i === index ? { ...item, [subField]: value } : item
        );
        return { ...prev, [field]: newArray };
      });
      setIsDirty(true);
    },
    [setIsDirty]
  );

  const addHelperObjectItem = useCallback((field: 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas') => {
    setHelperData(prev => {
      const currentArray = (prev[field] as Array<any> || []);
      let newItem: any;
      if (field === 'usuariosYRoles') newItem = { id: crypto.randomUUID(), usuario: '', rol: '' };
      else if (field === 'conexionesDocumentales') newItem = { id: crypto.randomUUID(), documento: '', codigo: '' };
      else if (field === 'referenciaANormas') newItem = { id: crypto.randomUUID(), referencia: '', codigo: '' };
      else return prev;

      return { ...prev, [field]: [...currentArray, newItem] };
    });
    setIsDirty(true);
  }, [setIsDirty]);

  const removeHelperObjectItem = useCallback((field: 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas', index: number) => {
    setHelperData(prev => {
      const currentArray = (prev[field] as Array<any> || []);
      const newArray = currentArray.filter((_, i) => i !== index);
      let defaultItem: any;
      if (field === 'usuariosYRoles') defaultItem = { id: crypto.randomUUID(), usuario: '', rol: '' };
      else if (field === 'conexionesDocumentales') defaultItem = { id: crypto.randomUUID(), documento: '', codigo: '' };
      else if (field === 'referenciaANormas') defaultItem = { id: crypto.randomUUID(), referencia: '', codigo: '' };
      
      return { ...prev, [field]: newArray.length > 0 ? newArray : (defaultItem ? [defaultItem] : []) };
    });
    setIsDirty(true);
  }, [setIsDirty]);


  const handleAiEnhance = useCallback(async () => {
    if (!poa?.scope) {
      toast({ title: "Texto Requerido", description: "Por favor, escribe un alcance para editarlo con IA.", variant: "destructive" });
      return;
    }
    setScopeBeforeAi(poa.scope);
    setIsLoadingAiEnhance(true);
    try {
        const enhanceInput: Parameters<typeof enhanceText>[0] = {
            text: poa.scope,
            context: "scope",
            maxWords: maxWords,
        };
      const result = await enhanceText(enhanceInput);
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
    const canGenerateFromHelper = Object.values(helperData).some(val => 
        Array.isArray(val) ? 
        val.some(item => typeof item === 'string' ? item.trim() !== '' : (typeof item === 'object' && item !== null && Object.values(item).some(v => typeof v === 'string' && v.trim() !== '')))
        : (typeof val === 'string' && val.trim() !== '')
    );

    if (!canGenerateFromHelper) {
        toast({ title: "Información Insuficiente", description: "Por favor, completa al menos un campo en la sección de ayuda para generar el alcance con IA.", variant: "destructive", duration: 5000 });
        return;
    }

    setScopeBeforeAi(poa.scope);
    setIsLoadingAiGenerate(true);
    try {
      const inputForAI: GenerateScopeInput = {
        ...helperData,
        maxWords,
        usuariosYRoles: (helperData.usuariosYRoles || []).filter(u => u.id && (u.usuario?.trim() !== '' || u.rol?.trim() !== '')),
        conexionesDocumentales: (helperData.conexionesDocumentales || []).filter(c => c.id && (c.documento?.trim() !== '' || c.codigo?.trim() !== '')),
        referenciaANormas: (helperData.referenciaANormas || []).filter(r => r.id && (r.referencia?.trim() !== '' || r.codigo?.trim() !== '')),
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
  }, [poa, updateField, toast, maxWords, helperData]);

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
  const canGenerateFromHelperNow = Object.values(helperData).some(val => 
    Array.isArray(val) ? 
    val.some(item => typeof item === 'string' ? item.trim() !== '' : (typeof item === 'object' && item !== null && Object.values(item).some(v => typeof v === 'string' && v.trim() !== '')))
    : (typeof val === 'string' && val.trim() !== '')
  );


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
            max={250}
            step={10}
            defaultValue={[100]}
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
        
        <div className="flex items-center space-x-2 mb-3">
           <Checkbox
            id="toggle-scope-helper-section"
            checked={isHelpSectionVisible}
            onCheckedChange={(checked) => setIsHelpSectionVisible(Boolean(checked))}
            aria-controls="scope-helper-content"
          />
          <Label htmlFor="toggle-scope-helper-section" className="text-md font-semibold text-primary flex items-center cursor-pointer">
            <Lightbulb className="mr-2 h-5 w-5" />
            Ayuda para Redactar el Alcance
          </Label>
        </div>

        {isHelpSectionVisible && (
          <div id="scope-helper-content" className="pt-3 pl-2 border-l-2 border-primary/30 space-y-4">
            <div className="flex items-center gap-2 mb-4"> 
              <Button onClick={handleGenerateScope} disabled={isLoadingAiGenerate || !canGenerateFromHelperNow}>
                {isLoadingAiGenerate ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Brain className="mr-2 h-4 w-4" />}
                {isLoadingAiGenerate ? "Generando..." : "Generar Alcance con Campos de Ayuda (IA)"}
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

            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm text-primary mb-2">1. Definición del Ámbito de Aplicación:</h4>
                    <div className="pl-4 space-y-3">
                        <div>
                            <Label htmlFor="procesosYActividades">Procesos y Actividades Clave</Label>
                            <Textarea id="procesosYActividades" value={helperData.procesosYActividades || ""} onChange={(e) => handleHelperInputChange('procesosYActividades', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Especifica claramente las actividades, procesos o funciones que abarca el procedimiento."/>
                            <p className="text-xs text-muted-foreground mt-1">Cubre el procedimiento.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mt-3 text-primary mb-2">2. Aplicabilidad y Responsables:</h4>
                    <div className="pl-4 space-y-3">
                        <div>
                            <Label>Usuarios y Roles</Label>
                            {(helperData.usuariosYRoles || [{ id: crypto.randomUUID(), usuario: '', rol: '' }]).map((item, index) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1 p-2 border rounded-md">
                                <Input value={item.usuario || ""} onChange={(e) => handleHelperObjectChange('usuariosYRoles', index, 'usuario', e.target.value)} placeholder="Usuario" className="flex-grow min-w-[150px]"/>
                                <Input value={item.rol || ""} onChange={(e) => handleHelperObjectChange('usuariosYRoles', index, 'rol', e.target.value)} placeholder="Rol que ejecuta" className="flex-grow min-w-[150px]"/>
                                {(helperData.usuariosYRoles || []).length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperObjectItem('usuariosYRoles', index)} className="text-destructive shrink-0 self-center sm:self-auto"><Trash2 className="h-4 w-4" /></Button>
                                )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addHelperObjectItem('usuariosYRoles')} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Añadir Usuario/Rol</Button>
                            <p className="text-xs text-muted-foreground mt-1">Usuarios o roles específicos responsables o afectados.</p>
                        </div>
                        <div>
                            <Label htmlFor="gradoDeInclusion">Grado de Inclusión/Exclusión</Label>
                            <Textarea id="gradoDeInclusion" value={helperData.gradoDeInclusion || ""} onChange={(e) => handleHelperInputChange('gradoDeInclusion', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Especifica si se aplica de manera global o solo a determinadas áreas y las condiciones."/>
                            <p className="text-xs text-muted-foreground mt-1">Grado de inclusión o exclusión de ciertos roles o situaciones.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mt-3 text-primary mb-2">3. Límites y Exclusiones:</h4>
                    <div className="pl-4 space-y-3">
                        <div>
                            <Label htmlFor="delimitacionPrecisa">Delimitación Precisa del Inicio y Fin</Label>
                            <Textarea id="delimitacionPrecisa" value={helperData.delimitacionPrecisa || ""} onChange={(e) => handleHelperInputChange('delimitacionPrecisa', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Qué marca el comienzo y el final del procedimiento."/>
                            <p className="text-xs text-muted-foreground mt-1">Delimitación precisa del inicio y fin del procedimiento.</p>
                        </div>
                        <div>
                            <Label htmlFor="condicionesDeExclusion">Condiciones de Exclusión Explícitas</Label>
                            <Textarea id="condicionesDeExclusion" value={helperData.condicionesDeExclusion || ""} onChange={(e) => handleHelperInputChange('condicionesDeExclusion', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Menciona cualquier excepción o situación donde no aplica."/>
                            <p className="text-xs text-muted-foreground mt-1">Condiciones o escenarios específicos bajo los cuales el procedimiento NO aplica.</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 className="font-semibold text-sm mt-3 text-primary mb-2">4. Condiciones y Contexto de Aplicación:</h4>
                    <div className="pl-4 space-y-3">
                        <div>
                            <Label htmlFor="criteriosDeActivacion">Criterios de Activación</Label>
                            <Textarea id="criteriosDeActivacion" value={helperData.criteriosDeActivacion || ""} onChange={(e) => handleHelperInputChange('criteriosDeActivacion', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Establece bajo qué circunstancias o condiciones se aplica."/>
                            <p className="text-xs text-muted-foreground mt-1">Criterios, eventos o condiciones que activan la aplicación del procedimiento.</p>
                        </div>
                        <div>
                            <Label htmlFor="contextoOperativo">Contexto Operativo</Label>
                            <Textarea id="contextoOperativo" value={helperData.contextoOperativo || ""} onChange={(e) => handleHelperInputChange('contextoOperativo', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Describe el entorno o situación relevante (sistemas, herramientas, etc.)."/>
                            <p className="text-xs text-muted-foreground mt-1">Contexto operativo, como sistemas, herramientas, software o entornos físicos específicos.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mt-3 text-primary mb-2">5. Interrelación con Otros Procesos y Normas:</h4>
                    <div className="pl-4 space-y-3">
                        <div>
                            <Label>Documentos, POAs, Guías o Manuales Relacionados</Label>
                            {(helperData.conexionesDocumentales || [{ id: crypto.randomUUID(), documento: '', codigo: '' }]).map((item, index) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1 p-2 border rounded-md">
                                <Input value={item.documento || ""} onChange={(e) => handleHelperObjectChange('conexionesDocumentales', index, 'documento', e.target.value)} placeholder="Documento/Proceso" className="flex-grow min-w-[150px]"/>
                                <Input value={item.codigo || ""} onChange={(e) => handleHelperObjectChange('conexionesDocumentales', index, 'codigo', e.target.value)} placeholder="Código (Opcional)" className="flex-grow min-w-[100px]"/>
                                {(helperData.conexionesDocumentales || []).length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperObjectItem('conexionesDocumentales', index)} className="text-destructive shrink-0 self-center sm:self-auto"><Trash2 className="h-4 w-4" /></Button>
                                )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addHelperObjectItem('conexionesDocumentales')} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Añadir Conexión</Button>
                            <p className="text-xs text-muted-foreground mt-1">Otros documentos, POAs, guías o manuales relacionados o referenciados.</p>
                        </div>
                        <div>
                            <Label>Normativas, Estándares o Políticas Aplicables</Label>
                            {(helperData.referenciaANormas || [{ id: crypto.randomUUID(), referencia: '', codigo: '' }]).map((item, index) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1 p-2 border rounded-md">
                                <Input value={item.referencia || ""} onChange={(e) => handleHelperObjectChange('referenciaANormas', index, 'referencia', e.target.value)} placeholder="Norma/Estándar" className="flex-grow min-w-[150px]"/>
                                <Input value={item.codigo || ""} onChange={(e) => handleHelperObjectChange('referenciaANormas', index, 'codigo', e.target.value)} placeholder="Cláusula/Sección (Opcional)" className="flex-grow min-w-[100px]"/>
                                {(helperData.referenciaANormas || []).length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperObjectItem('referenciaANormas', index)} className="text-destructive shrink-0 self-center sm:self-auto"><Trash2 className="h-4 w-4" /></Button>
                                )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addHelperObjectItem('referenciaANormas')} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Añadir Norma</Button>
                            <p className="text-xs text-muted-foreground mt-1">Normativas, estándares, políticas internas o regulaciones externas que el procedimiento debe cumplir.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mt-3 text-primary mb-2">6. Vigencia y Revisión (opcional):</h4>
                    <div className="pl-4 space-y-3">
                        <div>
                            <Label htmlFor="duracionYPeriodicidad">Duración de Aplicabilidad y Periodicidad</Label>
                            <Textarea id="duracionYPeriodicidad" value={helperData.duracionYPeriodicidad || ""} onChange={(e) => handleHelperInputChange('duracionYPeriodicidad', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Establece el período de validez, fechas de inicio/fin, o plazos de revisión."/>
                            <p className="text-xs text-muted-foreground mt-1">Duración de la aplicabilidad del procedimiento o periodicidad de su aplicación.</p>
                        </div>
                        <div>
                            <Label htmlFor="revisionHelper">Frecuencia o Condiciones para Revisión del Alcance</Label>
                            <Textarea id="revisionHelper" value={helperData.revision || ""} onChange={(e) => handleHelperInputChange('revision', e.target.value)} rows={2} className="w-full min-h-[40px] mt-1" placeholder="Condiciones para la revisión y actualización del alcance del procedimiento."/>
                            <p className="text-xs text-muted-foreground mt-1">Frecuencia o condiciones para la revisión y actualización del alcance.</p>
                        </div>
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

    