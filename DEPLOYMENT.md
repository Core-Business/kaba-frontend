# 🚀 GUÍA DE DESPLIEGUE BETA - KABA PLATFORM

## 📋 Resumen

Esta guía te ayudará a desplegar KABA Platform en un servidor para testing beta con un grupo reducido de usuarios.

## 🔧 Requisitos Previos

### Sistema Operativo
- **Linux** (Ubuntu 20.04+ recomendado)
- **macOS** (para desarrollo/testing local)

### Software Requerido
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **OpenSSL** (para generar secrets)

### Recursos Mínimos del Servidor
- **RAM**: 4GB mínimo, 8GB recomendado
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **Disco**: 50GB mínimo, 100GB recomendado
- **Puertos**: 80, 443, 3000, 9002

## 🚀 Proceso de Despliegue

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios de grupo
exit
```

### 2. Clonar el Repositorio

```bash
# Clonar ambos repositorios
git clone [URL_REPOSITORIO_BACKEND] kaba-backend
git clone [URL_REPOSITORIO_FRONTEND] kaba-frontend

# Crear estructura de proyecto
mkdir kaba-platform
cd kaba-platform
mv ../kaba-backend ./
mv ../kaba-frontend ./
```

### 3. Configurar Variables de Entorno

#### Backend (.env)
```bash
# Copiar template y editar
cp kaba-backend/production.env.template .env

# Generar JWT secret seguro
openssl rand -hex 32

# Editar el archivo .env
nano .env
```

**Configuración mínima requerida:**
```env
# CRITICAL - Cambiar estos valores
JWT_SECRET=tu_jwt_secret_generado_con_openssl
POSTGRES_PASSWORD=tu_password_postgres_seguro
MONGO_PASSWORD=tu_password_mongo_seguro
MINIO_SECRET_KEY=tu_password_minio_seguro

# URLs (ajustar según tu dominio)
NEXT_PUBLIC_API_BASE_URL=http://tu-dominio.com/api

# OPCIONAL - Para funcionalidades de IA
GOOGLE_API_KEY=tu_google_api_key
```

#### Frontend (.env.local)
```bash
# Copiar template y editar
cp kaba-frontend/production.env.template kaba-frontend/.env.local

# Editar con tu dominio
nano kaba-frontend/.env.local
```

**Configuración:**
```env
NEXT_PUBLIC_API_BASE_URL=http://tu-dominio.com/api
GOOGLE_API_KEY=tu_google_api_key
```

### 4. Ejecutar el Despliegue

```bash
# Construir y ejecutar todos los servicios
docker-compose -f docker-compose.production.yml up -d

# Ver logs para verificar que todo funciona
docker-compose -f docker-compose.production.yml logs -f
```

### 5. Verificar el Despliegue

```bash
# Verificar que todos los servicios estén running
docker-compose -f docker-compose.production.yml ps

# Verificar health checks
curl http://localhost/api/health

# Verificar frontend
curl http://localhost/
```

## 🔍 Verificaciones Post-Despliegue

### 1. Health Checks
```bash
# Backend health
curl http://tu-dominio.com/api/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "database": "configured",
    "mongodb": "configured",
    "auth": "configured"
  }
}
```

### 2. Crear Usuario de Prueba
```bash
# Acceder al contenedor del backend
docker exec -it kaba-backend /bin/sh

# Ejecutar setup inicial
npm run setup:kaba-default
```

### 3. Probar Login
1. Ir a `http://tu-dominio.com`
2. Crear cuenta nueva
3. Verificar que el login funciona
4. Probar crear un POA básico

## 📊 Monitoreo Básico

### Logs del Sistema
```bash
# Ver logs de todos los servicios
docker-compose -f docker-compose.production.yml logs -f

# Ver logs específicos
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Estado de Servicios
```bash
# Ver estado de contenedores
docker-compose -f docker-compose.production.yml ps

# Ver uso de recursos
docker stats
```

### Backups Básicos
```bash
# Crear directorio de backups
mkdir -p backups

# Backup de PostgreSQL
docker exec kaba-postgres pg_dump -U postgres kaba_db > backups/postgres_$(date +%Y%m%d_%H%M%S).sql

# Backup de MongoDB
docker exec kaba-mongodb mongodump --db kaba --out /backups/mongo_$(date +%Y%m%d_%H%M%S)
```

## 🚨 Solución de Problemas

### Problema: Backend no inicia
```bash
# Revisar logs del backend
docker-compose -f docker-compose.production.yml logs backend

# Verificar variables de entorno
docker exec kaba-backend env | grep -E "(JWT_SECRET|POSTGRES_URL|MONGODB_URI)"
```

### Problema: Frontend no conecta con Backend
```bash
# Verificar configuración del frontend
docker exec kaba-frontend env | grep NEXT_PUBLIC_API_BASE_URL

# Verificar conectividad
docker exec kaba-frontend curl -f http://backend:3000/api/health
```

### Problema: Base de datos no conecta
```bash
# Verificar PostgreSQL
docker exec kaba-postgres pg_isready -U postgres

# Verificar MongoDB
docker exec kaba-mongodb mongosh --eval "db.adminCommand('ping')"
```

## 🔐 Seguridad Básica

### Firewall
```bash
# Configurar UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### SSL/HTTPS (Opcional para Beta)
```bash
# Instalar Certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Actualizar nginx.conf para usar SSL
```

## 👥 Gestión de Usuarios Beta

### Invitar Usuarios
1. Acceder al sistema como administrador
2. Ir a configuración de workspace
3. Invitar usuarios por email
4. Compartir URL: `http://tu-dominio.com`

### Crear Usuarios de Prueba
```bash
# Conectar a PostgreSQL
docker exec -it kaba-postgres psql -U postgres -d kaba_db

# Listar usuarios
SELECT id, email, "firstName", "lastName" FROM users;

# Verificar organizaciones
SELECT id, name FROM organizations;
```

## 📈 Métricas de Éxito

### KPIs a Monitorear
- **Usuarios registrados**: Meta inicial 10-20 usuarios
- **POAs creados**: Meta inicial 5-10 POAs
- **Tiempo de respuesta**: < 3 segundos
- **Errores**: < 5% de requests
- **Disponibilidad**: > 95%

### Recolección de Feedback
1. **Crear canal de feedback** (email, Slack, etc.)
2. **Documentar bugs** reportados
3. **Recopilar sugerencias** de UX
4. **Medir tiempos** de creación de POAs

## 🔄 Actualizaciones

### Actualizar la Aplicación
```bash
# Detener servicios
docker-compose -f docker-compose.production.yml down

# Actualizar código
cd kaba-backend && git pull origin main
cd ../kaba-frontend && git pull origin main

# Reconstruir y ejecutar
docker-compose -f docker-compose.production.yml up -d --build
```

### Rollback (si algo sale mal)
```bash
# Volver a versión anterior
git checkout [commit-hash-anterior]
docker-compose -f docker-compose.production.yml up -d --build
```

## 📞 Soporte y Contacto

### En caso de problemas críticos:
1. **Revisar logs** con los comandos de arriba
2. **Verificar health checks**
3. **Crear backup** antes de hacer cambios
4. **Contactar al equipo de desarrollo**

### Información del Sistema
```bash
# Información útil para soporte
echo "=== SYSTEM INFO ==="
uname -a
docker --version
docker-compose --version
curl -s http://localhost/api/health | jq .
```

---

**🎉 ¡Despliegue completado!** 

Tu plataforma KABA está lista para testing beta. Comparte la URL con tus testers y comienza a recopilar feedback.

**URL de acceso**: `http://tu-dominio.com`
**Panel de administración**: `http://tu-dominio.com/api/docs` 