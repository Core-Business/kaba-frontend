# KABA Component Catalog

Catálogo completo de componentes UI para la aplicación KABA. Este documento describe cada componente, sus variantes, estados y ejemplos de uso.

---

## Tabla de Contenidos

1. [Button](#button)
2. [Badge](#badge)
3. [Card](#card)
4. [Input](#input)
5. [Textarea](#textarea)
6. [Select](#select)
7. [Checkbox](#checkbox)
8. [Switch](#switch)
9. [Dialog](#dialog)
10. [Alert](#alert)
11. [Toast](#toast)
12. [Table](#table)
13. [Tabs](#tabs)
14. [Sidebar](#sidebar)
15. [Componentes POA](#componentes-poa)

---

## Button

**Ubicación**: `@/components/ui/button`

### Variantes

| Variante      | Descripción         | Clases                                                   |
| ------------- | ------------------- | -------------------------------------------------------- |
| `default`     | Botón primario      | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `destructive` | Acciones peligrosas | `bg-destructive text-destructive-foreground`             |
| `outline`     | Borde sin fondo     | `border border-input bg-background hover:bg-accent`      |
| `secondary`   | Acción secundaria   | `bg-secondary text-secondary-foreground`                 |
| `ghost`       | Sin borde ni fondo  | `hover:bg-accent hover:text-accent-foreground`           |
| `link`        | Estilo de enlace    | `text-primary underline-offset-4 hover:underline`        |

### Tamaños

| Tamaño    | Clases                 |
| --------- | ---------------------- |
| `default` | `h-10 px-4 py-2`       |
| `sm`      | `h-9 rounded-md px-3`  |
| `lg`      | `h-11 rounded-md px-8` |
| `icon`    | `h-10 w-10`            |

### Estados

| Estado   | Descripción                                           |
| -------- | ----------------------------------------------------- |
| Default  | Estado normal                                         |
| Hover    | `hover:bg-*/90` según variante                        |
| Focus    | `focus-visible:ring-2 focus-visible:ring-ring`        |
| Disabled | `disabled:pointer-events-none disabled:opacity-50`    |
| Loading  | Agregar `<Loader2 className="animate-spin" />` dentro |

### Uso en KABA

```tsx
// Botón primario azul (Guardar)
<Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white">
  <Save className="mr-2 h-4 w-4" />
  Guardar Actividades
</Button>

// Botón con borde punteado (Agregar)
<Button
  variant="outline"
  className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full"
>
  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Actividad
</Button>

// Botón ghost (acciones en hover)
<Button variant="ghost" size="icon" className="h-7 w-7">
  <Trash2 className="h-3.5 w-3.5" />
</Button>
```

---

## Badge

**Ubicación**: `@/components/ui/badge`

### Variantes Base

| Variante      | Descripción           |
| ------------- | --------------------- |
| `default`     | Fondo primario sólido |
| `secondary`   | Fondo secundario      |
| `destructive` | Fondo rojo            |
| `outline`     | Solo borde            |

### Badges Personalizados KABA

```tsx
// Individual (Azul)
<Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 rounded-full px-3">
  Individual
</Badge>

// Decisión (Ámbar)
<Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 rounded-full px-3">
  Decisión
</Badge>

// Alternativas (Púrpura)
<Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200 rounded-full px-3">
  Alternativas
</Badge>

// Fin (Gris)
<Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200 rounded-full px-3">
  Fin
</Badge>
```

---

## Card

**Ubicación**: `@/components/ui/card`

### Subcomponentes

| Componente        | Clases Base                           |
| ----------------- | ------------------------------------- |
| `Card`            | `rounded-lg border bg-card shadow-sm` |
| `CardHeader`      | `flex flex-col space-y-1.5 p-4`       |
| `CardTitle`       | `text-2xl font-semibold leading-none` |
| `CardDescription` | `text-sm text-muted-foreground`       |
| `CardContent`     | `p-4 pt-0`                            |
| `CardFooter`      | `flex items-center p-4 pt-0`          |

### Uso en KABA

```tsx
// Contenedor de actividades
<div className="bg-white rounded-2xl p-6 border border-gray-200">
  {/* contenido */}
</div>

// Tarjeta de actividad
<Card className="border border-gray-200 rounded-xl shadow-none bg-white">
  <CardContent className="p-0">
    <div className="flex items-center gap-3 p-3">
      {/* contenido */}
    </div>
  </CardContent>
</Card>
```

---

## Input

**Ubicación**: `@/components/ui/input`

### Clases Base

```css
h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-base
placeholder:text-muted-foreground
focus-visible:ring-2 focus-visible:ring-ring
disabled:cursor-not-allowed disabled:opacity-50
```

### Variantes KABA

```tsx
// Input estándar
<Input placeholder="Ej: Coordinador de Operaciones" className="h-9 bg-background" />

// Input transparente (inline editing)
<Input
  className="border-none shadow-none bg-transparent h-8 px-0 focus-visible:ring-0 placeholder:text-gray-400"
/>
```

---

## Textarea

**Ubicación**: `@/components/ui/textarea`

```tsx
<Textarea
  placeholder="Describe detalladamente..."
  rows={3}
  className="min-h-[80px] bg-background resize-y"
/>
```

---

## Select

**Ubicación**: `@/components/ui/select`

### Subcomponentes

| Componente      | Uso                        |
| --------------- | -------------------------- |
| `Select`        | Contenedor principal       |
| `SelectTrigger` | Botón que abre el dropdown |
| `SelectValue`   | Valor seleccionado         |
| `SelectContent` | Contenedor del dropdown    |
| `SelectItem`    | Cada opción                |

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Seleccionar..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Checkbox

**Ubicación**: `@/components/ui/checkbox`

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Acepto los términos</Label>
</div>
```

---

## Switch

**Ubicación**: `@/components/ui/switch`

```tsx
<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Modo avión</Label>
</div>
```

---

## Dialog

**Ubicación**: `@/components/ui/dialog`

### Subcomponentes

| Componente          | Uso                        |
| ------------------- | -------------------------- |
| `Dialog`            | Contenedor y estado        |
| `DialogTrigger`     | Elemento que abre el modal |
| `DialogContent`     | Contenido del modal        |
| `DialogHeader`      | Encabezado                 |
| `DialogTitle`       | Título                     |
| `DialogDescription` | Descripción                |
| `DialogFooter`      | Pie con acciones           |

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del diálogo</DialogTitle>
      <DialogDescription>Descripción opcional</DialogDescription>
    </DialogHeader>
    {/* contenido */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleAction}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Alert

**Ubicación**: `@/components/ui/alert`

### Variantes

| Variante      | Uso                    |
| ------------- | ---------------------- |
| `default`     | Información general    |
| `destructive` | Errores o advertencias |

```tsx
// Alerta de bloqueo (KABA)
<Alert className="bg-yellow-50 border-yellow-200">
  <Lock className="h-4 w-4 text-yellow-600" />
  <AlertTitle className="text-yellow-800">Actividades Cerradas</AlertTitle>
  <AlertDescription className="text-yellow-700">
    Las actividades están cerradas...
  </AlertDescription>
</Alert>
```

---

## Toast

**Ubicación**: `@/hooks/use-toast`

```tsx
const { toast } = useToast();

// Éxito
toast({
  title: "Guardado",
  description: "Los cambios se guardaron correctamente.",
});

// Error
toast({
  title: "Error",
  description: "No se pudo completar la acción.",
  variant: "destructive",
});
```

---

## Table

**Ubicación**: `@/components/ui/table`

| Componente    | Uso                  |
| ------------- | -------------------- |
| `Table`       | Contenedor principal |
| `TableHeader` | Encabezado           |
| `TableBody`   | Cuerpo               |
| `TableRow`    | Fila                 |
| `TableHead`   | Celda de encabezado  |
| `TableCell`   | Celda de datos       |

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Estado</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Documento 1</TableCell>
      <TableCell>
        <Badge>Activo</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Tabs

**Ubicación**: `@/components/ui/tabs`

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Contenido 1</TabsContent>
  <TabsContent value="tab2">Contenido 2</TabsContent>
</Tabs>
```

---

## Sidebar

**Ubicación**: `@/components/ui/sidebar`

### Componentes Principales

| Componente          | Uso                  |
| ------------------- | -------------------- |
| `Sidebar`           | Contenedor principal |
| `SidebarHeader`     | Encabezado con logo  |
| `SidebarContent`    | Área de navegación   |
| `SidebarMenu`       | Lista de items       |
| `SidebarMenuItem`   | Item individual      |
| `SidebarMenuButton` | Botón de navegación  |
| `SidebarFooter`     | Pie del sidebar      |

### Estilos KABA

```tsx
// Navegación activa
<SidebarMenuButton
  className="bg-blue-50 text-blue-600 font-medium rounded-full"
  isActive={true}
>
  <Home className="h-4 w-4" />
  <span>Inicio</span>
</SidebarMenuButton>

// Navegación inactiva
<SidebarMenuButton
  className="text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
>
  <Settings className="h-4 w-4" />
  <span>Configuración</span>
</SidebarMenuButton>
```

---

## Componentes POA

Componentes específicos del módulo POA (Procedimientos Operativos).

### ActivityItem

**Ubicación**: `@/components/poa/activity-item`

Tarjeta individual de actividad en el flujo de procedimientos.

**Estructura:**

```tsx
<Card className="border border-gray-200 rounded-xl shadow-none bg-white">
  <CardContent className="p-0">
    {/* Header: drag handle, expand, number, name, type badge */}
    <div className="flex items-center gap-3 p-3">
      <GripVertical /> {/* Arrastrar */}
      <ChevronRight /> {/* Expandir/Colapsar */}
      <span>01</span> {/* Número */}
      <Input /> {/* Nombre */}
      <Badge>Individual</Badge> {/* Tipo */}
    </div>

    {/* Expanded Content */}
    {isExpanded && (
      <div className="px-4 pb-4 space-y-4">
        {/* Responsable, Tipo, Descripción, Branches... */}
      </div>
    )}
  </CardContent>
</Card>
```

### SectionTitle

**Ubicación**: `@/components/poa/common-form-elements`

Título de sección consistente.

```tsx
<SectionTitle
  title="Actividades del Procedimiento"
  description="Define los pasos individuales..."
/>
```

### AiEnhanceButton

**Ubicación**: `@/components/poa/common-form-elements`

Botón para acciones de IA.

```tsx
<AiEnhanceButton
  onClick={handleAiAction}
  isLoading={isLoading}
  textExists={!!text}
  buttonText="Mejorar con IA"
>
  <Wand2 className="h-3 w-3" />
</AiEnhanceButton>
```

---

## Iconos

Se utiliza **Lucide React** para todos los iconos.

### Importación

```tsx
import { Home, Settings, Plus, Trash2, ChevronRight } from "lucide-react";
```

### Tamaños Estándar

| Contexto      | Clase         |
| ------------- | ------------- |
| Botón icon    | `h-4 w-4`     |
| Botón pequeño | `h-3.5 w-3.5` |
| Sidebar       | `h-4 w-4`     |
| Header grande | `h-6 w-6`     |

### Colores

```tsx
<Icon className="text-blue-600" />      {/* Activo/Primary */}
<Icon className="text-gray-400" />      {/* Inactivo */}
<Icon className="text-gray-500" />      {/* Muted */}
<Icon className="text-amber-600" />     {/* Warning */}
<Icon className="text-red-500" />       {/* Destructive */}
```

---

## Patrones Comunes

### Loading State

```tsx
{isLoading ? (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
) : (
  /* contenido */
)}
```

### Empty State

```tsx
<div className="text-center py-12 border-2 border-dashed rounded-xl bg-white">
  <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
  <p className="mt-4 text-lg font-medium text-gray-900">No hay elementos</p>
  <p className="text-sm text-gray-500">Comienza agregando el primero.</p>
  <Button className="mt-6">
    <Plus className="mr-2 h-4 w-4" /> Agregar
  </Button>
</div>
```

### Hover Actions

```tsx
<div className="group">
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    <Button variant="ghost" size="icon">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
```
