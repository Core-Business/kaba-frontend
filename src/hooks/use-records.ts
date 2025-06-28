import { useState, useCallback } from 'react';
import { POAAPI } from '@/api/poa';
import { POARecord, CreateRecord, UpdateRecord } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';

export function useRecords(procedureId: string) {
  const [records, setRecords] = useState<POARecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Obtener todos los registros
  const fetchRecords = useCallback(async () => {
    if (!procedureId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await POAAPI.records.getAll(procedureId);
      const safeRecords = Array.isArray(data) ? data : [];
      setRecords(safeRecords);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar registros';
      setError(errorMessage);
      console.error('Error al obtener registros:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, toast]);

  // Agregar nuevo registro
  const addRecord = useCallback(async (recordData: CreateRecord) => {
    if (!procedureId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await POAAPI.records.add(procedureId, recordData);
      await fetchRecords(); // Recargar la lista
      toast({
        title: "Éxito",
        description: "Registro agregado correctamente",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al agregar registro';
      setError(errorMessage);
      console.error('Error al agregar registro:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, fetchRecords, toast]);

  // Actualizar registro específico
  const updateRecord = useCallback(async (recordId: string, recordData: UpdateRecord) => {
    if (!procedureId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await POAAPI.records.update(procedureId, recordId, recordData);
      await fetchRecords(); // Recargar la lista
      toast({
        title: "Éxito",
        description: "Registro actualizado correctamente",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar registro';
      setError(errorMessage);
      console.error('Error al actualizar registro:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, fetchRecords, toast]);

  // Eliminar registro específico
  const removeRecord = useCallback(async (recordId: string) => {
    if (!procedureId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await POAAPI.records.remove(procedureId, recordId);
      await fetchRecords(); // Recargar la lista
      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar registro';
      setError(errorMessage);
      console.error('Error al eliminar registro:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, fetchRecords, toast]);

  // Actualizar todos los registros (para formulario)
  const updateAllRecords = useCallback(async (allRecords: CreateRecord[]) => {
    if (!procedureId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await POAAPI.records.updateAll(procedureId, { records: allRecords });
      await fetchRecords(); // Recargar la lista
      toast({
        title: "Éxito",
        description: "Registros actualizados correctamente",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar registros';
      setError(errorMessage);
      console.error('Error al actualizar registros:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, fetchRecords, toast]);

  // Utilidad para crear un registro vacío
  const createEmptyRecord = useCallback((): CreateRecord => {
    return {
      title: '',
      format: '',
      responsible: '',
      frequency: '',
      retentionTime: '',
      storageMethod: '',
    };
  }, []);

  // Utilidad para validar si un registro está completo (campos obligatorios)
  const isRecordValid = useCallback((record: CreateRecord): boolean => {
    return !!(
      record.title?.trim() &&
      record.format?.trim() &&
      record.responsible?.trim() &&
      record.frequency?.trim() &&
      record.retentionTime?.trim()
    );
  }, []);

  // Utilidad para contar registros válidos
  const getValidRecordsCount = useCallback((): number => {
    return records.filter(record => 
      record.title?.trim() &&
      record.format?.trim() &&
      record.responsible?.trim() &&
      record.frequency?.trim() &&
      record.retentionTime?.trim()
    ).length;
  }, [records]);

  return {
    // Estado
    records,
    isLoading,
    error,
    
    // Operaciones CRUD
    fetchRecords,
    addRecord,
    updateRecord,
    removeRecord,
    updateAllRecords,
    
    // Utilidades
    createEmptyRecord,
    isRecordValid,
    getValidRecordsCount,
  };
} 