
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
  const [maxWords, setMaxWords] = useState(60); 
  const { toast } = useToast();
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);
  const [showHelperSection, setShowHelperSection] = useState(false);

  const [helperData, setHelperData] = useState<POAScopeHelperData>(() => {
    const initialSource = poa?.scopeHelperData || defaultPOAScopeHelperData;
    return JSON.parse(JSON.stringify(initialSource)); 
  });

  useEffect(() => {
    const contextSource = poa?.scopeHelperData || defaultPOAScopeHelperData;
    if (JSON.stringify(helperData) !== JSON.stringify(contextSource)) {
      setHelperData(JSON.parse(JSON.stringify(contextSource))); 
    }
  }, [poa?.scopeHelperData, helperData]);


  useEffect(() => {
    if (poa && JSON.stringify(helperData) !== JSON.stringify(poa.scopeHelperData || defaultPOAScopeHelperData)) {
      updatePoaScopeHelperData(helperData);
    }
  }, [helperData, poa, updatePoaScopeHelperData]);

  const handleMainScopeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("scope", e.target.value);
    setScopeBeforeAi(null);
  };

  const handleHelperInputChange = (field: keyof Omit<POAScopeHelperData, 'departamentosOAreas' | 'productosOServicios' | 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas'>, value: string) => {
    setHelperData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };
  
  const handleHelperArrayStringChange = (field: 'departamentosOAreas' | 'productosOServicios', index: number, value: string) => {
    setHelperData(prev => {
      const currentArray = prev[field] || [];
      const newArray = [...currentArray];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
    setIsDirty(true);
  };

  const addHelperArrayStringItem = (field: 'departamentosOAreas' | 'productosOServicios') => {
    setHelperData(prev => {
      const currentArray = prev[field] || [];
      return { ...prev, [field]: [...currentArray, ''] };
    });
    setIsDirty(true);
  };

  const removeHelperArrayStringItem = (field: 'departamentosOAreas' | 'productosOServicios', index: number) => {
    setHelperData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.filter((_, i) => i !== index);
      return { ...prev, [field]: newArray.length > 0 ? newArray : [''] };
    });
    setIsDirty(true);
  };

  const handleHelperObjectChange = <T extends POAScopeUsuarioRol | POAScopeConexionDocumental | POAScopeReferenciaNorma>(
    field: 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas',
    index: number,
    propName: keyof T,
    value: string
  ) => {
    setHelperData(prev => {
      const currentArray = (prev[field] || []) as T[];
      const newArray = currentArray.map((item, i) => 
        i === index ? { ...item, [propName]: value } : item
      );
      return { ...prev, [field]: newArray };
    });
    setIsDirty(true);
  };

  const addHelperObjectItem = (field: 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas') => {
    setHelperData(prev => {
      const currentArray = prev[field] || [];
      let newItem;
      if (field === 'usuariosYRoles') newItem = { id: crypto.randomUUID(), usuario: '', rol: '' };
      else if (field === 'conexionesDocumentales') newItem = { id: crypto.randomUUID(), documento: '', codigo: '' };
      else newItem = { id: crypto.randomUUID(), referencia: '', codigo: '' };
      return { ...prev, [field]: [...currentArray, newItem] };
    });
    setIsDirty(true);
  };

  const removeHelperObjectItem = (field: 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas', index: number) => {
    setHelperData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.filter((_, i) => i !== index);
      let finalArray = newArray;
      if (newArray.length === 0) {
        if (field === 'usuariosYRoles') finalArray = [{ id: crypto.randomUUID(), usuario: '', rol: '' }];
        else if (field === 'conexionesDocumentales') finalArray = [{ id: crypto.randomUUID(), documento: '', codigo: '' }];
        else finalArray = [{ id: crypto.randomUUID(), referencia: '', codigo: '' }];
      }
      return { ...prev, [field]: finalArray };
    });
    setIsDirty(true);
  };

  const handleAiEnhance = async () => {
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
    }
    setIsLoadingAiEnhance(false);
  };

  const handleGenerateScope = async () => {
    if (!poa) return;
    setScopeBeforeAi(poa.scope);
    setIsLoadingAiGenerate(true);
    try {
      const inputForAI: GenerateScopeInput = {
        ...helperData,
        maxWords,
        // Ensure arrays are passed correctly, filtering out empty/default items if necessary
        departamentosOAreas: (helperData.departamentosOAreas || []).filter(d => d.trim() !== ''),
        productosOServicios: (helperData.productosOServicios || []).filter(p => p.trim() !== ''),
        usuariosYRoles: (helperData.usuariosYRoles || []).filter(u => u.usuario?.trim() !== '' || u.rol?.trim() !== ''),
        conexionesDocumentales: (helperData.conexionesDocumentales || []).filter(c => c.documento?.trim() !== '' || c.codigo?.trim() !== ''),
        referenciaANormas: (helperData.referenciaANormas || []).filter(r => r.referencia?.trim() !== '' || r.codigo?.trim() !== ''),
      };
      const result = await generateScope(inputForAI);
      updateField("scope", result.generatedScope);
      toast({ title: "Alcance Generado con IA", description: "Se ha generado un nuevo alcance utilizando las preguntas de ayuda." });
    } catch (error) {
      console.error("Error generando alcance con IA:", error);
      toast({ title: "Fallo al Generar Alcance", description: "No se pudo generar el alcance.", variant: "destructive" });
    }
    setIsLoadingAiGenerate(false);
  };

  const handleUndoAi = () => {
    if (scopeBeforeAi !== null && poa) {
      updateField("scope", scopeBeforeAi);
      toast({ title: "Acción Deshecha", description: "Se restauró el texto anterior del alcance." });
      setScopeBeforeAi(null);
    }
  };

  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
    }
  };

  if (!poa) return <div className="flex justify-center items-center h-64"><LoadingSpinner className="h-8 w-8" /><p className="ml-2">Cargando datos...</p></div>;

  const canEnhanceMainScope = !!poa.scope && poa.scope.length > 5;
  const canGenerateFromHelper = Object.values(helperData).some(val => {
    if (Array.isArray(val)) {
      return val.some(item => {
        if (typeof item === 'string') return item.trim() !== '';
        if (typeof item === 'object' && item !== null && typeof (item as any).id === 'string') { // Check if it's one of our structured objects
          return Object.entries(item).some(([key, v]) => key !== 'id' && typeof v === 'string' && v.trim() !== '');
        }
        return false;
      });
    }
    return typeof val === 'string' && val.trim() !== '';
  });
  
  const renderArrayStringInputs = (
    fieldKey: 'departamentosOAreas' | 'productosOServicios',
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {(helperData[fieldKey] || ['']).map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => handleHelperArrayStringChange(fieldKey, index, e.target.value)}
            placeholder={`${placeholder} ${index + 1}`}
            className="flex-grow"
          />
          {(helperData[fieldKey] || []).length > 1 ? (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperArrayStringItem(fieldKey, index)} className="text-destructive shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (helperData[fieldKey]?.length === 1 && (helperData[fieldKey]?.[0]?.trim() !== '') && // Show clear button only if one item and not empty
            <Button type="button" variant="ghost" size="icon" onClick={() => handleHelperArrayStringChange(fieldKey, index, '')} className="text-muted-foreground hover:text-destructive shrink-0">
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => addHelperArrayStringItem(fieldKey)}>
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir {label.endsWith('s') ? label.slice(0, -1) : label}
      </Button>
    </div>
  );

  const renderObjectInputs = <K extends 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas'>(
    fieldKey: K,
    label: string,
    prop1Key: keyof POAScopeHelperData[K][0],
    prop1Label: string,
    prop1Placeholder: string,
    prop2Key: keyof POAScopeHelperData[K][0],
    prop2Label: string,
    prop2Placeholder: string
  ) => (
    <div className="space-y-2">
      <Label className="block mb-1">{label}</Label>
      {(helperData[fieldKey] || [{ id: crypto.randomUUID() } as POAScopeHelperData[K][0]]).map((item, index) => (
        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-2 border rounded-md">
          <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor={`${fieldKey}-${index}-${String(prop1Key)}`} className="text-xs">{prop1Label}</Label>
            <Input
              id={`${fieldKey}-${index}-${String(prop1Key)}`}
              value={item[prop1Key] as string || ''}
              onChange={(e) => handleHelperObjectChange(fieldKey, index, prop1Key, e.target.value)}
              placeholder={prop1Placeholder}
              className="mt-1 w-full"
            />
          </div>
          <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor={`${fieldKey}-${index}-${String(prop2Key)}`} className="text-xs">{prop2Label}</Label>
            <Input
              id={`${fieldKey}-${index}-${String(prop2Key)}`}
              value={item[prop2Key] as string || ''}
              onChange={(e) => handleHelperObjectChange(fieldKey, index, prop2Key, e.target.value)}
              placeholder={prop2Placeholder}
              className="mt-1 w-full"
            />
          </div>
          {(helperData[fieldKey] || []).length > 1 ? (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperObjectItem(fieldKey, index)} className="text-destructive shrink-0 self-center sm:self-end">
              <Trash2 className="h-4 w-4" />
            </Button>
           ) : ( (helperData[fieldKey]?.length === 1 && (item[prop1Key] || item[prop2Key])) && // Show clear only if one item and not empty
            <Button type="button" variant="ghost" size="icon" onClick={() => {
                handleHelperObjectChange(fieldKey, index, prop1Key, '');
                handleHelperObjectChange(fieldKey, index, prop2Key, '');
            }} className="text-muted-foreground hover:text-destructive shrink-0 self-center sm:self-end">
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => addHelperObjectItem(fieldKey)} className="mt-2">
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir {label.replace(/es y Roles$/, 'e y Rol').replace(/es Documentales$/, ' Documental').replace(/a Normas$/, ' Norma')}
      </Button>
    </div>
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
                        <Label htmlFor="procesosYActividades">Procesos y actividades clave cubiertos</Label>
                        <Textarea id="procesosYActividades" value={helperData.procesosYActividades || ''} onChange={(e) => handleHelperInputChange('procesosYActividades', e.target.value)} placeholder="Ej., Gestión de incidencias de TI, desarrollo de nuevo software, atención al cliente post-venta." className="min-h-[60px] mt-1"/>
                    </div>
                    {renderArrayStringInputs('departamentosOAreas', 'Departamentos o Áreas Involucradas', 'Ej., TI, Desarrollo, Soporte')}
                    {renderArrayStringInputs('productosOServicios', 'Productos o Servicios Afectados', 'Ej., Sistema CRM, App Móvil X')}
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">2. Aplicabilidad y Responsables</h4>
                <div className="space-y-3">
                    {renderObjectInputs('usuariosYRoles', 'Usuarios y Roles Específicos', 'usuario', 'Usuario/Puesto', 'Ej. Analista de Soporte N1', 'rol', 'Rol en el Procedimiento', 'Ej. Ejecutor, Revisor, Aprobador')}
                     <div>
                        <Label htmlFor="gradoDeInclusion">Grado de inclusión o exclusión</Label>
                        <Textarea id="gradoDeInclusion" value={helperData.gradoDeInclusion || ''} onChange={(e) => handleHelperInputChange('gradoDeInclusion', e.target.value)} placeholder="Ej., Aplica a todos los empleados del departamento X, excluye personal temporal." className="min-h-[60px] mt-1"/>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">3. Límites y Exclusiones</h4>
                <div className="space-y-3">
                     <div>
                        <Label htmlFor="delimitacionPrecisa">Delimitación precisa (inicio/fin)</Label>
                        <Textarea id="delimitacionPrecisa" value={helperData.delimitacionPrecisa || ''} onChange={(e) => handleHelperInputChange('delimitacionPrecisa', e.target.value)} placeholder="Ej., Inicia con la recepción de la solicitud del cliente y finaliza con la confirmación de la solución." className="min-h-[60px] mt-1"/>
                    </div>
                    <div>
                        <Label htmlFor="condicionesDeExclusion">Condiciones de exclusión</Label>
                        <Textarea id="condicionesDeExclusion" value={helperData.condicionesDeExclusion || ''} onChange={(e) => handleHelperInputChange('condicionesDeExclusion', e.target.value)} placeholder="Ej., No aplica para solicitudes de hardware, no cubre fallos de infraestructura de red." className="min-h-[60px] mt-1"/>
                    </div>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">4. Condiciones y Contexto de Aplicación</h4>
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="criteriosDeActivacion">Criterios de activación</Label>
                        <Textarea id="criteriosDeActivacion" value={helperData.criteriosDeActivacion || ''} onChange={(e) => handleHelperInputChange('criteriosDeActivacion', e.target.value)} placeholder="Ej., Al recibir una alerta de sistema crítico, cuando un cliente reporta un error de tipo A." className="min-h-[60px] mt-1"/>
                    </div>
                    <div>
                        <Label htmlFor="contextoOperativo">Contexto operativo</Label>
                        <Textarea id="contextoOperativo" value={helperData.contextoOperativo || ''} onChange={(e) => handleHelperInputChange('contextoOperativo', e.target.value)} placeholder="Ej., Se aplica en el sistema de ticketing Jira, utilizando la base de conocimiento Confluence." className="min-h-[60px] mt-1"/>
                    </div>
                </div>
            </div>
            
            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">5. Interrelación con Otros Procesos y Normas</h4>
                <div className="space-y-3">
                    {renderObjectInputs('conexionesDocumentales', 'Conexiones Documentales', 'documento', 'Nombre del Documento', 'Ej. POA de Gestión de Cambios', 'codigo', 'Código/ID (Opcional)', 'Ej. GC-POA-002')}
                    {renderObjectInputs('referenciaANormas', 'Referencia a Normativas o Estándares', 'referencia', 'Norma/Estándar', 'Ej. ISO 27001, Política de Seguridad Interna', 'codigo', 'Cláusula/Sección (Opcional)', 'Ej. Anexo A.12.1')}
                </div>
            </div>
            
            <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold text-primary mb-2">6. Vigencia y Revisión (Opcional)</h4>
                <div className="space-y-3">
                     <div>
                        <Label htmlFor="duracionYPeriodicidad">Duración y Periodicidad</Label>
                        <Textarea id="duracionYPeriodicidad" value={helperData.duracionYPeriodicidad || ''} onChange={(e) => handleHelperInputChange('duracionYPeriodicidad', e.target.value)} placeholder="Ej., Vigente hasta 31/12/2025, aplicable durante el Q3 de cada año." className="min-h-[60px] mt-1"/>
                    </div>
                     <div>
                        <Label htmlFor="revision">Revisión del Alcance</Label>
                        <Textarea id="revision" value={helperData.revision || ''} onChange={(e) => handleHelperInputChange('revision', e.target.value)} placeholder="Ej., Revisión anual o tras cambios significativos en los sistemas involucrados." className="min-h-[60px] mt-1"/>
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

