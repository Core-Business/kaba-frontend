# Dashboard 2026 - Especificación de Diseño

Documentación completa de design tokens y componentes para el rediseño del Dashboard KABA.

---

## Tipografía Propuesta

### Familia Principal: **Inter**

[Inter](https://fonts.google.com/specimen/Inter) es una familia tipográfica moderna, optimizada para pantallas y altamente legible.

**Instalación:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
:root {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  font-family: var(--font-sans);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}
```

### Alternativas Recomendadas

| Fuente                | Estilo              | Uso                   |
| --------------------- | ------------------- | --------------------- |
| **Inter**             | Geométrica, moderna | Recomendada principal |
| **Plus Jakarta Sans** | Elegante, premium   | Alternativa           |
| **DM Sans**           | Limpia, minimalista | Alternativa gratuita  |
| **Outfit**            | Geométrica, tech    | Opción startup        |

### Escala Tipográfica

| Elemento       | Clase      | Tamaño | Peso                  |
| -------------- | ---------- | ------ | --------------------- |
| H1 (Dashboard) | `text-2xl` | 24px   | `font-bold` (700)     |
| H2 (Sección)   | `text-xl`  | 20px   | `font-semibold` (600) |
| Card Title     | `text-lg`  | 18px   | `font-semibold` (600) |
| Body           | `text-sm`  | 14px   | `font-normal` (400)   |
| Caption        | `text-xs`  | 12px   | `font-medium` (500)   |
| Metric Number  | `text-3xl` | 30px   | `font-bold` (700)     |

---

## Paleta de Colores

### Fondos

| Token          | Valor         | Hex       | Uso             |
| -------------- | ------------- | --------- | --------------- |
| `--bg-page`    | `210 20% 98%` | `#F8FAFC` | Fondo principal |
| `--bg-card`    | `0 0% 100%`   | `#FFFFFF` | Cards           |
| `--bg-sidebar` | `0 0% 100%`   | `#FFFFFF` | Sidebar         |

### Métricas - Colores Semánticos

| Métrica    | Icono             | Fondo          | Texto             |
| ---------- | ----------------- | -------------- | ----------------- |
| Total      | `text-blue-600`   | `bg-blue-50`   | `text-blue-700`   |
| Publicados | `text-green-600`  | `bg-green-50`  | `text-green-700`  |
| Borradores | `text-gray-500`   | `bg-gray-100`  | `text-gray-600`   |
| Recientes  | `text-purple-600` | `bg-purple-50` | `text-purple-700` |

### Badges de Estado

| Estado      | Clase Tailwind                |
| ----------- | ----------------------------- |
| Publicado   | `bg-green-100 text-green-700` |
| Borrador    | `bg-gray-100 text-gray-700`   |
| En Revisión | `bg-amber-100 text-amber-700` |
| Archivado   | `bg-red-100 text-red-700`     |

---

## Componentes

### 1. MetricCard (Modernizado)

```tsx
interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "gray" | "purple";
  isLoading?: boolean;
}
```

**Estructura:**

```
┌─────────────────────────┐
│  ┌────┐                 │
│  │ 📊 │    42           │
│  └────┘                 │
│  Total de Procedimientos│
└─────────────────────────┘
```

**Clases:**

```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-6">
  <div className={`p-3 rounded-xl w-fit ${colorClasses[color].bg}`}>
    <Icon className={`h-6 w-6 ${colorClasses[color].icon}`} />
  </div>
  <div className="text-3xl font-bold text-gray-900 mt-4">{value}</div>
  <div className="text-sm text-gray-500 mt-1">{title}</div>
</div>
```

### 2. ProcedureCard (Nuevo)

**Estructura:**

```
┌────────────────────────────────────────────────────────────┐
│ ┌────┐                                                     │
│ │ 📄 │  Procedimiento de Calidad         [Borrador]        │
│ └────┘  PROC-001 · v1.0 · Hace 2 días                      │
│                                                            │
│                          [Editar]  [Descargar]  [•••]      │
└────────────────────────────────────────────────────────────┘
```

**Clases:**

```tsx
<div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group">
  <div className="flex items-start gap-4">
    <div className="p-3 bg-blue-50 rounded-xl">
      <FileText className="h-6 w-6 text-blue-600" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {code} · v{version} · {timeAgo}
      </p>
    </div>
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Action buttons */}
    </div>
  </div>
</div>
```

### 3. FilterTabs (Nuevo)

**Diseño Pill Buttons:**

```tsx
<div className="flex gap-2">
  {filters.map((filter) => (
    <button
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all",
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {filter.label}
    </button>
  ))}
</div>
```

### 4. EmptyState (Nuevo)

```tsx
<div className="text-center py-16">
  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
    <FileText className="h-10 w-10 text-gray-400" />
  </div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No hay procedimientos
  </h3>
  <p className="text-gray-500 mb-6 max-w-md mx-auto">
    Crea tu primer procedimiento para comenzar a documentar tus procesos.
  </p>
  <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
    <Plus className="mr-2 h-4 w-4" />
    Nuevo Procedimiento
  </Button>
</div>
```

### 5. DashboardSidebar (Actualizado)

**Tema Blanco Consistente:**

```tsx
<div className="w-64 bg-white border-r border-gray-200">
  <div className="p-4 border-b">
    <Image src="/images/logo-kaba-blue.png" alt="KABA" className="h-8" />
  </div>
  <nav className="p-3">
    <Link
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  </nav>
</div>
```

---

## Espaciado

| Token            | Valor                | Uso                |
| ---------------- | -------------------- | ------------------ |
| Card padding     | `p-6` (24px)         | Contenido de cards |
| Card gap         | `gap-6` (24px)       | Entre cards        |
| Section gap      | `space-y-8` (32px)   | Entre secciones    |
| Border radius    | `rounded-2xl` (16px) | Cards principales  |
| Border radius sm | `rounded-xl` (12px)  | Elementos internos |

---

## Animaciones

| Elemento       | Animación                                              |
| -------------- | ------------------------------------------------------ |
| Cards hover    | `hover:shadow-md transition-all duration-200`          |
| Botones        | `transition-colors duration-150`                       |
| Metric counter | Animación de conteo 1s ease-out                        |
| Action buttons | `opacity-0 group-hover:opacity-100 transition-opacity` |

---

## Iconos por Métrica

| Métrica    | Icono Lucide              |
| ---------- | ------------------------- |
| Total      | `LayoutGrid` o `FileText` |
| Publicados | `CheckCircle`             |
| Borradores | `FileEdit`                |
| Recientes  | `Clock`                   |

---

## Implementación

### Archivos a Modificar

1. `dashboard/page.tsx` - Layout y componentes principales
2. `components/dashboard/MetricCard.tsx` - Nuevo componente
3. `components/dashboard/ProcedureCard.tsx` - Nuevo componente
4. `components/dashboard/FilterTabs.tsx` - Nuevo componente
5. `components/dashboard/EmptyState.tsx` - Nuevo componente

### Instalación de Inter Font

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
/* tailwind.config.ts */
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
    },
  },
}
```
