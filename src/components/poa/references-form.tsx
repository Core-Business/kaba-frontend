"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Save, X, Trash2, Plus, Loader2 } from "lucide-react";
import { usePOA } from "@/hooks/use-poa";
import { usePOAAPI } from "@/hooks/use-poa-api";
import { useToast } from "@/hooks/use-toast";
import type { POAReference } from "@/lib/schema";

interface EditingReference extends POAReference {
  isNew?: boolean;
}

export function ReferencesForm() {
  const { poa, updateReferences } = usePOA();
  const { updateReferences: updateReferencesAPI } = usePOAAPI();
  const { toast } = useToast();
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingReference, setEditingReference] = useState<EditingReference | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const references = poa?.references || [];
  const updateReferencesMutation = updateReferencesAPI();

  // Función helper para crear la referencia limpia
  const createCleanReference = (ref: EditingReference | POAReference): POAReference => {
    const cleanRef: POAReference = {
      nombreReferencia: ref.nombreReferencia.trim(),
      tipoReferencia: ref.tipoReferencia.trim(),
    };
    
    // Solo agregar campos opcionales si tienen contenido
    if (ref.codigo?.trim()) {
      cleanRef.codigo = ref.codigo.trim();
    }
    if (ref.enlace?.trim()) {
      cleanRef.enlace = ref.enlace.trim();
    }
    
    return cleanRef;
  };

  // Función para limpiar todas las referencias (remover _id, id, etc.)
  const cleanAllReferences = (refs: (POAReference | EditingReference)[]): POAReference[] => {
    return refs.map(ref => createCleanReference(ref));
  };

  const handleAddNew = () => {
    const newReference: EditingReference = {
      codigo: "",
      nombreReferencia: "",
      tipoReferencia: "",
      enlace: "",
      isNew: true,
    };
    setEditingReference(newReference);
    setEditingIndex(references.length);
  };

  const handleEdit = (index: number) => {
    setEditingReference({ ...references[index] });
    setEditingIndex(index);
  };

  const handleCancel = () => {
    setEditingReference(null);
    setEditingIndex(null);
  };

  const handleSave = async () => {
    if (!editingReference || !poa) return;

    // Validaciones
    if (!editingReference.nombreReferencia.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre de la referencia es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!editingReference.tipoReferencia.trim()) {
      toast({
        title: "Error de validación", 
        description: "El tipo de referencia es requerido",
        variant: "destructive",
      });
      return;
    }

    if (editingReference.codigo && editingReference.codigo.length > 255) {
      toast({
        title: "Error de validación",
        description: "El código no puede exceder 255 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (editingReference.nombreReferencia.length > 500) {
      toast({
        title: "Error de validación",
        description: "El nombre de la referencia no puede exceder 500 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (editingReference.tipoReferencia.length > 80) {
      toast({
        title: "Error de validación",
        description: "El tipo de referencia no puede exceder 80 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (editingReference.enlace && editingReference.enlace.length > 500) {
      toast({
        title: "Error de validación",
        description: "El enlace no puede exceder 500 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Crear nueva lista de referencias
    let newReferences: POAReference[];

    if (editingReference.isNew) {
      // Agregar nueva referencia
      const allRefs = [...references, editingReference];
      newReferences = cleanAllReferences(allRefs);
    } else {
      // Actualizar referencia existente
      const allRefs = references.map((ref, index) => 
        index === editingIndex ? editingReference : ref
      );
      newReferences = cleanAllReferences(allRefs);
    }

    try {
      // Debug logs
      console.log("🔄 Enviando referencias al backend:", {
        procedureId: poa.procedureId,
        references: newReferences,
        totalReferences: newReferences.length
      });
      
      // Actualizar en el backend
      await updateReferencesMutation.mutateAsync({
        procedureId: poa.procedureId,
        references: { references: newReferences },
      });

      // Actualizar en el contexto local
      updateReferences(newReferences);

      toast({
        title: "Referencia guardada",
        description: `La referencia "${editingReference.nombreReferencia}" ha sido guardada exitosamente`,
      });

      // Limpiar estado de edición
      setEditingReference(null);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving reference:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la referencia. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (index: number) => {
    if (!poa) return;

    const referenceToDelete = references[index];
    const filteredReferences = references.filter((_, i) => i !== index);
    const newReferences = cleanAllReferences(filteredReferences);

    try {
      // Debug logs para delete
      console.log("🗑️ Eliminando referencia del backend:", {
        referenceToDelete: referenceToDelete.nombreReferencia,
        procedureId: poa.procedureId,
        remainingReferences: newReferences.length
      });
      
      // Actualizar en el backend
      await updateReferencesMutation.mutateAsync({
        procedureId: poa.procedureId,
        references: { references: newReferences },
      });

      // Actualizar en el contexto local
      updateReferences(newReferences);

      toast({
        title: "Referencia eliminada",
        description: `La referencia "${referenceToDelete.nombreReferencia}" ha sido eliminada`,
      });
    } catch (error) {
      console.error("Error deleting reference:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la referencia. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const isSaving = updateReferencesMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Referencias
          <Button onClick={handleAddNew} size="sm" disabled={editingIndex !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Referencia
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {references.length === 0 && editingIndex === null ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay referencias definidas para este procedimiento.
            </p>
            <Button onClick={handleAddNew} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Referencia
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Código</TableHead>
                  <TableHead className="min-w-[250px]">Nombre de la Referencia</TableHead>
                  <TableHead className="w-[180px]">Tipo de Referencia</TableHead>
                  <TableHead className="min-w-[200px]">Enlace</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {references.map((reference, index) => (
                  <TableRow key={index}>
                    {editingIndex === index ? (
                      <>
                        <TableCell>
                          <Input
                            value={editingReference?.codigo || ""}
                            onChange={(e) => 
                              setEditingReference(prev => prev ? { ...prev, codigo: e.target.value } : null)
                            }
                            placeholder="Código (opcional)"
                            className="w-full"
                            maxLength={255}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            ref={nameInputRef}
                            value={editingReference?.nombreReferencia || ""}
                            onChange={(e) => 
                              setEditingReference(prev => prev ? { ...prev, nombreReferencia: e.target.value } : null)
                            }
                            placeholder="Nombre de la referencia *"
                            className="w-full"
                            maxLength={500}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingReference?.tipoReferencia || ""}
                            onChange={(e) => 
                              setEditingReference(prev => prev ? { ...prev, tipoReferencia: e.target.value } : null)
                            }
                            placeholder="Tipo de referencia *"
                            className="w-full"
                            maxLength={80}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingReference?.enlace || ""}
                            onChange={(e) => 
                              setEditingReference(prev => prev ? { ...prev, enlace: e.target.value } : null)
                            }
                            placeholder="Enlace (opcional)"
                            className="w-full"
                            maxLength={500}
                            type="url"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              disabled={isSaving}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="max-w-[150px]">
                          <div className="truncate" title={reference.codigo || ""}>
                            {reference.codigo || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="truncate" title={reference.nombreReferencia}>
                            {reference.nombreReferencia}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <div className="truncate" title={reference.tipoReferencia}>
                            {reference.tipoReferencia}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {reference.enlace ? (
                            <a 
                              href={reference.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline truncate block"
                              title={reference.enlace}
                            >
                              {reference.enlace}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(index)}
                              disabled={editingIndex !== null}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(index)}
                              disabled={editingIndex !== null || isSaving}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                
                {/* Fila para agregar nueva referencia */}
                {editingIndex === references.length && (
                  <TableRow>
                    <TableCell>
                      <Input
                        value={editingReference?.codigo || ""}
                        onChange={(e) => 
                          setEditingReference(prev => prev ? { ...prev, codigo: e.target.value } : null)
                        }
                        placeholder="Código (opcional)"
                        className="w-full"
                        maxLength={255}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        ref={nameInputRef}
                        value={editingReference?.nombreReferencia || ""}
                        onChange={(e) => 
                          setEditingReference(prev => prev ? { ...prev, nombreReferencia: e.target.value } : null)
                        }
                        placeholder="Nombre de la referencia *"
                        className="w-full"
                        maxLength={500}
                        required
                        autoFocus
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingReference?.tipoReferencia || ""}
                        onChange={(e) => 
                          setEditingReference(prev => prev ? { ...prev, tipoReferencia: e.target.value } : null)
                        }
                        placeholder="Tipo de referencia *"
                        className="w-full"
                        maxLength={80}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingReference?.enlace || ""}
                        onChange={(e) => 
                          setEditingReference(prev => prev ? { ...prev, enlace: e.target.value } : null)
                        }
                        placeholder="Enlace (opcional)"
                        className="w-full"
                        maxLength={500}
                        type="url"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 