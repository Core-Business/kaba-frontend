# Objective Page 2026 - Especificación de Diseño

Documentación completa de design tokens y componentes para el rediseño de la página de Objetivo (Objective).

---

## Filosofía de Diseño

**"Editor First"** - Transformar un formulario tradicional en una experiencia de escritura enfocada con asistencia de IA contextual.

### Principios Clave

1. **Minimalismo**: Eliminar ruido visual (sombras pesadas, alertas grandes)
2. **Enfoque**: Área de escritura amplia y limpia
3. **Contextual**: IA integrada sin interrumpir el flujo
4. **Progresivo**: Mostrar complejidad solo cuando se necesita

---

## Paleta de Colores

### Fondos

| Token               | Valor          | Hex       | Uso                   |
| ------------------- | -------------- | --------- | --------------------- |
| `--bg-page`         | `210 20% 98%`  | `#F8FAFC` | Fondo principal       |
| `--bg-editor`       | `0 0% 100%`    | `#FFFFFF` | Contenedor del editor |
| `--bg-input-subtle` | `220 14% 96%`  | `#F1F5F9` | Inputs de contexto    |
| `--bg-ai-accent`    | `270 100% 98%` | `#FAF5FF` | Fondo de acciones IA  |

### Bordes

| Token             | Color     | Uso                |
| ----------------- | --------- | ------------------ |
| `--border-subtle` | `#E2E8F0` | Bordes principales |
| `--border-focus`  | `#3B82F6` | Estado focus       |
| `--border-ai`     | `#A855F7` | Elementos de IA    |

### Acciones

| Elemento         | Color                                              | Uso                  |
| ---------------- | -------------------------------------------------- | -------------------- |
| Botón Principal  | `bg-blue-600 hover:bg-blue-700`                    | Guardar              |
| Botón IA         | `bg-purple-50 text-purple-700 hover:bg-purple-100` | Acciones de IA       |
| Botón Secundario | `bg-gray-100 text-gray-700 hover:bg-gray-200`      | Acciones secundarias |

---

## Tipografía

### Escala para Editor

| Elemento       | Clase       | Tamaño | Peso                | Uso             |
| -------------- | ----------- | ------ | ------------------- | --------------- |
| Título Sección | `text-2xl`  | 24px   | `font-bold` (700)   | "Objetivo"      |
| Descripción    | `text-sm`   | 14px   | `font-normal` (400) | Subtítulo       |
| Texto Editor   | `text-lg`   | 18px   | `font-normal` (400) | Área principal  |
| Labels         | `text-xs`   | 12px   | `font-medium` (500) | Campos de ayuda |
| Placeholders   | `text-base` | 16px   | `font-normal` (400) | Hints en inputs |

### Fuente Recomendada

**Inter** - Optimizada para legibilidad en editores de texto.

---

## Componentes

### 1. ObjectiveEditor (Principal)

**Descripción**: Área de escritura principal tipo Notion.

**Estructura**:

```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-8">
  <AiToolbar />
  <Textarea
    className="text-lg leading-relaxed border-none focus:ring-0 min-h-[300px]"
    placeholder="Describe el objetivo principal..."
  />
</div>
```

**Clases Clave**:

- Contenedor: `bg-white rounded-2xl border border-gray-200 p-8`
- Textarea: `text-lg leading-relaxed border-none focus:ring-0`
- Sin sombras pesadas

### 2. AiToolbar (Barra de IA)

**Descripción**: Toolbar flotante o integrada con acciones de IA.

**Acciones**:
| Botón | Icono | Función |
|-------|-------|---------|
| Mejorar | `Wand2` | Refinar redacción |
| Acortar | `Minimize2` | Reducir palabras |
| Expandir | `Maximize2` | Ampliar contenido |
| Generar | `Brain` | Crear desde contexto |

**Diseño**:

```tsx
<div className="flex items-center gap-2 mb-4">
  <Button variant="ghost" size="sm" className="text-purple-600">
    <Wand2 className="h-4 w-4 mr-1" />
    Mejorar
  </Button>
  <Button variant="ghost" size="sm" className="text-purple-600">
    <Brain className="h-4 w-4 mr-1" />
    Generar
  </Button>
  <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
    <Sparkles className="h-3 w-3" />
    AI Ready
  </div>
</div>
```

### 3. ContextPanel (Panel de Ayuda)

**Descripción**: Panel lateral o inferior con campos de contexto para IA.

**Layout**:

```
┌─────────────────────────────────────┐
│ 💡 Guía Inteligente                 │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐     │
│ │ Descripción │ │ Necesidad   │     │
│ └─────────────┘ └─────────────┘     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ Audiencia   │ │ Impacto     │     │
│ └─────────────┘ └─────────────┘     │
│                                     │
│ KPIs: [tag1] [tag2] [+]             │
│                                     │
│        [🧠 Generar con IA]          │
└─────────────────────────────────────┘
```

**Clases**:

```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
    <Lightbulb className="h-5 w-5 text-amber-500" />
    Guía Inteligente
  </h3>

  <div className="grid grid-cols-2 gap-3">
    <Input
      placeholder="¿Qué se hace?"
      className="bg-gray-50 border-transparent focus:bg-white focus:border-blue-500"
    />
    {/* ... más inputs */}
  </div>

  <KpiManager />

  <Button className="w-full bg-purple-600 hover:bg-purple-700">
    <Brain className="mr-2 h-4 w-4" />
    Generar con IA
  </Button>
</div>
```

### 4. KpiManager (Gestor de KPIs)

**Descripción**: Gestión de KPIs con tags editables.

**Diseño**:

```tsx
<div className="space-y-2">
  <Label className="text-xs text-gray-500">KPIs</Label>
  <div className="flex flex-wrap gap-2">
    {kpis.map((kpi) => (
      <Badge
        variant="secondary"
        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
      >
        {kpi}
        <X className="ml-1 h-3 w-3 cursor-pointer" />
      </Badge>
    ))}
    <Button variant="ghost" size="sm">
      <Plus className="h-3 w-3" />
    </Button>
  </div>
</div>
```

### 5. InfoTooltip (Consejos Discretos)

**Descripción**: Reemplazo de los bloques de alerta grandes.

**Implementación**:

```tsx
<Tooltip>
  <TooltipTrigger>
    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
  </TooltipTrigger>
  <TooltipContent className="max-w-xs">
    <p className="text-xs">
      Inicia con un verbo en infinitivo (establecer, implementar...)
    </p>
  </TooltipContent>
</Tooltip>
```

---

## Espaciado

| Token               | Valor              | Uso                  |
| ------------------- | ------------------ | -------------------- |
| Editor padding      | `p-8` (32px)       | Contenedor principal |
| Panel padding       | `p-6` (24px)       | Panel de contexto    |
| Gap entre inputs    | `gap-3` (12px)     | Grid de inputs       |
| Gap entre secciones | `space-y-6` (24px) | Separación vertical  |

---

## Animaciones

| Elemento       | Animación                                            |
| -------------- | ---------------------------------------------------- |
| Botones IA     | `transition-colors duration-150`                     |
| Editor focus   | `focus:ring-2 focus:ring-blue-500 transition-shadow` |
| Panel collapse | `transition-all duration-300 ease-in-out`            |
| Tooltip        | `animate-in fade-in-50 duration-200`                 |

---

## Layout Responsivo

### Desktop (lg+)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <ObjectiveEditor />
  </div>
  <div className="lg:col-span-1">
    <ContextPanel />
  </div>
</div>
```

### Mobile

- Stack vertical
- Editor primero
- Panel de contexto colapsable por defecto

---

## Iconos

| Elemento   | Icono Lucide | Color             |
| ---------- | ------------ | ----------------- |
| IA General | `Brain`      | `text-purple-600` |
| Mejorar    | `Wand2`      | `text-purple-600` |
| Generar    | `Sparkles`   | `text-purple-600` |
| Ayuda      | `Lightbulb`  | `text-amber-500`  |
| Info       | `Info`       | `text-gray-400`   |
| Guardar    | `Save`       | `text-white`      |

---

## Implementación

### Archivos a Crear/Modificar

1. **`objective-form-enhanced.tsx`** - Refactorizar completamente
2. **`components/objective/ObjectiveEditor.tsx`** - Nuevo
3. **`components/objective/AiToolbar.tsx`** - Nuevo
4. **`components/objective/ContextPanel.tsx`** - Nuevo
5. **`components/objective/KpiManager.tsx`** - Nuevo

### Estructura Propuesta

```tsx
// objective-form-enhanced.tsx
export function ObjectiveFormEnhanced() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Objetivo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Establece la meta principal de este procedimiento
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-4">
          <ObjectiveEditor />
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Context Column */}
        <div className="lg:col-span-1">
          <ContextPanel />
        </div>
      </div>
    </div>
  );
}
```

---

## Comparación: Antes vs. Después

| Aspecto       | Antes                      | Después                   |
| ------------- | -------------------------- | ------------------------- |
| Sombras       | `shadow-lg`                | `border border-gray-200`  |
| Alertas       | Bloques grandes azul/verde | Tooltips discretos        |
| Helper Toggle | Switch que desplaza        | Panel lateral permanente  |
| Textarea      | Básico                     | Editor amplio tipo Notion |
| IA Actions    | Botones dispersos          | Toolbar integrada         |
| KPIs          | Inputs verticales          | Tags editables            |
| Fondo         | Gris claro                 | Blanco limpio             |
