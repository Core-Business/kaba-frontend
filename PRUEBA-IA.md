# 🤖 Guía de Prueba - Funcionalidades de IA en Objetivos

## ✅ **Configuración Completada**

Tu API Key de Google Gemini ya está configurada en:
- ✅ `kaba-frontend/.env.local`
- ✅ Variables de entorno cargadas
- ✅ Servicios reiniciados

## 🎯 **Cómo Probar las Funcionalidades**

### **1. Acceder a la Sección de Objetivos**

1. **Abrir el navegador**: http://localhost:9002
2. **Iniciar sesión** con tus credenciales
3. **Ir al Dashboard**
4. **Abrir un procedimiento** existente o crear uno nuevo
5. **Navegar a la sección "Objetivo"**

### **2. Probar "Editar con IA"**

**Requisitos**: Tener texto en el campo objetivo

1. **Escribir un objetivo básico**, por ejemplo:
   ```
   Mejorar el proceso de inventario
   ```

2. **Ajustar el slider** "Máximo de Palabras para IA" (10-100 palabras)

3. **Hacer clic en "Editar con IA"**

4. **Resultado esperado**: 
   - El texto se mejorará y expandirá
   - Aparecerá un toast de confirmación
   - Se habilitará el botón "Deshacer" (↶)

### **3. Probar "Generar con IA"**

**Requisitos**: Completar preguntas de ayuda

1. **Activar la sección de ayuda**:
   - Hacer clic en el switch "Ayuda para Redactar el Objetivo"

2. **Completar al menos un campo**, por ejemplo:
   ```
   Descripción general: Implementar un sistema de control de calidad
   Necesidad o problema: Reducir defectos en la producción
   Finalidad: Mejorar la satisfacción del cliente
   ```

3. **Hacer clic en "Generar Objetivo con IA"**

4. **Resultado esperado**:
   - Se generará un objetivo completo y profesional
   - Aparecerá un toast de confirmación
   - El texto se insertará en el campo objetivo

### **4. Funcionalidades Adicionales**

**Deshacer Cambios**:
- Usar el botón "↶" para revertir cambios de IA
- Solo disponible después de usar IA

**Auto-guardado**:
- Los cambios se guardan automáticamente cada 2 minutos
- También puedes usar "Guardar Objetivo" manualmente

## 🔍 **Verificación de Funcionamiento**

### **Indicadores de Éxito**

✅ **IA Configurada**: Ves el mensaje verde "Funcionalidades de IA Habilitadas"
✅ **Edición Funciona**: El botón "Editar con IA" mejora el texto
✅ **Generación Funciona**: El botón "Generar Objetivo con IA" crea contenido nuevo
✅ **Estados de Carga**: Los botones muestran "Editando..." o "Generando..."
✅ **Notificaciones**: Aparecen toasts de éxito o error
✅ **Deshacer**: El botón ↶ restaura el texto anterior

### **Posibles Problemas**

❌ **Error de API**: 
- **Síntoma**: Toast rojo "Error en Edición con IA"
- **Solución**: Verificar que la API key sea válida

❌ **Botones Deshabilitados**:
- **Síntoma**: Botones grises e inactivos
- **Solución**: Escribir texto para "Editar" o completar preguntas para "Generar"

❌ **Mensaje Amarillo**:
- **Síntoma**: "Para habilitar las funcionalidades de IA..."
- **Solución**: Reiniciar servidor después de configurar `.env.local`

## 🧪 **Casos de Prueba Sugeridos**

### **Caso 1: Edición Básica**
```
Texto inicial: "Controlar inventario"
Resultado esperado: Objetivo expandido y profesional
```

### **Caso 2: Generación Completa**
```
Preguntas completadas:
- Descripción: "Capacitar al personal en nuevas tecnologías"
- Necesidad: "Falta de conocimiento en herramientas digitales"
- Finalidad: "Aumentar la productividad del equipo"
- Audiencia: "Empleados del departamento de IT"

Resultado esperado: Objetivo estructurado y coherente
```

### **Caso 3: Flujo Completo**
1. Generar objetivo con IA
2. Editar el resultado con IA
3. Guardar manualmente
4. Verificar auto-guardado

## 📊 **Métricas de Calidad**

**Un buen objetivo generado por IA debe**:
- ✅ Iniciar con verbo en infinitivo
- ✅ Ser específico y claro
- ✅ Incluir propósito y beneficiarios
- ✅ Tener extensión apropiada (según slider)
- ✅ Usar lenguaje profesional

## 🎉 **¡Listo para Probar!**

Ahora puedes probar todas las funcionalidades de IA en la sección de objetivos. 

**URLs de acceso**:
- **Frontend**: http://localhost:9002
- **Sección Objetivo**: http://localhost:9002/builder/[poaId]/objective

**¡Disfruta explorando las capacidades de IA integradas en KABA Services!** 🚀 