import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableRLS1737768800005 implements MigrationInterface {
  name = 'EnableRLS1737768800005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable Row Level Security on workspaces table
    await queryRunner.query('ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY');

    // Create RLS policy for organization scope
    await queryRunner.query(`
      CREATE POLICY org_scope_ws
        ON workspaces
        USING (organization_id = current_setting('app.current_org_id')::uuid)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policy
    await queryRunner.query('DROP POLICY IF EXISTS org_scope_ws ON workspaces');
    
    // Disable Row Level Security
    await queryRunner.query('ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY');
  }
} 