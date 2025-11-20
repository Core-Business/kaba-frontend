# `/frontend-full` – Iniciar frontend + backend juntos

## Objetivo

Levantar el backend y el frontend en modo desarrollo usando el script `dev:full` del frontend.

## Pasos

1. Ir al directorio del frontend:

   ```bash
   cd /Users/mariorgzr/kaba/kaba-frontend
   ```

2. Opcional: levantar Postgres, MongoDB y Minio con Docker (si no están ya corriendo):

   ```bash
   docker compose up -d postgres mongodb minio
   ```

3. Iniciar backend + frontend en paralelo:

   ```bash
   npm run dev:full
   ```

4. Abrir el navegador en:

   - Backend Swagger: `http://localhost:3000/api/docs`
   - Frontend: `http://localhost:9002`


