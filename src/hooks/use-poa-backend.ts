import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import {
  usePoaQuery,
  useAutoCreatePoaMutation,
  useCreatePoaMutation,
  usePartialUpdatePoaMutation,
  useUpdatePoaMutation,
} from './use-poa-api';
import { usePOA } from './use-poa';
import type { POA } from '@/lib/schema';
import type { CreatePOARequest } from '@/api/poa';
import { useToast } from './use-toast';
import { isAxiosError } from 'axios';

export interface UsePOABackendHandlers {
  procedureId: string | null;
  poa: POA | null;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  loadPoa: (poaData: POA) => void;
  saveToLocalStorage: () => void;
}

export function usePOABackendController({
  procedureId,
  poa,
  isDirty,
  setIsDirty,
  loadPoa,
  saveToLocalStorage,
}: UsePOABackendHandlers) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');
  const lastLoadedDataRef = useRef<POA | null>(null);
  const autoCreateAttemptedRef = useRef<string | null>(null);

  const poaQuery = usePoaQuery(procedureId);
  const autoCreateMutation = useAutoCreatePoaMutation();
  const partialUpdateMutation = usePartialUpdatePoaMutation();
  const updateMutation = useUpdatePoaMutation();
  const createMutation = useCreatePoaMutation();

  useEffect(() => {
    if (!procedureId) {
      lastLoadedDataRef.current = null;
      autoCreateAttemptedRef.current = null;
      return;
    }

    if (poaQuery.data && !poaQuery.isLoading) {
      if (lastLoadedDataRef.current === poaQuery.data) {
        return;
      }

      console.log('✅ Cargando POA desde backend');
      lastLoadedDataRef.current = poaQuery.data;
      loadPoa(poaQuery.data);
      lastSaveRef.current = JSON.stringify(poaQuery.data);
      autoCreateAttemptedRef.current = null;
    } else if (poaQuery.error && isAxiosError(poaQuery.error)) {
      const errorStatus = poaQuery.error.response?.status;
      if (errorStatus === 404) {
        if (autoCreateAttemptedRef.current === procedureId) {
          return;
        }

        console.log('POA no encontrado, auto-creando...');
        autoCreateAttemptedRef.current = procedureId;

        autoCreateMutation.mutate(
          { procedureId, partialPoa: {} },
          {
            onSuccess: (newPoa) => {
              console.log('POA auto-creado exitosamente');
              lastLoadedDataRef.current = null;
              loadPoa(newPoa);
              lastSaveRef.current = JSON.stringify(newPoa);
            },
            onError: (error) => {
              console.error('Error auto-creando POA:', error);
            },
          },
        );
      }
    }
  }, [
    poaQuery.data,
    poaQuery.isLoading,
    poaQuery.error,
    procedureId,
    autoCreateMutation,
    loadPoa,
  ]);

  useEffect(() => {
    if (!poa || !procedureId || !isDirty) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const currentPoaString = JSON.stringify(poa);

      if (currentPoaString !== lastSaveRef.current) {
        console.log('🔄 Auto-guardando cambios...');

        partialUpdateMutation.mutate(
          {
            procedureId,
            poa,
          },
          {
            onSuccess: () => {
              lastSaveRef.current = currentPoaString;
              setIsDirty(false);
              console.log('✅ Auto-guardado exitoso');
            },
            onError: (error) => {
              console.error('❌ Error en auto-guardado:', error);
              saveToLocalStorage();
            },
          },
        );
      }
    }, 120000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    poa,
    procedureId,
    isDirty,
    partialUpdateMutation,
    setIsDirty,
    saveToLocalStorage,
  ]);

  const createNewPOA = useCallback(async (procedureId: string, poaData?: Partial<POA>) => {
    try {
      const result = await createMutation.mutateAsync({
        procedureId,
        poa: {
          name: poaData?.name || 'Nuevo Procedimiento POA',
          ...poaData,
        },
      });

      loadPoa(result);
      toast({
        title: "POA Creado",
        description: "El procedimiento POA ha sido creado exitosamente.",
      });

      return result;
    } catch (error) {
      console.error('Error creando POA:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el procedimiento POA.",
        variant: "destructive",
      });
      throw error;
    }
  }, [createMutation, loadPoa, toast]);

  const autoCreatePOA = useCallback(
    async (procedureId: string, partialData?: Partial<CreatePOARequest>) => {
      try {
        const result = await autoCreateMutation.mutateAsync({
          procedureId,
          partialPoa: partialData,
        });

        loadPoa(result);
        toast({
          title: "POA Creado Automáticamente",
          description: "El procedimiento POA ha sido generado desde el procedimiento base.",
        });

        return result;
      } catch (error) {
        console.error('Error auto-creando POA:', error);
        toast({
          title: "Error",
          description: "No se pudo generar automáticamente el procedimiento POA.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [autoCreateMutation, loadPoa, toast],
  );

  const saveToBackend = useCallback(async () => {
    if (!poa || !procedureId) return;

    try {
      const result = await updateMutation.mutateAsync({
        procedureId,
        poa,
      });

      loadPoa(result);
      setIsDirty(false);
      lastSaveRef.current = JSON.stringify(result);

      queryClient.invalidateQueries({ queryKey: ["procedures"] });

      toast({
        title: "POA Guardado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      return result;
    } catch (error) {
      console.error('Error guardando POA:', error);
      toast({
        title: "Error al Guardar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });

      saveToLocalStorage();
      throw error;
    }
  }, [
    poa,
    procedureId,
    updateMutation,
    loadPoa,
    setIsDirty,
    toast,
    saveToLocalStorage,
    queryClient,
  ]);

  return {
    poa,
    isDirty,
    isLoading: poaQuery.isLoading,
    error: poaQuery.error,
    createNewPOA,
    autoCreatePOA,
    saveToBackend,
    refetch: poaQuery.refetch,
    isCreating: createMutation.isPending,
    isAutoCreating: autoCreateMutation.isPending,
    isUpdating: updateMutation.isPending,
    isPartialUpdating: partialUpdateMutation.isPending,
  };
}

export function usePOABackend(procedureId: string | null) {
  const { poa, isDirty, setIsDirty, loadPoa, saveCurrentPOA } = usePOA();

  return usePOABackendController({
    procedureId,
    poa,
    isDirty,
    setIsDirty,
    loadPoa,
    saveToLocalStorage: saveCurrentPOA,
  });
}