"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Save, X, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { usePOA } from "@/hooks/use-poa";
import { usePOAAPI } from "@/hooks/use-poa-api";
import { aiApi } from "@/api/ai";
import { useToast } from "@/hooks/use-toast";
import type { POADefinition } from "@/lib/schema";

interface EditingDefinition extends POADefinition {
  isNew?: boolean;
}

export function DefinitionsForm() {
  const { poa, updateDefinitions } = usePOA();
  const { updateDefinitions: updateDefinitionsAPI } = usePOAAPI();
  const { toast } = useToast();
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDefinition, setEditingDefinition] = useState<EditingDefinition | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
  const newTextareaRef = useRef<HTMLTextAreaElement>(null);

  const definitions = poa?.definitions || [];
  const updateDefinitionsMutation = updateDefinitionsAPI();

  // Función helper para crear la definición limpia
  const createCleanDefinition = (def: EditingDefinition | POADefinition): POADefinition => {
    return {
      term: def.term.trim(),
      definition: def.definition.trim(),
    };
  };

  // Función para limpiar todas las definiciones (remover _id, id, etc.)
  const cleanAllDefinitions = (defs: (POADefinition | EditingDefinition)[]): POADefinition[] => {
    return defs.map(def => createCleanDefinition(def));
  };

  // Forzar re-render cuando la IA actualice la definición
  useEffect(() => {
    console.log("🔄 useEffect - editingDefinition cambió:", editingDefinition);
    if (editingDefinition?.definition) {
      console.log("✅ Definición presente:", editingDefinition.definition);
    } else {
      console.log("❌ Definición ausente o vacía");
    }
  }, [editingDefinition]);

  const handleAddNew = () => {
    const newDefinition: EditingDefinition = {
      term: "",
      definition: "",
      isNew: true,
    };
    setEditingDefinition(newDefinition);
    setEditingIndex(definitions.length);
  };

  const handleEdit = (index: number) => {
    setEditingDefinition({ ...definitions[index] });
    setEditingIndex(index);
  };

  const handleCancel = () => {
    setEditingDefinition(null);
    setEditingIndex(null);
  };

  const handleSave = async () => {
    if (!editingDefinition || !poa) return;

    // Validaciones
    if (!editingDefinition.term.trim()) {
      toast({
        title: "Error de validación",
        description: "El término es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!editingDefinition.definition.trim()) {
      toast({
        title: "Error de validación", 
        description: "La definición es requerida",
        variant: "destructive",
      });
      return;
    }

    if (editingDefinition.term.length > 250) {
      toast({
        title: "Error de validación",
        description: "El término no puede exceder 250 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (editingDefinition.definition.length > 4000) {
      toast({
        title: "Error de validación",
        description: "La definición no puede exceder 4000 caracteres", 
        variant: "destructive",
      });
      return;
    }

    // Crear nueva lista de definiciones
    let newDefinitions: POADefinition[];
    
    if (editingDefinition.isNew) {
      // Agregar nueva definición
      const allDefs = [...definitions, editingDefinition];
      newDefinitions = cleanAllDefinitions(allDefs);
    } else {
      // Actualizar definición existente
      const allDefs = definitions.map((def, index) => 
        index === editingIndex ? editingDefinition : def
      );
      newDefinitions = cleanAllDefinitions(allDefs);
    }

    try {
      // Actualizar en el backend
      await updateDefinitionsMutation.mutateAsync({
        procedureId: poa.procedureId,
        definitions: { definitions: newDefinitions },
      });

      // Actualizar en el contexto local
      updateDefinitions(newDefinitions);

      toast({
        title: "Definición guardada",
        description: `La definición de "${editingDefinition.term}" ha sido guardada exitosamente`,
      });

      // Limpiar estado de edición
      setEditingDefinition(null);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving definition:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la definición. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (index: number) => {
    if (!poa) return;

    const definitionToDelete = definitions[index];
    const filteredDefinitions = definitions.filter((_, i) => i !== index);
    const newDefinitions = cleanAllDefinitions(filteredDefinitions);

    try {
      // Actualizar en el backend
      await updateDefinitionsMutation.mutateAsync({
        procedureId: poa.procedureId,
        definitions: { definitions: newDefinitions },
      });

      // Actualizar en el contexto local
      updateDefinitions(newDefinitions);

      toast({
        title: "Definición eliminada",
        description: `La definición de "${definitionToDelete.term}" ha sido eliminada`,
      });
    } catch (error) {
      console.error("Error deleting definition:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la definición. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateWithAI = async () => {
    if (!editingDefinition?.term.trim()) {
      toast({
        title: "Término requerido",
        description: "Ingresa un término antes de generar la definición con IA",
        variant: "destructive",
      });
      return;
    }

    console.log("🚀 INICIO - handleGenerateWithAI");
    console.log("🔍 editingDefinition actual:", editingDefinition);
    
    setIsGeneratingAI(true);
    try {
      const termToGenerate = editingDefinition.term.trim();
      console.log("🔄 Generando definición para término:", termToGenerate);
      
      const response = await aiApi.generateDefinition(termToGenerate);
      console.log("✅ Respuesta de IA recibida:", response);
      console.log("✅ Tipo de respuesta:", typeof response);
      console.log("✅ response.definition:", response.definition);
      console.log("✅ Tipo de response.definition:", typeof response.definition);
      
      // Extraer la definición de la respuesta
      const newDefinition = response.definition || (response as any).data?.definition || (response as any);
      console.log("🎯 Definición extraída:", newDefinition);
      console.log("🎯 Tipo de definición:", typeof newDefinition);
      
      // Validar que tenemos una definición válida
      if (!newDefinition || typeof newDefinition !== 'string') {
        console.error("❌ Definición inválida recibida:", newDefinition);
        toast({
          title: "Error de IA",
          description: "La IA no devolvió una definición válida",
          variant: "destructive",
        });
        return;
      }
      
      // Actualizar el estado de forma segura
      setEditingDefinition(prev => {
        if (!prev) {
          console.log("❌ editingDefinition es null, no se puede actualizar");
          return null;
        }
        
        // Crear el nuevo objeto con la definición
        const updated = {
          term: prev.term,
          definition: newDefinition,
          isNew: prev.isNew,
        };
        console.log("✅ Nuevo estado creado:", updated);
        return updated;
      });
      
      // Forzar re-render
      setForceRenderKey(prevKey => {
        const newKey = prevKey + 1;
        console.log("🔄 Forzando re-mount con key:", newKey);
        return newKey;
      });
      
      console.log("✅ Estado actualizado con definición:", response.definition);
      
      toast({
        title: "Definición generada",
        description: "La IA ha generado una definición. Puedes editarla antes de guardar.",
      });
    } catch (error: any) {
      console.error("❌ ERROR COMPLETO:", error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error response:", error?.response);
      console.error("❌ Error response data:", error?.response?.data);
      
      toast({
        title: "Error de IA",
        description: `No se pudo generar la definición con IA. Error: ${error?.message || 'Desconocido'}`,
        variant: "destructive",
      });
    } finally {
      console.log("🏁 FINALIZANDO - handleGenerateWithAI");
      setIsGeneratingAI(false);
    }
  };

  const isEditing = editingIndex !== null;
  const isSaving = updateDefinitionsMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Definiciones del Procedimiento</span>
          <Button 
            onClick={handleAddNew} 
            disabled={isEditing}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir Término
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {definitions.length === 0 && !isEditing ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No hay definiciones agregadas</p>
            <p className="text-sm">Haz clic en "Añadir Término" para comenzar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Término</TableHead>
                <TableHead className="w-1/2">Definición</TableHead>
                <TableHead className="w-1/6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {definitions.map((definition, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        value={editingDefinition?.term || ""}
                        onChange={(e) =>
                          setEditingDefinition(prev => prev ? { ...prev, term: e.target.value } : null)
                        }
                        placeholder="Ingresa el término"
                        maxLength={250}
                      />
                    ) : (
                      <span className="font-medium">{definition.term}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <div className="space-y-2">
                        <Textarea
                          ref={editingTextareaRef}
                          key={`editing-${editingIndex}-${forceRenderKey}`}
                          value={editingDefinition?.definition || ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setEditingDefinition(prev => prev ? { ...prev, definition: newValue } : null);
                          }}
                          placeholder="Ingresa la definición"
                          maxLength={4000}
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateWithAI}
                            disabled={isGeneratingAI || !editingDefinition?.term.trim()}
                            className="flex items-center gap-2"
                          >
                            {isGeneratingAI ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            {isGeneratingAI ? "Generando..." : "Generar con IA"}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {editingDefinition?.definition?.length || 0}/4000 caracteres
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm">{definition.definition}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-1"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(index)}
                          disabled={isEditing}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(index)}
                          disabled={isEditing}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Fila para agregar nueva definición */}
              {isEditing && editingDefinition?.isNew && (
                <TableRow>
                  <TableCell>
                    <Input
                      value={editingDefinition?.term || ""}
                      onChange={(e) =>
                        setEditingDefinition(prev => prev ? { ...prev, term: e.target.value } : null)
                      }
                      placeholder="Ingresa el término"
                      maxLength={250}
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Textarea
                        ref={newTextareaRef}
                        key={`new-definition-${forceRenderKey}`}
                        value={editingDefinition?.definition || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          console.log("📝 Usuario escribiendo:", newValue);
                          setEditingDefinition(prev => prev ? { ...prev, definition: newValue } : null);
                        }}
                        placeholder="Ingresa la definición"
                        maxLength={4000}
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateWithAI}
                          disabled={isGeneratingAI || !editingDefinition?.term.trim()}
                          className="flex items-center gap-2"
                        >
                          {isGeneratingAI ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {isGeneratingAI ? "Generando..." : "Generar con IA"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {editingDefinition?.definition?.length || 0}/4000 caracteres
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 