## Auditoría de Frontend (KABA Services)

### Resumen ejecutivo

- **Arquitectura**: Next.js App Router con agrupaciones `(auth)` y `(app)`, estado global con `AuthContext` y `POAContext`, data fetching vía `@tanstack/react-query` y `axios`. Estructura clara, modular y con buenas bases de DX.
- **Críticos a corregir**:
  - **Build ignora errores**: `next.config.ts` establece `typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds` en `true` (riesgo de desplegar código roto).
  - **Autenticación en localStorage**: el JWT se guarda en `localStorage` y se decodifica con `atob` (riesgo XSS, base64url, refresh management).
  - **Debug en producción**: logging sensible/verboso y monkey patch de `window.fetch` en `Dashboard`.
  - **Cambio de workspace**: no se actualiza el token devuelto por `POST /auth/switch-workspace`.
  - **Código de backend en frontend**: archivo `src/middleware/context.middleware.ts` (NestJS) dentro del frontend.
  - **Inconsistencias API/baseURL**: `AuthContext.refreshContexts` usa `fetch` directo con base distinta a `api` (`axios`).
  - **Clave de token inconsistente**: referencia a `accessToken` en `ProceduresAPI.update` (debería ser `kaba.token`).
- **Seguridad**: falta `Content-Security-Policy` y `Strict-Transport-Security` en `vercel.json`; headers de seguridad básicos presentes.
- **Performance/DX**: buen uso de React Query; oportunidades en caching por defecto, code-splitting, remoción de logs.
- **Testing**: hay E2E con Cypress; faltan unit tests y contract tests (Zod) en límites del API.

---

### Stack y dependencias relevantes

- **Framework**: Next.js `15.2.3`, React `18.3.1`, TypeScript `^5`.
- **State/Data**: `@tanstack/react-query@^5.66.0`.
- **UI**: TailwindCSS `^3.4.1`, Radix UI, `lucide-react`.
- **Validación**: `zod` para modelos de POA.
- **HTTP**: `axios` con interceptores para `Authorization` y cabeceras multi-tenant (`X-Organization-Id`, `X-Workspace-Id`).
- **IA**: `genkit`/`@genkit-ai/*` (integraciones locales/SSR).

---

### Estructura y flujo

- **Ruteo**: App Router con grupos `src/app/(auth)` y `src/app/(app)`. Redirección base `src/app/page.tsx` a `/login`.
- **Contextos**:
  - `AuthContext`: token, usuario, workspace actual, lista de workspaces; persistencia en `localStorage`.
  - `POAContext`: estado y operaciones del builder; ahora integra la sincronización con backend (fetch, auto-create, auto-save) y expone `usePOA` como única API para los formularios.
- **API Layer**: `src/api/http.ts` centraliza baseURL e interceptores; endpoints por dominio (`auth`, `users`, `procedures`, `poa`, etc.).
- **UI/Layout**: `AppHeader`, `AppSidebar`, `WorkspaceSelector`, `UserNav`; páginas de dashboard y builder por secciones.

---

### Hallazgos por categoría y propuestas

#### 1) Build, tipado y linting

- **Problema**: `next.config.ts` deshabilita errores de TypeScript y ESLint en build.
  - **Riesgo**: despliegues con errores de tipado/estilo no detectados.
  - **Acción (Alta)**: habilitar `typescript.ignoreBuildErrors = false` y `eslint.ignoreDuringBuilds = false`. Resolver errores existentes; si hay falsos positivos, ajustar reglas.

- **Problema**: `allowJs: true`, `skipLibCheck: true` en `tsconfig.json`.
  - **Acción (Media)**: deshabilitar `allowJs` si no hay JS crudo. Mantener `skipLibCheck` solo si hay bloqueos de tiempo de build; idealmente `false` en CI.

- **Problema**: script `pre-commit` definido pero no integrado.
  - **Acción (Media)**: instalar y configurar Husky para ganchos `pre-commit`/`pre-push` que ejecuten `typecheck`, `lint`, `validate:architecture` y pruebas.

#### 2) Autenticación, autorización y multi-tenant

- **Problema**: JWT en `localStorage` con decodificación `atob` en `AuthAPI` y `UsersAPI`.
  - **Riesgos**: exfiltración vía XSS; `atob` no maneja base64url correctamente; acoplamiento a claims del JWT para `userId`.
  - **Acciones (Alta)**:
    - Migrar a **cookies HttpOnly** (`Secure`, `SameSite=Lax/Strict`) para `accessToken` y `refreshToken`.
    - Agregar **middleware de Next** (`middleware.ts`) que redirija a `/login` si no hay sesión válida y adjunte contexto si aplica.
    - Exponer en backend endpoints tipo `/users/me` para evitar confiar en claims del cliente.
    - Si se mantiene `Authorization` por header (no cookies), minimizar superficie XSS y evitar exponer claims en consola.

- **Problema**: `AuthAPI.switchWorkspace` devuelve `accessToken` nuevo pero `WorkspaceSelector` no lo aplica.
  - **Acción (Alta)**: al cambiar workspace, **persistir** el nuevo `accessToken` con `AuthContext.refreshToken(newToken)` o `setAuth` y refrescar permisos.

- **Problema**: inconsistencia de baseURL en `AuthContext.refreshContexts` (usa `fetch` directo: `NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"`).
  - **Acción (Media)**: unificar todas las llamadas en el `api` (axios) para heredar interceptores y baseURL (`/api`). El fallback `localhost` debe incluir `/api` si el backend usa prefijo.

- **Problema**: `UsersAPI` obtiene `userId` decodificando JWT y consulta `/users/{id}`.
  - **Acción (Media)**: usar endpoint `/users/me` autenticado y eliminar dependencia del claim `sub` en el cliente.

#### 3) Seguridad (cabeceras, CSP, exposición de datos)

- **Verificaciones actuales**: `vercel.json` incluye `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` (obsoleto) y `Referrer-Policy`.

- **Faltantes y acciones (Alta)**:
  - Agregar **Content-Security-Policy (CSP)** estricta con `script-src 'self' 'unsafe-inline'` reducido al mínimo, `connect-src` hacia el backend/API, `img-src` dominios permitidos, etc.
  - Agregar **Strict-Transport-Security (HSTS)** con `max-age=31536000; includeSubDomains; preload`.
  - Agregar **Permissions-Policy** (camera, microphone, geolocation deshabilitados).
  - Considerar `Cross-Origin-Opener-Policy` y `Cross-Origin-Embedder-Policy` si procede.
  - Remover `X-XSS-Protection` (no útil en navegadores modernos) y sustituir por CSP.

- **Problema**: logging sensible/verboso en producción.
  - Ejemplos: `Dashboard` hace monkey patch a `window.fetch` y loguea headers; `ProceduresAPI.update` imprime headers y estado; `POAAPI` imprime payloads completos.
  - **Acción (Alta)**: condicionar todos los logs a `process.env.NODE_ENV !== 'production'` o usar un logger con niveles y filtros.

- **Problema**: archivo `src/middleware/context.middleware.ts` (NestJS) está en frontend.
  - **Acción (Alta)**: eliminar/mover al backend. Mantener paridad de responsabilidades: el frontend no debe llevar middlewares de servidor.

#### 4) Calidad de código y consistencia

- **Problema**: clave del token inconsistente y duplicada.
  - `localStorage` usa `kaba.token`; en `ProceduresAPI.update` se inspecciona `accessToken` para logs.
  - **Acción (Media)**: estandarizar en `STORAGE_KEYS` del `AuthContext` y nunca leer claves "sucias" en módulos aislados.

- **Problema**: decodificación JWT con `atob` (sin base64url) y sin manejo de errores robusto.
  - **Acción (Media)**: usar un helper seguro para base64url o una librería liviana de decode que no verifique firma pero maneje formato.

- **Problema**: mezcla de `fetch` y `axios` para llamadas REST.
  - **Acción (Media)**: consolidar en `axios` para heredar interceptores y manejo centralizado de errores.

- **Mejoras (Baja)**:
  - Añadir tipos estrictos en payloads `any` de `POAAPI` y `ProceduresAPI`.
  - Centralizar strings UI (i18n futuro), y usar constantes para rutas.

#### 5) Performance y UX

- **Observaciones**:
  - React Query sin configuración global de `staleTime`/`retry`/`gcTime`.
  - Páginas como `dashboard` y `builder` podrían beneficiarse de `dynamic()` para componentes pesados (e.g. gráficos, editores) y división por secciones.
  - Hay logs abundantes que impactan rendimiento.

- **Acciones (Media)**:
  - Configurar `QueryClient` con defaults (p.ej., `staleTime` 30–60s para listas, `retry` 1–2, `refetchOnWindowFocus: false` si no aplica).
  - Usar `dynamic(() => import(...), { ssr: false })` para UI pesada no crítica.
  - Eliminar logs en producción y monkey patches.

#### 6) Accesibilidad y UI

- **Positivo**: uso de `Label`/`Input` adecuados y semántica básica.
- **Acciones (Baja)**: revisar contraste, `aria-*` en menús y dialog, y foco al abrir modales. Validar con Lighthouse/axe.

#### 7) Testing

- **Actual**: Cypress E2E presente (`cypress/e2e/...`).
- **Acciones (Media)**:
  - Agregar unit tests (Jest/Vitest) para hooks (`usePOABackend`, `useProcedures`) y utils.
  - Contract tests con Zod para respuestas del backend (parseo y fallback si cambian shapes).
  - Tests de ruta protegida (middleware) y de cambio de workspace.

#### 8) DevOps/CI/CD

- **Problema**: scripts usan `npm` pero el proyecto declara `packageManager: pnpm` y hay `pnpm-lock.yaml`.
  - **Acción (Media)**: unificar a `pnpm` en scripts y en CI.

- **Acción (Media)**: agregar workflow CI (lint, typecheck, build, tests) y gates de calidad (Cypress en PR críticos).

---

### Hallazgos y referencias de código concretas

- **Ignorar errores en build**: `next.config.ts`
  - `typescript.ignoreBuildErrors: true`, `eslint.ignoreDuringBuilds: true`.

- **JWT en localStorage y decodificación**:
  - `src/contexts/AuthContext.tsx`: persiste `kaba.token`, `kaba.user`, `kaba.lastWorkspace`.
  - `src/api/auth.ts`: decodifica con `atob`, asume claims `org`, `ws`, `role`.
  - `src/api/users.ts`: decodifica `sub` y usa `/users/{id}`.

- **Cambio de workspace sin actualizar token**:
  - `src/components/workspace/WorkspaceSelector.tsx`: usa `AuthAPI.switchWorkspace` pero no consume `accessToken` regresado.

- **BaseURL inconsistente**:
  - `src/api/http.ts`: `baseURL = NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"`.
  - `src/contexts/AuthContext.tsx`: `fetch(`${NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/auth/contexts`)`.

- **Logs y monkey patch**:
  - `src/app/(app)/dashboard/page.tsx`: parchea `window.fetch` y loguea headers por 10s.
  - `src/api/procedures.ts`: logs detallados de headers y requests; revisa `localStorage.getItem("accessToken")` (clave incorrecta).
  - `src/api/poa.ts`: logs de payloads de actualización y referencias.

- **Código backend en frontend**:
  - `src/middleware/context.middleware.ts`: clase NestJS `ContextMiddleware`.

- **Auto-save**:
  - `src/hooks/use-poa-backend.ts`: comentario dice "cada 2 segundos", pero el `setTimeout` está en `120000` ms (2 minutos). Alinear comentario/intervalo.

---

### Propuestas priorizadas (plan de acción)

#### Alta prioridad (semana 1)

- **Build y calidad**
  - Habilitar TS/ESLint en build; corregir errores resultantes.
  - Configurar Husky y `lint-staged` con `typecheck`, `eslint`, `prettier` (si aplica), `validate:architecture`.

- **Seguridad**
  - Implementar **CSP**, **HSTS** y **Permissions-Policy** en `vercel.json`.
  - Remover monkey patches y logs sensibles; condicionar logs a entorno.
  - Eliminar `src/middleware/context.middleware.ts` del frontend.

- **Auth/Multi-tenant**
  - Aplicar el nuevo `accessToken` al hacer `switchWorkspace` y refrescar permisos.
  - Unificar llamadas de `AuthContext.refreshContexts` al cliente `api` (axios) y revisar prefijo `/api`.
  - Exponer `/users/me` en backend y migrar `UsersAPI`.

#### Media prioridad (semana 2–3)

- **Sesiones seguras**
  - Migrar a **cookies HttpOnly** o, si se mantiene header, endurecer defensa XSS y revisar caducidad/refresh.
  - Añadir `middleware.ts` en Next para proteger rutas `(app)` y manejar redirecciones.

- **Performance/DX**
  - Configurar defaults de React Query (staleTime, retries, focus/refetch) y `ErrorBoundary`.
  - Hacer `dynamic import` en componentes pesados del builder.

- **Testing**
  - Unit tests de hooks/utilidades y contract tests para endpoints clave (`auth`, `procedures`, `poa`).

#### Baja prioridad

- **Refactors**
  - Tipar `any` en `POAAPI` y estandarizar DTOs.
  - Centralizar copy en util de i18n.
  - Revisar `tsconfig` para deshabilitar `allowJs` si no se usa.

---

### Checklist operativa

- [ ] En `next.config.ts`, activar validaciones de TS/ESLint en build.
- [ ] Quitar logs sensibles/monkey patches o protegerlos por `NODE_ENV`.
- [ ] Unificar baseURL y uso de `axios` en `AuthContext.refreshContexts`.
- [ ] Aplicar token devuelto en `switchWorkspace` y refrescar contexto.
- [ ] Mover/eliminar `src/middleware/context.middleware.ts` (propio de backend).
- [ ] Agregar CSP, HSTS, Permissions-Policy en `vercel.json`.
- [ ] Estandarizar clave de token (`kaba.token`) y remover referencias a `accessToken` en cliente.
- [ ] Configurar Husky + CI para `typecheck`, `lint`, `build`, `test`.
- [ ] Ajustar intervalos/comentarios de auto-save en `use-poa-backend.ts`.

---

### Notas adicionales

- La documentación existente (`docs/*`) y los E2E de Cypress son una buena base. Sumar guías de seguridad (CSP, cookies, multi-tenant) y un README de arquitectura de frontend.
- Mantener consistencia de gestor de paquetes: se declara `pnpm` pero los scripts llaman `npm`. Unificar a `pnpm`.

---

### Métricas sugeridas de éxito (posteriores a cambios)

- 0 errores de TypeScript/ESLint en build CI.
- 0 logs sensibles en producción (auditoría por grep en build output).
- Tiempos de primera carga sin regresión tras `dynamic import` y tuning de React Query.
- Cobertura mínima de tests unitarios > 60% en hooks y utils críticos.
- Seguridad: Lighthouse Security/Best Practices > 95; CSP sin violaciones reportadas.


