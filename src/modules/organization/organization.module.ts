import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import { OrgMember } from './org-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrgMember])],
  exports: [TypeOrmModule],
})
export class OrganizationModule {} 