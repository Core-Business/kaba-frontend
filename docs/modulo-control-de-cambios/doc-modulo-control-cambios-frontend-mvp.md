# Documentación Técnica: Módulo Control de Cambios - Frontend MVP

## Descripción General

El módulo de **Control de Cambios** en el frontend proporciona una interfaz de tabla para registrar y gestionar los cambios realizados en un procedimiento POA. Permite agregar nuevos registros y editar/eliminar únicamente la última entrada.

## Ubicación en el Sistema

- **Posición en Builder**: Entre "Aprobaciones" y "Vista Previa"
- **Ruta**: `/builder/[poaId]/change-control`
- **Icono**: `FileEdit` (Lucide React)
- **Título en navegación**: "Control de Cambios"

## Esquemas TypeScript (schema.ts)

### Tipos Base

```typescript
// Entrada individual de control de cambios
export const poaChangeControlEntrySchema = z.object({
  id: z.string(),
  number: z.number().int().positive(),
  changeDate: z.string().regex(
    /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/,
    "La fecha debe estar en formato MM-DD-YYYY"
  ),
  changeReason: z.string().min(1, "El motivo es obligatorio").max(255),
  responsible: z.string().min(1, "El responsable es obligatorio").max(255),
  signature: z.string().nullable().optional(),
  editedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type POAChangeControlEntry = z.infer<typeof poaChangeControlEntrySchema>;

// Formulario para crear/editar entrada
export const changeControlEntryFormSchema = z.object({
  changeDate: z.string().regex(
    /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/,
    "La fecha debe estar en formato MM-DD-YYYY"
  ).refine((date) => {
    const [month, day, year] = date.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  }, "La fecha no puede ser futura"),
  changeReason: z.string().min(1, "El motivo es obligatorio").max(255),
  responsible: z.string().min(1, "El responsable es obligatorio").max(255),
});

export type ChangeControlEntryFormData = z.infer<typeof changeControlEntryFormSchema>;

// Agregar al esquema principal POA
export const poaSchema = z.object({
  // ... campos existentes
  changeControl: z.array(poaChangeControlEntrySchema).optional().default([]),
});

// Valores por defecto
export const defaultPOAChangeControl: POAChangeControlEntry[] = [];

// Actualizar createNewPOA
export function createNewPOA(): POA {
  return {
    // ... campos existentes
    changeControl: defaultPOAChangeControl,
  };
}
```

## Componentes React

### 1. ChangeControlForm (Componente Principal)

```typescript
// src/components/poa/change-control-form.tsx
'use client';

import { useState } from 'react';
import { usePOA } from '@/hooks/use-poa';
import { useChangeControl } from '@/hooks/use-change-control';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from './common-form-elements';
import { ChangeControlTable } from './change-control-table';
import { ChangeControlDialog } from './change-control-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus } from 'lucide-react';
import type { POAChangeControlEntry, ChangeControlEntryFormData } from '@/lib/schema';

export function ChangeControlForm() {
  const { poa, saveCurrentPOA } = usePOA();
  const {
    isLoading,
    addChangeControlEntry,
    updateChangeControlEntry,
    deleteChangeControlEntry,
  } = useChangeControl();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<POAChangeControlEntry | null>(null);

  if (!poa) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner />
      </div>
    );
  }

  const changeControlEntries = poa.changeControl || [];

  const handleOpenDialog = (entry?: POAChangeControlEntry | null) => {
    setEditingEntry(entry || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (data: ChangeControlEntryFormData) => {
    try {
      if (editingEntry) {
        await updateChangeControlEntry(editingEntry.id, data);
      } else {
        await addChangeControlEntry(data);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting change control entry:', error);
    }
  };

  const handleEditEntry = (entry: POAChangeControlEntry) => {
    handleOpenDialog(entry);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteChangeControlEntry(entryId);
    } catch (error) {
      console.error('Error deleting change control entry:', error);
    }
  };

  const handleSave = async () => {
    if (!poa) {
      toast({
        title: "Error",
        description: "No hay datos para guardar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveCurrentPOA();
      toast({
        title: "Control de Cambios Guardado",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      console.error('Error al guardar control de cambios:', error);
      toast({
        title: "Error al Guardar",
        description: `No se pudo guardar el control de cambios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="shadow-lg w-full">
        <CardHeader>
          <SectionTitle 
            title="Control de Cambios" 
            description="Registra y gestiona los cambios realizados en el procedimiento a lo largo del tiempo." 
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Botón para agregar nueva entrada */}
          <div className="flex justify-end">
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Cambio
            </Button>
          </div>

          {/* Tabla de control de cambios */}
          <ChangeControlTable
            entries={changeControlEntries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            isLoading={isLoading}
          />

          {/* Mensaje informativo si no hay entradas */}
          {changeControlEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              <div className="space-y-2">
                <p className="text-base font-medium">Sin cambios registrados</p>
                <p className="text-sm">
                  El control de cambios documenta las modificaciones realizadas al procedimiento.
                  Comienza agregando el primer registro de cambio.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-start border-t pt-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Control de Cambios
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo para agregar/editar entradas */}
      <ChangeControlDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        entry={editingEntry}
        isLoading={isLoading}
      />
    </>
  );
}
```

### 2. ChangeControlTable (Tabla de Entradas)

```typescript
// src/components/poa/change-control-table.tsx
'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import type { POAChangeControlEntry } from '@/lib/schema';

interface ChangeControlTableProps {
  entries: POAChangeControlEntry[];
  onEditEntry: (entry: POAChangeControlEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  isLoading: boolean;
}

export function ChangeControlTable({
  entries,
  onEditEntry,
  onDeleteEntry,
  isLoading,
}: ChangeControlTableProps) {
  // Ordenar entradas por número (ascendente)
  const sortedEntries = [...entries].sort((a, b) => a.number - b.number);
  const lastEntry = sortedEntries[sortedEntries.length - 1];

  const formatDate = (dateString: string) => {
    // Convertir MM-DD-YYYY a formato más legible
    const [month, day, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No.</TableHead>
            <TableHead className="w-32">Fecha de Cambio</TableHead>
            <TableHead>Motivo de Cambio</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="w-24">Firma</TableHead>
            <TableHead className="w-16">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No hay cambios registrados
              </TableCell>
            </TableRow>
          ) : (
            sortedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {entry.number}
                </TableCell>
                <TableCell>
                  {formatDate(entry.changeDate)}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={entry.changeReason}>
                    {entry.changeReason}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={entry.responsible}>
                    {entry.responsible}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    Pendiente
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isLoading}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                                         <DropdownMenuContent align="end">
                       {/* Solo permitir editar/eliminar la última entrada */}
                       {lastEntry?.id === entry.id ? (
                         <>
                           <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                             <Edit className="mr-2 h-4 w-4" />
                             Editar
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             onClick={() => onDeleteEntry(entry.id)}
                             className="text-destructive"
                           >
                             <Trash2 className="mr-2 h-4 w-4" />
                             Eliminar
                           </DropdownMenuItem>
                         </>
                       ) : (
                         <DropdownMenuItem disabled>
                           <span className="text-muted-foreground text-xs">
                             Solo se puede editar/eliminar la última entrada
                           </span>
                         </DropdownMenuItem>
                       )}
                     </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 3. ChangeControlDialog (Modal para Agregar/Editar)

```typescript
// src/components/poa/change-control-dialog.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  changeControlEntryFormSchema, 
  type ChangeControlEntryFormData,
  type POAChangeControlEntry 
} from '@/lib/schema';

interface ChangeControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChangeControlEntryFormData) => Promise<void>;
  entry?: POAChangeControlEntry | null;
  isLoading: boolean;
}

export function ChangeControlDialog({
  open,
  onOpenChange,
  onSubmit,
  entry,
  isLoading,
}: ChangeControlDialogProps) {
  const isEditing = !!entry;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeControlEntryFormData>({
    resolver: zodResolver(changeControlEntryFormSchema),
    defaultValues: {
      changeDate: entry?.changeDate || '',
      changeReason: entry?.changeReason || '',
      responsible: entry?.responsible || '',
    },
  });

  const handleFormSubmit = async (data: ChangeControlEntryFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cambio' : 'Agregar Nuevo Cambio'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="changeDate">Fecha de Cambio *</Label>
            <Input
              id="changeDate"
              type="text"
              placeholder="MM-DD-YYYY (ej: 12-15-2024)"
              {...register('changeDate')}
              disabled={isLoading}
              className="w-full"
            />
            {errors.changeDate && (
              <p className="text-sm text-destructive">{errors.changeDate.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Formato: MM-DD-YYYY. No se permiten fechas futuras.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeReason">Motivo del Cambio *</Label>
            <Textarea
              id="changeReason"
              placeholder="Describe el motivo o razón del cambio realizado..."
              {...register('changeReason')}
              disabled={isLoading}
              className="w-full min-h-[80px]"
              maxLength={255}
            />
            {errors.changeReason && (
              <p className="text-sm text-destructive">{errors.changeReason.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Máximo 255 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Responsable *</Label>
            <Input
              id="responsible"
              type="text"
              placeholder="Nombre y cargo del responsable del cambio"
              {...register('responsible')}
              disabled={isLoading}
              className="w-full"
              maxLength={255}
            />
            {errors.responsible && (
              <p className="text-sm text-destructive">{errors.responsible.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ej: Juan Pérez - Gerente de Calidad (máx. 255 caracteres)
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Hook Personalizado

### useChangeControl Hook

```typescript
// src/hooks/use-change-control.ts
'use client';

import { useState } from 'react';
import { usePOA } from './use-poa';
import { api } from '@/api/http';
import { useToast } from './use-toast';
import type { ChangeControlEntryFormData } from '@/lib/schema';

export function useChangeControl() {
  const { poa, setPoa } = usePOA();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addChangeControlEntry = async (data: ChangeControlEntryFormData) => {
    if (!poa) {
      toast({
        title: "Error",
        description: "No hay POA cargado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        `/procedures/${poa.procedureId}/poa/change-control/entry`,
        data
      );

      // Actualizar estado local con respuesta del backend
      setPoa(response.data);

      toast({
        title: "Cambio Agregado",
        description: "La entrada de control de cambios ha sido agregada exitosamente.",
      });
    } catch (error: any) {
      console.error('Error agregando entrada de control de cambios:', error);
      toast({
        title: "Error al Agregar",
        description: error.response?.data?.message || "No se pudo agregar la entrada.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChangeControlEntry = async (entryId: string, data: ChangeControlEntryFormData) => {
    if (!poa) {
      toast({
        title: "Error",
        description: "No hay POA cargado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(
        `/procedures/${poa.procedureId}/poa/change-control/entry/${entryId}`,
        data
      );

      // Actualizar estado local con respuesta del backend
      setPoa(response.data);

      toast({
        title: "Cambio Actualizado",
        description: "La entrada de control de cambios ha sido actualizada exitosamente.",
      });
    } catch (error: any) {
      console.error('Error actualizando entrada de control de cambios:', error);
      toast({
        title: "Error al Actualizar",
        description: error.response?.data?.message || "No se pudo actualizar la entrada.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChangeControlEntry = async (entryId: string) => {
    if (!poa) {
      toast({
        title: "Error",
        description: "No hay POA cargado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.delete(
        `/procedures/${poa.procedureId}/poa/change-control/entry/${entryId}`
      );

      // Actualizar estado local con respuesta del backend
      setPoa(response.data);

      toast({
        title: "Cambio Eliminado",
        description: "La entrada de control de cambios ha sido eliminada exitosamente.",
      });
    } catch (error: any) {
      console.error('Error eliminando entrada de control de cambios:', error);
      toast({
        title: "Error al Eliminar",
        description: error.response?.data?.message || "No se pudo eliminar la entrada.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addChangeControlEntry,
    updateChangeControlEntry,
    deleteChangeControlEntry,
  };
}
```

## Página del Módulo

### change-control/page.tsx

```typescript
// src/app/(app)/builder/[poaId]/(sections)/change-control/page.tsx
import { ChangeControlForm } from '@/components/poa/change-control-form';

export default function ChangeControlPage() {
  return <ChangeControlForm />;
}
```

## Navegación (Actualización)

### Actualizar app-sidebar.tsx

```typescript
// Agregar a la lista de secciones en app-sidebar.tsx
{
  title: "Control de Cambios",
  href: `/builder/${poaId}/change-control`,
  icon: FileEdit,
  isActive: pathname.includes('/change-control'),
},
```

## Utilidades

### Validación de Fechas

```typescript
// src/lib/date-utils.ts
export function validateDateNotFuture(dateString: string): boolean {
  try {
    const [month, day, year] = dateString.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  } catch {
    return false;
  }
}

export function formatDisplayDate(dateString: string): string {
  try {
    const [month, day, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function getCurrentDate(): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${month}-${day}-${year}`;
}
```

## Archivos a Crear/Modificar

### Nuevos archivos:
1. `src/components/poa/change-control-form.tsx` - Componente principal
2. `src/components/poa/change-control-table.tsx` - Tabla de entradas
3. `src/components/poa/change-control-dialog.tsx` - Modal para agregar/editar
4. `src/hooks/use-change-control.ts` - Hook personalizado para API
5. `src/app/(app)/builder/[poaId]/(sections)/change-control/page.tsx` - Página del módulo
6. `src/lib/date-utils.ts` - Utilidades de fecha

### Archivos a modificar:
1. `src/lib/schema.ts` - Agregar esquemas y tipos
2. `src/components/layout/app-sidebar.tsx` - Agregar navegación
3. `src/app/(app)/builder/[poaId]/layout.tsx` - Verificar que incluya la nueva ruta

## Consideraciones de UX/UI

### Diseño de Tabla
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Ordenamiento**: Por número ascendente (automático)
- **Acciones**: Menú dropdown con opciones contextuales
- **Estados**: Loading states para todas las operaciones

### Validaciones Frontend
- **Fecha futura**: Validación en tiempo real con mensaje claro
- **Formato fecha**: Regex para MM-DD-YYYY con placeholder explicativo
- **Campos obligatorios**: Marcados con asterisco y validación inmediata
- **Límites de caracteres**: Contador visual y validación

### Interacciones
- **Agregar**: Botón prominente en la parte superior
- **Editar**: Solo disponible para la última entrada
- **Eliminar**: Solo disponible para la última entrada
- **Guardar**: Botón manual para sincronizar cambios

### Accessibility
- **Labels**: Todos los campos tienen labels apropiados
- **ARIA**: Atributos para lectores de pantalla
- **Keyboard navigation**: Soporte completo de teclado
- **Focus management**: Manejo correcto del foco en modales

## Estados y Flujos

### Estados de la Aplicación
1. **Vacío**: Sin entradas registradas (mensaje informativo)
2. **Con datos**: Tabla con entradas ordenadas por número
3. **Cargando**: Spinners durante operaciones de API
4. **Error**: Mensajes de error con toast notifications

### Flujos de Usuario
1. **Agregar entrada**: Botón → Modal → Validación → API → Actualización local
2. **Editar entrada**: Menú (solo última entrada) → Modal pre-poblado → Validación → API → Actualización
3. **Eliminar entrada**: Menú (solo última entrada) → Confirmación → API → Actualización local
4. **Guardar cambios**: Botón → Sincronización con contexto POA

## Integración con Sistema Existente

### Contexto POA
- Usa el contexto `usePOA()` existente para estado global
- Integra con auto-save y detección de cambios
- Mantiene consistencia con otros módulos

### API Integration
- Usa cliente `api` con interceptors para headers multi-tenant
- Manejo de errores consistente con el resto de la aplicación
- Estructura de respuesta estándar

### Navegación
- Integra con sidebar existente entre "Aprobaciones" y "Vista Previa"
- Mantiene estado de navegación activa
- Breadcrumbs automáticos del layout padre

Esta implementación proporciona una experiencia de usuario consistente con el resto del sistema, mantiene la arquitectura establecida y cumple con todos los requisitos funcionales especificados.
