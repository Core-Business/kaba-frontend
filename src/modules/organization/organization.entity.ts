import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Workspace } from '../workspace/workspace.entity';
import { OrgMember } from './org-member.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: ['COMPANY', 'CONSULTANCY'],
    nullable: true,
  })
  type!: 'COMPANY' | 'CONSULTANCY';

  @Column({ type: 'jsonb', nullable: true })
  branding!: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => Workspace, (workspace) => workspace.organization)
  workspaces!: Workspace[];

  @OneToMany(() => OrgMember, (orgMember) => orgMember.organization)
  members!: OrgMember[];
} 