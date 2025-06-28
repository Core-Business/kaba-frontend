# Documentación Técnica - Módulo de Registros (Frontend MVP)

## **Descripción General**

El módulo de **Registros** en el frontend permite gestionar una tabla de registros asociados a cada procedimiento operativo (POA). Se ubica entre "Control de Cambios" y "Vista Previa" en la navegación del builder de procedimientos.

## **Estructura de Datos**

### **Decisión de Arquitectura: IDs Únicos**
Siguiendo la estructura actual del proyecto y manteniendo consistencia con otros módulos, se utilizarán **IDs únicos (UUID)** para cada registro, proporcionando:
- ✅ Operaciones CRUD eficientes y seguras
- ✅ Consistencia con el resto del sistema
- ✅ Facilidad para referencias y estado local
- ✅ Compatibilidad con el backend

### **Esquemas TypeScript con Zod**

```typescript
// Esquema para registro individual
export const poaRecordSchema = z.object({
  id: z.string(),
  recordNumber: z.number().positive(),
  title: z.string()
    .min(1, "El título del registro es obligatorio")
    .max(255, "El título no puede exceder 255 caracteres"),
  format: z.string()
    .min(1, "El formato es obligatorio")
    .max(255, "El formato no puede exceder 255 caracteres"),
  responsible: z.string()
    .min(1, "El responsable es obligatorio")
    .max(255, "El responsable no puede exceder 255 caracteres"),
  frequency: z.string()
    .min(1, "La frecuencia es obligatoria")
    .max(255, "La frecuencia no puede exceder 255 caracteres"),
  retentionTime: z.string()
    .min(1, "El tiempo de retención es obligatorio")
    .max(255, "El tiempo de retención no puede exceder 255 caracteres"),
  storageMethod: z.string()
    .max(500, "El medio de almacenamiento no puede exceder 500 caracteres")
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Esquema para crear registro (sin id y recordNumber)
export const createRecordSchema = z.object({
  title: z.string()
    .min(1, "El título del registro es obligatorio")
    .max(255, "El título no puede exceder 255 caracteres"),
  format: z.string()
    .min(1, "El formato es obligatorio")
    .max(255, "El formato no puede exceder 255 caracteres"),
  responsible: z.string()
    .min(1, "El responsable es obligatorio")
    .max(255, "El responsable no puede exceder 255 caracteres"),
  frequency: z.string()
    .min(1, "La frecuencia es obligatoria")
    .max(255, "La frecuencia no puede exceder 255 caracteres"),
  retentionTime: z.string()
    .min(1, "El tiempo de retención es obligatorio")
    .max(255, "El tiempo de retención no puede exceder 255 caracteres"),
  storageMethod: z.string()
    .max(500, "El medio de almacenamiento no puede exceder 500 caracteres")
    .optional(),
});

// Esquema para actualizar registro (todos los campos opcionales)
export const updateRecordSchema = z.object({
  title: z.string()
    .max(255, "El título no puede exceder 255 caracteres")
    .optional(),
  format: z.string()
    .max(255, "El formato no puede exceder 255 caracteres")
    .optional(),
  responsible: z.string()
    .max(255, "El responsable no puede exceder 255 caracteres")
    .optional(),
  frequency: z.string()
    .max(255, "La frecuencia no puede exceder 255 caracteres")
    .optional(),
  retentionTime: z.string()
    .max(255, "El tiempo de retención no puede exceder 255 caracteres")
    .optional(),
  storageMethod: z.string()
    .max(500, "El medio de almacenamiento no puede exceder 500 caracteres")
    .optional(),
});

// Tipos TypeScript derivados
export type POARecord = z.infer<typeof poaRecordSchema>;
export type CreateRecord = z.infer<typeof createRecordSchema>;
export type UpdateRecord = z.infer<typeof updateRecordSchema>;
```

### **Integración en POA Schema**

```typescript
// En el esquema principal POA
export const poaSchema = z.object({
  // ... otros campos existentes
  records: z.array(poaRecordSchema).default([]),
  // ... resto de campos
});
```

## **API Cliente**

### **Endpoints en `src/api/poa.ts`**

```typescript
// Agregar a POAAPI
records: {
  // Obtener todos los registros
  getAll: async (procedureId: string): Promise<POARecord[]> => {
    const response = await api.get(`/procedures/${procedureId}/poa/records`);
    return response.data?.data || [];
  },

  // Agregar nuevo registro
  add: async (procedureId: string, data: CreateRecord): Promise<POARecord> => {
    const response = await api.post(`/procedures/${procedureId}/poa/records`, data);
    return response.data?.data;
  },

  // Actualizar registro específico
  update: async (procedureId: string, recordId: string, data: UpdateRecord): Promise<POARecord> => {
    const response = await api.put(`/procedures/${procedureId}/poa/records/${recordId}`, data);
    return response.data?.data;
  },

  // Eliminar registro específico
  remove: async (procedureId: string, recordId: string): Promise<void> => {
    await api.delete(`/procedures/${procedureId}/poa/records/${recordId}`);
  },

  // Actualizar todos los registros
  updateAll: async (procedureId: string, records: CreateRecord[]): Promise<POARecord[]> => {
    const response = await api.patch(`/procedures/${procedureId}/poa/records`, { records });
    return response.data?.data || [];
  },
},
```

## **Hook Personalizado**

### **`src/hooks/use-records.ts`**

```typescript
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { POAAPI } from '@/api/poa';
import { POARecord, CreateRecord, UpdateRecord } from '@/lib/schema';

interface UseRecordsOptions {
  procedureId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRecords({
  procedureId,
  onSuccess,
  onError,
}: UseRecordsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<POARecord[]>([]);

  // Obtener todos los registros
  const fetchRecords = useCallback(async () => {
    if (!procedureId || procedureId === 'new') {
      setRecords([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await POAAPI.records.getAll(procedureId);
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [procedureId]);

  // Agregar nuevo registro
  const addRecord = useCallback(
    async (recordData: CreateRecord): Promise<boolean> => {
      if (!procedureId || procedureId === 'new') {
        toast({
          title: 'Error',
          description: 'No se puede agregar registro a un procedimiento no guardado',
          variant: 'destructive',
        });
        return false;
      }

      setIsLoading(true);
      try {
        await POAAPI.records.add(procedureId, recordData);
        await fetchRecords(); // Recargar registros
        onSuccess?.();
        toast({
          title: 'Éxito',
          description: 'Registro agregado correctamente',
        });
        return true;
      } catch (error) {
        console.error('Error adding record:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: 'No se pudo agregar el registro',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [procedureId, fetchRecords]
  );

  // Actualizar registro específico
  const updateRecord = useCallback(
    async (recordId: string, recordData: UpdateRecord): Promise<boolean> => {
      if (!procedureId || procedureId === 'new') {
        toast({
          title: 'Error',
          description: 'No se puede actualizar registro de un procedimiento no guardado',
          variant: 'destructive',
        });
        return false;
      }

      setIsLoading(true);
      try {
        await POAAPI.records.update(procedureId, recordId, recordData);
        await fetchRecords(); // Recargar registros
        onSuccess?.();
        toast({
          title: 'Éxito',
          description: 'Registro actualizado correctamente',
        });
        return true;
      } catch (error) {
        console.error('Error updating record:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el registro',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [procedureId, fetchRecords]
  );

  // Eliminar registro específico
  const removeRecord = useCallback(
    async (recordId: string): Promise<boolean> => {
      if (!procedureId || procedureId === 'new') {
        toast({
          title: 'Error',
          description: 'No se puede eliminar registro de un procedimiento no guardado',
          variant: 'destructive',
        });
        return false;
      }

      setIsLoading(true);
      try {
        await POAAPI.records.remove(procedureId, recordId);
        await fetchRecords(); // Recargar registros
        onSuccess?.();
        toast({
          title: 'Éxito',
          description: 'Registro eliminado correctamente',
        });
        return true;
      } catch (error) {
        console.error('Error removing record:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el registro',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [procedureId, fetchRecords]
  );

  return {
    // Estado
    records,
    isLoading,
    
    // Operaciones CRUD
    fetchRecords,
    addRecord,
    updateRecord,
    removeRecord,
    
    // Propiedades computadas
    hasRecords: records.length > 0,
    recordCount: records.length,
  };
}
```

## **Componentes UI**

### **1. Tabla de Registros - `src/components/poa/records-table.tsx`**

```typescript
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText, 
  User, 
  Calendar,
  Archive,
  Database
} from 'lucide-react';
import { POARecord } from '@/lib/schema';

interface RecordsTableProps {
  records: POARecord[];
  isLoading?: boolean;
  onEdit?: (record: POARecord) => void;
  onDelete?: (record: POARecord) => void;
}

export function RecordsTable({
  records,
  isLoading = false,
  onEdit,
  onDelete,
}: RecordsTableProps) {
  // Validación de seguridad: asegurar que records sea un array
  const safeRecords = Array.isArray(records) ? records : [];

  if (isLoading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead>Título del Registro</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Tiempo de Retención</TableHead>
              <TableHead>Medio de Almacenamiento</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                {[...Array(8)].map((_, index) => (
                  <TableCell key={index}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (safeRecords.length === 0) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead>Título del Registro</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Tiempo de Retención</TableHead>
              <TableHead>Medio de Almacenamiento</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                  <p>No hay registros definidos</p>
                  <p className="text-sm">Agrega el primer registro para comenzar</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No.</TableHead>
            <TableHead>Título del Registro</TableHead>
            <TableHead>Formato</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Frecuencia</TableHead>
            <TableHead>Tiempo de Retención</TableHead>
            <TableHead>Medio de Almacenamiento</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeRecords.map((record) => (
            <TableRow key={record.id} className="group">
              <TableCell className="font-medium">
                <span className="text-sm font-mono">{record.recordNumber}</span>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium" title={record.title}>
                    {record.title}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm" title={record.format}>
                  {record.format}
                </span>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm" title={record.responsible}>
                    {record.responsible}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm" title={record.frequency}>
                    {record.frequency}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm" title={record.retentionTime}>
                    {record.retentionTime}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {record.storageMethod ? (
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm max-w-32 truncate" title={record.storageMethod}>
                      {record.storageMethod}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No especificado</span>
                )}
              </TableCell>
              
              <TableCell>
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar registro
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(record)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar registro
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {safeRecords.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {safeRecords.length} {safeRecords.length === 1 ? 'registro' : 'registros'} definidos
          </p>
        </div>
      )}
    </div>
  );
}
```

### **2. Diálogo de Formulario - `src/components/poa/records-dialog.tsx`**

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { createRecordSchema, updateRecordSchema, CreateRecord, UpdateRecord, POARecord } from '@/lib/schema';

interface RecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  record?: POARecord;
  onSubmit: (data: CreateRecord | UpdateRecord) => Promise<boolean>;
  isLoading?: boolean;
}

export function RecordsDialog({
  open,
  onOpenChange,
  mode,
  record,
  onSubmit,
  isLoading = false,
}: RecordsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = mode === 'add' ? createRecordSchema : updateRecordSchema;
  
  const form = useForm<CreateRecord | UpdateRecord>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      format: '',
      responsible: '',
      frequency: '',
      retentionTime: '',
      storageMethod: '',
    },
  });

  // Resetear formulario cuando cambia el modo o registro
  useEffect(() => {
    if (mode === 'edit' && record) {
      form.reset({
        title: record.title,
        format: record.format,
        responsible: record.responsible,
        frequency: record.frequency,
        retentionTime: record.retentionTime,
        storageMethod: record.storageMethod || '',
      });
    } else if (mode === 'add') {
      form.reset({
        title: '',
        format: '',
        responsible: '',
        frequency: '',
        retentionTime: '',
        storageMethod: '',
      });
    }
  }, [mode, record, form]);

  const handleSubmit = async (data: CreateRecord | UpdateRecord) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data);
      if (success) {
        onOpenChange(false);
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nuevo Registro' : 'Editar Registro'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Completa la información del nuevo registro. El número se asignará automáticamente.'
              : `Edita la información del registro #${record?.recordNumber}.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título del Registro */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Título del Registro <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Registro de Capacitaciones"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/255 caracteres
                    </div>
                  </FormItem>
                )}
              />

              {/* Formato */}
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Formato <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: KABA-REG-001"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/255 caracteres
                    </div>
                  </FormItem>
                )}
              />

              {/* Responsable */}
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Responsable <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Coordinador de RRHH"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/255 caracteres
                    </div>
                  </FormItem>
                )}
              />

              {/* Frecuencia */}
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Frecuencia <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Mensual, Trimestral, Anual"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/255 caracteres
                    </div>
                  </FormItem>
                )}
              />

              {/* Tiempo de Retención */}
              <FormField
                control={form.control}
                name="retentionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiempo de Retención <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 5 años, 10 años, Permanente"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/255 caracteres
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Medio de Almacenamiento */}
            <FormField
              control={form.control}
              name="storageMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medio de Almacenamiento (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Archivo físico en oficina central, Sistema digital, Base de datos..."
                      maxLength={500}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/500 caracteres
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    {mode === 'add' ? 'Agregando...' : 'Actualizando...'}
                  </>
                ) : (
                  mode === 'add' ? 'Agregar Registro' : 'Actualizar Registro'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### **3. Componente Principal - `src/components/poa/records-form.tsx`**

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Info, 
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';
import { RecordsTable } from './records-table';
import { RecordsDialog } from './records-dialog';
import { useRecords } from '@/hooks/use-records';
import {
  CreateRecord,
  UpdateRecord,
  POARecord,
} from '@/lib/schema';
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
  readOnly?: boolean;
  className?: string;
}

export function RecordsForm({
  procedureId,
  readOnly = false,
  className,
}: RecordsFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedRecord, setSelectedRecord] = useState<POARecord | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<POARecord | undefined>();

  const {
    records,
    isLoading,
    fetchRecords,
    addRecord,
    updateRecord,
    removeRecord,
    hasRecords,
    recordCount,
  } = useRecords({
    procedureId,
    onSuccess: () => {
      // Callback opcional para acciones adicionales después del éxito
    },
    onError: (error) => {
      console.error('Error en registros:', error);
    },
  });

  // Cargar registros al montar el componente
  useEffect(() => {
    if (procedureId && procedureId !== 'new') {
      fetchRecords();
    }
  }, [procedureId, fetchRecords]);

  // Manejar agregar nuevo registro
  const handleAddRecord = () => {
    setDialogMode('add');
    setSelectedRecord(undefined);
    setDialogOpen(true);
  };

  // Manejar editar registro
  const handleEditRecord = (record: POARecord) => {
    setDialogMode('edit');
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  // Manejar confirmación de eliminación
  const handleDeleteRecord = (record: POARecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (recordToDelete) {
      await removeRecord(recordToDelete.id);
      setDeleteDialogOpen(false);
      setRecordToDelete(undefined);
    }
  };

  // Manejar envío del diálogo
  const handleDialogSubmit = async (
    data: CreateRecord | UpdateRecord
  ): Promise<boolean> => {
    if (dialogMode === 'add') {
      return await addRecord(data as CreateRecord);
    } else if (selectedRecord) {
      return await updateRecord(selectedRecord.id, data as UpdateRecord);
    }
    return false;
  };

  // Verificar si el procedimiento está guardado
  const isProcedureNew = !procedureId || procedureId === 'new';

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Registros</CardTitle>
              </div>
              {hasRecords && (
                <Badge variant="secondary" className="text-xs">
                  {recordCount} {recordCount === 1 ? 'registro' : 'registros'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecords}
                disabled={isLoading || isProcedureNew}
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
              
              {!readOnly && (
                <Button
                  onClick={handleAddRecord}
                  disabled={isLoading || isProcedureNew}
                  size="sm"
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Registro
                </Button>
              )}
            </div>
          </div>
          
          <CardDescription className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>
              Define los registros asociados al procedimiento. Puedes agregar, editar y eliminar registros libremente.
              {isProcedureNew && ' Guarda el procedimiento primero para habilitar esta función.'}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alerta para procedimiento nuevo */}
          {isProcedureNew && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Los registros estarán disponibles después de guardar el procedimiento.
              </AlertDescription>
            </Alert>
          )}

          {/* Información de estado */}
          {!isProcedureNew && hasRecords && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {recordCount} {recordCount === 1 ? 'registro definido' : 'registros definidos'}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Tabla de registros */}
          {!isProcedureNew && (
            <RecordsTable
              records={records}
              isLoading={isLoading}
              onEdit={!readOnly ? handleEditRecord : undefined}
              onDelete={!readOnly ? handleDeleteRecord : undefined}
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogo de agregar/editar */}
      <RecordsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        record={selectedRecord}
        onSubmit={handleDialogSubmit}
        isLoading={isLoading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro "{recordToDelete?.title}" 
              y recalculará la numeración de los registros restantes.
              <br /><br />
              <strong>Esta acción no se puede deshacer.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

### **4. Página del Módulo - `src/app/(app)/builder/[poaId]/(sections)/records/page.tsx`**

```typescript
'use client';

import { RecordsForm } from '@/components/poa/records-form';
import { useParams } from 'next/navigation';

export default function RecordsPage() {
  const params = useParams();
  const poaId = params.poaId as string;

  // Extraer procedureId del formato: proc-{procedureId}-{timestamp} o directamente {procedureId}
  const procedureId = (() => {
    if (!poaId || poaId === 'new') return poaId;
    
    if (poaId.startsWith('proc-')) {
      // Formato: proc-{procedureId}-{timestamp}
      const withoutPrefix = poaId.replace('proc-', '');
      const parts = withoutPrefix.split('-');
      // Si hay al menos 2 partes, el último es timestamp, el resto es procedureId
      return parts.length >= 2 ? parts.slice(0, -1).join('-') : withoutPrefix;
    } else {
      // Formato directo: {procedureId}
      return poaId;
    }
  })();

  return (
    <div className="container mx-auto py-6">
      <RecordsForm procedureId={procedureId} />
    </div>
  );
}
```

## **Navegación y Rutas**

### **Actualización del Layout - `src/app/(app)/builder/[poaId]/layout.tsx`**

```typescript
// Agregar "Registros" al array navItems
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
  { name: "Registros", href: "records", icon: FileText }, // ← NUEVO
  { name: "Vista Previa", href: "document", icon: Printer },
];
```

### **Actualización del Header - `src/components/layout/app-header.tsx`**

```typescript
// Agregar "Registros" al array navItemsForTitle
const navItemsForTitle = [
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
  { name: "Registros", href: "records" }, // ← NUEVO
  { name: "Vista Previa", href: "document" },
];
```

## **Características Técnicas**

### **Validaciones de Negocio**
- ✅ Validación en tiempo real con Zod
- ✅ Límites de caracteres según especificación
- ✅ Campo `storageMethod` opcional
- ✅ Auto-numeración manejada por el backend - **NO EDITABLE**
- ✅ **Sin límite máximo** de registros por procedimiento
- ✅ **Sin validaciones especiales** adicionales en campos
- ✅ **Operaciones CRUD libres** - editar/eliminar cualquier registro

### **UX/UI**
- ✅ Tabla responsive con iconos descriptivos
- ✅ Estados de carga con skeletons animados
- ✅ **Diálogo modal para agregar/editar** (como Control de Cambios)
- ✅ Confirmación de eliminación
- ✅ Contadores de caracteres en tiempo real
- ✅ Toasts informativos para feedback
- ✅ **Sin funcionalidad de búsqueda/filtrado** (no requerida)

### **Manejo de Errores**
- ✅ Validación de arrays para evitar crashes
- ✅ Estados de error con toasts
- ✅ Fallbacks para datos no válidos
- ✅ Manejo de procedimientos no guardados

### **Rendimiento**
- ✅ Hooks optimizados con useCallback
- ✅ Re-renders mínimos
- ✅ Carga lazy de componentes
- ✅ Estados de carga apropiados

## **Archivos a Crear/Modificar**

### **Nuevos Archivos**
1. `src/hooks/use-records.ts` - Hook personalizado
2. `src/components/poa/records-table.tsx` - Componente tabla
3. `src/components/poa/records-dialog.tsx` - Diálogo formulario
4. `src/components/poa/records-form.tsx` - Componente principal
5. `src/app/(app)/builder/[poaId]/(sections)/records/page.tsx` - Página del módulo

### **Archivos a Modificar**
1. `src/lib/schema.ts` - Agregar esquemas de registros
2. `src/api/poa.ts` - Agregar endpoints de registros
3. `src/app/(app)/builder/[poaId]/layout.tsx` - Agregar navegación
4. `src/components/layout/app-header.tsx` - Agregar título

## **Testing**

### **Tests de Componentes**
- ✅ Renderizado de tabla vacía y con datos
- ✅ Funcionalidad de agregar/editar/eliminar
- ✅ Validación de formularios
- ✅ Estados de carga y error

### **Tests de Hooks**
- ✅ Operaciones CRUD completas
- ✅ Manejo de estados
- ✅ Integración con API
- ✅ Validación de datos

### **Tests E2E**
- ✅ Flujo completo de gestión de registros
- ✅ Navegación entre secciones
- ✅ Persistencia de datos
- ✅ Responsive design

## **Integración con Documento HTML**

### **Generación de Sección**
- ✅ Los registros se incluyen en el documento HTML generado
- ✅ **Formato de tabla profesional** según especificación
- ✅ Numeración automática visible
- ✅ Campos opcionales manejados apropiadamente
- ✅ **No requiere funcionalidad de exportación** adicional

## **Accesibilidad**

### **Estándares WCAG**
- ✅ Etiquetas semánticas apropiadas
- ✅ Navegación por teclado
- ✅ Contraste de colores adecuado
- ✅ Textos alternativos para iconos
- ✅ Roles ARIA apropiados
