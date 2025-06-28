import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { POAAPI } from '@/api/poa';
import {
  POAChangeControlEntry,
  CreateChangeControlEntry,
  UpdateChangeControlEntry,
} from '@/lib/schema';

interface UseChangeControlOptions {
  procedureId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useChangeControl({
  procedureId,
  onSuccess,
  onError,
}: UseChangeControlOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<POAChangeControlEntry[]>([]);

  // Obtener todas las entradas de control de cambios
  const fetchEntries = useCallback(async () => {
    if (!procedureId || procedureId === 'new') {
      setEntries([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await POAAPI.changeControl.getAll(procedureId);
      // La API ya devuelve un array o un array vacío
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching change control entries:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entradas de control de cambios',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [procedureId]);

  // Agregar nueva entrada
  const addEntry = useCallback(
    async (entryData: CreateChangeControlEntry) => {
      if (!procedureId || procedureId === 'new') {
        toast({
          title: 'Error',
          description: 'No se puede agregar entrada a un procedimiento no guardado',
          variant: 'destructive',
        });
        return false;
      }

      setIsLoading(true);
      try {
        await POAAPI.changeControl.add(procedureId, entryData);
        await fetchEntries(); // Recargar entradas
        onSuccess?.();
        toast({
          title: 'Éxito',
          description: 'Entrada de control de cambios agregada correctamente',
        });
        return true;
      } catch (error) {
        console.error('Error adding change control entry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: 'No se pudo agregar la entrada de control de cambios',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [procedureId, fetchEntries]
  );

  // Actualizar la última entrada
  const updateLastEntry = useCallback(
    async (entryData: UpdateChangeControlEntry) => {
      if (!procedureId || procedureId === 'new') {
        toast({
          title: 'Error',
          description: 'No se puede actualizar entrada de un procedimiento no guardado',
          variant: 'destructive',
        });
        return false;
      }

      if (entries.length === 0) {
        toast({
          title: 'Error',
          description: 'No hay entradas para actualizar',
          variant: 'destructive',
        });
        return false;
      }

      setIsLoading(true);
      try {
        await POAAPI.changeControl.updateLast(procedureId, entryData);
        await fetchEntries(); // Recargar entradas
        onSuccess?.();
        toast({
          title: 'Éxito',
          description: 'Última entrada actualizada correctamente',
        });
        return true;
      } catch (error) {
        console.error('Error updating last change control entry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar la última entrada',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [procedureId, entries.length, fetchEntries]
  );

  // Eliminar la última entrada
  const removeLastEntry = useCallback(async () => {
    if (!procedureId || procedureId === 'new') {
      toast({
        title: 'Error',
        description: 'No se puede eliminar entrada de un procedimiento no guardado',
        variant: 'destructive',
      });
      return false;
    }

    if (entries.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay entradas para eliminar',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      await POAAPI.changeControl.removeLast(procedureId);
      await fetchEntries(); // Recargar entradas
      onSuccess?.();
      toast({
        title: 'Éxito',
        description: 'Última entrada eliminada correctamente',
      });
      return true;
    } catch (error) {
      console.error('Error removing last change control entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la última entrada',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, entries.length, fetchEntries]);

  // Función para obtener la fecha actual en formato MM-DD-YYYY
  const getCurrentDateFormatted = useCallback(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}-${day}-${year}`;
  }, []);

  // Función para validar si una entrada es la última
  const isLastEntry = useCallback(
    (entryNumber: number) => {
      if (entries.length === 0) return false;
      const maxEntryNumber = Math.max(...entries.map((entry) => entry.entryNumber));
      return entryNumber === maxEntryNumber;
    },
    [entries]
  );

  // Función para formatear fecha para mostrar
  const formatDateForDisplay = useCallback((dateString: string) => {
    try {
      const [month, day, year] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  }, []);

  return {
    // Estado
    entries,
    isLoading,
    
    // Operaciones CRUD
    fetchEntries,
    addEntry,
    updateLastEntry,
    removeLastEntry,
    
    // Utilidades
    getCurrentDateFormatted,
    isLastEntry,
    formatDateForDisplay,
    
    // Propiedades computadas
    hasEntries: entries.length > 0,
    lastEntry: entries.length > 0 ? entries[entries.length - 1] : null,
    entryCount: entries.length,
  };
} 