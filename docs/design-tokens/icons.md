# KABA Icon Library

Biblioteca de iconos para la aplicación KABA. Utilizamos **Lucide React** como fuente principal de iconos.

---

## Instalación

```bash
npm install lucide-react
```

## Importación

```tsx
import { Home, Settings, Plus, Save } from "lucide-react";
```

---

## Tamaños Estándar

| Contexto    | Clase         | Pixeles | Uso                           |
| ----------- | ------------- | ------- | ----------------------------- |
| Extra Small | `h-3 w-3`     | 12px    | Indicadores mínimos           |
| Small       | `h-3.5 w-3.5` | 14px    | Botones pequeños, badges      |
| Default     | `h-4 w-4`     | 16px    | Botones, sidebar, general     |
| Medium      | `h-5 w-5`     | 20px    | Headers, acciones principales |
| Large       | `h-6 w-6`     | 24px    | Logo, encabezados             |
| XL          | `h-8 w-8`     | 32px    | Empty states                  |
| XXL         | `h-12 w-12`   | 48px    | Ilustraciones vacías          |

---

## Colores

| Estado      | Clase            | Uso                   |
| ----------- | ---------------- | --------------------- |
| Primary     | `text-blue-600`  | Activo, énfasis       |
| Muted       | `text-gray-400`  | Inactivo, placeholder |
| Secondary   | `text-gray-500`  | Iconos secundarios    |
| Dark        | `text-gray-900`  | Alto contraste        |
| Warning     | `text-amber-600` | Advertencias          |
| Destructive | `text-red-500`   | Eliminar, error       |
| Success     | `text-green-500` | Completado, éxito     |

---

## Iconos por Categoría

### Navegación

| Icono              | Nombre       | Uso                 |
| ------------------ | ------------ | ------------------- |
| `<Home />`         | Home         | Inicio/Dashboard    |
| `<ChevronLeft />`  | ChevronLeft  | Volver atrás        |
| `<ChevronRight />` | ChevronRight | Expandir/Siguiente  |
| `<ChevronDown />`  | ChevronDown  | Dropdown/Colapsar   |
| `<ChevronUp />`    | ChevronUp    | Cerrar dropdown     |
| `<ArrowLeft />`    | ArrowLeft    | Navegación atrás    |
| `<ArrowRight />`   | ArrowRight   | Navegación adelante |
| `<PanelLeft />`    | PanelLeft    | Toggle sidebar      |

### Acciones CRUD

| Icono             | Nombre      | Uso                    |
| ----------------- | ----------- | ---------------------- |
| `<Plus />`        | Plus        | Agregar nuevo          |
| `<PlusCircle />`  | PlusCircle  | Agregar (enfatizado)   |
| `<Pencil />`      | Pencil      | Editar                 |
| `<Trash2 />`      | Trash2      | Eliminar               |
| `<Save />`        | Save        | Guardar                |
| `<X />`           | X           | Cerrar/Cancelar        |
| `<XCircle />`     | XCircle     | Cerrar (enfatizado)    |
| `<Check />`       | Check       | Confirmar/Seleccionado |
| `<CheckCircle />` | CheckCircle | Éxito                  |

### Archivos y Documentos

| Icono             | Nombre      | Uso           |
| ----------------- | ----------- | ------------- |
| `<FileText />`    | FileText    | Documento/POA |
| `<FileCode />`    | FileCode    | Código/Config |
| `<Download />`    | Download    | Descargar     |
| `<UploadCloud />` | UploadCloud | Subir archivo |
| `<Eye />`         | Eye         | Vista previa  |
| `<EyeOff />`      | EyeOff      | Ocultar       |
| `<BookOpen />`    | BookOpen    | Documentación |

### Organización

| Icono          | Nombre   | Uso                |
| -------------- | -------- | ------------------ |
| `<Building />` | Building | Empresa/Workspace  |
| `<Users />`    | Users    | Usuarios/Equipo    |
| `<User />`     | User     | Usuario individual |
| `<Settings />` | Settings | Configuración      |
| `<Lock />`     | Lock     | Bloqueado/Privado  |

### IA y Mejoras

| Icono           | Nombre    | Uso             |
| --------------- | --------- | --------------- |
| `<Wand2 />`     | Wand2     | Editar con IA   |
| `<Sparkles />`  | Sparkles  | Generar con IA  |
| `<Brain />`     | Brain     | Inteligencia/IA |
| `<Lightbulb />` | Lightbulb | Sugerencia      |
| `<Expand />`    | Expand    | Ampliar texto   |

### Estados y Feedback

| Icono             | Nombre      | Uso                           |
| ----------------- | ----------- | ----------------------------- |
| `<Loader2 />`     | Loader2     | Cargando (con `animate-spin`) |
| `<AlertCircle />` | AlertCircle | Alerta/Aviso                  |
| `<ListChecks />`  | ListChecks  | Lista de actividades          |
| `<Circle />`      | Circle      | Radio button                  |

### Layout y UI

| Icono              | Nombre       | Uso              |
| ------------------ | ------------ | ---------------- |
| `<GripVertical />` | GripVertical | Drag handle      |
| `<Maximize2 />`    | Maximize2    | Expandir todo    |
| `<Minimize2 />`    | Minimize2    | Contraer todo    |
| `<PlusSquare />`   | PlusSquare   | Expandir sección |
| `<MinusSquare />`  | MinusSquare  | Contraer sección |
| `<Search />`       | Search       | Buscar           |
| `<Mail />`         | Mail         | Email            |
| `<Camera />`       | Camera       | Foto/Avatar      |
| `<Palette />`      | Palette      | Tema/Colores     |
| `<Undo2 />`        | Undo2        | Deshacer         |
| `<LogOut />`       | LogOut       | Cerrar sesión    |

---

## Patrones de Uso

### Botón con Icono

```tsx
<Button>
  <Save className="mr-2 h-4 w-4" />
  Guardar
</Button>
```

### Botón Solo Icono

```tsx
<Button variant="ghost" size="icon" className="h-8 w-8">
  <Trash2 className="h-4 w-4" />
</Button>
```

### Icono de Carga

```tsx
{
  isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Save className="h-4 w-4" />
  );
}
```

### Icono en Hover

```tsx
<div className="group">
  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
  </button>
</div>
```

### Icono con Badge

```tsx
<div className="flex items-center gap-2">
  <FileText className="h-4 w-4 text-blue-600" />
  <span>Documento</span>
</div>
```

### Empty State

```tsx
<div className="text-center py-12">
  <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
  <p className="mt-4 text-lg font-medium text-gray-900">No hay actividades</p>
</div>
```

### Drag Handle

```tsx
<div className="cursor-grab opacity-0 group-hover:opacity-100">
  <GripVertical className="h-4 w-4 text-gray-400" />
</div>
```

---

## Iconos en Sidebar KABA

| Sección            | Icono         | Clase                   |
| ------------------ | ------------- | ----------------------- |
| Logo               | `FileText`    | `h-6 w-6 text-blue-600` |
| Encabezado         | `FileText`    | `h-4 w-4`               |
| Objetivo           | `Target`      | `h-4 w-4`               |
| Actividades        | `ListChecks`  | `h-4 w-4`               |
| Alcance            | `MapPin`      | `h-4 w-4`               |
| Responsabilidades  | `Users`       | `h-4 w-4`               |
| Definiciones       | `BookOpen`    | `h-4 w-4`               |
| Referencias        | `Link`        | `h-4 w-4`               |
| Registros          | `Database`    | `h-4 w-4`               |
| Introducción       | `FileText`    | `h-4 w-4`               |
| Control de Cambios | `History`     | `h-4 w-4`               |
| Aprobaciones       | `CheckSquare` | `h-4 w-4`               |
| Anexos             | `Paperclip`   | `h-4 w-4`               |
| Vista Previa       | `Eye`         | `h-4 w-4`               |

---

## Iconos IA

```tsx
// Mejorar con IA
<Button variant="ghost" size="sm">
  <Wand2 className="mr-1 h-3 w-3" />
  Editar
</Button>

// Generar con IA
<Button variant="ghost" size="sm">
  <Sparkles className="mr-1 h-3 w-3" />
  Generar
</Button>

// Ampliar con IA
<Button variant="ghost" size="sm">
  <Expand className="mr-1 h-3 w-3" />
  Ampliar
</Button>

// Sugerencia IA
<Button variant="ghost" size="sm">
  <Lightbulb className="mr-1 h-3 w-3" />
  Sugerir
</Button>
```

---

## Buenas Prácticas

### ✅ Correcto

```tsx
// Tamaño consistente con el contexto
<Button size="sm">
  <Plus className="mr-2 h-3.5 w-3.5" />
  Agregar
</Button>

// Color que indica estado
<Trash2 className="text-gray-400 hover:text-red-500 transition-colors" />

// Accesibilidad con aria-label
<Button variant="ghost" size="icon" aria-label="Eliminar">
  <Trash2 className="h-4 w-4" />
</Button>
```

### ❌ Evitar

```tsx
// Tamaño inconsistente
<Button>
  <Save className="h-8 w-8" /> {/* Muy grande para un botón */}
</Button>

// Sin transición en cambios de color
<Trash2 className="text-gray-400 hover:text-red-500" /> {/* Falta transition-colors */}

// Sin descripción accesible
<Button size="icon">
  <Settings className="h-4 w-4" /> {/* Falta aria-label */}
</Button>
```

---

## Recursos

- [Lucide Icons](https://lucide.dev/icons/) - Catálogo completo
- [Lucide React Docs](https://lucide.dev/guide/packages/lucide-react) - Documentación
