import { useState, useCallback, useEffect } from 'react';
import { POAAPI } from '@/api/poa';
import { POAAttachment, CreateAttachment, UpdateAttachment } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { usePOABackend } from '@/hooks/use-poa-backend';
import { validateFile, formatFileSize, getFileTypeLabel } from '@/lib/file-validation';

export function useAttachments(procedureId: string) {
  const [attachments, setAttachments] = useState<POAAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { poa } = usePOABackend(procedureId);

  // Obtener todos los anexos
  const fetchAttachments = useCallback(async () => {
    if (!procedureId || !poa?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await POAAPI.attachments.getAll(procedureId, poa.id);
      const safeAttachments = Array.isArray(data) ? data : [];
      setAttachments(safeAttachments);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar anexos';
      setError(errorMessage);
      console.error('Error al obtener anexos:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, poa?.id, toast]);

  // Auto-cargar anexos cuando el POA esté disponible
  useEffect(() => {
    if (poa?.id && procedureId) {
      fetchAttachments();
    }
  }, [poa?.id, procedureId, fetchAttachments]);

  // Subir nuevo anexo
  const uploadAttachment = useCallback(async (file: File, description?: string) => {
    if (!procedureId || !poa?.id) return;
    
    // Validar archivo antes de subir
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Archivo inválido",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const newAttachment = await POAAPI.attachments.upload(procedureId, poa.id, file, description);
      
      // Agregar el nuevo anexo al estado local
      setAttachments(prev => [newAttachment, ...prev]);
      
      toast({
        title: "Éxito",
        description: `Anexo "${file.name}" subido correctamente`,
      });
      
      return newAttachment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al subir anexo';
      setError(errorMessage);
      console.error('Error al subir anexo:', err);
      toast({
        title: "Error al subir archivo",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [procedureId, poa?.id, toast]);

  // Actualizar descripción de anexo
  const updateAttachmentDescription = useCallback(async (attachmentId: string, description: string) => {
    if (!procedureId || !poa?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAttachment = await POAAPI.attachments.updateDescription(procedureId, poa.id, attachmentId, description);
      
      // Actualizar el anexo en el estado local
      setAttachments(prev => 
        prev.map(attachment => 
          attachment.id === attachmentId ? updatedAttachment : attachment
        )
      );
      
      toast({
        title: "Éxito",
        description: "Descripción actualizada correctamente",
      });
      
      return updatedAttachment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar descripción';
      setError(errorMessage);
      console.error('Error al actualizar descripción:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, poa?.id, toast]);

  // Eliminar anexo
  const removeAttachment = useCallback(async (attachmentId: string) => {
    if (!procedureId || !poa?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await POAAPI.attachments.remove(procedureId, poa.id, attachmentId);
      
      // Remover el anexo del estado local
      setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
      
      toast({
        title: "Éxito",
        description: "Anexo eliminado correctamente",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar anexo';
      setError(errorMessage);
      console.error('Error al eliminar anexo:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, poa?.id, toast]);

  // Descargar anexo
  const downloadAttachment = useCallback(async (attachment: POAAttachment) => {
    if (!procedureId || !poa?.id) return;
    
    try {
      const downloadUrl = await POAAPI.attachments.getDownloadUrl(procedureId, poa.id, attachment.id);
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Descarga iniciada",
        description: `Descargando "${attachment.originalName}"`,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al descargar anexo';
      console.error('Error al descargar anexo:', err);
      toast({
        title: "Error al descargar",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [procedureId, poa?.id, toast]);

  // Validar archivo (utilidad)
  const validateFileForUpload = useCallback((file: File) => {
    return validateFile(file);
  }, []);

  // Obtener información formateada del archivo
  const getFileInfo = useCallback((attachment: POAAttachment) => {
    return {
      ...attachment,
      formattedSize: formatFileSize(attachment.size),
      typeLabel: getFileTypeLabel(attachment.mimeType),
      uploadDate: new Date(attachment.createdAt).toLocaleDateString('es-MX'),
    };
  }, []);

  // Obtener estadísticas de anexos
  const getAttachmentStats = useCallback(() => {
    const totalSize = attachments.reduce((sum, attachment) => sum + attachment.size, 0);
    const totalCount = attachments.length;
    
    return {
      totalCount,
      totalSize,
      formattedTotalSize: formatFileSize(totalSize),
    };
  }, [attachments]);

  // Filtrar anexos por tipo
  const filterAttachmentsByType = useCallback((mimeType: string) => {
    return attachments.filter(attachment => attachment.mimeType === mimeType);
  }, [attachments]);

  // Buscar anexos por nombre
  const searchAttachments = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return attachments;
    
    const term = searchTerm.toLowerCase();
    return attachments.filter(attachment => 
      attachment.originalName.toLowerCase().includes(term) ||
      attachment.description?.toLowerCase().includes(term)
    );
  }, [attachments]);

  return {
    // Estado
    attachments,
    isLoading,
    isUploading,
    error,
    
    // Operaciones CRUD
    fetchAttachments,
    uploadAttachment,
    updateAttachmentDescription,
    removeAttachment,
    downloadAttachment,
    
    // Utilidades
    validateFileForUpload,
    getFileInfo,
    getAttachmentStats,
    filterAttachmentsByType,
    searchAttachments,
  };
} 