import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'kaba_db',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: true,
});

async function createContactCenterWorkspace() {
  try {
    console.log('🔍 Inicializando conexión a la base de datos...');
    await AppDataSource.initialize();
    
    // 1. Encontrar el usuario test@kaba.com
    console.log('👤 Buscando usuario test@kaba.com...');
    const userQuery = `SELECT id, email, first_name, last_name FROM users WHERE email = 'test@kaba.com'`;
    const users = await AppDataSource.query(userQuery);
    
    if (users.length === 0) {
      console.error('❌ Usuario test@kaba.com no encontrado');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Usuario encontrado: ${user.first_name} ${user.last_name} (${user.email})`);
    console.log(`   User ID: ${user.id}`);
    
    // 2. Obtener la organización del usuario
    console.log('🏢 Obteniendo organización del usuario...');
    const orgQuery = `
      SELECT o.id, o.name 
      FROM organizations o
      JOIN org_member om ON o.id = om.organization_id  
      WHERE om.user_id = $1
    `;
    const orgs = await AppDataSource.query(orgQuery, [user.id]);
    
    if (orgs.length === 0) {
      console.error('❌ Usuario no tiene organización asignada');
      return;
    }
    
    const organization = orgs[0];
    console.log(`✅ Organización encontrada: ${organization.name}`);
    console.log(`   Organization ID: ${organization.id}`);
    
    // 3. Verificar si ya existe el workspace "Contact Center"
    console.log('🔍 Verificando si ya existe el workspace "Contact Center"...');
    const existingWsQuery = `
      SELECT id, name 
      FROM workspaces 
      WHERE organization_id = $1 AND name = 'Contact Center'
    `;
    const existingWorkspaces = await AppDataSource.query(existingWsQuery, [organization.id]);
    
    if (existingWorkspaces.length > 0) {
      console.log('⚠️  El workspace "Contact Center" ya existe');
      console.log(`   Workspace ID: ${existingWorkspaces[0].id}`);
      
      // Verificar si el usuario ya es miembro
      const memberQuery = `
        SELECT role, is_active 
        FROM workspace_member 
        WHERE user_id = $1 AND workspace_id = $2
      `;
      const memberships = await AppDataSource.query(memberQuery, [user.id, existingWorkspaces[0].id]);
      
      if (memberships.length === 0) {
        console.log('📝 Agregando usuario como WORKSPACE_ADMIN al workspace existente...');
        const addMemberQuery = `
          INSERT INTO workspace_member (user_id, workspace_id, role, is_active, joined_at)
          VALUES ($1, $2, 'WORKSPACE_ADMIN', true, NOW())
        `;
        await AppDataSource.query(addMemberQuery, [user.id, existingWorkspaces[0].id]);
        console.log('✅ Usuario agregado como WORKSPACE_ADMIN');
      } else {
        console.log(`✅ Usuario ya es miembro con rol: ${memberships[0].role}`);
      }
      return;
    }
    
    // 4. Crear el nuevo workspace "Contact Center"
    console.log('🏗️  Creando workspace "Contact Center"...');
    const createWsQuery = `
      INSERT INTO workspaces (name, organization_id, created_at, settings)
      VALUES ('Contact Center', $1, NOW(), '{"defaultProcedureTemplate": "iso9001", "autoNumbering": true, "exportFormats": ["pdf", "html"], "notifications": {"procedureUpdates": true, "workspaceInvites": true}}')
      RETURNING id, name
    `;
    const newWorkspaces = await AppDataSource.query(createWsQuery, [organization.id]);
    const newWorkspace = newWorkspaces[0];
    
    console.log(`✅ Workspace creado: ${newWorkspace.name}`);
    console.log(`   Workspace ID: ${newWorkspace.id}`);
    
    // 5. Asignar al usuario como WORKSPACE_ADMIN
    console.log('👑 Asignando usuario como WORKSPACE_ADMIN...');
    const addAdminQuery = `
      INSERT INTO workspace_member (user_id, workspace_id, role, is_active, joined_at)
      VALUES ($1, $2, 'WORKSPACE_ADMIN', true, NOW())
    `;
    await AppDataSource.query(addAdminQuery, [user.id, newWorkspace.id]);
    
    console.log('✅ Usuario asignado como WORKSPACE_ADMIN');
    
    // 6. Verificar el resultado final
    console.log('🔍 Verificando workspaces del usuario...');
    const finalQuery = `
      SELECT w.id, w.name, wm.role, wm.is_active
      FROM workspaces w
      JOIN workspace_member wm ON w.id = wm.workspace_id
      WHERE wm.user_id = $1 AND w.organization_id = $2
      ORDER BY w.name
    `;
    const userWorkspaces = await AppDataSource.query(finalQuery, [user.id, organization.id]);
    
    console.log('📋 Workspaces del usuario:');
    userWorkspaces.forEach((ws: any) => {
      console.log(`   - ${ws.name}: ${ws.role} (${ws.is_active ? 'activo' : 'inactivo'})`);
    });
    
    console.log('🎉 ¡Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Ejecutar el script
createContactCenterWorkspace(); 