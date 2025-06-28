'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { usePOA } from '@/hooks/use-poa';
import { api } from '@/api/http';
import type { POAApprovals, ApprovalType } from '@/lib/schema';

interface ApprovalPersonFormData {
  name: string;
  position: string;
}

export function useApprovals() {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { toast } = useToast();
  const { poa, setIsDirty } = usePOA();
  
  const procedureId = typeof params.poaId === 'string' ? params.poaId : '';

  // Función auxiliar para obtener etiquetas de tipo
  const getTypeLabel = (type: ApprovalType): string => {
    switch (type) {
      case 'elaborated': return 'Elaboró';
      case 'reviewed': return 'Revisó';
      case 'authorized': return 'Autorizó';
      default: return '';
    }
  };

  // Agregar persona a tipo específico
  const addApprovalPerson = async (
    type: ApprovalType,
    personData: ApprovalPersonFormData
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post(
        `/procedures/${procedureId}/poa/approvals/${type}`,
        personData
      );

      setIsDirty(true);
      toast({
        title: 'Persona agregada',
        description: `Se agregó exitosamente a ${getTypeLabel(type)}`,
      });
    } catch (error: any) {
      console.error('Error adding approval person:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo agregar la persona';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar persona específica
  const updateApprovalPerson = async (
    type: ApprovalType,
    personId: string,
    personData: ApprovalPersonFormData
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.put(
        `/procedures/${procedureId}/poa/approvals/${type}/${personId}`,
        personData
      );

      setIsDirty(true);
      toast({
        title: 'Persona actualizada',
        description: `Se actualizó exitosamente en ${getTypeLabel(type)}`,
      });
    } catch (error: any) {
      console.error('Error updating approval person:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo actualizar la persona';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar persona específica
  const deleteApprovalPerson = async (
    type: ApprovalType,
    personId: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.delete(
        `/procedures/${procedureId}/poa/approvals/${type}/${personId}`
      );

      setIsDirty(true);
      toast({
        title: 'Persona eliminada',
        description: `Se eliminó exitosamente de ${getTypeLabel(type)}`,
      });
    } catch (error: any) {
      console.error('Error deleting approval person:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo eliminar la persona';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar todas las aprobaciones
  const updateAllApprovals = async (approvals: POAApprovals): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post(
        `/procedures/${procedureId}/poa/approvals`,
        approvals
      );

      setIsDirty(true);
      toast({
        title: 'Aprobaciones actualizadas',
        description: 'Se actualizaron todas las aprobaciones exitosamente',
      });
    } catch (error: any) {
      console.error('Error updating all approvals:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudieron actualizar las aprobaciones';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addApprovalPerson,
    updateApprovalPerson,
    deleteApprovalPerson,
    updateAllApprovals,
    getTypeLabel,
  };
} 