# Módulo de Referencias - MVP Frontend

## 1. Objetivo

Documentar la implementación en el frontend para el **Módulo de Referencias**. Esta guía describe la estructura de componentes, el manejo del estado y la interacción con la API del backend para permitir a los usuarios gestionar una lista de referencias externas dentro del builder de procedimientos.

## 2. Análisis Técnico

La implementación seguirá el patrón de diseño existente en el frontend, utilizando Next.js, React, `shadcn/ui`, y el sistema de contextos y hooks para el manejo del estado del POA.

- **Estructura de Archivos:** Se creará una nueva ruta y página para la sección de Referencias, junto con un componente de formulario reutilizable.
- **Manejo de Estado:** Se extenderá el `POAContext` y los hooks `use-poa` y `use-poa-api` para incluir y gestionar el estado de las `references`.
- **Componentes UI:** Se utilizará la librería `shadcn/ui` para construir la interfaz, principalmente `Table`, `Input`, `Button` y `Card`. La edición de datos se realizará en línea (inline editing) para una mejor experiencia de usuario.
- **Posicionamiento:** La sección de Referencias se ubicará entre "Definiciones" e "Introducción" en la navegación del builder.

## 3. Especificaciones del Módulo

### 3.1. Campos de la Referencia

| Campo | Requerido | Longitud Máxima | Tipo | Descripción |
|-------|-----------|-----------------|------|-------------|
| **Código** | No | 255 caracteres | String | Código identificador opcional |
| **Nombre de la referencia** | Sí | 500 caracteres | String | Nombre descriptivo de la referencia |
| **Tipo de referencia** | Sí | 80 caracteres | String | Categoría o tipo de la referencia |
| **Enlace** | No | 500 caracteres | String | URL o enlace opcional (sin validación) |

### 3.2. Funcionalidades MVP

- ✅ **CRUD Básico:** Crear, editar y eliminar referencias
- ✅ **Edición Inline:** Edición directa en la tabla sin modales
- ✅ **Validaciones:** Validación de campos requeridos y longitudes máximas
- ✅ **Persistencia:** Guardado automático en el backend
- ❌ **IA:** Sin integración con inteligencia artificial
- ❌ **Validación URL:** Sin validación de formato de enlaces
- ❌ **Reordenamiento:** Sin funcionalidad de drag & drop
- ❌ **Importación:** Sin importación de referencias

## 4. Implementación Detallada

### 4.1. Estructura de Archivos

Se crearán los siguientes archivos y directorios:

1. **Página de la Sección:**
   - `src/app/(app)/builder/[poaId]/(sections)/references/page.tsx`

2. **Componente del Formulario:**
   - `src/components/poa/references-form.tsx`

### 4.2. Manejo de Estado

1. **`src/lib/schema.ts`:**
   Se definirá la interfaz TypeScript para las referencias.

   ```typescript
   // src/lib/schema.ts

   export interface POAReference {
     codigo?: string;
     nombreReferencia: string;
     tipoReferencia: string;
     enlace?: string;
   }

   // Dentro de la interfaz POA
   export interface POA {
     // ... otros campos existentes
     references?: POAReference[];
     // ... resto de campos
   }
   ```

2. **`src/contexts/poa-context.tsx`:**
   Se añadirá la función `updateReferences` para gestionar las referencias.

   ```typescript
   // src/contexts/poa-context.tsx

   interface POAContextType {
     // ... propiedades existentes
     updateReferences: (references: POAReference[]) => void;
   }

   // En el componente POAProvider
   const updateReferences = useCallback((references: POAReference[]) => {
     setPoa((currentPoa) => {
       if (!currentPoa) return null;
       setIsDirty(true);
       return { ...currentPoa, references };
     });
   }, []);

   // En el valor del contexto
   return (
     <POAContext.Provider
       value={{
         // ... valores existentes
         updateReferences,
       }}
     >
       {children}
     </POAContext.Provider>
   );
   ```

3. **`src/hooks/use-poa-api.ts`:**
   Se agregará una función para actualizar las referencias en el backend.

   ```typescript
   // src/hooks/use-poa-api.ts

   export function usePOAAPI() {
     // ... hooks existentes

     const updateReferences = () => {
       return useMutation({
         mutationFn: async ({ 
           procedureId, 
           references 
         }: { 
           procedureId: string; 
           references: { references: POAReference[] } 
         }) => {
           const response = await fetch(`/api/poa/${procedureId}/references`, {
             method: 'PATCH',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify(references),
           });

           if (!response.ok) {
             throw new Error('Error al actualizar referencias');
           }

           return response.json();
         },
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['poa', procedureId] });
         },
       });
     };

     return {
       // ... otros métodos existentes
       updateReferences,
     };
   }
   ```

### 4.3. Componente `references-form.tsx`

Este será el componente principal que contendrá la lógica de la interfaz.

#### 4.3.1. Estado Local

```typescript
interface EditingReference extends POAReference {
  isNew?: boolean;
}

// Estados del componente
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [editingReference, setEditingReference] = useState<EditingReference | null>(null);
```

#### 4.3.2. Funcionalidades Principales

**Listar Referencias:**
- Renderizar todas las referencias en una tabla usando `poa.references`
- Mostrar estado vacío cuando no hay referencias

**Agregar Nueva Referencia:**
- Botón "Agregar Referencia" que habilita una nueva fila de edición
- Estado temporal `isNew: true` hasta que se guarde

**Editar Referencia Existente:**
- Clic en "Editar" convierte la fila en inputs editables
- Precarga los valores actuales en el estado de edición

**Guardar Cambios:**
- Validaciones de campos requeridos y longitudes
- Actualización del array completo de referencias
- Llamada al endpoint del backend
- Actualización del contexto local

**Eliminar Referencia:**
- Confirmación implícita (sin modal por simplicidad del MVP)
- Eliminación directa del array
- Actualización inmediata del backend

#### 4.3.3. Validaciones Frontend

```typescript
// Validaciones antes de guardar
const validateReference = (ref: EditingReference): string[] => {
  const errors: string[] = [];

  if (!ref.nombreReferencia.trim()) {
    errors.push("El nombre de la referencia es requerido");
  }

  if (!ref.tipoReferencia.trim()) {
    errors.push("El tipo de referencia es requerido");
  }

  if (ref.codigo && ref.codigo.length > 255) {
    errors.push("El código no puede exceder 255 caracteres");
  }

  if (ref.nombreReferencia.length > 500) {
    errors.push("El nombre no puede exceder 500 caracteres");
  }

  if (ref.tipoReferencia.length > 80) {
    errors.push("El tipo no puede exceder 80 caracteres");
  }

  if (ref.enlace && ref.enlace.length > 500) {
    errors.push("El enlace no puede exceder 500 caracteres");
  }

  return errors;
};
```

#### 4.3.4. Ejemplo de Flujo de Edición

1. **Estado inicial:** Tabla con referencias en modo solo lectura
2. **Clic en "Agregar":** Nueva fila con inputs vacíos aparece
3. **Llenar campos:** Usuario ingresa datos, validación en tiempo real
4. **Clic en "Guardar":** Validación, llamada API, actualización UI
5. **Clic en "Cancelar":** Descarta cambios, vuelve al estado anterior

### 4.4. Página `references/page.tsx`

Estructura simple que renderiza el componente principal:

```typescript
// src/app/(app)/builder/[poaId]/(sections)/references/page.tsx

import { ReferencesForm } from "@/components/poa/references-form";

export default function ReferencesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Referencias</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las referencias externas relacionadas con el procedimiento
        </p>
      </div>
      <ReferencesForm />
    </div>
  );
}
```

### 4.5. Actualización de Navegación

**Archivo:** `src/app/(app)/builder/[poaId]/layout.tsx`

```typescript
// Agregar el import
import { ExternalLink } from "lucide-react";

// Actualizar el array navItems
const navItems = [
  { name: "Encabezado", href: "header", icon: ClipboardEdit },
  { name: "Objetivo", href: "objective", icon: Target },
  { name: "Actividades", href: "activities", icon: ListTree },
  { name: "Alcance", href: "scope", icon: ScanSearch },
  { name: "Responsabilidades", href: "responsibilities", icon: Users },
  { name: "Definiciones", href: "definitions", icon: BookOpen },
  { name: "Referencias", href: "references", icon: ExternalLink }, // NUEVO
  { name: "Introducción", href: "introduction", icon: BookOpenText },
  { name: "Vista Previa", href: "document", icon: Printer },
];
```

## 5. Pasos para el Desarrollo

### 5.1. Fase 1: Fundación (Backend Requerido)
1. **Verificar Backend:** Asegurar que el endpoint `PATCH /poa/:id/references` esté implementado
2. **Tipos TypeScript:** Actualizar `src/lib/schema.ts` con `POAReference`
3. **Contexto POA:** Agregar `updateReferences` al contexto

### 5.2. Fase 2: Navegación
1. **Layout del Builder:** Actualizar `navItems` en `layout.tsx`
2. **Importar Icono:** Agregar `ExternalLink` de lucide-react
3. **Probar Navegación:** Verificar que la ruta funcione (404 esperado)

### 5.3. Fase 3: API Hook
1. **Hook API:** Implementar `updateReferences` en `use-poa-api.ts`
2. **Pruebas de API:** Verificar conexión con el backend

### 5.4. Fase 4: Interfaz
1. **Página Básica:** Crear `references/page.tsx`
2. **Componente Base:** Estructurar `references-form.tsx`
3. **Tabla de Referencias:** Implementar vista de solo lectura
4. **Estado Vacío:** Mensaje cuando no hay referencias

### 5.5. Fase 5: Funcionalidad CRUD
1. **Agregar Referencias:** Implementar botón y fila nueva
2. **Edición Inline:** Convertir filas a inputs editables
3. **Validaciones:** Implementar validaciones frontend
4. **Guardar/Cancelar:** Conectar con API y contexto
5. **Eliminar:** Implementar eliminación directa

### 5.6. Fase 6: Pulido y Testing
1. **Manejo de Errores:** Mostrar mensajes de error claros
2. **Loading States:** Spinners durante operaciones
3. **UX Polish:** Mejorar transiciones y feedback
4. **Testing Manual:** Probar todos los flujos

## 6. Consideraciones Técnicas

### 6.1. Performance
- **Mutaciones Optimistas:** Actualizar UI inmediatamente, revertir en error
- **Validación Debounced:** Evitar validaciones excesivas mientras se escribe
- **Memoización:** Usar `useMemo` para cálculos costosos si es necesario

### 6.2. Accesibilidad
- **Keyboard Navigation:** Navegación completa por teclado
- **Screen Readers:** Labels apropiados para campos de formulario
- **Focus Management:** Mantener foco en elementos relevantes

### 6.3. Responsive Design
- **Mobile First:** Tabla responsive que funcione en móviles
- **Breakpoints:** Ajustar columnas según tamaño de pantalla
- **Touch Targets:** Botones de tamaño adecuado para touch

### 6.4. Error Handling
- **Network Errors:** Mensajes claros para errores de conexión
- **Validation Errors:** Feedback inmediato en campos inválidos
- **Recovery:** Opciones para recuperarse de errores

## 7. Testing

### 7.1. Testing Manual
1. **CRUD Completo:** Crear, editar, eliminar referencias
2. **Validaciones:** Probar todos los casos de validación
3. **Navegación:** Verificar integración con el builder
4. **Persistencia:** Confirmar que los datos se guarden
5. **Edge Cases:** Referencias vacías, campos muy largos, etc.

### 7.2. Criterios de Aceptación
- ✅ Usuario puede agregar nueva referencia con campos válidos
- ✅ Usuario puede editar referencia existente
- ✅ Usuario puede eliminar referencia
- ✅ Validaciones impiden guardar datos inválidos
- ✅ Referencias se muestran correctamente en tabla
- ✅ Navegación funciona entre secciones
- ✅ Datos persisten al recargar la página
- ✅ Interface es responsive en móviles

## 8. Notas de Implementación

### 8.1. Diferencias con Definiciones
- **Más Campos:** Referencias tiene 4 campos vs 2 en definiciones
- **Sin IA:** Referencias no incluye generación automática
- **Validaciones Diferentes:** Longitudes máximas específicas
- **Sin Reordenamiento:** No se requiere drag & drop

### 8.2. Futuras Mejoras (Post-MVP)
- **Validación URL:** Verificar formato y existencia de enlaces
- **Categorías Predefinidas:** Dropdown para tipos de referencia
- **Importación/Exportación:** Cargar referencias desde archivos
- **Reordenamiento:** Drag & drop para ordenar referencias
- **Búsqueda/Filtrado:** Encontrar referencias específicas
- **IA Integration:** Sugerir referencias basadas en el contenido

Esta documentación proporciona una guía completa para implementar el módulo de Referencias en el frontend, manteniendo consistencia con los patrones existentes del proyecto. 