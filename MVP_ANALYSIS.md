# Análisis de Frontend para SaaS MVP

Este documento resume el estado actual del repositorio `kaba-frontend` y detalla las pantallas y funcionalidades faltantes para lanzar un MVP de SaaS funcional.

## Estado Actual

### Arquitectura

- **Framework**: Next.js 15 (App Router).
- **UI Library**: Shadcn UI + Tailwind CSS.
- **Gestión de Estado**: React Query (TanStack Query).

### Secciones Existentes

1.  **Autenticación (`/auth`)**:
    - Login, Registro, Recuperación de contraseña, OTP, Google Auth.
    - Estado: ✨ Completo y moderno.
2.  **Dashboard (`/dashboard`)**:
    - Punto de entrada principal post-login.
3.  **Builder (`/builder`)**:
    - Funcionalidad core del producto (Construcción de Agentes/Procedimientos).
4.  **Settings (`/settings`)**:
    - Existente pero básico (monolítico en `page.tsx`).

## Faltantes Críticos para MVP SaaS

### 1. Marketing y Onboarding

**Prioridad: Alta**

- **Landing Page (`/`)**: Actualmente redirige a login. Se requiere una página pública que explique el producto, precios y features.
- **Onboarding Flow**: Primeros pasos guiados para usuarios nuevos (e.g., "Crea tu primer agente").
- **Legal**: Páginas de Términos de Servicio y Política de Privacidad (Footer links).

### 2. Gestión de Suscripciones (Billing UI)

**Prioridad: Alta**

- **Pricing Page**: Página pública de precios.
- **Portal de Facturación**: Integración (posiblemente un link al portal de cliente de Stripe) o UI nativa para:
  - Ver plan actual.
  - Cambiar de plan (Upgrade/Downgrade).
  - Actualizar método de pago.
  - Descargar facturas.

### 3. Gestión de Organización y Equipo

**Prioridad: Media**

- **Settings Breakdown**: Refactorizar `/settings` para tener tabs o sub-rutas:
  - `/settings/profile`: Foto, nombre, cambio de password.
  - `/settings/organization`: Nombre de la empresa, logo.
  - `/settings/team`: Lista de miembros, botón de "Invitar", gestión de roles.
  - `/settings/billing`: Lo mencionado arriba.

### 4. Soporte y Ayuda

**Prioridad: Baja (para MVP)**

- Botón de feedback o integración con herramienta de soporte (Intercom, Chatway, o simple mailto).
- Documentación/Help Center.

## Recomendaciones de UX/UI

1.  **Empty States**: Asegurar que cuando las listas (agentes, proyectos, logs) estén vacías, haya un CTA claro e ilustraciones amigables.
2.  **Feedback Visual**: Toasts y notificaciones para acciones de éxito/error (Shadcn Toast ya está instalado, usarlo consistentemente).
3.  **Loading States**: Skeletons para cargas de datos (React Suspense).

## Próximos Pasos Recomendados

1.  Diseñar e implementar la **Landing Page**.
2.  Desarrollar la sección de **Settings > Team** para habilitar el crecimiento viral (invitaciones).
3.  Integrar UI de **Pagos (Billing)**.
