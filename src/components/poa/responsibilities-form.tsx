'use client';

import { UpdateResponsibleRequest } from '@/api/poa';
import { useState, useRef } from 'react';
import { usePOA } from '@/hooks/use-poa';
import { useResponsibilities } from '@/hooks/use-responsibilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning, Pencil, Save, X, Trash2, Plus, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { POAResponsible } from '@/lib/schema';

interface EditingResponsible extends Partial<POAResponsible> {
  isNew?: boolean;
  role: string;
  summary: string;
}

export function ResponsibilitiesForm() {
  const { poa } = usePOA();
  const { 
    isLoading, 
    generateResponsibilities,
    addManualResponsible,
    updateResponsible,
    deleteResponsible,
  } = useResponsibilities();
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingResponsible, setEditingResponsible] = useState<EditingResponsible | null>(null);
  
  // Refs for focus management
  const roleInputRef = useRef<HTMLInputElement>(null);

  if (!poa) {
    return <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>;
  }

  const hasActivities = poa.activities && poa.activities.length > 0;
  const hasResponsibilities = poa.responsibilities && poa.responsibilities.length > 0;
  const responsibilities = poa.responsibilities || [];

  if (!hasActivities) {
    return (
      <Alert variant="default">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Sección Bloqueada</AlertTitle>
        <AlertDescription>
          Para generar responsabilidades, primero debe agregar actividades en la sección correspondiente.
        </AlertDescription>
      </Alert>
    );
  }

  const handleAddNew = () => {
    const newResponsible: EditingResponsible = {
      role: '',
      summary: '',
      isNew: true,
    };
    setEditingResponsible(newResponsible);
    setEditingIndex(responsibilities.length);
  };

  const handleEdit = (index: number) => {
    const resp = responsibilities[index];
    setEditingResponsible({
      ...resp,
      role: resp.role || '',
      summary: resp.summary || '',
      isNew: false
    });
    setEditingIndex(index);
  };

  const handleCancel = () => {
    setEditingResponsible(null);
    setEditingIndex(null);
  };

  const handleSave = async () => {
    if (!editingResponsible) return;

    // Validation
    if (!editingResponsible.role.trim()) {
      return;
    }

    try {
      if (editingResponsible.isNew) {
        await addManualResponsible({
          responsibleName: editingResponsible.role, // Map role to responsibleName
          role: editingResponsible.role,
          summary: editingResponsible.summary,
        });
      } else if (editingResponsible.id) {
        const updateData: UpdateResponsibleRequest = {
          role: editingResponsible.role,
          summary: editingResponsible.summary,
        };
        
        // Only update responsibleName if it's a manual entry, to keep it synced with role
        if (editingResponsible.type === 'manual') {
            updateData.responsibleName = editingResponsible.role;
        }

        await updateResponsible(editingResponsible.id, updateData);
      }
      
      handleCancel();
    } catch (error) {
      console.error("Error saving responsible:", error);
    }
  };

  const handleDelete = async (index: number) => {
    const resp = responsibilities[index];
    if (resp.id) {
        await deleteResponsible(resp.id);
    }
  };

  const isEditing = editingIndex !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span>Responsabilidades del Proceso</span>
          <div className="flex items-center gap-2">
             <Button 
              onClick={() => generateResponsibilities(hasResponsibilities)}
              disabled={isLoading || isEditing}
              variant="outline"
              size="sm"
            >
              {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
              {hasResponsibilities ? 'Regenerar Automáticos' : 'Generar Responsabilidades'}
            </Button>
            <Button 
                onClick={handleAddNew} 
                disabled={isEditing || isLoading}
                className="flex items-center gap-2"
                size="sm"
            >
                <Plus className="h-4 w-4" />
                Agregar Responsable
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {responsibilities.length === 0 && !isEditing ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No hay responsabilidades generadas</p>
            <p className="text-sm">Haga clic en &quot;Generar&quot; para empezar o agregue uno manualmente.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Rol responsable</TableHead>
                <TableHead className="w-1/2">Resumen de Responsabilidades</TableHead>
                <TableHead className="w-1/6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsibilities.map((resp, index) => (
                <TableRow key={resp.id || index}>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        ref={roleInputRef}
                        value={editingResponsible?.role || ""}
                        onChange={(e) =>
                          setEditingResponsible(prev => prev ? { ...prev, role: e.target.value } : null)
                        }
                        placeholder="Rol responsable"
                        disabled={isLoading}
                      />
                    ) : (
                      <span className="font-medium">{resp.role || resp.responsibleName}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <Textarea
                        value={editingResponsible?.summary || ""}
                        onChange={(e) =>
                          setEditingResponsible(prev => prev ? { ...prev, summary: e.target.value } : null)
                        }
                        placeholder="Resumen de responsabilidades"
                        rows={3}
                        disabled={isLoading}
                      />
                    ) : (
                      <span className="text-sm whitespace-pre-wrap">{resp.summary}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isLoading}
                          className="flex items-center gap-1"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isLoading}
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
                          disabled={isEditing || isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(index)}
                          disabled={isEditing || isLoading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Row for adding new responsible */}
              {isEditing && editingResponsible?.isNew && (
                <TableRow>
                  <TableCell>
                    <Input
                      value={editingResponsible?.role || ""}
                      onChange={(e) =>
                        setEditingResponsible(prev => prev ? { ...prev, role: e.target.value } : null)
                      }
                      placeholder="Rol responsable"
                      autoFocus
                      disabled={isLoading}
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={editingResponsible?.summary || ""}
                      onChange={(e) =>
                        setEditingResponsible(prev => prev ? { ...prev, summary: e.target.value } : null)
                      }
                      placeholder="Resumen de responsabilidades"
                      rows={3}
                      disabled={isLoading}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
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
