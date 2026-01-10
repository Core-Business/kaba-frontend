# KABA - Sistema POA Builder

Sistema completo para la construcción de Procedimientos Operativos Avanzados (POA).

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 + TypeScript + TailwindCSS (Puerto 9002)
- **Backend**: NestJS + MongoDB + JWT Auth (Puerto 3000)

## 🚀 Inicio Rápido

### 1. Configuración Inicial (Solo la primera vez)

```bash
# Instalar dependencias de ambos proyectos
npm run setup
```

### 2. Variables de Entorno

Crear `.env.local` en la raíz del frontend:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. Ejecutar la Aplicación Completa

```bash
# Ejecutar frontend + backend simultáneamente
npm run dev:full
```

Esto iniciará:
- **Backend**: [http://localhost:3000](http://localhost:3000) (API + Swagger en `/api/docs`)
- **Frontend**: [http://localhost:9002](http://localhost:9002)

### 4. Solo Frontend

```bash
npm run dev
```

## 🔗 Integración Completada

### ✅ API Cliente HTTP
- Axios configurado con interceptores JWT
- Auto-redirección en token expirado
- Base URL configurable

### ✅ Autenticación
- Login con email/password
- JWT storage en localStorage
- Toast notifications

### ✅ Servicios API
- **Procedures**: CRUD completo
- **POA**: Gestión de POAs
- **Auto-save**: Cada 2 segundos

### ✅ React Query
- Cache inteligente
- Estados de loading/error
- Invalidación automática

### ✅ Dashboard
- Lista de procedimientos desde API
- Creación/edición/eliminación
- Estados de carga y error
- Vista grid/lista

## ⚙️ Frontend Multi-Tenant (Fase 1)

### 🔧 Headers Automáticos
Todas las peticiones HTTP incluyen **tres headers obligatorios**:
```http
Authorization: Bearer <jwt_token>
X-Organization-Id: <organization_uuid>
X-Workspace-Id: <workspace_uuid>
```

### 🗂️ localStorage Keys
```typescript
// Claves utilizadas por el sistema
"kaba.token"        // JWT token con contexto org/workspace
"kaba.user"         // Datos del usuario autenticado
"kaba.lastWorkspace" // Último workspace seleccionado
```

### 🔄 Flujo Multi-Tenant
1. **Login** → Obtiene JWT contextual + workspace data
2. **Persistencia** → Guarda en localStorage automáticamente
3. **Interceptor** → Añade headers automáticamente en cada request
4. **Contextos** → Llama `GET /auth/contexts` para obtener workspaces disponibles

### ⚠️ Manejo de Errores
| Código | Acción | Descripción |
|--------|--------|-------------|
| `401` | Logout automático | Token expirado/inválido |
| `403` | Redirect `/workspace-revoked` | Sin permisos de workspace |
| `429` | Toast informativo | Rate limit excedido en switch |

### 🔌 API Integration
```typescript
// Hook para obtener contextos disponibles
import { useContexts } from '@/hooks/useContexts';

const { data: contexts, isLoading } = useContexts();
```

## 📱 Funcionalidades

### Autenticación
```tsx
import { AuthAPI } from "@/api/auth";

// Login
const response = await AuthAPI.login(email, password);

// Logout
AuthAPI.logout();

// Verificar autenticación
const isAuth = AuthAPI.isAuthenticated();
```

### Gestión de Procedimientos
```tsx
import { useProcedures } from "@/hooks/use-procedures";

const { list, create, update, remove } = useProcedures();
const proceduresQuery = list();
const createMutation = create();
```

### Gestión de POAs
```tsx
import { usePOA } from "@/hooks/use-poa";

const { 
  poa,
  backendProcedureId,
  isBackendLoading,
  saveToBackend,
  setBackendProcedureId,
} = usePOA();

// Builder layout establece el procedureId activo una sola vez:
useEffect(() => {
  setBackendProcedureId(procedureIdFromRoute);
  return () => setBackendProcedureId(null);
}, [procedureIdFromRoute, setBackendProcedureId]);
```

## 🎯 Criterios de Aceptación ✅

- ✅ Login guarda `accessToken` en `localStorage`
- ✅ Crear procedimiento devuelve **201** y muestra el `id`
- ✅ Al recargar la página, `GET /procedures/{id}` carga los datos
- ✅ No hay errores **401** ni **CORS** durante la sesión
- ✅ Auto-save cada 2 segundos para POAs
- ✅ Manejo de errores con toast notifications
- ✅ Estados de loading en todas las operaciones
- ✅ **Headers contextuales** se envían automáticamente
- ✅ **Error 403** redirige a `/workspace-revoked`
- ✅ **Error 429** muestra toast de rate limit
- ✅ **Workspace context** persiste entre sesiones

## 🔧 Arquitectura de Integración

```
┌─────────────────┐    HTTP/JWT    ┌─────────────────┐
│   Frontend      │ ──────────────► │   Backend       │
│   (Next.js)     │                 │   (NestJS)      │
│   Port: 9002    │ ◄────────────── │   Port: 3000    │
└─────────────────┘   JSON API     └─────────────────┘
│                                   │
├─ React Query                      ├─ MongoDB
├─ Axios Client                     ├─ JWT Auth
├─ Context API                      ├─ Swagger API
└─ Auto-save                        └─ Multi-Tenant
```

## 🛠️ Scripts Disponibles

### Frontend
- `npm run dev` - Solo frontend en desarrollo
- `npm run dev:full` - Frontend + Backend simultáneamente
- `npm run setup` - Instalar dependencias de ambos proyectos
- `npm run backend:dev` - Solo backend en desarrollo
- `npm run backend:install` - Instalar dependencias del backend
- `npm run verificar` - Verificar que ambos servicios estén corriendo
- `npm run build` - Construir para producción
- `npm run lint` - Ejecutar linter

### Backend (desde ../kaba-backend/)
- `npm run start:dev` - Backend en desarrollo
- `npm run swagger:dev` - Generar documentación Swagger
- `npm run test` - Ejecutar tests

## ✅ Estado de Integración

El frontend está **100% integrado** con el backend NestJS:
- ✅ Scripts concurrentes configurados
- ✅ HTTP client con interceptores JWT
- ✅ APIs de autenticación y procedimientos
- ✅ Auto-save y cache inteligente
- ✅ Dashboard completamente funcional
- ✅ Formulario de objetivos con integración backend
- ✅ Funcionalidades de IA completamente configuradas y operativas
- ✅ **Sistema multi-tenant** integrado con contexto automático

## 🤖 Funcionalidades de IA Integradas

La sección de objetivos incluye capacidades avanzadas de IA con Google Gemini:

**✅ Configuración Completada:**
- API Key configurada en `.env.local`
- Integración con Google Gemini 2.0 Flash
- Manejo robusto de errores y fallbacks

**🎯 Funcionalidades Disponibles:**
- **Editar con IA**: Mejora y expande texto del objetivo existente
- **Generar con IA**: Crea objetivos profesionales desde preguntas guía
- **Asistente Inteligente**: Validación y sugerencias contextuales
- **Control de Extensión**: Slider para ajustar longitud (10-100 palabras)
- **Deshacer Cambios**: Botón para revertir modificaciones de IA

**📋 Guía de Uso:**
Ver `PRUEBA-IA.md` para instrucciones detalladas de testing y casos de uso.

<!-- Test comment -->