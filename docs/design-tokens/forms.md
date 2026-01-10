# KABA Form Patterns

Patrones y estilos para formularios en la aplicación KABA.

---

## Componentes Base

### Input

```tsx
import { Input } from "@/components/ui/input";

// Estándar
<Input
  placeholder="Ingresa un valor..."
  className="h-9 bg-background"
/>

// Transparente (inline editing)
<Input
  className="border-none shadow-none bg-transparent h-8 px-0 focus-visible:ring-0"
/>
```

**Clases base:**

```css
h-9 w-full rounded-md border border-input bg-background px-3 py-1.5
text-base placeholder:text-muted-foreground
focus-visible:ring-2 focus-visible:ring-ring
disabled:cursor-not-allowed disabled:opacity-50
```

---

### Textarea

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  placeholder="Descripción detallada..."
  rows={3}
  className="min-h-[80px] bg-background resize-y"
/>;
```

---

### Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Seleccionar..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
  </SelectContent>
</Select>;
```

---

### Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center space-x-2">
  <Checkbox id="terms" checked={checked} onCheckedChange={setChecked} />
  <Label htmlFor="terms" className="text-sm">
    Acepto los términos y condiciones
  </Label>
</div>;
```

---

### Switch

```tsx
import { Switch } from "@/components/ui/switch";

<div className="flex items-center justify-between">
  <Label htmlFor="notifications">Notificaciones</Label>
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
</div>;
```

---

### Radio Group

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Opción 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Opción 2</Label>
  </div>
</RadioGroup>;
```

---

## Labels

### Label Estándar

```tsx
<Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
  Nombre del campo
</Label>
```

### Label con Requerido

```tsx
<Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
  Campo obligatorio <span className="text-red-500">*</span>
</Label>
```

### Label con Hint

```tsx
<div className="flex items-center justify-between mb-1.5">
  <Label className="text-xs font-medium text-muted-foreground">
    Contraseña
  </Label>
  <span className="text-xs text-muted-foreground">Mínimo 8 caracteres</span>
</div>
```

---

## Layouts de Formulario

### Campo Individual

```tsx
<div className="space-y-1.5">
  <Label className="text-xs font-medium text-muted-foreground">
    Nombre <span className="text-red-500">*</span>
  </Label>
  <Input placeholder="Ej: Juan Pérez" />
</div>
```

### Dos Columnas

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-1.5">
    <Label>Responsable</Label>
    <Input placeholder="Cargo..." />
  </div>
  <div className="space-y-1.5">
    <Label>Departamento</Label>
    <Select>...</Select>
  </div>
</div>
```

### Tres Columnas

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Campo 1</div>
  <div>Campo 2</div>
  <div>Campo 3</div>
</div>
```

### Formulario Completo

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Campos en 2 columnas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-1.5">
      <Label>Nombre</Label>
      <Input {...register("name")} />
    </div>
    <div className="space-y-1.5">
      <Label>Email</Label>
      <Input type="email" {...register("email")} />
    </div>
  </div>

  {/* Campo full width */}
  <div className="space-y-1.5">
    <Label>Descripción</Label>
    <Textarea rows={4} {...register("description")} />
  </div>

  {/* Acciones */}
  <div className="flex justify-end gap-2 pt-4">
    <Button type="button" variant="outline">
      Cancelar
    </Button>
    <Button type="submit">Guardar</Button>
  </div>
</form>
```

---

## Estados de Validación

### Estado de Error

```tsx
<div className="space-y-1.5">
  <Label className="text-xs font-medium text-red-500">
    Email <span>*</span>
  </Label>
  <Input
    className="border-red-500 focus-visible:ring-red-500"
    aria-invalid="true"
  />
  <p className="text-xs text-red-500">Por favor ingresa un email válido</p>
</div>
```

### Estado de Éxito

```tsx
<div className="space-y-1.5">
  <Label className="text-xs font-medium text-green-600">Email verificado</Label>
  <Input className="border-green-500 focus-visible:ring-green-500" disabled />
</div>
```

### Estado Disabled

```tsx
<Input disabled className="disabled:bg-gray-100 disabled:cursor-not-allowed" />
```

### Estado Loading

```tsx
<div className="relative">
  <Input disabled className="pr-10" />
  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
</div>
```

---

## Botones de Acción

### Footer de Formulario

```tsx
<div className="flex justify-end gap-2 pt-6 border-t mt-6">
  <Button type="button" variant="outline">
    Cancelar
  </Button>
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? (
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
</div>
```

### Botón Primario Azul (KABA)

```tsx
<Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white">
  <Save className="mr-2 h-4 w-4" />
  Guardar Cambios
</Button>
```

### Botón Agregar (Dashed)

```tsx
<Button
  variant="outline"
  className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full"
>
  <PlusCircle className="mr-2 h-4 w-4" />
  Agregar Item
</Button>
```

---

## Patrones Avanzados

### Campo con Acciones IA

```tsx
<div className="relative group/field">
  <Label>Descripción</Label>
  <Textarea rows={3} />

  {/* Toolbar de IA en hover */}
  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-md border shadow-sm">
    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">
      <Wand2 className="mr-1 h-3 w-3" />
      Editar
    </Button>
    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">
      <Expand className="mr-1 h-3 w-3" />
      Ampliar
    </Button>
  </div>
</div>
```

### Inline Editing (Click to Edit)

```tsx
<div className="group">
  {isEditing ? (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <Button size="icon" variant="ghost" onClick={handleSave}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={handleCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  ) : (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
      onClick={() => setIsEditing(true)}
    >
      <span>{value}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 text-gray-400" />
    </div>
  )}
</div>
```

### Lista Editable

```tsx
<div className="space-y-2">
  {items.map((item, index) => (
    <div key={item.id} className="flex items-center gap-2 group">
      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
      <Input
        value={item.value}
        onChange={(e) => updateItem(index, e.target.value)}
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100"
        onClick={() => removeItem(index)}
      >
        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
      </Button>
    </div>
  ))}

  <Button variant="outline" onClick={addItem} className="w-full border-dashed">
    <Plus className="mr-2 h-4 w-4" />
    Agregar item
  </Button>
</div>
```

### Campo con Contador

```tsx
<div className="space-y-1.5">
  <div className="flex justify-between">
    <Label>Descripción</Label>
    <span
      className={cn(
        "text-xs",
        value.length > 200 ? "text-red-500" : "text-muted-foreground"
      )}
    >
      {value.length}/200
    </span>
  </div>
  <Textarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    maxLength={200}
  />
</div>
```

---

## Validación con React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
});

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1.5">
        <Label className={errors.name ? "text-red-500" : ""}>
          Nombre <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>
    </form>
  );
}
```

---

## Placeholders

| Tipo de Campo | Placeholder                      |
| ------------- | -------------------------------- |
| Nombre        | `Ej: Juan Pérez`                 |
| Email         | `correo@ejemplo.com`             |
| Teléfono      | `+52 55 1234 5678`               |
| Cargo         | `Ej: Coordinador de Operaciones` |
| Descripción   | `Describe detalladamente...`     |
| Búsqueda      | `Buscar...`                      |
| URL           | `https://ejemplo.com`            |
| Genérico      | `Ingresa un valor...`            |

---

## Accesibilidad

### Labels Asociados

```tsx
// ✅ Correcto
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ❌ Incorrecto
<Label>Email</Label>
<Input type="email" />
```

### Mensajes de Error

```tsx
<Input aria-invalid={!!error} aria-describedby="email-error" />;
{
  error && (
    <p id="email-error" className="text-xs text-red-500" role="alert">
      {error.message}
    </p>
  );
}
```

### Grupos de Campos

```tsx
<fieldset>
  <legend className="text-sm font-medium mb-3">Información de contacto</legend>
  <div className="space-y-4">{/* campos */}</div>
</fieldset>
```
