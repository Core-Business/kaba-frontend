# Debug: AI Response No Se Inserta

## Diagnóstico Paso a Paso

### 1. Abrir Consola del Navegador

1. Abre las DevTools (F12 o Cmd+Option+I en Mac)
2. Ve a la pestaña "Console"
3. Ve a la pestaña "Network"

### 2. Verificar Request/Response

1. En el frontend, haz clic en "Generar Objetivo" (o cualquier botón de AI)
2. En la pestaña Network, busca la request a `/api/ai/generate-objective`
3. Haz clic en esa request y verifica:

   **a) Request Headers:**
   - ¿Tiene `Authorization: Bearer <token>`?
   - ¿Tiene `X-Organization-Id` y `X-Workspace-Id`?

   **b) Request Payload:**
   - ¿Se están enviando los datos correctos?

   **c) Response:**
   - ¿Cuál es el status code? (debería ser 200)
   - ¿Cuál es el body de la respuesta?

   **IMPORTANTE:** Copia el body de la respuesta exactamente como aparece.

### 3. Verificar en Console

Pega este código en la consola del navegador para inspeccionar:

```javascript
// Ver el estado actual del POA
const poaContext = document.querySelector('[data-poa-context]');
console.log('POA Context:', poaContext);

// Interceptar la próxima llamada a AI
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (args[0].includes('/ai/')) {
    const clone = response.clone();
    const data = await clone.json();
    console.log('=== AI RESPONSE ===');
    console.log('URL:', args[0]);
    console.log('Response Data:', data);
    console.log('Response Type:', typeof data);
    console.log('Response Keys:', Object.keys(data));
    console.log('==================');
  }
  return response;
};

console.log('Fetch interceptor instalado. Ahora haz clic en un botón de AI.');
```

### 4. Verificar Errores Silenciosos

Agrega temporalmente esto en `objective-form-enhanced.tsx` línea 156:

```typescript
const result = await aiApi.generateObjective({...});
console.log('=== RESULT FROM BACKEND ===');
console.log('Full result:', result);
console.log('result.objective:', result.objective);
console.log('typeof result:', typeof result);
console.log('Keys:', Object.keys(result));
console.log('==========================');

updateField("objective", result.objective);
```

### 5. Verificar updateField

Agrega temporalmente en el mismo archivo línea 156:

```typescript
console.log('=== BEFORE UPDATE ===');
console.log('Current objective:', poa?.objective);
console.log('New objective:', result.objective);
updateField("objective", result.objective);
console.log('=== AFTER UPDATE (should trigger re-render) ===');
```

### 6. Posibles Problemas Comunes

#### Problema A: Backend devuelve objeto con estructura diferente

Si el backend devuelve algo como:
```json
{
  "data": {
    "objective": "..."
  }
}
```

En lugar de:
```json
{
  "objective": "..."
}
```

**Solución temporal en `/src/api/ai.ts` línea 102:**
```typescript
generateObjective: async (data: GenerateObjectiveRequest): Promise<GenerateObjectiveResponse> => {
  const response = await api.post('/ai/generate-objective', data);
  console.log('Raw response:', response);
  console.log('Response data:', response.data);

  // Si el backend envuelve la respuesta en un campo 'data'
  if (response.data.data) {
    return response.data.data;
  }

  return response.data;
},
```

#### Problema B: Error 401/403 (No autorizado)

Verifica en Network:
- Si ves status 401 → Token expirado, vuelve a hacer login
- Si ves status 403 → Problema de permisos/workspace

#### Problema C: CORS

Si ves en console:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/ai/...' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

**Solución:** Verificar en backend que CORS esté habilitado para localhost:3001

#### Problema D: updateField no actualiza

Si los logs muestran que `result.objective` tiene valor pero no se actualiza el UI:

**Verifica en POAProvider:**
1. Que el POAProvider envuelve correctamente la página
2. Que no hay múltiples POAProviders anidados

### 7. Test Manual del Backend

Desde la terminal, verifica que el backend responde correctamente:

```bash
# 1. Hacer login y obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@test.com","password":"tu-password"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# 2. Test generate-objective
curl -X POST http://localhost:3000/api/ai/generate-objective \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Organization-Id: tu-org-id" \
  -H "X-Workspace-Id: tu-ws-id" \
  -d '{
    "procedureName": "Test Procedure",
    "companyName": "Test Company"
  }' | jq .
```

Si esto funciona, el problema está en el frontend.
Si esto falla, el problema está en el backend.

---

## Reporte de Bug

Por favor reporta:

1. **Status code de la response:** ___
2. **Body exacto de la response:**
```json

```
3. **Logs de la consola:**
```

```
4. **¿Aparece algún toast de error?** Sí/No - Mensaje: ___
5. **¿El campo `poa.objective` tiene el valor antes de llamar a AI?** Sí/No
6. **¿Qué navegador usas?** ___
