import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { usePOA } from './use-poa';
import { usePOAAPI } from './use-poa-api';
import type { POA } from '@/lib/schema';
import { useToast } from './use-toast';

export function usePOABackend(procedureId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    poa, 
    setPoa, 
    isDirty, 
    setIsDirty, 
    loadPoa, 
    saveCurrentPOA: saveToLocalStorage 
  } = usePOA();
  
  const { 
    getByProcedureId, 
    create, 
    autoCreate, 
    update, 
    partialUpdate 
  } = usePOAAPI();

  // Para auto-save cada 2 segundos cuando hay cambios
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  // Query para obtener POA del backend
  const poaQuery = getByProcedureId(procedureId || '');

  // Declarar todas las mutations al inicio del hook
  const autoCreateMutation = autoCreate();
  const partialUpdateMutation = partialUpdate();
  const updateMutation = update();
  const createMutation = create();
  
  // Cargar POA desde backend cuando cambie el procedureId
  useEffect(() => {
    if (poaQuery.data && !poaQuery.isLoading) {
      console.log('✅ Cargando POA desde backend');
      loadPoa(poaQuery.data);
      lastSaveRef.current = JSON.stringify(poaQuery.data);
    } else if (poaQuery.error && procedureId) {
      // Si hay error 404, significa que no existe POA, auto-crearlo
      const errorStatus = (poaQuery.error as any)?.response?.status;
      if (errorStatus === 404) {
        console.log('POA no encontrado, auto-creando...');
        autoCreateMutation.mutate(
          { procedureId, partialPoa: {} },
          {
            onSuccess: (newPoa) => {
              console.log('POA auto-creado exitosamente');
              loadPoa(newPoa);
              lastSaveRef.current = JSON.stringify(newPoa);
            },
            onError: (error) => {
              console.error('Error auto-creando POA:', error);
            }
          }
        );
      }
    }
  }, [poaQuery.data, poaQuery.isLoading, poaQuery.error, procedureId]);

  // Las mutations ya están declaradas arriba
  
  // Auto-save al backend cada 2 segundos cuando hay cambios
  useEffect(() => {
    if (!poa || !procedureId || !isDirty) return;

    // Limpiar timer anterior
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Configurar nuevo timer
    autoSaveTimerRef.current = setTimeout(() => {
      const currentPoaString = JSON.stringify(poa);
      
      // Solo guardar si hay cambios reales
      if (currentPoaString !== lastSaveRef.current) {
        console.log('🔄 Auto-guardando cambios...');
        
        partialUpdateMutation.mutate(
          { 
            procedureId, 
            poa: poa 
          },
          {
            onSuccess: (savedPoa) => {
              lastSaveRef.current = currentPoaString;
              setIsDirty(false);
              console.log('✅ Auto-guardado exitoso');
            },
            onError: (error) => {
              console.error('❌ Error en auto-guardado:', error);
              // Fallback al localStorage si falla el backend
              saveToLocalStorage();
            }
          }
        );
      }
    }, 120000); // 120 segundos = 2 minutos

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [poa, procedureId, isDirty]);

  // Crear nuevo POA en el backend
  const createNewPOA = useCallback(async (procedureId: string, poaData?: Partial<POA>) => {
    try {
      const result = await createMutation.mutateAsync({
        procedureId,
        poa: {
          name: poaData?.name || 'Nuevo Procedimiento POA',
          ...poaData
        }
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

  // Auto-crear POA desde procedimiento
  const autoCreatePOA = useCallback(async (procedureId: string, partialData?: any) => {
    try {
      const result = await autoCreateMutation.mutateAsync({
        procedureId,
        partialPoa: partialData
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
  }, [autoCreateMutation, loadPoa, toast]);

  // Guardar manualmente al backend
  const saveToBackend = useCallback(async () => {
    if (!poa || !procedureId) return;

    try {
      const result = await updateMutation.mutateAsync({
        procedureId,
        poa: poa
      });
      
      loadPoa(result);
      setIsDirty(false);
      lastSaveRef.current = JSON.stringify(result);
      
      // Invalidar cache de procedimientos para actualizar el dashboard
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
      
      // Fallback al localStorage
      saveToLocalStorage();
      throw error;
    }
  }, [poa, procedureId, updateMutation, loadPoa, setIsDirty, toast, saveToLocalStorage]);

  return {
    // Estado del POA
    poa,
    isDirty,
    isLoading: poaQuery.isLoading,
    error: poaQuery.error,
    
    // Métodos para trabajar con backend
    createNewPOA,
    autoCreatePOA,
    saveToBackend,
    refetch: poaQuery.refetch,
    
    // Operaciones de mutation
    isCreating: createMutation.isPending,
    isAutoCreating: autoCreateMutation.isPending,
    isUpdating: updateMutation.isPending,
    isPartialUpdating: partialUpdateMutation.isPending,
  };
} 