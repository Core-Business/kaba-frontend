import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

export class CreateWorkspaceMembers1737768800004 implements MigrationInterface {
  name = 'CreateWorkspaceMembers1737768800004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workspace_member',
        columns: [
          {
            name: 'user_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'workspace_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['WORKSPACE_ADMIN', 'EDITOR', 'VIEWER'],
            isNullable: false,
          },
          {
            name: 'joined_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'expiration_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'workspace_member',
      new ForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_workspace_member_user',
      }),
    );

    await queryRunner.createForeignKey(
      'workspace_member',
      new ForeignKey({
        columnNames: ['workspace_id'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_workspace_member_workspace',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('workspace_member', 'FK_workspace_member_workspace');
    await queryRunner.dropForeignKey('workspace_member', 'FK_workspace_member_user');
    await queryRunner.dropTable('workspace_member');
  }
} 