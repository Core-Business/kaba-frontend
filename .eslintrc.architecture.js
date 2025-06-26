module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Prevenir imports de backend en frontend
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@nestjs/*'],
            message: '❌ ARQUITECTURA: No importar dependencias NestJS en frontend. Usar API calls en su lugar.'
          },
          {
            group: ['typeorm', 'typeorm/*'],
            message: '❌ ARQUITECTURA: No usar TypeORM en frontend. Las entidades pertenecen al backend.'
          },
          {
            group: ['mongoose', 'mongoose/*'],
            message: '❌ ARQUITECTURA: No usar Mongoose en frontend. Los esquemas pertenecen al backend.'
          },
          {
            group: ['**/modules/**/*.entity.ts'],
            message: '❌ ARQUITECTURA: Las entidades TypeORM pertenecen al backend. Usar tipos TypeScript en su lugar.'
          },
          {
            group: ['**/schemas/**/*.schema.ts'],
            message: '❌ ARQUITECTURA: Los esquemas Mongoose pertenecen al backend. Usar interfaces TypeScript en su lugar.'
          },
          {
            group: ['**/guards/**'],
            message: '❌ ARQUITECTURA: Los Guards NestJS pertenecen al backend. La validación se hace en el servidor.'
          },
          {
            group: ['**/interceptors/**'],
            message: '❌ ARQUITECTURA: Los Interceptors NestJS pertenecen al backend. Usar middleware de Next.js si necesario.'
          },
          {
            group: ['**/migrations/**'],
            message: '❌ ARQUITECTURA: Las migraciones de DB pertenecen al backend. El frontend no maneja base de datos.'
          }
        ]
      }
    ],
    
    // Prevenir creación de archivos backend en frontend
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ImportDeclaration[source.value=/\\.entity$/]',
        message: '❌ ARQUITECTURA: Archivos .entity.ts pertenecen al backend. Usar interfaces en /types/'
      },
      {
        selector: 'ImportDeclaration[source.value=/\\.schema$/]',
        message: '❌ ARQUITECTURA: Archivos .schema.ts pertenecen al backend. Usar interfaces en /types/'
      },
      {
        selector: 'ImportDeclaration[source.value=/\\.guard$/]',
        message: '❌ ARQUITECTURA: Archivos .guard.ts pertenecen al backend. Usar middleware de Next.js'
      },
      {
        selector: 'ImportDeclaration[source.value=/\\.interceptor$/]',
        message: '❌ ARQUITECTURA: Archivos .interceptor.ts pertenecen al backend. Usar middleware de Next.js'
      }
    ]
  }
}; 