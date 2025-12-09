# KABA Layout System

Sistema de layout y estructura visual para la aplicación KABA.

---

## Breakpoints

| Breakpoint | Prefijo   | Min-Width | Uso                   |
| ---------- | --------- | --------- | --------------------- |
| Mobile     | (default) | 0px       | Smartphones           |
| Small      | `sm:`     | 640px     | Smartphones landscape |
| Medium     | `md:`     | 768px     | Tablets               |
| Large      | `lg:`     | 1024px    | Laptops               |
| XL         | `xl:`     | 1280px    | Desktop               |
| 2XL        | `2xl:`    | 1536px    | Large displays        |

---

## Estructura Principal

```
┌─────────────────────────────────────────────────────────┐
│                     App Shell                            │
├──────────────┬──────────────────────────────────────────┤
│              │           App Header                      │
│   Sidebar    ├──────────────────────────────────────────┤
│   (240px)    │                                          │
│              │           Main Content                    │
│              │           (flex-1)                        │
│              │                                          │
│              │                                          │
├──────────────┴──────────────────────────────────────────┤
│                     Footer (optional)                    │
└─────────────────────────────────────────────────────────┘
```

### Código Base

```tsx
<SidebarProvider>
  <Sidebar className="w-60 border-r bg-white">
    <SidebarHeader />
    <SidebarContent />
    <SidebarFooter />
  </Sidebar>

  <div className="flex flex-col flex-1 min-w-0">
    <AppHeader />
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <main className="w-full flex-1">{children}</main>
    </div>
  </div>
</SidebarProvider>
```

---

## Sidebar

### Dimensiones

| Estado    | Ancho | Clase  |
| --------- | ----- | ------ |
| Expandido | 240px | `w-60` |
| Colapsado | 64px  | `w-16` |

### Estructura

```tsx
<Sidebar
  collapsible="icon"
  variant="sidebar"
  side="left"
  className="border-r shadow-sm bg-white"
>
  {/* Header: Logo + Toggle */}
  <SidebarHeader className="p-4">
    <FileText className="h-6 w-6 text-blue-600" />
    <span>KABA Services</span>
    <SidebarTrigger />
  </SidebarHeader>

  {/* Navigation */}
  <SidebarContent className="p-2">
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton />
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarContent>

  {/* Footer */}
  <SidebarFooter className="p-2">{/* Info card */}</SidebarFooter>
</Sidebar>
```

---

## Grid System

### Columnas Flexibles

```tsx
// 2 columnas en desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Columna 1</div>
  <div>Columna 2</div>
</div>

// 3 columnas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// Auto-fill responsivo
<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Flex Layout

```tsx
// Row con gap
<div className="flex items-center gap-3">
  <Icon />
  <span>Label</span>
</div>

// Row con justify
<div className="flex items-center justify-between">
  <span>Left</span>
  <Button>Right</Button>
</div>

// Column
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Contenedores

### Container Principal

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Contenido centrado con padding responsive */}
</div>
```

### Card Container (Actividades)

```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-200">
  {/* Lista de items */}
</div>
```

### Sección con Título

```tsx
<div className="space-y-6">
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-lg font-semibold">Título</h2>
      <p className="text-sm text-gray-500">Descripción</p>
    </div>
    <Button>Acción</Button>
  </div>

  {/* Contenido */}
</div>
```

---

## Espaciado (Spacing)

### Padding

| Clase | Valor | Uso                       |
| ----- | ----- | ------------------------- |
| `p-0` | 0px   | Reset                     |
| `p-2` | 8px   | Elementos compactos       |
| `p-3` | 12px  | Cards internas            |
| `p-4` | 16px  | Cards, secciones          |
| `p-6` | 24px  | Contenedores principales  |
| `p-8` | 32px  | Páginas, layout principal |

### Responsive Padding

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding que crece con el viewport */}
</div>
```

### Margin

| Clase     | Valor | Uso                     |
| --------- | ----- | ----------------------- |
| `mt-4`    | 16px  | Separación vertical     |
| `mb-6`    | 24px  | Antes de secciones      |
| `mx-auto` | auto  | Centrar horizontalmente |

### Gap

| Clase   | Valor | Uso                 |
| ------- | ----- | ------------------- |
| `gap-2` | 8px   | Elementos compactos |
| `gap-3` | 12px  | Items de lista      |
| `gap-4` | 16px  | Secciones, cards    |
| `gap-6` | 24px  | Grupos de secciones |

### Space

| Clase       | Valor | Uso            |
| ----------- | ----- | -------------- |
| `space-y-3` | 12px  | Lista de items |
| `space-y-4` | 16px  | Formularios    |
| `space-y-6` | 24px  | Secciones      |

---

## Páginas

### Page Layout Básico

```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      {/* Header de página */}
      <div>
        <h1 className="text-2xl font-bold">Título de Página</h1>
        <p className="text-muted-foreground">Descripción opcional</p>
      </div>

      {/* Contenido */}
      <Card>
        <CardContent>{/* ... */}</CardContent>
      </Card>
    </div>
  );
}
```

### Page con Acciones

```tsx
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold">Título</h1>
    <p className="text-sm text-gray-500">Descripción</p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline">Cancelar</Button>
    <Button>Guardar</Button>
  </div>
</div>
```

---

## Formularios

### Form Layout

```tsx
<form className="space-y-6">
  {/* Campos en grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label>Campo 1</Label>
      <Input />
    </div>
    <div>
      <Label>Campo 2</Label>
      <Input />
    </div>
  </div>

  {/* Campo full width */}
  <div>
    <Label>Descripción</Label>
    <Textarea />
  </div>

  {/* Acciones */}
  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancelar</Button>
    <Button type="submit">Guardar</Button>
  </div>
</form>
```

### Campo Individual

```tsx
<div className="space-y-1.5">
  <Label className="text-xs font-medium text-muted-foreground">
    Campo <span className="text-red-500">*</span>
  </Label>
  <Input placeholder="Valor..." />
</div>
```

---

## Responsivo

### Mobile First

```tsx
// Base es mobile, luego crece
<div className="
  flex flex-col          /* Mobile: columna */
  md:flex-row            /* Tablet+: fila */
  gap-4
">
```

### Ocultar/Mostrar

```tsx
// Oculto en mobile
<span className="hidden sm:inline">Visible en tablet+</span>

// Solo mobile
<span className="sm:hidden">Solo mobile</span>
```

### Sidebar Mobile (Sheet)

```tsx
// En mobile el sidebar se convierte en Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="md:hidden">
      <PanelLeft />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">{/* Navegación */}</SheetContent>
</Sheet>
```

---

## Z-Index

| Nivel    | Clase  | Uso               |
| -------- | ------ | ----------------- |
| Base     | `z-0`  | Contenido normal  |
| Elevated | `z-10` | Cards flotantes   |
| Dropdown | `z-20` | Menús, popovers   |
| Sticky   | `z-30` | Headers pegajosos |
| Modal    | `z-40` | Dialogs, sheets   |
| Toast    | `z-50` | Notificaciones    |

---

## Overflow

```tsx
// Scroll vertical
<div className="overflow-y-auto max-h-[400px]">
  {/* Contenido largo */}
</div>

// Contenedor con scroll interno
<div className="flex-1 overflow-y-auto">
  {/* Main content */}
</div>

// Prevenir overflow
<div className="min-w-0 truncate">
  Texto muy largo que se corta...
</div>
```

---

## Patrones Comunes

### Split Layout

```tsx
<div className="flex h-screen">
  <aside className="w-64 border-r">Sidebar</aside>
  <main className="flex-1 overflow-auto">Content</main>
</div>
```

### Sticky Header

```tsx
<header className="sticky top-0 z-30 bg-white border-b">
  {/* Header content */}
</header>
```

### Fixed Footer Actions

```tsx
<div className="sticky bottom-0 bg-white border-t p-4">
  <Button className="w-full">Guardar</Button>
</div>
```

### Empty State Centered

```tsx
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-center">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <p className="mt-4">No hay elementos</p>
  </div>
</div>
```
