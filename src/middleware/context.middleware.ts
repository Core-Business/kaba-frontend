import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface TenantRequest extends Request {
  tenantContext?: {
    organizationId: string;
    workspaceId: string;
  };
}

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: TenantRequest, res: Response, next: NextFunction) {
    const rlsEnabled = this.configService.get<boolean>('ENABLE_RLS', false);
    
    if (rlsEnabled) {
      const organizationId = req.headers['x-organization-id'] as string;
      const workspaceId = req.headers['x-workspace-id'] as string;

      if (organizationId && workspaceId) {
        req.tenantContext = {
          organizationId,
          workspaceId,
        };
      }
    }

    next();
  }
} 