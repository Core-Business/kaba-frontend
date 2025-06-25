#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patrones de archivos que NO deben existir en frontend
const FORBIDDEN_PATTERNS = [
  // Entidades TypeORM
  { pattern: /\.entity\.ts$/, message: 'Entidades TypeORM pertenecen al backend' },
  { pattern: /\.entity\.spec\.ts$/, message: 'Tests de entidades pertenecen al backend' },
  
  // Esquemas Mongoose
  { pattern: /\.schema\.ts$/, message: 'Esquemas Mongoose pertenecen al backend' },
  
  // Guards y Interceptors NestJS
  { pattern: /\.guard\.ts$/, message: 'Guards NestJS pertenecen al backend' },
  { pattern: /\.guard\.spec\.ts$/, message: 'Tests de guards pertenecen al backend' },
  { pattern: /\.interceptor\.ts$/, message: 'Interceptors NestJS pertenecen al backend' },
  { pattern: /\.interceptor\.spec\.ts$/, message: 'Tests de interceptors pertenecen al backend' },
  
  // Módulos NestJS
  { pattern: /\.module\.ts$/, message: 'Módulos NestJS pertenecen al backend (excepto /src/app/)' },
  
  // Migraciones de DB
  { pattern: /migrations\/.*\.ts$/, message: 'Migraciones de DB pertenecen al backend' },
  
  // Tests de integración backend
  { pattern: /\.integration\.spec\.ts$/, message: 'Tests de integración pertenecen al backend' },
];

// Directorios que NO deben existir en frontend
const FORBIDDEN_DIRECTORIES = [
  'src/modules',
  'src/enums', 
  'src/guards',
  'src/database',
  'src/common/interceptors'
];

// Archivos específicos que NO deben existir
const FORBIDDEN_FILES = [
  'src/auth/auth.controller.ts',
  'src/auth/jwt-contextual.service.ts'
];

function scanDirectory(dir, relativePath = '') {
  const violations = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Verificar directorios prohibidos
        if (FORBIDDEN_DIRECTORIES.includes(relativeItemPath)) {
          violations.push({
            type: 'directory',
            path: relativeItemPath,
            message: `Directorio '${relativeItemPath}' no debe existir en frontend`
          });
          continue; // No escanear dentro del directorio prohibido
        }
        
        // Escanear recursivamente
        violations.push(...scanDirectory(fullPath, relativeItemPath));
      } else {
        // Verificar archivos específicos prohibidos
        if (FORBIDDEN_FILES.includes(relativeItemPath)) {
          violations.push({
            type: 'file',
            path: relativeItemPath,
            message: `Archivo específico de backend: ${relativeItemPath}`
          });
          continue;
        }
        
        // Verificar patrones de archivos prohibidos
        for (const { pattern, message } of FORBIDDEN_PATTERNS) {
          if (pattern.test(item)) {
            // Excepción para módulos en /src/app/ (Next.js)
            if (item.endsWith('.module.ts') && relativeItemPath.startsWith('src/app/')) {
              continue;
            }
            
            violations.push({
              type: 'pattern',
              path: relativeItemPath,
              pattern: pattern.toString(),
              message
            });
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error escaneando ${dir}:`, error.message);
  }
  
  return violations;
}

function checkPackageJson() {
  const violations = [];
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Dependencias que NO deben estar en frontend
    const forbiddenDeps = [
      '@nestjs/common',
      '@nestjs/core', 
      '@nestjs/typeorm',
      '@nestjs/mongoose',
      'typeorm',
      'mongoose',
      'pg',
      'mysql2'
    ];
    
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    for (const dep of forbiddenDeps) {
      if (allDeps[dep]) {
        violations.push({
          type: 'dependency',
          path: 'package.json',
          message: `Dependencia de backend '${dep}' no debe estar en frontend`
        });
      }
    }
  } catch (error) {
    console.error('Error verificando package.json:', error.message);
  }
  
  return violations;
}

function main() {
  console.log('🔍 Verificando arquitectura frontend...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  const violations = [
    ...scanDirectory(srcPath, 'src'),
    ...checkPackageJson()
  ];
  
  if (violations.length === 0) {
    console.log('✅ Arquitectura frontend correcta - No se encontraron archivos de backend');
    process.exit(0);
  }
  
  console.log(`❌ Se encontraron ${violations.length} violaciones de arquitectura:\n`);
  
  violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.path}`);
    console.log(`   ${violation.message}`);
    if (violation.pattern) {
      console.log(`   Patrón: ${violation.pattern}`);
    }
    console.log('');
  });
  
  console.log('🔧 Soluciones sugeridas:');
  console.log('- Mover archivos .entity.ts al backend (kaba-backend/src/modules/)');
  console.log('- Mover archivos .schema.ts al backend (kaba-backend/src/procedures/schemas/)');
  console.log('- Mover guards/interceptors al backend (kaba-backend/src/common/)');
  console.log('- Crear interfaces TypeScript en frontend (/src/types/) si necesitas tipos');
  console.log('- Usar API calls en lugar de imports directos del backend\n');
  
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, checkPackageJson }; 