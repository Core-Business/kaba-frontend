import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';
import { OrganizationRole } from '../../enums/organization-role.enum';

@Entity('org_member')
@Unique('one_org_per_user', ['user_id'])
export class OrgMember {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  organization_id!: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
  })
  role!: OrganizationRole;

  @CreateDateColumn()
  joined_at!: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Organization, (organization) => organization.members)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
} 