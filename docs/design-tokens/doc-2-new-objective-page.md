# Design Tokens: Página Objective (Rediseño)

> **Versión:** 2.0  
> **Fecha:** 2025-12-07  
> **Estado:** Propuesta de Rediseño

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Sistema de Colores](#sistema-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado y Layout](#espaciado-y-layout)
5. [Componentes](#componentes)
6. [Iconografía](#iconografía)
7. [Estados Interactivos](#estados-interactivos)
8. [Responsive Design](#responsive-design)

---

## Visión General

La página Objective rediseñada sigue el sistema de diseño establecido en las páginas de Header y Dashboard, manteniendo consistencia visual y mejorando la experiencia de usuario.

### Principios de Diseño

| Principio         | Descripción                                 |
| ----------------- | ------------------------------------------- |
| **Consistencia**  | Alineado con Header y Dashboard             |
| **Claridad**      | Jerarquía visual clara y organizada         |
| **Modernidad**    | Componentes premium con glassmorphism sutil |
| **Accesibilidad** | Contraste WCAG AA, labels descriptivos      |

---

## Sistema de Colores

### Paleta Principal

```css
/* Backgrounds */
--bg-page: #f8fafc; /* Fondo de página */
--bg-card: #ffffff; /* Tarjetas principales */
--bg-input-rest: #f8fafc; /* Inputs en reposo */
--bg-input-focus: #ffffff; /* Inputs con foco */
--bg-input-disabled: #f1f5f9; /* Inputs deshabilitados */

/* Borders */
--border-light: #e5e7eb; /* Bordes de tarjetas */
--border-medium: #d1d5db; /* Bordes de inputs */
--border-focus: #2563eb; /* Bordes con foco */

/* Text */
--text-primary: #111827; /* Títulos principales */
--text-secondary: #6b7280; /* Descripciones, labels */
--text-tertiary: #9ca3af; /* Placeholders, hints */
--text-disabled: #d1d5db; /* Texto deshabilitado */

/* Accents */
--accent-primary: #2563eb; /* Azul principal */
--accent-primary-hover: #1d4ed8; /* Hover azul */
--accent-success: #10b981; /* Verde éxito */
--accent-warning: #f59e0b; /* Amarillo advertencia */
--accent-error: #ef4444; /* Rojo error */
```

### Gradientes de IA

```css
/* AI Actions */
--gradient-ai: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
--gradient-ai-hover: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%);

/* AI Glow Effect */
--glow-ai: 0 0 20px rgba(37, 99, 235, 0.3);
```

### Aplicación de Colores

| Elemento          | Color Token        | Ejemplo                     |
| ----------------- | ------------------ | --------------------------- |
| Fondo página      | `--bg-page`        | `className="bg-[#F8FAFC]"`  |
| Tarjeta principal | `--bg-card`        | `className="bg-white"`      |
| Título sección    | `--text-primary`   | `className="text-gray-900"` |
| Descripción       | `--text-secondary` | `className="text-gray-500"` |
| Botón primario    | `--accent-primary` | `className="bg-blue-600"`   |
| Input reposo      | `--bg-input-rest`  | `className="bg-gray-50"`    |

---

## Tipografía

### Escala Tipográfica

```css
/* Font Family */
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Jerarquía de Texto

| Elemento                | Clase Tailwind                     | Uso                          |
| ----------------------- | ---------------------------------- | ---------------------------- |
| **Título Principal**    | `text-2xl font-bold text-gray-900` | "Objetivo del Procedimiento" |
| **Descripción Sección** | `text-sm text-gray-500 mt-1`       | Subtítulo descriptivo        |
| **Título de Card**      | `font-semibold text-gray-900`      | Headers de tarjetas          |
| **Label de Campo**      | `text-xs text-gray-500`            | Labels de inputs             |
| **Input Text**          | `text-base text-gray-900`          | Texto dentro de inputs       |
| **Placeholder**         | `text-sm text-gray-400`            | Placeholders                 |
| **Helper Text**         | `text-xs text-gray-400`            | Texto de ayuda               |

---

## Espaciado y Layout

### Sistema de Espaciado

```css
/* Spacing Scale (basado en 4px) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
```

### Aplicación de Espaciado

| Contexto                    | Token       | Clase Tailwind |
| --------------------------- | ----------- | -------------- |
| Entre secciones principales | `--space-6` | `space-y-6`    |
| Padding de tarjeta          | `--space-6` | `p-6`          |
| Gap en grid 2 columnas      | `--space-4` | `gap-4`        |
| Margen entre campos         | `--space-3` | `space-y-3`    |
| Padding de input            | `--space-3` | `px-3 py-2.5`  |

### Bordes Redondeados

```css
/* Border Radius */
--radius-sm: 0.375rem; /* 6px - inputs pequeños */
--radius-md: 0.5rem; /* 8px - inputs normales */
--radius-lg: 0.75rem; /* 12px - botones */
--radius-xl: 1rem; /* 16px - cards secundarias */
--radius-2xl: 1.5rem; /* 24px - cards principales */
--radius-full: 9999px; /* Botones pill */
```

### Grid System

```css
/* Layout Grid */
.objective-page-layout {
  display: grid;
  gap: 1.5rem; /* 24px */
  grid-template-columns: 1fr;
}

/* Helper Section Grid */
.helper-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem; /* 16px */
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .helper-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Componentes

### 1. Header de Sección

```tsx
<div>
  <h1 className="text-2xl font-bold text-gray-900">
    Objetivo del Procedimiento
  </h1>
  <p className="text-sm text-gray-500 mt-1">
    Establece claramente la meta principal o propósito de este Procedimiento
    POA.
  </p>
</div>
```

**Tokens:**

- Título: `text-2xl`, `font-bold`, `text-gray-900`
- Descripción: `text-sm`, `text-gray-500`, `mt-1`

---

### 2. Tarjeta Principal del Objetivo

```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
  {/* Contenido */}
</div>
```

**Tokens:**
| Propiedad | Valor | Token |
|-----------|-------|-------|
| Background | `bg-white` | `--bg-card` |
| Border Radius | `rounded-2xl` | `--radius-2xl` |
| Border | `border-gray-200` | `--border-light` |
| Padding | `p-6` | `--space-6` |
| Spacing interno | `space-y-6` | `--space-6` |

---

### 3. Textarea del Objetivo

```tsx
<Textarea
  className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 rounded-xl"
  placeholder="Describe el objetivo principal aquí..."
/>
```

**Tokens:**
| Estado | Background | Border | Clase |
|--------|------------|--------|-------|
| Reposo | `bg-gray-50` | `border-gray-200` | `--bg-input-rest` |
| Focus | `bg-white` | `border-blue-600` | `--bg-input-focus` |
| Disabled | `bg-gray-100` | `border-gray-200` | `--bg-input-disabled` |

**Dimensiones:**

- Min height: `100px`
- Border radius: `rounded-xl` (`--radius-xl`)
- Padding: `px-3 py-2.5`

---

### 4. Slider de Palabras

```tsx
<div className="space-y-3">
  <Label className="text-sm font-medium text-gray-700">
    Máximo de Palabras para IA: {maxWords}
  </Label>
  <Slider min={10} max={100} step={5} className="w-full" />
</div>
```

**Tokens:**
| Elemento | Valor |
|----------|-------|
| Track background | `bg-gray-200` |
| Track fill | `bg-blue-600` |
| Thumb | `bg-white border-2 border-blue-600` |
| Thumb size | `h-5 w-5` |

---

### 5. Botón "Editar con IA"

```tsx
<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-6 h-10">
  <Wand2 className="mr-2 h-4 w-4" />
  Editar con IA
</Button>
```

**Tokens:**
| Propiedad | Valor | Token |
|-----------|-------|-------|
| Background | Gradiente azul-índigo | `--gradient-ai` |
| Hover | Gradiente más oscuro | `--gradient-ai-hover` |
| Border radius | `rounded-full` | `--radius-full` |
| Height | `h-10` | `40px` |
| Padding horizontal | `px-6` | `--space-6` |
| Text color | `text-white` | - |
| Icon size | `h-4 w-4` | `16px` |

---

### 6. Toggle de Sección de Ayuda

```tsx
<div className="flex items-center justify-between bg-blue-50 rounded-xl p-4 border border-blue-100">
  <div className="flex items-center space-x-2">
    <Switch id="helper-toggle" />
    <Label className="text-md font-semibold text-gray-900 flex items-center">
      <Lightbulb className="mr-2 h-5 w-5 text-blue-600" />
      Asistente para Redactar el Objetivo
    </Label>
  </div>
  <Button>Generar con IA</Button>
</div>
```

**Tokens:**
| Elemento | Valor |
|----------|-------|
| Background | `bg-blue-50` |
| Border | `border-blue-100` |
| Border radius | `rounded-xl` |
| Padding | `p-4` |
| Icon color | `text-blue-600` |
| Icon size | `h-5 w-5` |

---

### 7. Campos de Ayuda (Helper Fields)

#### Grid de 2 Columnas

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Campo 1 */}
  <div className="space-y-1.5">
    <Label className="text-xs text-gray-500 flex items-center gap-1">
      <Target className="h-3 w-3" />
      Descripción General
    </Label>
    <Textarea
      className="min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white rounded-lg"
      placeholder="¿Qué se hace?"
    />
  </div>

  {/* Campo 2 */}
  <div className="space-y-1.5">
    <Label className="text-xs text-gray-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      Problema/Necesidad
    </Label>
    <Textarea
      className="min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white rounded-lg"
      placeholder="¿Por qué se hace?"
    />
  </div>
</div>
```

**Tokens:**
| Propiedad | Valor |
|-----------|-------|
| Grid columns (desktop) | `grid-cols-2` |
| Grid columns (mobile) | `grid-cols-1` |
| Gap | `gap-4` (`16px`) |
| Label icon size | `h-3 w-3` (`12px`) |
| Textarea min height | `80px` |
| Border radius | `rounded-lg` |

---

### 8. Sección de KPIs

```tsx
<div className="space-y-2">
  <Label className="text-xs text-gray-500 flex items-center gap-1">
    <TrendingUp className="h-3 w-3" />
    Indicadores Clave (KPIs)
  </Label>

  {/* KPI Input */}
  <div className="flex items-center gap-2">
    <Input
      className="flex-grow h-9 bg-gray-50 border-gray-200 focus:bg-white rounded-lg"
      placeholder="KPI 1"
    />
    <Button variant="ghost" size="icon" className="text-red-500 shrink-0">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>

  {/* Add KPI Button */}
  <Button variant="outline" size="sm" className="mt-2">
    <PlusCircle className="mr-2 h-4 w-4" />
    Añadir KPI
  </Button>
</div>
```

**Tokens:**
| Elemento | Valor |
|----------|-------|
| Input height | `h-9` (`36px`) |
| Icon button size | `h-4 w-4` |
| Delete icon color | `text-red-500` |
| Add button variant | `outline` |
| Add button size | `sm` |

---

### 9. Botón Guardar

```tsx
<div className="flex justify-end">
  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-11">
    <Save className="mr-2 h-4 w-4" />
    Guardar Objetivo
  </Button>
</div>
```

**Tokens:**
| Propiedad | Valor | Token |
|-----------|-------|-------|
| Background | `bg-blue-600` | `--accent-primary` |
| Hover | `bg-blue-700` | `--accent-primary-hover` |
| Border radius | `rounded-full` | `--radius-full` |
| Height | `h-11` | `44px` |
| Padding horizontal | `px-8` | `32px` |
| Icon size | `h-4 w-4` | `16px` |

---

## Iconografía

### Iconos Utilizados (Lucide React)

| Icono | Componente    | Contexto            | Tamaño    |
| ----- | ------------- | ------------------- | --------- |
| 🎯    | `Target`      | Descripción general | `h-3 w-3` |
| ⚠️    | `AlertCircle` | Problema/Necesidad  | `h-3 w-3` |
| 🎯    | `CheckCircle` | Resultado esperado  | `h-3 w-3` |
| 👥    | `Users`       | Audiencia objetivo  | `h-3 w-3` |
| 📈    | `TrendingUp`  | Impacto, KPIs       | `h-3 w-3` |
| 💡    | `Lightbulb`   | Asistente de ayuda  | `h-5 w-5` |
| 🪄    | `Wand2`       | Editar con IA       | `h-4 w-4` |
| 🧠    | `Brain`       | Generar con IA      | `h-4 w-4` |
| ↩️    | `Undo2`       | Deshacer IA         | `h-4 w-4` |
| 💾    | `Save`        | Guardar             | `h-4 w-4` |
| ➕    | `PlusCircle`  | Añadir KPI          | `h-4 w-4` |
| 🗑️    | `Trash2`      | Eliminar KPI        | `h-4 w-4` |

### Convenciones de Tamaño

```css
/* Icon Sizes */
--icon-xs: 12px; /* h-3 w-3 - Labels */
--icon-sm: 16px; /* h-4 w-4 - Botones */
--icon-md: 20px; /* h-5 w-5 - Headers */
--icon-lg: 24px; /* h-6 w-6 - Destacados */
```

---

## Estados Interactivos

### Inputs y Textareas

```css
/* Rest State */
.input-rest {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

/* Hover State */
.input-hover {
  border-color: #d1d5db;
}

/* Focus State */
.input-focus {
  background: #ffffff;
  border-color: #2563eb;
  outline: 2px solid rgba(37, 99, 235, 0.1);
  outline-offset: 2px;
}

/* Disabled State */
.input-disabled {
  background: #f1f5f9;
  border-color: #e5e7eb;
  color: #d1d5db;
  cursor: not-allowed;
}

/* Error State */
.input-error {
  border-color: #ef4444;
  background: #fef2f2;
}
```

### Botones

#### Botón Primario

```css
/* Rest */
.btn-primary {
  background: #2563eb;
  color: #ffffff;
}

/* Hover */
.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Active */
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}

/* Disabled */
.btn-primary:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
```

#### Botón con Gradiente (IA)

```css
/* Rest */
.btn-ai {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: #ffffff;
}

/* Hover */
.btn-ai:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
}
```

#### Botón Outline

```css
/* Rest */
.btn-outline {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

/* Hover */
.btn-outline:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}
```

### Switch Toggle

```css
/* Off State */
.switch-off {
  background: #e5e7eb;
}

/* On State */
.switch-on {
  background: #2563eb;
}

/* Thumb */
.switch-thumb {
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px; /* Tablets pequeñas */
--breakpoint-md: 768px; /* Tablets */
--breakpoint-lg: 1024px; /* Desktop */
--breakpoint-xl: 1280px; /* Desktop grande */
```

### Adaptaciones por Breakpoint

| Elemento                    | Mobile (<768px) | Desktop (≥768px) |
| --------------------------- | --------------- | ---------------- |
| **Helper Grid**             | 1 columna       | 2 columnas       |
| **Padding de página**       | `p-4`           | `p-6`            |
| **Título principal**        | `text-xl`       | `text-2xl`       |
| **Botones**                 | `w-full`        | `w-auto`         |
| **Spacing entre secciones** | `space-y-4`     | `space-y-6`      |

### Ejemplo de Código Responsive

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  {/* Contenido */}
</div>

<Button className="w-full md:w-auto">
  Guardar
</Button>

<h1 className="text-xl md:text-2xl font-bold">
  Objetivo del Procedimiento
</h1>
```

---

## Animaciones y Transiciones

### Transiciones Estándar

```css
/* Default Transition */
.transition-default {
  transition: all 0.2s ease-in-out;
}

/* Color Transition */
.transition-colors {
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

/* Transform Transition */
.transition-transform {
  transition: transform 0.2s ease-out;
}
```

### Animaciones Específicas

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Slide Down (Helper Section) */
@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000px;
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
```

---

## Accesibilidad

### Contraste de Color

| Combinación               | Ratio  | Nivel WCAG |
| ------------------------- | ------ | ---------- |
| `#111827` sobre `#FFFFFF` | 16.1:1 | AAA        |
| `#6B7280` sobre `#FFFFFF` | 5.7:1  | AA         |
| `#2563EB` sobre `#FFFFFF` | 5.9:1  | AA         |
| `#FFFFFF` sobre `#2563EB` | 5.9:1  | AA         |

### Focus Visible

```css
/* Focus Ring */
.focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Focus Ring para botones */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Labels y ARIA

```tsx
{/* Siempre incluir labels */}
<Label htmlFor="objective">Declaración del Objetivo</Label>
<Textarea id="objective" aria-describedby="objective-hint" />
<p id="objective-hint" className="text-xs text-gray-400">
  Describe el objetivo principal aquí
</p>

{/* ARIA para iconos */}
<Wand2 className="h-4 w-4" aria-hidden="true" />
<span className="sr-only">Editar con IA</span>
```

---

## Resumen de Clases Reutilizables

### Contenedores

```css
.page-container {
  @apply min-h-screen bg-[#F8FAFC] p-6;
}

.card-primary {
  @apply bg-white rounded-2xl border border-gray-200 p-6;
}

.card-secondary {
  @apply bg-white rounded-xl border border-gray-200 p-4;
}
```

### Inputs

```css
.input-base {
  @apply bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 rounded-lg;
}

.textarea-base {
  @apply min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 rounded-lg;
}
```

### Botones

```css
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-10;
}

.btn-ai {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-6 h-10;
}

.btn-outline {
  @apply border border-gray-200 hover:bg-gray-50 rounded-lg px-4 h-9;
}
```

---

## Notas de Implementación

### Dependencias

```json
{
  "dependencies": {
    "lucide-react": "^0.x.x",
    "@radix-ui/react-switch": "^1.x.x",
    "@radix-ui/react-slider": "^1.x.x"
  }
}
```

### Imports Necesarios

```tsx
import {
  Target,
  AlertCircle,
  Users,
  TrendingUp,
  Lightbulb,
  Wand2,
  Brain,
  Undo2,
  Save,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
```

---

## Changelog

| Versión | Fecha      | Cambios                                         |
| ------- | ---------- | ----------------------------------------------- |
| 2.0     | 2025-12-07 | Rediseño completo alineado con Header/Dashboard |
| 1.0     | -          | Diseño original con Card components             |
