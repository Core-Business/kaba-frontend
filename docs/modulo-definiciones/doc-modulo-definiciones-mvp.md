# Módulo de Definiciones - MVP Frontend

## 1. Objetivo

Documentar la implementación en el frontend para el **Módulo de Definiciones**. Esta guía describe la estructura de componentes, el manejo del estado y la interacción con la API del backend para permitir a los usuarios gestionar una lista de términos y definiciones dentro del builder de procedimientos.

## 2. Análisis Técnico

La implementación seguirá el patrón de diseño existente en el frontend, utilizando Next.js, React, `shadcn/ui`, y el sistema de contextos y hooks para el manejo del estado del POA.

-   **Estructura de Archivos:** Se creará una nueva ruta y página para la sección de Definiciones, junto con un componente de formulario reutilizable.
-   **Manejo de Estado:** Se extenderá el `PoaContext` y los hooks `use-poa` y `use-poa-api` para incluir y gestionar el estado de las `definitions`.
-   **Componentes UI:** Se utilizará la librería `shadcn/ui` para construir la interfaz, principalmente `Table`, `Input`, `Button` y `Tooltip`. La edición de datos se realizará en línea (inline editing) para una mejor experiencia de usuario.
-   **API Client:** Se creará un nuevo cliente de API (`src/api/ai.ts`) para comunicarse con el endpoint de IA del backend.

## 3. Implementación Detallada

### 3.1. Estructura de Archivos

Se crearán los siguientes archivos y directorios:

1.  **Página de la Sección:**
    -   `src/app/(app)/builder/[poaId]/(sections)/definitions/page.tsx`

2.  **Componente del Formulario:**
    -   `src/components/poa/definitions-form.tsx`

3.  **Cliente de API para IA:**
    -   `src/api/ai.ts`

### 3.2. Manejo de Estado

1.  **`src/contexts/poa-context.tsx`:**
    Se añadirá `definitions` a la interfaz `PoaData` y al estado inicial.

    ```typescript
    // src/contexts/poa-context.tsx

    interface PoaData {
      // ... otros campos
      definitions: { term: string; definition: string }[];
    }
    
    // En el estado inicial del contexto
    const initialState = {
        // ... otros estados
        definitions: [],
    }
    ```

2.  **`src/hooks/use-poa-api.ts`:**
    Se agregará una función para actualizar las definiciones en el backend.

    ```typescript
    // src/hooks/use-poa-api.ts
    
    // ... dentro del hook usePoaApi
    
    const updateDefinitions = async (poaId: string, definitions: { term: string; definition: string }[]) => {
      try {
        const response = await http.patch(`/procedures/poa/${poaId}/definitions`, { definitions });
        // Lógica para actualizar el estado local y mostrar notificaciones...
        return response.data;
      } catch (error) {
        // Manejo de errores...
      }
    };

    return { ..., updateDefinitions };
    ```

### 3.3. API Client para IA

Se creará un archivo para gestionar las llamadas a los endpoints de IA.

```typescript
// src/api/ai.ts
import { http } from './http';

interface GenerateDefinitionResponse {
  definition: string;
}

export const aiApi = {
  generateDefinition: async (term: string): Promise<GenerateDefinitionResponse> => {
    const response = await http.post<GenerateDefinitionResponse>('/ai/generate-definition', { term });
    return response.data;
  },
};
```

### 3.4. Componente `definitions-form.tsx`

Este será el componente principal que contendrá la lógica de la interfaz.

-   **Estado local:** Manejará el estado de la edición en línea (qué fila está en modo edición) y el contenido de los inputs mientras se edita.
-   **Renderizado:** Usará el componente `<Table>` para mostrar las definiciones. Cada fila tendrá botones para "Editar", "Guardar", "Cancelar" y "Eliminar".
-   **Funcionalidad:**
    -   **Listar:** Mapeará sobre `poa.definitions` del `use-poa()` para renderizar las filas.
    -   **Añadir:** Un botón "Añadir Término" agregará una nueva fila vacía a un estado local temporalmente, hasta que se guarde.
    -   **Editar (En línea):** Al hacer clic en "Editar", los campos `term` y `definition` de esa fila se convertirán en inputs. Los botones "Editar" y "Eliminar" se reemplazarán por "Guardar" y "Cancelar".
    -   **Guardar:** Al hacer clic en "Guardar" (después de editar o añadir), se llamará a la función `updateDefinitions` del hook `use-poa-api` con todo el array de definiciones actualizado.
    -   **Eliminar:** Eliminará el término del estado local y llamará a `updateDefinitions`.
    -   **Generar con IA:** Un botón junto al input de definición (en modo edición) llamará a `aiApi.generateDefinition`. El resultado se colocará en el input de definición, permitiendo al usuario modificarlo antes de guardar.

**Ejemplo de flujo de edición en línea:**

1.  **Estado inicial de la fila:** Muestra texto plano y botones "Editar" / "Eliminar".
2.  **Clic en "Editar":** La fila se re-renderiza con `<Input>` para término y `<Textarea>` para definición. Los botones cambian a "Guardar" / "Cancelar". Un botón "Generar con IA" aparece junto a la definición.
3.  **Clic en "Generar con IA":** Se muestra un spinner. Al completarse, el `<Textarea>` se llena con el texto de la IA.
4.  **Clic en "Guardar":** Los cambios se guardan en el estado global (y se envían a la API), la fila vuelve a su estado de solo lectura.
5.  **Clic en "Cancelar":** Los cambios se descartan y la fila vuelve a su estado de solo lectura.

## 4. Pasos para el Desarrollo

1.  **Ruta y Página:** Crear `src/app/(app)/builder/[poaId]/(sections)/definitions/page.tsx`. Importar y renderizar `definitions-form.tsx` allí.
2.  **Contexto:** Actualizar `poa-context.tsx` para incluir `definitions`.
3.  **Hook API:** Extender `use-poa-api.ts` con la función `updateDefinitions`.
4.  **Cliente API (IA):** Crear el archivo `src/api/ai.ts`.
5.  **Componente de Formulario:** Desarrollar `definitions-form.tsx` con la lógica de UI y estado descrita.
    -   Implementar la tabla de solo lectura.
    -   Añadir la lógica para agregar una nueva fila.
    -   Implementar el estado de edición en línea (inline editing).
    -   Integrar la llamada a la API de IA.
    -   Conectar el guardado de datos con el `use-pao-api`.
6.  **Navegación:** Agregar el enlace a "Definiciones" en el layout del builder (`src/app/(app)/builder/[poaId]/layout.tsx`), situándolo entre "Responsabilidades" e "Introducción".
7.  **Pruebas:** Probar manualmente el flujo completo: añadir, editar, eliminar y generar con IA. 