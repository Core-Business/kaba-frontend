import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from '../organization/organization.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { TenantGuard } from '../../guards/tenant.guard';
import { ContextMiddleware } from '../../middleware/context.middleware';

@Module({
  imports: [
    ConfigModule,
    OrganizationModule,
    WorkspaceModule,
  ],
  providers: [TenantGuard, ContextMiddleware],
  exports: [TenantGuard, ContextMiddleware, OrganizationModule, WorkspaceModule],
})
export class MultiTenantModule {} 