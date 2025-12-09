# KABA Animations & Transitions

Sistema de animaciones y transiciones para la aplicación KABA.

---

## Duraciones

| Token  | Valor | Clase Tailwind | Uso                               |
| ------ | ----- | -------------- | --------------------------------- |
| Fast   | 150ms | `duration-150` | Hover, focus, micro-interacciones |
| Normal | 200ms | `duration-200` | Transiciones de estado            |
| Slow   | 300ms | `duration-300` | Expandir/colapsar, modales        |
| Slower | 500ms | `duration-500` | Animaciones complejas             |

---

## Easing Functions

| Nombre      | Clase         | Uso                          |
| ----------- | ------------- | ---------------------------- |
| Ease Out    | `ease-out`    | Entradas (aparecer)          |
| Ease In     | `ease-in`     | Salidas (desaparecer)        |
| Ease In Out | `ease-in-out` | Transiciones bidireccionales |
| Linear      | `linear`      | Loaders, progress            |

---

## Transiciones Comunes

### Hover States

```tsx
// Color de fondo
<Button className="transition-colors hover:bg-blue-700">
  Click me
</Button>

// Opacidad
<div className="opacity-0 hover:opacity-100 transition-opacity">
  Visible on hover
</div>

// Múltiples propiedades
<Card className="transition-all hover:shadow-lg hover:-translate-y-1">
  Card content
</Card>
```

### Focus States

```tsx
<Input className="transition-all focus-visible:ring-2 focus-visible:ring-ring" />
```

### Color Transitions

```tsx
// Texto
<span className="text-gray-400 hover:text-gray-900 transition-colors">
  Link
</span>

// Borde
<div className="border-gray-200 hover:border-blue-400 transition-colors">
  Box
</div>

// Background
<Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
  Action
</Button>
```

---

## Animaciones CSS

### Spin (Loading)

```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Pulse

```tsx
<div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
```

### Bounce

```tsx
<ChevronDown className="animate-bounce" />
```

### Ping (Notificación)

```tsx
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
</span>
```

---

## Expand / Collapse

### Accordion Style

```tsx
// Con Tailwind
<div className={cn(
  "overflow-hidden transition-all duration-300",
  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
)}>
  {content}
</div>

// Con clase custom (definida en globals.css)
<div className={cn(
  isExpanded ? "animate-accordion-down" : "animate-accordion-up"
)}>
  {content}
</div>
```

### Configuración en tailwind.config.js

```js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};
```

---

## Fade In / Out

### Fade In

```tsx
<div className="animate-fade-in">Contenido que aparece</div>
```

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### Fade con Scale

```tsx
// Dialog/Modal entrance
<DialogContent className="animate-in fade-in-0 zoom-in-95 duration-200">
  ...
</DialogContent>
```

---

## Slide Animations

### Slide In

```tsx
// Desde abajo
<div className="animate-in slide-in-from-bottom-4 duration-300">
  Toast notification
</div>

// Desde la derecha
<SheetContent className="animate-in slide-in-from-right duration-300">
  Sheet content
</SheetContent>

// Desde la izquierda
<div className="animate-in slide-in-from-left-4">
  Sidebar content
</div>
```

---

## Hover Effects

### Scale

```tsx
<Card className="transition-transform hover:scale-105">Grows on hover</Card>
```

### Lift (Translate Y)

```tsx
<Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
  Lifts on hover
</Card>
```

### Reveal Icons

```tsx
<div className="group flex items-center gap-2">
  <span>Item name</span>
  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
    <Button size="icon" variant="ghost">
      <Pencil className="h-4 w-4" />
    </Button>
    <Button size="icon" variant="ghost">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## Loading States

### Skeleton Loading

```tsx
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-4 w-5/6" />
</div>;

// Skeleton component
const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);
```

### Button Loading

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Guardando...
    </>
  ) : (
    <>
      <Save className="mr-2 h-4 w-4" />
      Guardar
    </>
  )}
</Button>
```

### Full Page Loading

```tsx
<div className="flex items-center justify-center h-64">
  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
</div>
```

---

## Modales y Overlays

### Dialog Animation

```tsx
// Overlay fade
<DialogOverlay className="fixed inset-0 bg-black/50 animate-in fade-in-0" />

// Content scale + fade
<DialogContent className="animate-in fade-in-0 zoom-in-95 duration-200">
  ...
</DialogContent>
```

### Sheet Animation

```tsx
// Slide from right
<SheetContent
  side="right"
  className="animate-in slide-in-from-right duration-300"
>
  ...
</SheetContent>

// Slide from left (sidebar mobile)
<SheetContent
  side="left"
  className="animate-in slide-in-from-left duration-300"
>
  ...
</SheetContent>
```

---

## Drag & Drop

### Drag Handle Feedback

```tsx
<div
  className={cn(
    "cursor-grab active:cursor-grabbing",
    isDragging && "opacity-50 scale-105"
  )}
>
  <GripVertical className="h-4 w-4" />
</div>
```

### Drop Target

```tsx
<div
  className={cn(
    "border-2 border-dashed rounded-lg transition-colors",
    isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
  )}
>
  Drop here
</div>
```

---

## Micro-interacciones

### Checkbox Check

```tsx
<Checkbox className="transition-all data-[state=checked]:bg-blue-600" />
```

### Toggle Switch

```tsx
<Switch className="transition-colors data-[state=checked]:bg-blue-600" />
```

### Button Press

```tsx
<Button className="transition-transform active:scale-95">Click me</Button>
```

---

## Performance

### Propiedades Animables Eficientes

✅ **GPU Accelerated (Preferir)**

- `transform` (translate, scale, rotate)
- `opacity`

❌ **Evitar animar**

- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `border-width`

### Will-Change

```tsx
// Usar con moderación para hints de rendimiento
<div className="will-change-transform">
  Elemento que se animará frecuentemente
</div>
```

### Reduce Motion

```tsx
// Respetar preferencias del usuario
<div className="motion-reduce:transition-none motion-reduce:animate-none">
  Animated content
</div>
```

---

## Clases de Transición Recomendadas

| Elemento       | Clase                             |
| -------------- | --------------------------------- |
| Buttons        | `transition-colors duration-150`  |
| Cards hover    | `transition-all duration-200`     |
| Opacity reveal | `transition-opacity duration-200` |
| Modals         | `duration-200 ease-out`           |
| Accordions     | `duration-300 ease-out`           |
| Sidebar        | `transition-all duration-300`     |
| Icons hover    | `transition-colors duration-150`  |
