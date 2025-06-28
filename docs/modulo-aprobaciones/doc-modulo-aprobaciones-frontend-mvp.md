# Módulo de Aprobaciones - Frontend MVP

## Descripción General

El módulo de Aprobaciones permite a los usuarios capturar información sobre las personas que participan en la elaboración, revisión y autorización de los procedimientos. La interfaz permitirá agregar, editar y eliminar personas de cada categoría de aprobación.

## Ubicación en el Builder

El módulo se posiciona entre **'Introducción'** y **'Vista Previa'** en el flujo del builder de procedimientos.

## Estructura de Archivos y Componentes

### 1. Estructura de Directorios

```
src/
├── app/(app)/builder/[poaId]/(sections)/
│   └── approvals/
│       └── page.tsx                    # Página principal de aprobaciones
├── components/poa/
│   ├── approvals-form.tsx              # Componente principal del formulario
│   ├── approval-person-card.tsx        # Tarjeta para mostrar cada persona
│   ├── approval-person-dialog.tsx      # Diálogo para agregar/editar persona
│   └── approval-section.tsx            # Sección por tipo (elaboró, revisó, autorizó)
├── hooks/
│   └── use-approvals.ts                # Hook personalizado para aprobaciones
└── lib/
    └── schema.ts                       # Schemas actualizados con aprobaciones
```

### 2. Esquemas TypeScript

```typescript
// En lib/schema.ts - Agregar esquemas de aprobaciones

export const poaApprovalPersonSchema = z.object({
  id: z.string(),
  name: z.string().max(255, 'El nombre no puede exceder 255 caracteres'),
  position: z.string().max(255, 'El cargo no puede exceder 255 caracteres'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const poaApprovalsSchema = z.object({
  elaborated: z.array(poaApprovalPersonSchema).default([]),
  reviewed: z.array(poaApprovalPersonSchema).default([]),
  authorized: z.array(poaApprovalPersonSchema).default([]),
});

// Actualizar el schema principal de POA
export const poaSchema = z.object({
  // ... campos existentes
  approvals: poaApprovalsSchema.optional(),
});

export type POAApprovalPerson = z.infer<typeof poaApprovalPersonSchema>;
export type POAApprovals = z.infer<typeof poaApprovalsSchema>;
export type ApprovalType = 'elaborated' | 'reviewed' | 'authorized';
```

## Componentes Principales

### 1. ApprovalPersonDialog (`approval-person-dialog.tsx`)

Diálogo modal para agregar y editar personas de aprobación.

```tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

const approvalPersonFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  position: z.string().min(1, 'El cargo es requerido.')
    .max(255, 'El cargo no puede exceder 255 caracteres'),
});

type ApprovalPersonFormData = z.infer<typeof approvalPersonFormSchema>;

interface ApprovalPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalPersonFormData) => void;
  person?: POAApprovalPerson | null;
  isLoading: boolean;
  approvalType: ApprovalType;
}

export function ApprovalPersonDialog({
  open,
  onOpenChange,
  onSubmit,
  person,
  isLoading,
  approvalType,
}: ApprovalPersonDialogProps) {
  // Implementación del formulario
}
```

### 2. ApprovalPersonCard (`approval-person-card.tsx`)

Tarjeta para mostrar información de cada persona con opciones de editar/eliminar.

```tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, User } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface ApprovalPersonCardProps {
  person: POAApprovalPerson;
  onEdit: (person: POAApprovalPerson) => void;
  onDelete: (personId: string) => void;
  isLoading: boolean;
}

export function ApprovalPersonCard({
  person,
  onEdit,
  onDelete,
  isLoading,
}: ApprovalPersonCardProps) {
  // Implementación de la tarjeta
}
```

### 3. ApprovalSection (`approval-section.tsx`)

Sección individual para cada tipo de aprobación (elaboró, revisó, autorizó).

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ApprovalPersonCard } from './approval-person-card';

interface ApprovalSectionProps {
  title: string;
  description: string;
  people: POAApprovalPerson[];
  onAddPerson: () => void;
  onEditPerson: (person: POAApprovalPerson) => void;
  onDeletePerson: (personId: string) => void;
  isLoading: boolean;
}

export function ApprovalSection({
  title,
  description,
  people,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  isLoading,
}: ApprovalSectionProps) {
  // Implementación de la sección
}
```

### 4. ApprovalsForm (`approvals-form.tsx`)

Componente principal que contiene las tres secciones de aprobación.

```tsx
'use client';

import { useState } from 'react';
import { usePOA } from '@/hooks/use-poa';
import { useApprovals } from '@/hooks/use-approvals';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionTitle } from './common-form-elements';
import { ApprovalSection } from './approval-section';
import { ApprovalPersonDialog } from './approval-person-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function ApprovalsForm() {
  const { poa } = usePOA();
  const {
    isLoading,
    addApprovalPerson,
    updateApprovalPerson,
    deleteApprovalPerson,
  } = useApprovals();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<POAApprovalPerson | null>(null);
  const [currentType, setCurrentType] = useState<ApprovalType>('elaborated');

  // Implementación del componente principal
}
```

## Hook Personalizado

### useApprovals (`use-approvals.ts`)

Hook que maneja la lógica de negocio para las aprobaciones.

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { usePOA } from '@/hooks/use-poa';
import type { POAApprovalPerson, ApprovalType } from '@/lib/schema';

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

  // Agregar persona a tipo específico
  const addApprovalPerson = async (
    type: ApprovalType,
    personData: ApprovalPersonFormData
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/procedures/${procedureId}/poa/approvals/${type}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personData),
        }
      );

      if (!response.ok) throw new Error('Error al agregar persona');

      setIsDirty(true);
      toast({
        title: 'Persona agregada',
        description: `Se agregó exitosamente a ${getTypeLabel(type)}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar la persona',
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
    // Implementación similar
  };

  // Eliminar persona específica
  const deleteApprovalPerson = async (
    type: ApprovalType,
    personId: string
  ): Promise<void> => {
    // Implementación similar
  };

  // Actualizar todas las aprobaciones
  const updateAllApprovals = async (approvals: POAApprovals): Promise<void> => {
    // Implementación para actualizar todo
  };

  return {
    isLoading,
    addApprovalPerson,
    updateApprovalPerson,
    deleteApprovalPerson,
    updateAllApprovals,
  };
}

// Función auxiliar para etiquetas
function getTypeLabel(type: ApprovalType): string {
  switch (type) {
    case 'elaborated': return 'Elaboró';
    case 'reviewed': return 'Revisó';
    case 'authorized': return 'Autorizó';
    default: return '';
  }
}
```

## Página Principal

### page.tsx en approvals

```tsx
import { ApprovalsForm } from '@/components/poa/approvals-form';

export default function ApprovalsPage() {
  return <ApprovalsForm />;
}
```

## Integración con POA Context

### Actualizar usePOA

```typescript
// En hooks/use-poa.ts - Agregar funciones para aprobaciones

const updateApprovals = (approvals: POAApprovals) => {
  if (poaBackend) {
    const updatedPOA = { ...poaBackend, approvals };
    setPoaBackend(updatedPOA);
    setIsDirty(true);
  }
};

// Retornar en el hook
return {
  // ... funciones existentes
  updateApprovals,
  approvals: poaBackend?.approvals || {
    elaborated: [],
    reviewed: [],
    authorized: [],
  },
};
```

## API Integration

### Servicios API

```typescript
// En api/poa.ts - Agregar funciones para aprobaciones

export const approvalsApi = {
  // Actualizar todas las aprobaciones
  updateAll: async (procedureId: string, approvals: POAApprovals) => {
    return httpClient.post(`/procedures/${procedureId}/poa/approvals`, approvals);
  },

  // Agregar persona a tipo específico
  addPerson: async (
    procedureId: string,
    type: ApprovalType,
    person: ApprovalPersonFormData
  ) => {
    return httpClient.post(
      `/procedures/${procedureId}/poa/approvals/${type}`,
      person
    );
  },

  // Actualizar persona específica
  updatePerson: async (
    procedureId: string,
    type: ApprovalType,
    personId: string,
    person: ApprovalPersonFormData
  ) => {
    return httpClient.put(
      `/procedures/${procedureId}/poa/approvals/${type}/${personId}`,
      person
    );
  },

  // Eliminar persona específica
  deletePerson: async (
    procedureId: string,
    type: ApprovalType,
    personId: string
  ) => {
    return httpClient.delete(
      `/procedures/${procedureId}/poa/approvals/${type}/${personId}`
    );
  },
};
```

## Navegación y Rutas

### Actualizar Sidebar

```typescript
// En components/layout/app-sidebar.tsx - Agregar enlace a aprobaciones

const sectionItems = [
  // ... secciones existentes
  {
    title: "Introducción",
    href: `/builder/${poaId}/introduction`,
    icon: FileText,
  },
  {
    title: "Aprobaciones",
    href: `/builder/${poaId}/approvals`,
    icon: CheckSquare, // Nuevo icono
  },
  {
    title: "Vista Previa",
    href: `/builder/${poaId}/document`,
    icon: Eye,
  },
];
```

## Estilos y UX

### Características de Interfaz

1. **Card Principal**: Contiene todas las secciones de aprobación
2. **Secciones Separadas**: Una sección por cada tipo (Elaboró, Revisó, Autorizó)
3. **Tarjetas de Persona**: Muestra nombre y cargo claramente
4. **Botones de Acción**: Agregar, editar, eliminar con iconos
5. **Diálogo Modal**: Para agregar/editar personas
6. **Estados de Carga**: Spinners y estados disabled
7. **Validación**: Mensajes de error en tiempo real
8. **Confirmación**: Alertas antes de eliminar

### Responsive Design

- **Desktop**: Tres columnas para las secciones
- **Tablet**: Dos columnas, tercera abajo
- **Mobile**: Una columna, diseño vertical

## Auto-save

### Implementación

```typescript
// Auto-save cada vez que se modifica una aprobación
useEffect(() => {
  if (isDirty && approvals) {
    const timeoutId = setTimeout(() => {
      approvalsApi.updateAll(procedureId, approvals)
        .then(() => setIsDirty(false))
        .catch(() => {
          toast({
            title: 'Error de Auto-guardado',
            description: 'No se pudieron guardar los cambios automáticamente',
            variant: 'destructive',
          });
        });
    }, 2000); // Auto-save después de 2 segundos

    return () => clearTimeout(timeoutId);
  }
}, [approvals, isDirty]);
```

## Validaciones Frontend

### Reglas de Validación

1. **Nombres**: Requerido, máximo 255 caracteres
2. **Cargos**: Requerido, máximo 255 caracteres
3. **Duplicados**: Permitidos (mismo nombre en múltiples tipos)
4. **Límites**: Sin límite mínimo/máximo de personas

## Testing

### Casos de Prueba

1. **Rendering**: Componentes se renderizan correctamente
2. **Formularios**: Validación de campos
3. **CRUD**: Agregar, editar, eliminar personas
4. **Estados**: Loading, error, success
5. **Navegación**: Links y routing
6. **Auto-save**: Funcionalidad automática
7. **Responsive**: Diseño en diferentes tamaños

## Integración con PDF

### Preparación de Datos

```typescript
// Formatear datos para el PDF
export const formatApprovalsForPDF = (approvals: POAApprovals) => {
  return {
    elaborated: approvals.elaborated.map(p => ({
      name: p.name,
      position: p.position,
      signatureSpace: true, // Espacio para firma
    })),
    reviewed: approvals.reviewed.map(p => ({
      name: p.name,
      position: p.position,
      signatureSpace: true,
    })),
    authorized: approvals.authorized.map(p => ({
      name: p.name,
      position: p.position,
      signatureSpace: true,
    })),
  };
};
```

## Consideraciones Técnicas

### Performance
- Lazy loading de componentes
- Memoización de listas largas
- Debounce en auto-save

### Accesibilidad
- Labels descriptivos
- Focus management
- Keyboard navigation
- Screen reader support

### Internacionalización
- Textos preparados para i18n
- Formato de nombres según locale

## Migración y Compatibilidad

### POAs Existentes
- Auto-inicialización con arrays vacíos
- Backward compatibility garantizada
- No breaking changes

### Deployment
- Feature flags para rollout gradual
- Rollback strategy preparado
- Monitoring de errores específicos
