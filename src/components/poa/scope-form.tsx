
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
import { generateScope } from "@/ai/flows/generate-scope"; // Ensure this is the correct import
import type { GenerateScopeInput } from "@/ai/flows/generate-scope";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Trash2, Brain, Wand2, Lightbulb, Undo2, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POAScopeHelperData, POAScopeUsuarioRol, POAScopeConexionDocumental, POAScopeReferenciaNorma } from "@/lib/schema";
import { defaultPOAScopeHelperData } from "@/lib/schema";

export function ScopeForm() {
  const { poa, updateField, saveCurrentPOA, setIsDirty, updateScopeHelperData: updatePoaScopeHelperData } = usePOA();
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [maxWords, setMaxWords] = useState(60); // Default max words for scope
  const { toast } = useToast();
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);
  const [showHelperSection, setShowHelperSection] = useState(false);

  const [helperData, setHelperData] = useState<POAScopeHelperData>(() => {
    const initialSource = poa?.scopeHelperData || defaultPOAScopeHelperData;
    return JSON.parse(JSON.stringify(initialSource)); // Deep copy to avoid mutation issues
  });

  // Sync from context to local state
  useEffect(() => {
    const contextSource = poa?.scopeHelperData || defaultPOAScopeHelperData;
    if (JSON.stringify(helperData) !== JSON.stringify(contextSource)) {
      setHelperData(JSON.parse(JSON.stringify(contextSource))); // Deep copy
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poa?.scopeHelperData]);

  // Sync from local state to context
  useEffect(() => {
    if (poa && JSON.stringify(helperData) !== JSON.stringify(poa.scopeHelperData || defaultPOAScopeHelperData)) {
      updatePoaScopeHelperData(helperData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helperData, poa?.id]);

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

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  const canEnhanceMainScope = !!poa.scope && poa.scope.length > 5;
  const canGenerateFromHelper = Object.values(helperData).some(val => {
    if (Array.isArray(val)) {
      return val.some(item => {
        if (typeof item === 'string') return item.trim() !== '';
        if (typeof item === 'object' && item !== null) return Object.values(item).some(v => typeof v === 'string' && v.trim() !== '');
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
          {(helperData[fieldKey] || []).length > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperArrayStringItem(fieldKey, index)} className="text-destructive shrink-0">
              <Trash2 className="h-4 w-4" />
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
      {(helperData[fieldKey] || [{ id: crypto.randomUUID() }]).map((item, index) => (
        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-2 border rounded-md">
          <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor={`${fieldKey}-${index}-${String(prop1Key)}`} className="text-xs">{prop1Label}</Label>
            <Input
              id={`${fieldKey}-${index}-${String(prop1Key)}`}
              value={item[prop1Key] || ''}
              onChange={(e) => handleHelperObjectChange(fieldKey, index, prop1Key, e.target.value)}
              placeholder={prop1Placeholder}
              className="mt-1 w-full"
            />
          </div>
          <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor={`${fieldKey}-${index}-${String(prop2Key)}`} className="text-xs">{prop2Label}</Label>
            <Input
              id={`${fieldKey}-${index}-${String(prop2Key)}`}
              value={item[prop2Key] || ''}
              onChange={(e) => handleHelperObjectChange(fieldKey, index, prop2Key, e.target.value)}
              placeholder={prop2Placeholder}
              className="mt-1 w-full"
            />
          </div>
          {(helperData[fieldKey] || []).length > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeHelperObjectItem(fieldKey, index)} className="text-destructive shrink-0 self-center sm:self-end">
              <Trash2 className="h-4 w-4" />
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
            <div className="p-3 border rounded-md bg-muted/30">
                <h4 className="text-sm font-semibold text-primary mb-2">1. Definición del Ámbito de Aplicación</h4>
                <div className="space-y-3">
                    <Textarea value={helperData.procesosYActividades || ''} onChange={(e) => handleHelperInputChange('procesosYActividades', e.target.value)} placeholder="Procesos y actividades clave cubiertos" label="Procesos y actividades clave cubiertos" className="min-h-[60px]"/>
                    {renderArrayStringInputs('departamentosOAreas', 'Departamentos o Áreas Involucradas', 'Departamento/Área')}
                    {renderArrayStringInputs('productosOServicios', 'Productos o Servicios Afectados', 'Producto/Servicio')}
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/30">
                <h4 className="text-sm font-semibold text-primary mb-2">2. Aplicabilidad y Responsables</h4>
                <div className="space-y-3">
                    {renderObjectInputs('usuariosYRoles', 'Usuarios y Roles Específicos', 'usuario', 'Usuario', 'Ej. Analista de Soporte', 'rol', 'Rol', 'Ej. Ejecutor del procedimiento')}
                    <Textarea value={helperData.gradoDeInclusion || ''} onChange={(e) => handleHelperInputChange('gradoDeInclusion', e.target.value)} placeholder="Grado de inclusión o exclusión de ciertos roles" label="Grado de inclusión o exclusión" className="min-h-[60px]"/>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/30">
                <h4 className="text-sm font-semibold text-primary mb-2">3. Límites y Exclusiones</h4>
                <div className="space-y-3">
                    <Textarea value={helperData.delimitacionPrecisa || ''} onChange={(e) => handleHelperInputChange('delimitacionPrecisa', e.target.value)} placeholder="Delimitación precisa del inicio y fin del procedimiento" label="Delimitación precisa (inicio/fin)" className="min-h-[60px]"/>
                    <Textarea value={helperData.condicionesDeExclusion || ''} onChange={(e) => handleHelperInputChange('condicionesDeExclusion', e.target.value)} placeholder="Condiciones específicas bajo las cuales el procedimiento NO aplica" label="Condiciones de exclusión" className="min-h-[60px]"/>
                </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/30">
                <h4 className="text-sm font-semibold text-primary mb-2">4. Condiciones y Contexto de Aplicación</h4>
                <div className="space-y-3">
                    <Textarea value={helperData.criteriosDeActivacion || ''} onChange={(e) => handleHelperInputChange('criteriosDeActivacion', e.target.value)} placeholder="Criterios o eventos que activan la aplicación del procedimiento" label="Criterios de activación" className="min-h-[60px]"/>
                    <Textarea value={helperData.contextoOperativo || ''} onChange={(e) => handleHelperInputChange('contextoOperativo', e.target.value)} placeholder="Contexto operativo (ej. sistemas, herramientas, entornos específicos)" label="Contexto operativo" className="min-h-[60px]"/>
                </div>
            </div>
            
            <div className="p-3 border rounded-md bg-muted/30">
                <h4 className="text-sm font-semibold text-primary mb-2">5. Interrelación con Otros Procesos y Normas</h4>
                <div className="space-y-3">
                    {renderObjectInputs('conexionesDocumentales', 'Conexiones Documentales (Otros POAs, Guías, etc.)', 'documento', 'Documento', 'Ej. POA de Gestión de Incidentes', 'codigo', 'Código/ID (Opcional)', 'Ej. TI-POA-005')}
                    {renderObjectInputs('referenciaANormas', 'Referencia a Normativas o Estándares', 'referencia', 'Norma/Estándar', 'Ej. ISO 9001:2015', 'codigo', 'Cláusula/Sección (Opcional)', 'Ej. 7.5.3')}
                </div>
            </div>
            
            <div className="p-3 border rounded-md bg-muted/30">
                <h4 className="text-sm font-semibold text-primary mb-2">6. Vigencia y Revisión (Opcional)</h4>
                <div className="space-y-3">
                     <Textarea value={helperData.duracionYPeriodicidad || ''} onChange={(e) => handleHelperInputChange('duracionYPeriodicidad', e.target.value)} placeholder="Duración, fechas de inicio/fin, o periodicidad de aplicación" label="Duración y Periodicidad" className="min-h-[60px]"/>
                     <Textarea value={helperData.revision || ''} onChange={(e) => handleHelperInputChange('revision', e.target.value)} placeholder="Frecuencia o condiciones para la revisión y actualización del alcance" label="Revisión del Alcance" className="min-h-[60px]"/>
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
