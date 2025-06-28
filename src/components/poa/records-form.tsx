'use client';

import React, { useState, useEffect } from 'react';
import { POARecord, CreateRecord } from '@/lib/schema';
import { useRecords } from '@/hooks/use-records';
import { RecordsTable } from './records-table';
import { RecordsDialog } from './records-dialog';
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

interface RecordsFormProps {
  procedureId: string;
}

export function RecordsForm({ procedureId }: RecordsFormProps) {
  // Estados del hook personalizado
  const {
    records,
    isLoading,
    error,
    fetchRecords,
    addRecord,
    updateRecord,
    removeRecord,
  } = useRecords(procedureId);

  // Estados locales para UI
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<POARecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Cargar registros al montar el componente
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handlers para el diálogo
  const handleAddRecord = () => {
    setSelectedRecord(null);
    setDialogOpen(true);
  };

  const handleEditRecord = (record: POARecord) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleSubmitRecord = async (data: CreateRecord) => {
    if (selectedRecord) {
      // Actualizar registro existente
      await updateRecord(selectedRecord.id, data);
    } else {
      // Agregar nuevo registro
      await addRecord(data);
    }
  };

  // Handlers para eliminar
  const handleDeleteRecord = (recordId: string) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (recordToDelete) {
      try {
        await removeRecord(recordToDelete);
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
      } catch (error) {
        console.error('Error al eliminar registro:', error);
      }
    }
  };

  const cancelDeleteRecord = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // Encontrar el registro a eliminar para mostrar su información
  const recordToDeleteInfo = recordToDelete 
    ? records.find(r => r.id === recordToDelete)
    : null;

  return (
    <div className="space-y-6">
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Tabla de registros */}
      <RecordsTable
        records={records}
        isLoading={isLoading}
        onAddRecord={handleAddRecord}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* Diálogo para agregar/editar */}
      <RecordsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={selectedRecord}
        onSubmit={handleSubmitRecord}
        isLoading={isLoading}
      />

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              {recordToDeleteInfo ? (
                <>
                  Estás a punto de eliminar el registro:
                  <br />
                  <strong>No. {recordToDeleteInfo.recordNumber} - {recordToDeleteInfo.title}</strong>
                  <br /><br />
                  Esta acción no se puede deshacer. Los números de los registros restantes se recalcularán automáticamente.
                </>
              ) : (
                'Esta acción no se puede deshacer.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteRecord}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 