import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from '../modules/workspace/workspace-member.entity';
import { Workspace } from '../modules/workspace/workspace.entity';

interface TenantRequest {
  user?: {
    id: string;
    email: string;
  };
  headers: {
    'x-organization-id'?: string;
    'x-workspace-id'?: string;
  };
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if RLS is enabled
    const rlsEnabled = this.configService.get<boolean>('ENABLE_RLS', false);
    if (!rlsEnabled) {
      return true; // Skip validation if RLS is disabled
    }

    const request = context.switchToHttp().getRequest<TenantRequest>();
    const user = request.user;
    const organizationId = request.headers['x-organization-id'];
    const workspaceId = request.headers['x-workspace-id'];

    // Validate user is authenticated
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Validate required headers
    if (!organizationId || !workspaceId) {
      throw new ForbiddenException(
        'Headers X-Organization-Id y X-Workspace-Id son requeridos',
      );
    }

    // Validate workspace belongs to organization
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        organization_id: organizationId,
      },
    });

    if (!workspace) {
      throw new ForbiddenException(
        'Workspace no pertenece a la organización especificada',
      );
    }

    // Validate user has access to workspace
    const membership = await this.workspaceMemberRepository.findOne({
      where: {
        user_id: user.id,
        workspace_id: workspaceId,
        is_active: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Usuario no tiene acceso al workspace especificado',
      );
    }

    // Check expiration if set
    if (membership.expiration_date && new Date() > membership.expiration_date) {
      throw new ForbiddenException('Acceso al workspace ha expirado');
    }

    return true;
  }
} 