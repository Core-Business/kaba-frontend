# 🚀 INICIO RÁPIDO - KABA

## Configuración Inicial (Solo la primera vez)

```bash
# 1. Ir al directorio del frontend
cd kaba-frontend

# 2. Instalar dependencias de ambos proyectos
npm run setup
```

## Crear Variables de Entorno

Crear archivo `.env.local` en `kaba-frontend/`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Google AI / Gemini API Key (para funcionalidades de IA)
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_API_KEY=your_google_api_key_here

# Development
NODE_ENV=development
```

**Nota**: Para usar las funcionalidades de IA, necesitas obtener una clave API de Google Gemini desde [Google AI Studio](https://makersuite.google.com/app/apikey)

## Ejecutar la Aplicación Completa

```bash
# Desde kaba-frontend/
npm run dev:full
```

Esto iniciará automáticamente:
- **Backend NestJS**: http://localhost:3000
- **Frontend Next.js**: http://localhost:9002
- **API Docs**: http://localhost:3000/api/docs

## Comandos Útiles

```bash
# Solo frontend
npm run dev

# Solo backend
npm run backend:dev

# Instalar dependencias del backend
npm run backend:install

# Verificar que ambos servicios estén corriendo
npm run verificar

# Ver logs con colores
npm run dev:full
```

## Verificar que Todo Funciona

1. **Backend**: Ir a http://localhost:3000/api/docs (Swagger)
2. **Frontend**: Ir a http://localhost:9002
3. **Login**: Crear cuenta o usar credenciales existentes
4. **Dashboard**: Ver lista de procedimientos
5. **Builder**: Crear nuevo POA

¡Listo para desarrollar! 🎉 