# 🏗️ Guía de Arquitectura KABA - Frontend vs Backend

**Objetivo**: Mantener separación clara entre frontend (Next.js) y backend (NestJS)

---

## 📋 **Reglas de Oro**

### ✅ **Frontend (kaba-frontend) - PUEDE tener:**
```
src/
├── api/              ← Clientes HTTP para comunicarse con backend
├── components/       ← Componentes React/UI
├── hooks/            ← React hooks personalizados
├── contexts/         ← React contexts
├── app/              ← Páginas Next.js (routing)
├── lib/              ← Utilidades frontend (validaciones, formateo)
├── types/            ← Interfaces TypeScript (NO entidades)
└── middleware/       ← Middleware Next.js (NO NestJS interceptors)
```

### ❌ **Frontend - NO DEBE tener:**
```
❌ src/modules/       ← Entidades TypeORM van al backend
❌ src/enums/         ← Enums de DB van al backend  
❌ src/guards/        ← Guards NestJS van al backend
❌ src/database/      ← Migraciones van al backend
❌ src/procedures/schemas/ ← Esquemas Mongoose van al backend
❌ src/common/interceptors/ ← Interceptors NestJS van al backend
❌ archivos *.entity.ts ← TypeORM entities
❌ archivos *.schema.ts ← Mongoose schemas
❌ archivos *.guard.ts ← NestJS guards
❌ archivos *.interceptor.ts ← NestJS interceptors
❌ archivos *.module.ts ← NestJS modules (excepto Next.js)
❌ archivos *.integration.spec.ts ← Tests de integración backend
```

---

## 🎯 **Backend (kaba-backend) - Estructura Correcta**
```
src/
├── modules/          ← Entidades TypeORM + Módulos NestJS
├── auth/             ← Servicios autenticación + Controllers
├── common/           ← Interceptors, Guards, Pipes
├── procedures/       ← Esquemas MongoDB + Services
├── database/         ← Migraciones PostgreSQL + MongoDB
├── guards/           ← Guards multi-tenant
├── enums/            ← Enums compartidos (roles, estados)
└── users/            ← Módulo usuarios
```

---

## 🔄 **Comunicación Frontend ↔ Backend**

### ✅ **Forma CORRECTA:**
```typescript
// Frontend: src/api/procedures.ts
export const proceduresApi = {
  async getAll(): Promise<Procedure[]> {
    const response = await fetch('/api/procedures', {
      headers: {
        'X-Organization-Id': orgId,
        'X-Workspace-Id': workspaceId
      }
    });
    return response.json();
  }
};

// Frontend: src/types/procedure.ts
export interface Procedure {
  id: string;
  title: string;
  status: 'draft' | 'published';
  // Solo propiedades necesarias para UI
}
```

### ❌ **Forma INCORRECTA:**
```typescript
// ❌ NO hacer esto en frontend:
import { ProcedureEntity } from '../modules/procedures/procedure.entity';
import { ProcedureService } from '../procedures/procedures.service';
```

---

## 🛡️ **Validaciones Automáticas**

### **ESLint Rules**
```javascript
// .eslintrc.architecture.js
'no-restricted-imports': [
  'error',
  {
    patterns: [
      '@nestjs/*',      // ❌ No NestJS en frontend
      'typeorm',        // ❌ No TypeORM en frontend  
      'mongoose',       // ❌ No Mongoose en frontend
      '**/*.entity.ts', // ❌ No entidades en frontend
      '**/*.schema.ts'  // ❌ No esquemas en frontend
    ]
  }
]
```

### **Scripts de Validación**
```bash
npm run validate:architecture  # Verificar arquitectura
npm run check:backend-files    # Detectar archivos backend en frontend
npm run pre-commit             # Validación completa pre-commit
```

---

## 📦 **Dependencias Permitidas**

### **Frontend package.json - ✅ PERMITIDAS:**
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^18.x", 
    "axios": "^1.x",
    "@tanstack/react-query": "^5.x",
    "zod": "^3.x",
    "tailwindcss": "^3.x"
  }
}
```

### **Frontend package.json - ❌ PROHIBIDAS:**
```json
{
  "dependencies": {
    "@nestjs/common": "❌ Backend only",
    "@nestjs/typeorm": "❌ Backend only",
    "typeorm": "❌ Backend only",
    "mongoose": "❌ Backend only",
    "pg": "❌ Backend only"
  }
}
```

---

## 🔍 **Checklist Pre-Commit**

Antes de hacer commit, verificar:

- [ ] ✅ No hay archivos `*.entity.ts` en frontend
- [ ] ✅ No hay archivos `*.schema.ts` en frontend  
- [ ] ✅ No hay directorios `src/modules/` en frontend
- [ ] ✅ No hay imports de `@nestjs/*` en frontend
- [ ] ✅ No hay imports de `typeorm` o `mongoose` en frontend
- [ ] ✅ Ejecutar `npm run validate:architecture` sin errores
- [ ] ✅ Backend tiene todos los archivos necesarios

---

## 🚨 **Señales de Alerta**

Si ves esto en **frontend**, es un ERROR:

```typescript
❌ import { Injectable } from '@nestjs/common';
❌ import { Entity, Column } from 'typeorm';
❌ import { Schema, Prop } from '@nestjs/mongoose';
❌ import { CanActivate } from '@nestjs/common';
❌ import { NestInterceptor } from '@nestjs/common';
```

### **Solución:**
1. Mover archivo al backend correspondiente
2. Crear interface TypeScript en frontend si necesitas tipos
3. Usar API calls para comunicación

---

## 📚 **Ejemplos de Refactoring**

### **Antes (INCORRECTO):**
```typescript
// frontend/src/modules/user/user.entity.ts ❌
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  email: string;
}
```

### **Después (CORRECTO):**
```typescript
// backend/src/users/entities/user.entity.ts ✅
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  email: string;
}

// frontend/src/types/user.ts ✅
export interface User {
  id: string;
  email: string;
}
```

---

## 🎯 **Responsabilidades por Capa**

| Responsabilidad | Frontend | Backend |
|----------------|----------|---------|
| **UI/UX** | ✅ React components | ❌ |
| **Validación formularios** | ✅ Zod schemas | ❌ |
| **Estado global** | ✅ React Context | ❌ |
| **Routing** | ✅ Next.js router | ❌ |
| **Entidades DB** | ❌ | ✅ TypeORM entities |
| **Esquemas Mongo** | ❌ | ✅ Mongoose schemas |
| **Business logic** | ❌ | ✅ Services |
| **Autenticación** | ❌ | ✅ Guards + JWT |
| **Validación datos** | ❌ | ✅ DTOs + Pipes |
| **Base de datos** | ❌ | ✅ Repositories |

---

**🏆 Mantener esta separación garantiza código limpio, mantenible y escalable.** 