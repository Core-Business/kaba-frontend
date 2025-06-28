# Documentación del Módulo de Anexos - Frontend MVP

## **📋 Resumen Ejecutivo**

El módulo de anexos en el frontend proporciona una interfaz intuitiva para que los usuarios suban, gestionen y descarguen documentos auxiliares asociados a sus procedimientos POA. Los anexos se ubican entre las secciones "Registros" y "Vista Previa" en el builder.

## **🏗️ Arquitectura del Frontend**

### **Decisiones de Diseño**
- **Ubicación**: Entre "Registros" y "Vista Previa" en la navegación
- **Guardado**: Automático al subir archivos (sin botón "Guardar")
- **Interacción**: Solo upload y download (sin preview)
- **UI**: Botón de upload + lista de archivos con metadatos
- **Estado**: Integrado con el sistema de navegación del builder

## **📊 Esquemas y Tipos**

### **Esquemas Zod**
```typescript
// src/lib/schema.ts
export const poaAttachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalName: z.string().min(1, "El nombre del archivo es requerido"),
  mimeType: z.string(),
  size: z.number().positive("El tamaño debe ser positivo"),
  url: z.string().url("URL inválida"),
  poaId: z.string(),
  procedureId: z.string(),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  uploadedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAttachmentSchema = z.object({
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
});

export const updateAttachmentSchema = z.object({
  description: z.string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede exceder 500 caracteres"),
});

export type POAAttachment = z.infer<typeof poaAttachmentSchema>;
export type CreateAttachment = z.infer<typeof createAttachmentSchema>;
export type UpdateAttachment = z.infer<typeof updateAttachmentSchema>;
```

### **Validaciones de Archivos**
```typescript
// src/lib/file-validation.ts
export const ALLOWED_FILE_TYPES = {
  'application/pdf': { extension: 'pdf', label: 'PDF' },
  'text/plain': { extension: 'txt', label: 'TXT' },
  'image/jpeg': { extension: 'jpg', label: 'JPG' },
  'image/png': { extension: 'png', label: 'PNG' },
  'application/msword': { extension: 'doc', label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: 'docx', label: 'DOCX' 
  },
  'application/vnd.ms-excel': { extension: 'xls', label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    extension: 'xlsx', label: 'XLSX' 
  },
  'application/vnd.ms-powerpoint': { extension: 'ppt', label: 'PPT' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { 
    extension: 'pptx', label: 'PPTX' 
  },
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Validar tipo
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    const allowedExtensions = Object.values(ALLOWED_FILE_TYPES)
      .map(type => type.label)
      .join(', ');
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedExtensions}`
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'El archivo no puede exceder 10 MB'
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeLabel(mimeType: string): string {
  return ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]?.label || 'Desconocido';
}
```

## **🔧 API Layer**

### **Endpoints de Anexos**
```typescript
// src/api/poa.ts (agregar al archivo existente)
export const POAAPI = {
  // ... métodos existentes ...

  // =====================================
  // ENDPOINTS DE ANEXOS
  // =====================================
  attachments: {
    // Obtener todos los anexos del POA
    getAll: async (procedureId: string, poaId: string): Promise<POAAttachment[]> => {
      const response = await api.get(`/procedures/${procedureId}/poa/attachments?poaId=${poaId}`);
      return response.data?.data || [];
    },

    // Subir nuevo anexo
    upload: async (
      procedureId: string, 
      poaId: string, 
      file: File, 
      description?: string
    ): Promise<POAAttachment> => {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(
        `/procedures/${procedureId}/poa/attachments/upload?poaId=${poaId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data?.data;
    },

    // Obtener URL de descarga
    getDownloadUrl: async (
      procedureId: string, 
      poaId: string, 
      attachmentId: string
    ): Promise<string> => {
      const response = await api.get(
        `/procedures/${procedureId}/poa/attachments/${attachmentId}/download?poaId=${poaId}`
      );
      return response.data?.downloadUrl;
    },

    // Actualizar descripción
    updateDescription: async (
      procedureId: string, 
      poaId: string, 
      attachmentId: string, 
      description: string
    ): Promise<POAAttachment> => {
      const response = await api.patch(
        `/procedures/${procedureId}/poa/attachments/${attachmentId}?poaId=${poaId}`,
        { description }
      );
      return response.data?.data;
    },

    // Eliminar anexo
    remove: async (
      procedureId: string, 
      poaId: string, 
      attachmentId: string
    ): Promise<void> => {
      await api.delete(
        `/procedures/${procedureId}/poa/attachments/${attachmentId}?poaId=${poaId}`
      );
    },
  },
};
```

## **🎣 Hook Personalizado**

### **useAttachments Hook**
```typescript
// src/hooks/use-attachments.ts
import { useState, useCallback, useEffect } from 'react';
import { POAAPI } from '@/api/poa';
import { useToast } from '@/hooks/use-toast';
import type { POAAttachment } from '@/lib/schema';
import { validateFile } from '@/lib/file-validation';

interface UseAttachmentsProps {
  procedureId: string | null;
  poaId: string | null;
}

export function useAttachments({ procedureId, poaId }: UseAttachmentsProps) {
  const [attachments, setAttachments] = useState<POAAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Cargar anexos
  const loadAttachments = useCallback(async () => {
    if (!procedureId || !poaId) return;

    try {
      setIsLoading(true);
      const data = await POAAPI.attachments.getAll(procedureId, poaId);
      setAttachments(data);
    } catch (error: any) {
      console.error('Error al cargar anexos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los anexos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [procedureId, poaId, toast]);

  // Subir archivo
  const uploadFile = useCallback(async (file: File, description?: string) => {
    if (!procedureId || !poaId) {
      toast({
        title: "Error",
        description: "No se puede subir el archivo en este momento",
        variant: "destructive",
      });
      return;
    }

    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Archivo inválido",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const newAttachment = await POAAPI.attachments.upload(
        procedureId, 
        poaId, 
        file, 
        description
      );
      
      setAttachments(prev => [newAttachment, ...prev]);
      
      toast({
        title: "Anexo subido",
        description: `${file.name} se ha subido correctamente`,
      });
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      toast({
        title: "Error al subir",
        description: error.response?.data?.message || "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [procedureId, poaId, toast]);

  // Descargar archivo
  const downloadFile = useCallback(async (attachment: POAAttachment) => {
    if (!procedureId || !poaId) return;

    try {
      const downloadUrl = await POAAPI.attachments.getDownloadUrl(
        procedureId, 
        poaId, 
        attachment.id
      );
      
      // Abrir en nueva ventana para descarga
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${attachment.originalName}`,
      });
    } catch (error: any) {
      console.error('Error al descargar archivo:', error);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  }, [procedureId, poaId, toast]);

  // Actualizar descripción
  const updateDescription = useCallback(async (
    attachmentId: string, 
    description: string
  ) => {
    if (!procedureId || !poaId) return;

    try {
      const updatedAttachment = await POAAPI.attachments.updateDescription(
        procedureId, 
        poaId, 
        attachmentId, 
        description
      );
      
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachmentId ? updatedAttachment : att
        )
      );
      
      toast({
        title: "Descripción actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      console.error('Error al actualizar descripción:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la descripción",
        variant: "destructive",
      });
    }
  }, [procedureId, poaId, toast]);

  // Eliminar anexo
  const removeAttachment = useCallback(async (attachmentId: string) => {
    if (!procedureId || !poaId) return;

    try {
      await POAAPI.attachments.remove(procedureId, poaId, attachmentId);
      
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      toast({
        title: "Anexo eliminado",
        description: "El archivo se ha eliminado correctamente",
      });
    } catch (error: any) {
      console.error('Error al eliminar anexo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  }, [procedureId, poaId, toast]);

  // Cargar anexos al montar el componente
  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  return {
    attachments,
    isLoading,
    isUploading,
    uploadFile,
    downloadFile,
    updateDescription,
    removeAttachment,
    refreshAttachments: loadAttachments,
  };
}
```

## **🎨 Componentes UI**

### **1. AttachmentUploadZone**
```typescript
// src/components/poa/attachment-upload-zone.tsx
"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  className?: string;
}

export function AttachmentUploadZone({ 
  onFileSelect, 
  isUploading, 
  className 
}: AttachmentUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Limpiar el input para permitir subir el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={cn("border-dashed border-2", className)}>
      <CardContent className="p-6">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Subir Anexo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona un archivo para adjuntar al procedimiento
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Formatos permitidos: PDF, TXT, JPG, PNG, DOC, DOCX, XLS, XLSX, PPT, PPTX
            <br />
            Tamaño máximo: 10 MB
          </p>
          <Button 
            onClick={handleClick} 
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### **2. AttachmentsList**
```typescript
// src/components/poa/attachments-list.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  Edit, 
  FileText, 
  Calendar,
  User
} from 'lucide-react';
import { formatFileSize, getFileTypeLabel } from '@/lib/file-validation';
import { FormattedDate } from '@/components/shared/formatted-date';
import type { POAAttachment } from '@/lib/schema';
import { AttachmentDescriptionDialog } from './attachment-description-dialog';

interface AttachmentsListProps {
  attachments: POAAttachment[];
  onDownload: (attachment: POAAttachment) => void;
  onUpdateDescription: (attachmentId: string, description: string) => void;
  onRemove: (attachmentId: string) => void;
  isLoading?: boolean;
}

export function AttachmentsList({
  attachments,
  onDownload,
  onUpdateDescription,
  onRemove,
  isLoading = false
}: AttachmentsListProps) {
  const [editingAttachment, setEditingAttachment] = useState<POAAttachment | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando anexos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attachments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay anexos</p>
            <p className="text-sm">
              Sube el primer anexo para comenzar a adjuntar documentos auxiliares.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Anexos del Procedimiento ({attachments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">
                        {attachment.originalName}
                      </h4>
                      <Badge variant="secondary" className="shrink-0">
                        {getFileTypeLabel(attachment.mimeType)}
                      </Badge>
                    </div>
                    
                    {attachment.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {attachment.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {formatFileSize(attachment.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <FormattedDate date={attachment.createdAt} />
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Subido por: {attachment.uploadedBy}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAttachment(attachment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(attachment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AttachmentDescriptionDialog
        attachment={editingAttachment}
        open={!!editingAttachment}
        onOpenChange={(open) => !open && setEditingAttachment(null)}
        onSubmit={(description) => {
          if (editingAttachment) {
            onUpdateDescription(editingAttachment.id, description);
            setEditingAttachment(null);
          }
        }}
      />
    </>
  );
}
```

### **3. AttachmentDescriptionDialog**
```typescript
// src/components/poa/attachment-description-dialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateAttachmentSchema, type UpdateAttachment, type POAAttachment } from '@/lib/schema';

interface AttachmentDescriptionDialogProps {
  attachment: POAAttachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (description: string) => void;
}

export function AttachmentDescriptionDialog({
  attachment,
  open,
  onOpenChange,
  onSubmit,
}: AttachmentDescriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateAttachment>({
    resolver: zodResolver(updateAttachmentSchema),
    defaultValues: {
      description: '',
    },
  });

  // Actualizar formulario cuando cambie el attachment
  useEffect(() => {
    if (attachment) {
      form.reset({
        description: attachment.description || '',
      });
    }
  }, [attachment, form]);

  const handleSubmit = async (data: UpdateAttachment) => {
    setIsSubmitting(true);
    try {
      onSubmit(data.description);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!attachment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Descripción</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Archivo: <span className="font-medium">{attachment.originalName}</span>
              </p>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el contenido o propósito de este anexo..."
                      rows={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### **4. AttachmentsForm (Componente Principal)**
```typescript
// src/components/poa/attachments-form.tsx
"use client";

import { usePOA } from '@/hooks/use-poa';
import { useAttachments } from '@/hooks/use-attachments';
import { SectionTitle } from './common-form-elements';
import { AttachmentUploadZone } from './attachment-upload-zone';
import { AttachmentsList } from './attachments-list';
import { useParams } from 'next/navigation';

export function AttachmentsForm() {
  const { poa } = usePOA();
  const params = useParams();
  
  const procedureId = (() => {
    const poaId = params.poaId as string;
    if (!poaId || poaId === 'new') return null;
    
    if (poaId.startsWith('proc-')) {
      const withoutPrefix = poaId.replace('proc-', '');
      const parts = withoutPrefix.split('-');
      return parts.length >= 2 ? parts.slice(0, -1).join('-') : withoutPrefix;
    } else {
      return poaId;
    }
  })();

  const {
    attachments,
    isLoading,
    isUploading,
    uploadFile,
    downloadFile,
    updateDescription,
    removeAttachment,
  } = useAttachments({
    procedureId,
    poaId: poa?.id || null,
  });

  const handleFileSelect = async (file: File) => {
    await uploadFile(file);
  };

  const handleDownload = async (attachment: any) => {
    await downloadFile(attachment);
  };

  const handleUpdateDescription = async (attachmentId: string, description: string) => {
    await updateDescription(attachmentId, description);
  };

  const handleRemove = async (attachmentId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este anexo?')) {
      await removeAttachment(attachmentId);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Anexos del Procedimiento"
        description="Sube documentos auxiliares que acompañen a este procedimiento. Los anexos se mantendrán como archivos separados y aparecerán listados en el documento final."
      />

      <AttachmentUploadZone
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
      />

      <AttachmentsList
        attachments={attachments}
        onDownload={handleDownload}
        onUpdateDescription={handleUpdateDescription}
        onRemove={handleRemove}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## **📄 Página del Módulo**

### **Página de Anexos**
```typescript
// src/app/(app)/builder/[poaId]/(sections)/attachments/page.tsx
import { AttachmentsForm } from "@/components/poa/attachments-form";

export default function AttachmentsPage() {
  return <AttachmentsForm />;
}
```

## **🧭 Integración con Navegación**

### **Actualización del Layout del Builder**
```typescript
// src/app/(app)/builder/[poaId]/layout.tsx
// Actualizar el array navItems:

const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Responsabilidades", href: "responsibilities", icon: Users },
  { name: "Definiciones", href: "definitions", icon: BookOpen },
  { name: "Referencias", href: "references", icon: ExternalLink },
  { name: "Introducción", href: "introduction", icon: BookOpenText },
  { name: "Aprobaciones", href: "approvals", icon: CheckCircle },
  { name: "Control de Cambios", href: "change-control", icon: FileEdit },
  { name: "Registros", href: "records", icon: FileText },
  { name: "Anexos", href: "attachments", icon: Paperclip }, // NUEVO
  { name: "Vista Previa", href: "document", icon: Printer },
];
```

### **Actualización del Header de Navegación**
```typescript
// src/components/layout/app-header.tsx
// Actualizar el array de navegación:

const navigation = [
  { name: "Encabezado", href: "header" },
  { name: "Objetivo", href: "objective" },
  { name: "Actividades", href: "activities" },
  { name: "Alcance", href: "scope" },
  { name: "Responsabilidades", href: "responsibilities" },
  { name: "Definiciones", href: "definitions" },
  { name: "Referencias", href: "references" },
  { name: "Introducción", href: "introduction" },
  { name: "Aprobaciones", href: "approvals" },
  { name: "Control de Cambios", href: "change-control" },
  { name: "Registros", href: "records" },
  { name: "Anexos", href: "attachments" }, // NUEVO
  { name: "Vista Previa", href: "document" },
];
```

## **🔧 Utilidades Adicionales**

### **Componente FormattedDate Reutilizable**
```typescript
// src/components/shared/formatted-date.tsx (si no existe)
interface FormattedDateProps {
  date: string | Date;
  format?: 'short' | 'long' | 'relative';
}

export function FormattedDate({ date, format = 'short' }: FormattedDateProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return <span>Hoy</span>;
    } else if (diffInHours < 48) {
      return <span>Ayer</span>;
    }
  }
  
  const formatted = dateObj.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return <span>{formatted}</span>;
}
```

## **🧪 Plan de Testing**

### **Unit Tests**
```typescript
// src/hooks/__tests__/use-attachments.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAttachments } from '../use-attachments';

describe('useAttachments', () => {
  it('should load attachments on mount', async () => {
    // Test implementation
  });

  it('should upload file successfully', async () => {
    // Test implementation
  });

  it('should handle upload errors', async () => {
    // Test implementation
  });
});
```

### **Component Tests**
```typescript
// src/components/poa/__tests__/attachments-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AttachmentsForm } from '../attachments-form';

describe('AttachmentsForm', () => {
  it('should render upload zone', () => {
    // Test implementation
  });

  it('should handle file selection', () => {
    // Test implementation
  });

  it('should display attachments list', () => {
    // Test implementation
  });
});
```

### **E2E Tests**
```typescript
// cypress/e2e/attachments.cy.ts
describe('Attachments Module', () => {
  it('should upload and manage attachments', () => {
    // E2E test implementation
  });
});
```

## **📱 Responsividad y UX**

### **Consideraciones Móviles**
- Upload zone adaptativo en pantallas pequeñas
- Lista de anexos con scroll horizontal en móviles
- Botones de acción agrupados en menú desplegable
- Tooltips informativos para acciones

### **Estados de Carga**
- Skeleton loader durante carga de anexos
- Progress indicator durante upload
- Feedback visual para todas las acciones
- Manejo de errores con mensajes descriptivos

## **🔐 Seguridad Frontend**

### **Validaciones Client-Side**
- Tipo de archivo antes de enviar
- Tamaño de archivo antes de enviar
- Sanitización de nombres de archivo
- Validación de formularios con Zod

### **Manejo de Errores**
- Mensajes de error descriptivos
- Fallback para errores de red
- Retry automático para operaciones fallidas
- Logging de errores para debugging

## **📋 Checklist de Implementación**

### **Core Components**
- [ ] Crear esquemas Zod para anexos
- [ ] Implementar hook `useAttachments`
- [ ] Crear componente `AttachmentUploadZone`
- [ ] Crear componente `AttachmentsList`
- [ ] Crear componente `AttachmentDescriptionDialog`
- [ ] Crear componente principal `AttachmentsForm`

### **Integration**
- [ ] Agregar endpoints a `POAAPI`
- [ ] Crear página de anexos
- [ ] Actualizar navegación del builder
- [ ] Agregar validaciones de archivos
- [ ] Implementar manejo de errores

### **UX/UI**
- [ ] Implementar estados de carga
- [ ] Agregar feedback visual
- [ ] Optimizar para móviles
- [ ] Agregar tooltips y ayuda contextual
- [ ] Implementar confirmaciones de eliminación

### **Testing**
- [ ] Unit tests para hook
- [ ] Component tests para UI
- [ ] E2E tests para flujo completo
- [ ] Tests de validación de archivos
- [ ] Tests de manejo de errores

## **🚀 Deployment**

### **Build Process**
- Verificar que todos los tipos TypeScript sean correctos
- Asegurar que las validaciones Zod funcionen
- Confirmar que los endpoints API estén configurados
- Validar que las rutas de navegación funcionen

### **Environment Variables**
```bash
# Frontend no requiere variables adicionales
# Las configuraciones se manejan en el backend
```

### **Performance Considerations**
- Lazy loading de componentes grandes
- Debounce en búsquedas (futuro)
- Optimización de imágenes de preview (futuro)
- Caching de listas de anexos

---

**✅ Esta documentación cubre la implementación completa del módulo de anexos para el frontend, proporcionando una experiencia de usuario fluida e intuitiva mientras mantiene la consistencia con el diseño existente del builder.**
