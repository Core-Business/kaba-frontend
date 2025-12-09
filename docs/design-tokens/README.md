# KABA Design Tokens

Este documento define los tokens de diseño oficiales para la aplicación KABA. Úsalo como referencia para mantener consistencia visual.

## Colores

### Fondos

| Token                  | Valor HSL     | Hex       | Uso                       |
| ---------------------- | ------------- | --------- | ------------------------- |
| `--background`         | `210 20% 98%` | `#F8FAFC` | Fondo principal de la app |
| `--card`               | `0 0% 100%`   | `#FFFFFF` | Tarjetas, contenedores    |
| `--sidebar-background` | `0 0% 100%`   | `#FFFFFF` | Sidebar                   |

### Texto

| Token                  | Valor HSL     | Hex       | Uso               |
| ---------------------- | ------------- | --------- | ----------------- |
| `--foreground`         | `210 10% 23%` | `#333D47` | Texto principal   |
| `--muted-foreground`   | `215 16% 47%` | `#64748B` | Texto secundario  |
| `--sidebar-foreground` | `215 16% 47%` | `#64748B` | Texto del sidebar |

### Primarios

| Token               | Valor HSL      | Hex       | Uso                                |
| ------------------- | -------------- | --------- | ---------------------------------- |
| `--primary`         | `220 100% 19%` | `#002060` | Color principal (botones, acentos) |
| `--sidebar-primary` | `221 83% 53%`  | `#3B82F6` | Elementos activos en sidebar       |

### Estados

| Token                | Valor HSL     | Hex       | Uso                      |
| -------------------- | ------------- | --------- | ------------------------ |
| `--destructive`      | `0 84% 60%`   | `#EF4444` | Acciones destructivas    |
| `--warning`          | `38 92% 50%`  | `#F59E0B` | Advertencias, "Decisión" |
| `--accent-secondary` | `262 83% 58%` | `#8B5CF6` | "Alternativas"           |

---

## Bordes

| Clase              | Valor     | Uso                        |
| ------------------ | --------- | -------------------------- |
| `border-gray-200`  | `#E5E7EB` | Bordes de tarjetas         |
| `border-blue-200`  | `#BFDBFE` | Bordes de badges azules    |
| `border-blue-300`  | `#93C5FD` | Botones con borde punteado |
| `border-amber-200` | `#FDE68A` | Badges "Decisión"          |

---

## Espaciado

| Token       | Valor  | Uso                                 |
| ----------- | ------ | ----------------------------------- |
| `p-3`       | `12px` | Padding interno de tarjetas         |
| `p-4`       | `16px` | Padding de contenedores             |
| `p-6`       | `24px` | Padding de contenedores principales |
| `gap-3`     | `12px` | Espacio entre elementos             |
| `space-y-3` | `12px` | Espacio vertical entre items        |

---

## Border Radius

| Clase          | Valor    | Uso                      |
| -------------- | -------- | ------------------------ |
| `rounded-md`   | `6px`    | Botones pequeños         |
| `rounded-lg`   | `8px`    | Tarjetas internas        |
| `rounded-xl`   | `12px`   | Tarjetas de actividad    |
| `rounded-2xl`  | `16px`   | Contenedores principales |
| `rounded-full` | `9999px` | Badges, botones pill     |

---

## Sombras

| Clase         | Uso                                |
| ------------- | ---------------------------------- |
| `shadow-none` | Tarjetas de actividad (sin sombra) |
| `shadow-sm`   | Sidebar, elementos sutiles         |

---

## Badges

### Individual (Azul)

```css
bg-blue-50 text-blue-600 border-blue-200 rounded-full px-3
```

### Decisión (Ámbar)

```css
bg-amber-50 text-amber-600 border-amber-200 rounded-full px-3
```

### Alternativas (Púrpura)

```css
bg-purple-50 text-purple-600 border-purple-200 rounded-full px-3
```

---

## Botones

### Primario

```css
bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8
```

### Outline con borde punteado

```css
border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full bg-white
```

### Ghost

```css
variant="ghost" text-gray-600 hover:bg-gray-100
```

---

## Sidebar

### Navegación Activa

```css
bg-blue-50 text-blue-600 font-medium rounded-full
```

### Navegación Inactiva

```css
text-sidebar-foreground hover:bg-sidebar-accent rounded-md
```

---

## Ejemplos de Uso

### Tarjeta de Actividad (Colapsada)

```tsx
<Card className="border border-gray-200 rounded-xl shadow-none bg-white">
  <div className="flex items-center gap-3 p-3">
    <GripVertical className="h-4 w-4 text-gray-400" />
    <ChevronRight className="h-4 w-4 text-gray-500" />
    <span className="text-blue-600 font-semibold text-sm">01</span>
    <span className="text-gray-900">Actividad 1</span>
    <Badge className="bg-blue-50 text-blue-600 border-blue-200 rounded-full px-3">
      Individual
    </Badge>
  </div>
</Card>
```

### Contenedor Principal

```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-200">
  {/* contenido */}
</div>
```

---

## Cómo Solicitar Cambios de UI

1. **Proporciona capturas de pantalla** del diseño esperado
2. **Especifica tokens exactos** (colores hex, espaciado en px)
3. **Usa DevTools** para marcar estilos a eliminar
4. **Describe componente por componente** los cambios necesarios

### Ejemplo de solicitud efectiva:

```
Componente: Tarjeta de Actividad
- Fondo: #FFFFFF (bg-white)
- Borde: 1px solid #E5E7EB (border-gray-200)
- Border-radius: 12px (rounded-xl)
- Sombra: Ninguna (shadow-none)
- Badge de número: text-blue-600 font-semibold (sin fondo)
```
