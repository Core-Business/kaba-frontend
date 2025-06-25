import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { WorkspaceMember } from '../modules/workspace/workspace-member.entity';
import { Workspace } from '../modules/workspace/workspace.entity';
import { WorkspaceRole } from '../enums/workspace-role.enum';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let configService: ConfigService;
  let workspaceMemberRepository: Repository<WorkspaceMember>;
  let workspaceRepository: Repository<Workspace>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockWorkspaceMemberRepository = {
    findOne: jest.fn(),
  };

  const mockWorkspaceRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: mockWorkspaceMemberRepository,
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: mockWorkspaceRepository,
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    configService = module.get<ConfigService>(ConfigService);
    workspaceMemberRepository = module.get<Repository<WorkspaceMember>>(
      getRepositoryToken(WorkspaceMember),
    );
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace),
    );
  });

  const createMockContext = (user?: any, headers?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          headers: headers || {},
        }),
      }),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('when RLS is disabled', () => {
    it('should allow access without validation', async () => {
      mockConfigService.get.mockReturnValue(false);

      const context = createMockContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockConfigService.get).toHaveBeenCalledWith('ENABLE_RLS', false);
    });
  });

  describe('when RLS is enabled', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue(true);
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const context = createMockContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException when headers are missing', async () => {
      const context = createMockContext({ id: 'user-id' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when workspace does not belong to organization', async () => {
      const context = createMockContext(
        { id: 'user-id' },
        {
          'x-organization-id': 'org-id',
          'x-workspace-id': 'workspace-id',
        },
      );

      mockWorkspaceRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user has no workspace membership', async () => {
      const context = createMockContext(
        { id: 'user-id' },
        {
          'x-organization-id': 'org-id',
          'x-workspace-id': 'workspace-id',
        },
      );

      const mockWorkspace = {
        id: 'workspace-id',
        organization_id: 'org-id',
        name: 'Test Workspace',
      };

      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when membership is expired', async () => {
      const context = createMockContext(
        { id: 'user-id' },
        {
          'x-organization-id': 'org-id',
          'x-workspace-id': 'workspace-id',
        },
      );

      const mockWorkspace = {
        id: 'workspace-id',
        organization_id: 'org-id',
        name: 'Test Workspace',
      };

      const expiredMembership = {
        user_id: 'user-id',
        workspace_id: 'workspace-id',
        role: WorkspaceRole.EDITOR,
        is_active: true,
        expiration_date: new Date('2023-01-01'), // Expired date
      };

      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(expiredMembership);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow access when all validations pass', async () => {
      const context = createMockContext(
        { id: 'user-id' },
        {
          'x-organization-id': 'org-id',
          'x-workspace-id': 'workspace-id',
        },
      );

      const mockWorkspace = {
        id: 'workspace-id',
        organization_id: 'org-id',
        name: 'Test Workspace',
      };

      const validMembership = {
        user_id: 'user-id',
        workspace_id: 'workspace-id',
        role: WorkspaceRole.EDITOR,
        is_active: true,
        expiration_date: null,
      };

      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(validMembership);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when membership is not expired', async () => {
      const context = createMockContext(
        { id: 'user-id' },
        {
          'x-organization-id': 'org-id',
          'x-workspace-id': 'workspace-id',
        },
      );

      const mockWorkspace = {
        id: 'workspace-id',
        organization_id: 'org-id',
        name: 'Test Workspace',
      };

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const validMembership = {
        user_id: 'user-id',
        workspace_id: 'workspace-id',
        role: WorkspaceRole.WORKSPACE_ADMIN,
        is_active: true,
        expiration_date: futureDate,
      };

      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(validMembership);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
}); 