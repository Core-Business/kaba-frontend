import { MigrationInterface, QueryRunner, Table, ForeignKey, Index } from 'typeorm';

export class CreateOrgMembers1737768800003 implements MigrationInterface {
  name = 'CreateOrgMembers1737768800003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'org_member',
        columns: [
          {
            name: 'user_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['OWNER', 'ORG_ADMIN', 'ORG_MEMBER'],
            isNullable: false,
          },
          {
            name: 'joined_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'org_member',
      new ForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_org_member_user',
      }),
    );

    await queryRunner.createForeignKey(
      'org_member',
      new ForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_org_member_organization',
      }),
    );

    // Add unique constraint: one organization per user
    await queryRunner.createIndex(
      'org_member',
      new Index({
        name: 'one_org_per_user',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('org_member', 'one_org_per_user');
    await queryRunner.dropForeignKey('org_member', 'FK_org_member_organization');
    await queryRunner.dropForeignKey('org_member', 'FK_org_member_user');
    await queryRunner.dropTable('org_member');
  }
} 