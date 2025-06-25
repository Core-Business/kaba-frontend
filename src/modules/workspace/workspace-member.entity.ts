import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workspace } from './workspace.entity';
import { WorkspaceRole } from '../../enums/workspace-role.enum';

@Entity('workspace_member')
export class WorkspaceMember {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  workspace_id!: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
  })
  role!: WorkspaceRole;

  @CreateDateColumn()
  joined_at!: Date;

  @Column({ type: 'date', nullable: true })
  expiration_date!: Date | null;

  @Column({ default: true })
  is_active!: boolean;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.members)
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;
} 