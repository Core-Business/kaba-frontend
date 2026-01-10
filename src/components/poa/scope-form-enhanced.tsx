"use client";

import { usePOA } from "@/hooks/use-poa";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScopeEditor } from "./scope/ScopeEditor";
import { ScopeContextPanel } from "./scope/ScopeContextPanel";
import { defaultPOAScopeHelperData } from "@/lib/schema";
import type { POAScopeHelperData, POAActivity } from "@/lib/schema";
import { enhanceText } from "@/ai/flows/enhance-text";
import { generateScope } from "@/ai/flows/generate-scope";
import { generateScopeFromActivities } from "@/ai/flows/generate-scope-from-activities";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ScopeFormEnhanced() {
  const { 
      poa, 
      saveToBackend, 
      isBackendLoading, 
      backendProcedureId, 
      updateField, 
      setIsDirty,
      updateScopeHelperData 
  } = usePOA();

  const { toast } = useToast();
  
  const [isLoadingAiEnhance, setIsLoadingAiEnhance] = useState(false);
  const [isLoadingAiGenerate, setIsLoadingAiGenerate] = useState(false);
  const [isLoadingAiGenerateFromActivities, setIsLoadingAiGenerateFromActivities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scopeBeforeAi, setScopeBeforeAi] = useState<string | null>(null);
  const [maxWords, setMaxWords] = useState(150);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);

  // Local helper state
  const [helperData, setHelperData] = useState<POAScopeHelperData>(defaultPOAScopeHelperData);
  const lastPoaIdRef = useRef<string | undefined>(poa?.id);

  // Sync helper data from POA context to local state
  useEffect(() => {
    if (!poa) return;
    if (poa.id !== lastPoaIdRef.current) {
        lastPoaIdRef.current = poa.id;
        const contextSource = poa.scopeHelperData || defaultPOAScopeHelperData;
        setHelperData({
            ...defaultPOAScopeHelperData,
            ...contextSource,
            // Ensure arrays have at least one empty item if empty (handled in component usually but good for safety)
            usuariosYRoles: contextSource.usuariosYRoles?.length ? contextSource.usuariosYRoles : [{ id: crypto.randomUUID(), usuario: '', rol: '' }],
            conexionesDocumentales: contextSource.conexionesDocumentales?.length ? contextSource.conexionesDocumentales : [{ id: crypto.randomUUID(), documento: '', codigo: '' }],
            referenciaANormas: contextSource.referenciaANormas?.length ? contextSource.referenciaANormas : [{ id: crypto.randomUUID(), referencia: '', codigo: '' }],
        });
    }
  }, [poa?.id]); // Only re-sync on ID change (nav)

  // Sync local changes back to POA context
  useEffect(() => {
    if (poa && (JSON.stringify(helperData) !== JSON.stringify(poa.scopeHelperData || defaultPOAScopeHelperData))) {
        updateScopeHelperData(helperData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helperData, poa?.id, poa]); // Added poa to deps


  const handleScopeChange = (value: string) => {
    updateField("scope", value);
    setScopeBeforeAi(null);
    setIsDirty(true);
  };

  const handleHelperDataChange = (newData: POAScopeHelperData) => {
    setHelperData(newData);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!poa || !backendProcedureId) return;
    setIsSaving(true);
    try {
      await saveToBackend();
      toast({ 
        title: "Alcance Guardado", 
        description: "Los cambios se han guardado correctamente." 
      });
    } catch (error) {
      console.error("Error guardando alcance:", error);
      toast({ 
        title: "Error al Guardar", 
        description: "No se pudo guardar el alcance.", 
        variant: "destructive" 
      });
    }
    setIsSaving(false);
  };

  // AI Actions
  const handleAiEnhance = async () => {
    if (!poa?.scope) return;
    setScopeBeforeAi(poa.scope);
    setIsLoadingAiEnhance(true);
    try {
        const result = await enhanceText({
            text: poa.scope,
            context: "scope",
            maxWords: maxWords,
        });
        updateField("scope", result.enhancedText);
        toast({ title: "Mejorado con IA", description: "El texto ha sido optimizado." });
    } catch (error) {
        console.error("Enhance Error", error);
        toast({ title: "Error", description: "Falló la mejora con IA.", variant: "destructive" });
    }
    setIsLoadingAiEnhance(false);
  };

  const handleAiGenerate = async () => {
    setScopeBeforeAi(poa?.scope || "");
    setIsLoadingAiGenerate(true);
    try {
        const inputForAI = {
            ...helperData,
            maxWords,
            usuariosYRoles: (helperData.usuariosYRoles || []).filter(u => u.id && (u.usuario?.trim() !== '' || u.rol?.trim() !== '')),
            conexionesDocumentales: (helperData.conexionesDocumentales || []).filter(c => c.id && (c.documento?.trim() !== '' || c.codigo?.trim() !== '')),
            referenciaANormas: (helperData.referenciaANormas || []).filter(r => r.id && (r.referencia?.trim() !== '' || r.codigo?.trim() !== '')),
        };
        const result = await generateScope(inputForAI);
        updateField("scope", result.generatedScope);
        toast({ title: "Generado con IA", description: "Nuevo alcance creado basado en los datos auxiliares." });
    } catch (error) {
        console.error("Generate Error", error);
        toast({ title: "Error", description: "Falló la generación.", variant: "destructive" });
    }
    setIsLoadingAiGenerate(false);
  };

  const performGenerateFromActivities = async () => {
      if (!poa) return;
      setScopeBeforeAi(poa.scope || null);
      setIsLoadingAiGenerateFromActivities(true);
      try {
          const inputForAI = {
              procedureName: poa.header.title || "",
              companyName: poa.header.companyName,
              objective: poa.objective,
              activities: poa.activities.map((a: POAActivity) => ({
                  responsible: a.responsible,
                  description: a.description
              })),
              maxWords: maxWords
          };
          const result = await generateScopeFromActivities(inputForAI);
          updateField("scope", result.generatedScope);
          toast({ title: "Generado desde Actividades", description: "Alcance creado analizando las actividades." });
      } catch (error) {
          console.error("Activities Generate Error", error);
          toast({ title: "Error", description: "Falló la generación.", variant: "destructive" });
      }
      setIsLoadingAiGenerateFromActivities(false);
      setShowOverwriteDialog(false);
  };
  
  const handleGenerateFromActivitiesClick = () => {
    if (poa?.scope && poa.scope.trim().length > 10) {
        setShowOverwriteDialog(true);
    } else {
        performGenerateFromActivities();
    }
  };

  const handleUndoAi = () => {
    if (scopeBeforeAi !== null) {
      updateField("scope", scopeBeforeAi);
      setScopeBeforeAi(null);
      toast({ title: "Deshecho", description: "Se restauró la versión anterior." });
    }
  };

  const isActivitiesLocked = poa?.activities.some((act: POAActivity) => act.nextActivityType === 'process_end') || false;

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
        <h1 className="text-2xl font-bold text-gray-900">Alcance del Procedimiento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Delimita claramente dónde empieza y dónde termina este procedimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Editor Column */}
        <div className="lg:col-span-2 space-y-4 h-full">
            <ScopeEditor 
                value={poa.scope || ""}
                onChange={handleScopeChange}
                isLoadingAi={isLoadingAiEnhance}
                onAiAction={handleAiEnhance}
                onUndoAi={handleUndoAi}
                canUndoAi={scopeBeforeAi !== null}
                onGenerateFromActivities={handleGenerateFromActivitiesClick}
                isLoadingActivities={isLoadingAiGenerateFromActivities}
                isActivitiesLocked={isActivitiesLocked}
                maxWords={maxWords}
                onMaxWordsChange={setMaxWords}
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
                    {isSaving ? "Guardando..." : "Guardar Alcance"}
                </Button>
            </div>
        </div>

        {/* Helper Column */}
        <div className="lg:col-span-1 h-full">
            <ScopeContextPanel 
                data={helperData}
                onChange={handleHelperDataChange}
                onGenerate={handleAiGenerate}
                isGenerating={isLoadingAiGenerate}
            />
        </div>
      </div>

      <AlertDialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Reemplazar contenido actual?</AlertDialogTitle>
                <AlertDialogDescription>
                    Ya existe una definición de alcance. Al generar uno nuevo se perderá lo que has escrito.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={performGenerateFromActivities}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
