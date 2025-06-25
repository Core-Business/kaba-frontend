import { Organization } from './organization.entity';
import { Workspace } from '../workspace/workspace.entity';
import { OrgMember } from './org-member.entity';

describe('Organization Entity', () => {
  let organization: Organization;

  beforeEach(() => {
    organization = new Organization();
  });

  it('should be defined', () => {
    expect(organization).toBeDefined();
  });

  it('should have required properties', () => {
    organization.id = 'test-uuid';
    organization.name = 'Test Organization';
    organization.type = 'COMPANY';
    organization.branding = { logo: 'test-logo.png' };
    organization.created_at = new Date();
    organization.updated_at = new Date();

    expect(organization.id).toBe('test-uuid');
    expect(organization.name).toBe('Test Organization');
    expect(organization.type).toBe('COMPANY');
    expect(organization.branding).toEqual({ logo: 'test-logo.png' });
    expect(organization.created_at).toBeInstanceOf(Date);
    expect(organization.updated_at).toBeInstanceOf(Date);
  });

  it('should support CONSULTANCY type', () => {
    organization.type = 'CONSULTANCY';
    expect(organization.type).toBe('CONSULTANCY');
  });

  it('should have workspaces relation', () => {
    const workspace = new Workspace();
    workspace.name = 'Test Workspace';
    organization.workspaces = [workspace];

    expect(organization.workspaces).toHaveLength(1);
    expect(organization.workspaces[0].name).toBe('Test Workspace');
  });

  it('should have members relation', () => {
    const member = new OrgMember();
    member.user_id = 'user-uuid';
    organization.members = [member];

    expect(organization.members).toHaveLength(1);
    expect(organization.members[0].user_id).toBe('user-uuid');
  });
}); 