# 🚀 GUÍA DE DESPLIEGUE EN LA NUBE - KABA PLATFORM

## 📋 Stack Recomendado para Beta

| Servicio | Proveedor | Plan | Costo Mensual |
|----------|-----------|------|---------------|
| **Backend** | Railway | Starter | $5 USD |
| **Frontend** | Vercel | Hobby | $0 USD |
| **PostgreSQL** | Railway | Incluido | $0 USD |
| **MongoDB** | Atlas | M0 Free | $0 USD |
| **TOTAL** | | | **$5 USD/mes** |

---

## 🎯 PASO 1: CONFIGURAR MONGODB ATLAS

### 1.1. Crear Cuenta y Cluster
```bash
# 1. Ir a: https://www.mongodb.com/atlas
# 2. Crear cuenta gratuita
# 3. Crear nuevo proyecto: "kaba-platform"
# 4. Crear cluster M0 (gratuito)
#    - Nombre: "kaba-cluster"
#    - Región: Más cercana a tu ubicación
#    - Versión: 7.0
```

### 1.2. Configurar Seguridad
```bash
# Database Access:
# 1. Crear usuario de base de datos
#    - Username: kaba_user
#    - Password: [generar automáticamente - GUARDAR]
#    - Roles: Atlas admin

# Network Access:
# 1. Agregar IP: 0.0.0.0/0 (permite todas las IPs)
#    - Nota: Para beta está bien, para producción restringe
```

### 1.3. Obtener URI de Conexión
```bash
# 1. Ir a "Connect" en tu cluster
# 2. Seleccionar "Connect your application"
# 3. Copiar URI (se ve así):
mongodb+srv://kaba_user:<password>@kaba-cluster.xxxxx.mongodb.net/kaba_db?retryWrites=true&w=majority

# ⚠️ IMPORTANTE: Reemplazar <password> con tu contraseña real
```

---

## 🚂 PASO 2: DESPLEGAR BACKEND EN RAILWAY

### 2.1. Preparar Repositorio
```bash
# 1. Pushear todos los cambios a GitHub
git add .
git commit -m "feat: Add cloud deployment configuration"
git push origin main
```

### 2.2. Configurar Railway
```bash
# 1. Ir a: https://railway.app
# 2. Crear cuenta con GitHub
# 3. Crear nuevo proyecto
# 4. Seleccionar "Deploy from GitHub repo"
# 5. Seleccionar tu repositorio kaba-backend
```

### 2.3. Configurar Variables de Entorno
```bash
# En Railway Dashboard > Variables:

# 🔑 CRÍTICO - Generar JWT_SECRET:
# Ejecutar en terminal: openssl rand -hex 32
JWT_SECRET=tu_jwt_secret_generado_aquí

# 🗄️ BASES DE DATOS:
# PostgreSQL (Railway lo genera automáticamente)
POSTGRES_URL=${{Postgres.DATABASE_URL}}

# MongoDB (de Atlas)
MONGODB_URI=mongodb+srv://kaba_user:TU_PASSWORD@kaba-cluster.xxxxx.mongodb.net/kaba_db?retryWrites=true&w=majority

# 🔧 CONFIGURACIÓN:
NODE_ENV=production
PORT=3000
ENABLE_RLS=true
DEFAULT_ORG_NAME=KABA Default
DEFAULT_WORKSPACE_NAME=Main Workspace

# 🤖 IA (OPCIONAL):
GOOGLE_API_KEY=tu_google_api_key_aquí
GEMINI_API_KEY=tu_google_api_key_aquí
```

### 2.4. Agregar PostgreSQL
```bash
# 1. En Railway Dashboard:
# 2. Hacer clic en "+ Add Service"
# 3. Seleccionar "PostgreSQL"
# 4. Esperar a que se cree
# 5. La variable POSTGRES_URL se conectará automáticamente
```

### 2.5. Configurar Dominio
```bash
# 1. En Railway Dashboard > Settings > Domains
# 2. Hacer clic en "Generate Domain"
# 3. Copiar el dominio generado (ej: kaba-backend-production.up.railway.app)
# 4. ⚠️ IMPORTANTE: Guardar este dominio para el frontend
```

---

## ⚡ PASO 3: DESPLEGAR FRONTEND EN VERCEL

### 3.1. Configurar Vercel
```bash
# 1. Ir a: https://vercel.com
# 2. Crear cuenta con GitHub
# 3. Hacer clic en "New Project"
# 4. Seleccionar repositorio kaba-frontend
# 5. Framework: Next.js (auto-detectado)
```

### 3.2. Configurar Variables de Entorno
```bash
# En Vercel Dashboard > Settings > Environment Variables:

# 🔗 API CONNECTION:
NEXT_PUBLIC_API_BASE_URL=https://tu-dominio-railway.up.railway.app

# 🤖 IA (OPCIONAL):
GOOGLE_API_KEY=tu_google_api_key_aquí
GEMINI_API_KEY=tu_google_api_key_aquí

# 🔧 CONFIGURACIÓN:
NODE_ENV=production
```

### 3.3. Configurar Dominio Personalizado (Opcional)
```bash
# 1. En Vercel Dashboard > Settings > Domains
# 2. Agregar tu dominio personalizado
# 3. Configurar DNS según instrucciones
```

---

## 🔧 PASO 4: CONFIGURAR CORS

### 4.1. Actualizar CORS en Backend
La configuración de CORS ya está incluida en el backend. Solo necesitas asegurarte de que los dominios estén configurados correctamente.
---

## ✅ PASO 5: VERIFICAR DESPLIEGUE

### 5.1. Verificar Backend
```bash
# Verificar que el backend esté funcionando:
curl https://tu-dominio-railway.up.railway.app/api/health

# Debería devolver:
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "database": "configured",
    "mongodb": "configured",
    "auth": "configured"
  }
}
```

### 5.2. Verificar Frontend
```bash
# Ir a tu dominio de Vercel:
# https://tu-proyecto.vercel.app
# Debería cargar la página de login correctamente
```

### 5.3. Verificar Conexión Frontend-Backend
```bash
# Desde el frontend, intentar login
# Si funciona, significa que la conexión está correcta
```

---

## 🔧 PASO 6: CONFIGURAR DOMINIO PERSONALIZADO (OPCIONAL)

### 6.1. Configurar Dominio en Vercel
```bash
# 1. Comprar dominio (ej: tudominio.com)
# 2. En Vercel Dashboard > Settings > Domains
# 3. Agregar: tudominio.com
# 4. Configurar DNS según instrucciones
```

### 6.2. Configurar Subdominio para API
```bash
# 1. En tu proveedor de DNS:
# 2. Crear registro CNAME:
#    - Nombre: api
#    - Valor: tu-dominio-railway.up.railway.app
# 3. Actualizar NEXT_PUBLIC_API_BASE_URL en Vercel:
#    - https://api.tudominio.com
```

---

## 🚀 PASO 7: CREAR USUARIOS BETA

### 7.1. Crear Usuario Administrador
```bash
# Método 1: Usar endpoint de registro (si está habilitado)
curl -X POST https://tu-dominio-railway.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tudominio.com",
    "password": "TuPasswordSegura123!",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Método 2: Usar la interfaz web
# Ir a https://tu-proyecto.vercel.app/signup
```

### 7.2. Crear Usuarios Beta
```bash
# Repetir el proceso para cada usuario beta
# O usar una herramienta como Postman para crear múltiples usuarios
```

---

## 📊 PASO 8: MONITOREO Y LOGS

### 8.1. Monitorear Railway
```bash
# En Railway Dashboard:
# 1. Ir a tu servicio > Metrics
# 2. Revisar CPU, RAM, y requests
# 3. Configurar alertas si es necesario
```

### 8.2. Monitorear Vercel
```bash
# En Vercel Dashboard:
# 1. Ir a tu proyecto > Functions
# 2. Revisar logs de Next.js
# 3. Verificar performance
```

### 8.3. Monitorear MongoDB Atlas
```bash
# En MongoDB Atlas:
# 1. Ir a tu cluster > Metrics
# 2. Revisar conexiones y operaciones
# 3. Verificar que no excedas los límites del plan gratuito
```

---

## 🔒 PASO 9: SEGURIDAD ADICIONAL

### 9.1. Configurar Rate Limiting
```bash
# Ya incluido en el backend con NestJS Throttler
# Configurado en: 10 requests por minuto por IP
```

### 9.2. Configurar HTTPS
```bash
# Vercel: HTTPS automático
# Railway: HTTPS automático
# ✅ Ya configurado automáticamente
```

### 9.3. Configurar Backups
```bash
# PostgreSQL en Railway: Backups automáticos
# MongoDB Atlas: Backups automáticos en plan gratuito
# ✅ Ya configurado automáticamente
```

---

## 🎉 RESULTADO FINAL

Al completar estos pasos tendrás:

- ✅ **Backend** funcionando en Railway
- ✅ **Frontend** funcionando en Vercel
- ✅ **PostgreSQL** configurado automáticamente
- ✅ **MongoDB** en Atlas (gratuito)
- ✅ **HTTPS** configurado automáticamente
- ✅ **Monitoring** básico incluido
- ✅ **Backups** automáticos

### URLs Finales:
```bash
# Frontend: https://tu-proyecto.vercel.app
# Backend: https://tu-dominio-railway.up.railway.app
# API Docs: https://tu-dominio-railway.up.railway.app/api/docs
# Health Check: https://tu-dominio-railway.up.railway.app/api/health
```

---

## 💰 COSTOS ESTIMADOS

| Servicio | Plan | Costo |
|----------|------|-------|
| Railway | Starter | $5/mes |
| Vercel | Hobby | $0/mes |
| MongoDB Atlas | M0 | $0/mes |
| **TOTAL** | | **$5/mes** |

### Límites del Plan Gratuito:
- **Vercel**: 100GB bandwidth, 1000 serverless functions
- **MongoDB Atlas**: 512MB storage, 100 conexiones
- **Railway**: $5 incluye recursos suficientes para beta testing

---

## 📞 SOPORTE

### Si tienes problemas:

1. **Verificar logs en Railway**: Dashboard > Logs
2. **Verificar logs en Vercel**: Dashboard > Functions
3. **Verificar variables de entorno**: Ambas plataformas
4. **Verificar health check**: `/api/health`

### Comandos útiles para debugging:
```bash
# Verificar backend
curl https://tu-dominio-railway.up.railway.app/api/health

# Verificar conexión desde frontend
# F12 > Network > Ver requests a API
``` 