'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileEdit, 
  AlertCircle, 
  Info, 
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';
import { ChangeControlTable } from './change-control-table';
import { ChangeControlDialog } from './change-control-dialog';
import { useChangeControl } from '@/hooks/use-change-control';
import {
  CreateChangeControlEntry,
  UpdateChangeControlEntry,
  POAChangeControlEntry,
} from '@/lib/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChangeControlFormProps {
  procedureId: string;
  readOnly?: boolean;
  className?: string;
}

export function ChangeControlForm({
  procedureId,
  readOnly = false,
  className,
}: ChangeControlFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedEntry, setSelectedEntry] = useState<POAChangeControlEntry | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<POAChangeControlEntry | undefined>();

  const {
    entries,
    isLoading,
    fetchEntries,
    addEntry,
    updateLastEntry,
    removeLastEntry,
    getCurrentDateFormatted,
    isLastEntry,
    formatDateForDisplay,
    hasEntries,
    lastEntry,
    entryCount,
  } = useChangeControl({
    procedureId,
    onSuccess: () => {
      // Callback opcional para acciones adicionales después del éxito
    },
    onError: (error) => {
      console.error('Error en control de cambios:', error);
    },
  });

  // Cargar entradas al montar el componente
  useEffect(() => {
    if (procedureId && procedureId !== 'new') {
      fetchEntries();
    }
  }, [procedureId, fetchEntries]); // Ahora fetchEntries es estable

  // Manejar agregar nueva entrada
  const handleAddEntry = () => {
    setDialogMode('add');
    setSelectedEntry(undefined);
    setDialogOpen(true);
  };

  // Manejar editar entrada (solo la última)
  const handleEditEntry = (entry: POAChangeControlEntry) => {
    if (!isLastEntry(entry.entryNumber)) {
      return; // Solo se puede editar la última entrada
    }
    setDialogMode('edit');
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  // Manejar confirmación de eliminación
  const handleDeleteEntry = (entry: POAChangeControlEntry) => {
    if (!isLastEntry(entry.entryNumber)) {
      return; // Solo se puede eliminar la última entrada
    }
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (entryToDelete) {
      await removeLastEntry();
      setDeleteDialogOpen(false);
      setEntryToDelete(undefined);
    }
  };

  // Manejar envío del diálogo
  const handleDialogSubmit = async (
    data: CreateChangeControlEntry | UpdateChangeControlEntry
  ): Promise<boolean> => {
    if (dialogMode === 'add') {
      return await addEntry(data as CreateChangeControlEntry);
    } else {
      return await updateLastEntry(data as UpdateChangeControlEntry);
    }
  };

  // Verificar si el procedimiento está guardado
  const isProcedureNew = !procedureId || procedureId === 'new';

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-primary" />
                <CardTitle>Control de Cambios</CardTitle>
              </div>
              {hasEntries && (
                <Badge variant="secondary" className="text-xs">
                  {entryCount} {entryCount === 1 ? 'entrada' : 'entradas'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEntries}
                disabled={isLoading || isProcedureNew}
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
              
              {!readOnly && (
                <Button
                  onClick={handleAddEntry}
                  disabled={isLoading || isProcedureNew}
                  size="sm"
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Entrada
                </Button>
              )}
            </div>
          </div>
          
          <CardDescription className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>
              Registra todos los cambios realizados al procedimiento. Solo se puede editar o eliminar la última entrada.
              {isProcedureNew && ' Guarda el procedimiento primero para habilitar esta función.'}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alerta para procedimiento nuevo */}
          {isProcedureNew && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                El control de cambios estará disponible después de guardar el procedimiento.
              </AlertDescription>
            </Alert>
          )}

          {/* Información de estado */}
          {!isProcedureNew && hasEntries && lastEntry && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Última entrada: #{lastEntry.entryNumber} - {formatDateForDisplay(lastEntry.changeDate)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {lastEntry.responsible}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Alerta de restricciones */}
          {!isProcedureNew && hasEntries && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Solo se puede editar o eliminar la última entrada del control de cambios.
                Las entradas anteriores son de solo lectura para mantener la integridad del historial.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabla de entradas */}
          <div className="border rounded-lg">
            <ChangeControlTable
              entries={entries}
              isLoading={isLoading}
              onEdit={!readOnly ? handleEditEntry : undefined}
              onDelete={!readOnly ? handleDeleteEntry : undefined}
              isLastEntry={isLastEntry}
              formatDateForDisplay={formatDateForDisplay}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para agregar/editar */}
      <ChangeControlDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        entry={selectedEntry}
        onSubmit={handleDialogSubmit}
        isLoading={isLoading}
        getCurrentDateFormatted={getCurrentDateFormatted}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar entrada de control de cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la entrada #{entryToDelete?.entryNumber} del control de cambios.
              <br />
              <br />
              <strong>Fecha:</strong> {entryToDelete?.changeDate && formatDateForDisplay(entryToDelete.changeDate)}
              <br />
              <strong>Responsable:</strong> {entryToDelete?.responsible}
              <br />
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Entrada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 