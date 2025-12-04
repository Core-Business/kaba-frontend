# KABA Typography System

Sistema tipográfico para la aplicación KABA. Define fuentes, tamaños, pesos y estilos de texto.

---

## Fuentes

### Familia Principal

```css
font-family: Arial, Helvetica, sans-serif;
```

> **Nota**: Definida en `globals.css` dentro del selector `body`.

### Alternativas Recomendadas

Para mejorar la estética, considerar:

- **Inter** - Moderna, legible
- **Roboto** - Google, versátil
- **Outfit** - Geométrica, premium

---

## Escala Tipográfica

### Headings

| Nivel | Clase Tailwind | Tamaño | Peso            | Uso                           |
| ----- | -------------- | ------ | --------------- | ----------------------------- |
| H1    | `text-4xl`     | 36px   | `font-bold`     | Títulos principales de página |
| H2    | `text-2xl`     | 24px   | `font-semibold` | Títulos de sección            |
| H3    | `text-xl`      | 20px   | `font-semibold` | Subsecciones                  |
| H4    | `text-lg`      | 18px   | `font-medium`   | Encabezados de card           |
| H5    | `text-base`    | 16px   | `font-medium`   | Labels importantes            |
| H6    | `text-sm`      | 14px   | `font-medium`   | Subtítulos menores            |

### Body Text

| Tipo       | Clase Tailwind | Tamaño | Peso          | Uso                      |
| ---------- | -------------- | ------ | ------------- | ------------------------ |
| Body Large | `text-base`    | 16px   | `font-normal` | Párrafos principales     |
| Body       | `text-sm`      | 14px   | `font-normal` | Texto general, inputs    |
| Body Small | `text-xs`      | 12px   | `font-normal` | Texto auxiliar, captions |

### Special Text

| Tipo    | Clases                                            | Uso                   |
| ------- | ------------------------------------------------- | --------------------- |
| Caption | `text-xs text-muted-foreground`                   | Labels, hints         |
| Mono    | `font-mono text-xs`                               | IDs, códigos, números |
| Link    | `text-primary underline-offset-4 hover:underline` | Enlaces               |

---

## Pesos de Fuente

| Peso     | Clase Tailwind  | Valor | Uso                 |
| -------- | --------------- | ----- | ------------------- |
| Normal   | `font-normal`   | 400   | Texto de párrafo    |
| Medium   | `font-medium`   | 500   | Labels, botones     |
| Semibold | `font-semibold` | 600   | Títulos, énfasis    |
| Bold     | `font-bold`     | 700   | Títulos principales |

---

## Line Height

| Clase             | Valor | Uso             |
| ----------------- | ----- | --------------- |
| `leading-none`    | 1     | Títulos grandes |
| `leading-tight`   | 1.25  | Headings        |
| `leading-normal`  | 1.5   | Texto general   |
| `leading-relaxed` | 1.625 | Párrafos largos |

---

## Colores de Texto

### Primarios

| Color      | Clase                   | HSL           | Uso              |
| ---------- | ----------------------- | ------------- | ---------------- |
| Foreground | `text-foreground`       | `210 10% 23%` | Texto principal  |
| Muted      | `text-muted-foreground` | `215 16% 47%` | Texto secundario |

### Semánticos

| Color     | Clase            | Uso                            |
| --------- | ---------------- | ------------------------------ |
| Primary   | `text-primary`   | Enlaces, elementos activos     |
| Blue 600  | `text-blue-600`  | Números de actividad, badges   |
| Amber 600 | `text-amber-600` | Badges "Decisión"              |
| Red 500   | `text-red-500`   | Errores, asteriscos requeridos |
| Gray 400  | `text-gray-400`  | Placeholders, iconos inactivos |
| Gray 500  | `text-gray-500`  | Texto terciario                |
| Gray 900  | `text-gray-900`  | Texto de alta importancia      |

---

## Ejemplos de Uso

### Título de Página

```tsx
<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
  Actividades del Procedimiento
</h1>
```

### Descripción de Sección

```tsx
<p className="text-sm text-gray-500">
  Define los pasos individuales, decisiones y rutas alternativas.
</p>
```

### Label de Campo

```tsx
<Label className="text-xs font-medium text-muted-foreground">
  Responsable <span className="text-red-500">*</span>
</Label>
```

### Número de Actividad

```tsx
<span className="text-blue-600 font-semibold text-sm">01</span>
```

### Nombre de Actividad

```tsx
<span className="text-sm font-medium text-gray-900">Actividad 1</span>
```

### Caption / ID

```tsx
<span className="text-[10px] text-muted-foreground/50 font-mono">ID: 1</span>
```

### Placeholder

```tsx
<Input
  placeholder="Nombre de la actividad"
  className="placeholder:text-gray-400"
/>
```

---

## Patrones Tipográficos

### Título + Descripción

```tsx
<div>
  <h2 className="text-lg font-semibold text-gray-900">Título de Sección</h2>
  <p className="text-sm text-gray-500 mt-1">
    Descripción breve de lo que hace esta sección.
  </p>
</div>
```

### Label + Input

```tsx
<div>
  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
    Campo <span className="text-red-500">*</span>
  </Label>
  <Input placeholder="Valor..." />
</div>
```

### Badge con Texto

```tsx
<Badge className="text-blue-600 bg-blue-50 border-blue-200 font-normal">
  Individual
</Badge>
```

### Texto Mono para IDs

```tsx
<code className="font-mono text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
  ABC-123
</code>
```

---

## Truncamiento

### Línea Única

```tsx
<p className="truncate">Texto muy largo que se cortará...</p>
```

### Múltiples Líneas

```tsx
<p className="line-clamp-2">
  Texto que se mostrará en máximo 2 líneas antes de ser cortado.
</p>
```

---

## Espaciado de Texto

### Letter Spacing

| Clase              | Valor    | Uso              |
| ------------------ | -------- | ---------------- |
| `tracking-tighter` | -0.05em  | Títulos grandes  |
| `tracking-tight`   | -0.025em | Headings         |
| `tracking-normal`  | 0        | Texto general    |
| `tracking-wide`    | 0.025em  | Labels uppercase |

### Text Transform

| Clase         | Uso                         |
| ------------- | --------------------------- |
| `uppercase`   | Labels muy pequeños, badges |
| `lowercase`   | Raramente usado             |
| `capitalize`  | Primera letra mayúscula     |
| `normal-case` | Resetear transformaciones   |

---

## Responsive Typography

```tsx
// Título que cambia de tamaño
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Título Responsive
</h1>

// Texto que se oculta en móvil
<span className="hidden sm:inline text-sm text-gray-500">
  Visible solo en pantallas medianas+
</span>
```

---

## Accesibilidad

### Contraste Mínimo

- **Texto normal**: Ratio mínimo 4.5:1
- **Texto grande (18px+)**: Ratio mínimo 3:1

### Recomendaciones

```tsx
// ✅ Correcto - buen contraste
<p className="text-gray-900">Texto principal</p>
<p className="text-gray-600">Texto secundario</p>

// ❌ Evitar - bajo contraste
<p className="text-gray-300">Muy claro en fondo blanco</p>
```

### Texto en Elementos Interactivos

```tsx
// Links deben ser distinguibles
<a className="text-blue-600 hover:underline">Enlace accesible</a>
```
