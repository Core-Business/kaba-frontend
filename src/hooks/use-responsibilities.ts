import { useState } from 'react';
import { usePOA } from '@/hooks/use-poa';
import { useToast } from '@/hooks/use-toast';
import { POAAPI, CreateManualResponsibleRequest, UpdateResponsibleRequest } from '@/api/poa';
import { useParams } from 'next/navigation';

export function useResponsibilities() {
  const { poa, setPoa } = usePOA();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const procedureId = params.poaId as string;

  const handleError = (unknownError: unknown, defaultMessage: string) => {
    setIsLoading(false);
    const message =
      typeof unknownError === "object" &&
      unknownError !== null &&
      "response" in unknownError &&
      typeof (unknownError as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
        ? (unknownError as { response: { data: { message: string } } }).response.data.message
        : unknownError instanceof Error && unknownError.message
          ? unknownError.message
          : defaultMessage;
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const generateResponsibilities = async (regenerate: boolean = false) => {
    if (!procedureId || !poa) return;
    setIsLoading(true);
    try {
      const updatedResponsibilities = await POAAPI.generateResponsibilities(procedureId, { regenerate });
      
      // Validar que la respuesta sea un array
      if (!Array.isArray(updatedResponsibilities)) {
        console.error('La respuesta de generateResponsibilities no es un array:', updatedResponsibilities);
        throw new Error('Respuesta inválida del servidor');
      }
      
      const manualResponsibilities = (poa.responsibilities || []).filter(r => r.type === 'manual');
      
      setPoa(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responsibilities: [...manualResponsibilities, ...updatedResponsibilities],
        };
      });
      
      toast({
        title: 'Éxito',
        description: 'Responsabilidades generadas exitosamente.',
      });
    } catch (error) {
      handleError(error, 'Ocurrió un error al generar las responsabilidades.');
    } finally {
      setIsLoading(false);
    }
  };

  const addManualResponsible = async (data: CreateManualResponsibleRequest) => {
    if (!procedureId || !poa) return;
    setIsLoading(true);
    try {
      const newResponsible = await POAAPI.addManualResponsible(procedureId, data);
      setPoa(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responsibilities: [...(prev.responsibilities || []), newResponsible],
        };
      });
      toast({
        title: 'Éxito',
        description: 'Responsable manual agregado exitosamente.',
      });
    } catch (error) {
      handleError(error, 'Ocurrió un error al agregar el responsable.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateResponsible = async (responsibleId: string, data: UpdateResponsibleRequest) => {
    if (!procedureId || !poa) return;
    setIsLoading(true);
    try {
      const updatedResponsible = await POAAPI.updateResponsible(procedureId, responsibleId, data);
      setPoa(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responsibilities: (prev.responsibilities || []).map(r =>
            r.id === responsibleId ? updatedResponsible : r
          ),
        };
      });
      toast({
        title: 'Éxito',
        description: 'Responsable actualizado exitosamente.',
      });
    } catch (error) {
      handleError(error, 'Ocurrió un error al actualizar el responsable.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResponsible = async (responsibleId: string) => {
    if (!procedureId || !poa) return;
    setIsLoading(true);
    try {
      await POAAPI.deleteResponsible(procedureId, responsibleId);
      setPoa(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responsibilities: (prev.responsibilities || []).filter(r => r.id !== responsibleId),
        };
      });
      toast({
        title: 'Éxito',
        description: 'Responsable eliminado exitosamente.',
      });
    } catch (error) {
      handleError(error, 'Ocurrió un error al eliminar el responsable.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generateResponsibilities,
    addManualResponsible,
    updateResponsible,
    deleteResponsible,
  };
} 