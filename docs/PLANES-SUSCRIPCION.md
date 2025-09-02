## Planes de Suscripción — Kaba

Última actualización: 2025-08-14

Kaba es una plataforma multi-tenant para creación, gestión y control de Procedimientos (POA) con módulos de aprobaciones, anexos, control de cambios, definiciones, referencias, registros, responsabilidades y generación de contenido asistida por IA.

A continuación, se presenta la propuesta de paquetes Starter, Profesional y Enterprise, alineada con las capacidades actuales del sistema y pensada para escalar con organizaciones de distintos tamaños.

### Resumen rápido
- **Starter**: Para equipos pequeños que inician su formalización de procesos.
- **Profesional**: Para áreas operativas con múltiples equipos y mayores necesidades de control.
- **Enterprise**: Para organizaciones con requerimientos avanzados, gobierno, y escalamiento alto.

### Tabla comparativa

| Característica | Starter | Profesional | Enterprise |
|---|---:|---:|---:|
| Organizaciones incluidas | 1 | 3 | Ilimitadas |
| Workspaces por organización | 1 | 5 | Ilimitados |
| Usuarios por workspace | 5 | 50 | Ilimitados |
| Procedimientos (POA) activos por workspace | 10 | 200 | Ilimitados |
| Módulos POA (intro, objetivo, alcance, definiciones, responsabilidades, referencias, registros, anexos, aprobaciones, control de cambios, actividades, documento/encabezado) | Sí | Sí | Sí |
| Aprobaciones | 1 flujo, hasta 3 aprobadores | Flujos múltiples, hasta 10 aprobadores | Flujos avanzados, sin límite práctico |
| Control de cambios | Básico | Avanzado con reportes | Completo + retención extendida |
| Generación de contenido con IA (créditos/mes) | 200 | 1,500 | 10,000+ (ampliables) |
| Exportación | HTML | HTML + paquete con anexos | HTML + APIs de exportación |
| Almacenamiento de anexos | 5 GB | 50 GB | 500 GB (ampliables) |
| Tamaño máximo por archivo | 25 MB | 100 MB | 500 MB |
| Auditoría y trazabilidad | Básica, retención 6 meses | Completa, retención 24 meses | Avanzada, retención 84 meses |
| Seguridad multi-tenant (aislamiento por organización/workspace) | Sí | Sí | Sí |
| Dominio personalizado | — | Opcional | Incluido |
| Soporte | Email (respuesta 48 h) | Email/Chat 8x5 (respuesta 8 h) | 24/7 con SLA |
| SLA objetivo | 99.5% | 99.9% | 99.95% |

Notas:
- “Créditos IA” se refieren a invocaciones a asistentes de texto (por ejemplo: introducción, objetivo, alcance, actividades, mejoras de redacción).
- Exportación HTML soporta la descarga del contenido del POA; los anexos se incluyen en Profesional/Enterprise como paquete.
- Límites marcados como “ilimitado(s)” aplican bajo uso razonable. Se pueden establecer topes suaves para proteger estabilidad.

### Detalle por plan

#### Starter
Pensado para equipos pequeños o pilotos controlados.

- **Incluye**:
  - 1 organización, 1 workspace, 5 usuarios por workspace.
  - Todos los módulos de POA (incluyendo aprobaciones y control de cambios en modalidad básica).
  - 200 créditos de IA/mes.
  - Exportación a **HTML**.
  - 5 GB de almacenamiento, hasta 25 MB por archivo.
  - Auditoría básica con retención de 6 meses.
  - Soporte por email con respuesta en 48 horas.
- **Límites**:
  - 10 POA activos por workspace.
  - 1 flujo de aprobación por documento, hasta 3 aprobadores.
- **Uso recomendado**: validación del proceso, equipos de hasta 5-10 personas, primeras implantaciones.

#### Profesional
Diseñado para áreas con múltiples equipos y necesidades de control operativo más robustas.

- **Incluye**:
  - Hasta 3 organizaciones, 5 workspaces por organización, 50 usuarios por workspace.
  - Todos los módulos de POA con control de cambios avanzado y reportes.
  - 1,500 créditos de IA/mes.
  - Exportación a **HTML** + paquete con anexos.
  - 50 GB de almacenamiento, hasta 100 MB por archivo.
  - Auditoría completa con retención de 24 meses.
  - Dominio personalizado opcional.
  - Soporte por email/chat 8x5 con respuesta objetivo de 8 horas.
- **Límites**:
  - 200 POA activos por workspace.
  - Flujos de aprobación múltiples por documento, hasta 10 aprobadores.
- **Uso recomendado**: equipos multi-área, cumplimiento interno, operación con varios procesos en paralelo.

#### Enterprise
Para organizaciones con requerimientos de escala, gobierno y soporte extendido.

- **Incluye**:
  - Organizaciones, workspaces y usuarios ilimitados (bajo uso razonable).
  - Todos los módulos de POA, políticas y reportes avanzados.
  - 10,000+ créditos de IA/mes (ampliables por contrato).
  - Exportación **HTML** y APIs de exportación/integación.
  - 500 GB de almacenamiento (ampliables), hasta 500 MB por archivo.
  - Auditoría y trazabilidad avanzadas con retención de 84 meses.
  - Dominio personalizado incluido.
  - Soporte 24/7 con SLA y gestor técnico dedicado.
- **Límites**:
  - Sin límites prácticos predefinidos; se ajustan por contrato y monitoreo de uso.
- **Uso recomendado**: múltiples filiales o líneas de negocio, requisitos de auditoría prolongada, integración extendida.

### Precios sugeridos

Los siguientes montos son orientativos en MXN y pueden ajustarse conforme a costos de infraestructura, soporte y demanda. Se recomiendan descuentos por contratación anual.

- **Starter**: $1,999 MXN/mes (o $19,990 MXN/año, ~17% descuento)
- **Profesional**: $7,999 MXN/mes (o $79,990 MXN/año, ~17% descuento)
- **Enterprise**: a cotizar (según volumen, SLA y add-ons)

### Add-ons (opcionales)
- **Créditos IA adicionales**: bloques de 1,000 por $1,200 MXN/mes.
- **Almacenamiento adicional**: +100 GB por $1,200 MXN/mes.
- **Dominio personalizado (Starter/Profesional)**: $299 MXN/mes.
- **Onboarding/capacitación**: paquetes desde $9,900 MXN (sesiones remotas).

### Aspectos técnicos relevantes (alineados al producto)
- **Multi-tenant**: aislamiento por organización y workspace, con contexto JWT y políticas de acceso por rol.
- **Módulos**: introducción, objetivo, alcance, definiciones, responsabilidades, referencias, registros, anexos, aprobaciones, control de cambios, actividades, documento/encabezado.
- **Anexos**: almacenamiento de archivos con cuotas y límites de tamaño por plan.
- **Exportación**: soporte a HTML; en Profesional y Enterprise se agrega paquete con anexos y en Enterprise APIs.
- **Auditoría**: registro de eventos y retención por plan.
- **IA**: generación asistida de contenidos del POA (nombres de actividades, objetivos, alcance, introducciones, mejoras de texto).

### Políticas y condiciones
- Los límites indicados aplican a **POA activos**. Los documentos archivados no consumen cuota activa.
- Los créditos de IA no son acumulables entre meses, salvo acuerdo específico.
- El SLA es objetivo y se formaliza en el contrato para Profesional/Enterprise.
- Precios y características pueden cambiar con notificación previa.

Si necesitas adaptar los límites o incluir integraciones específicas, podemos preparar una versión personalizada de este documento.
