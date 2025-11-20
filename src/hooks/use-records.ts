import { useState, useCallback } from 'react';
import { POAAPI } from '@/api/poa';
import { POARecord, CreateRecord, UpdateRecord } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';

const getRecordsErrorMessage = (unknownError: unknown, fallback: string): string => {
  if (
    typeof unknownError === "object" &&
    unknownError !== null &&
    "response" in unknownError &&
    typeof (unknownError as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (unknownError as { response: { data: { message: string } } }).response.data.message;
  }
  if (unknownError instanceof Error && unknownError.message) {
    return unknownError.message;
  }
  return fallback;
};

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
    } catch (unknownError) {
      const errorMessage = getRecordsErrorMessage(unknownError, 'Error al cargar registros');
      setError(errorMessage);
      console.error('Error al obtener registros:', unknownError);
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
    } catch (unknownError) {
      const errorMessage = getRecordsErrorMessage(unknownError, 'Error al agregar registro');
      setError(errorMessage);
      console.error('Error al agregar registro:', unknownError);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw unknownError;
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
    } catch (unknownError) {
      const errorMessage = getRecordsErrorMessage(unknownError, 'Error al actualizar registro');
      setError(errorMessage);
      console.error('Error al actualizar registro:', unknownError);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw unknownError;
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
    } catch (unknownError) {
      const errorMessage = getRecordsErrorMessage(unknownError, 'Error al eliminar registro');
      setError(errorMessage);
      console.error('Error al eliminar registro:', unknownError);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw unknownError;
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
    } catch (unknownError) {
      const errorMessage = getRecordsErrorMessage(unknownError, 'Error al actualizar registros');
      setError(errorMessage);
      console.error('Error al actualizar registros:', unknownError);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw unknownError;
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