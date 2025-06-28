import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecordDto {
  @ApiProperty({
    description: 'Título del registro',
    example: 'Registro de Capacitaciones',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El título del registro es obligatorio' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Formato del registro',
    example: 'Formato KABA-REG-001',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El formato es obligatorio' })
  @MaxLength(255, { message: 'El formato no puede exceder 255 caracteres' })
  format: string;

  @ApiProperty({
    description: 'Responsable del registro',
    example: 'Coordinador de RRHH',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El responsable es obligatorio' })
  @MaxLength(255, { message: 'El responsable no puede exceder 255 caracteres' })
  responsible: string;

  @ApiProperty({
    description: 'Frecuencia de actualización',
    example: 'Mensual',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'La frecuencia es obligatoria' })
  @MaxLength(255, { message: 'La frecuencia no puede exceder 255 caracteres' })
  frequency: string;

  @ApiProperty({
    description: 'Tiempo de retención',
    example: '5 años',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El tiempo de retención es obligatorio' })
  @MaxLength(255, { message: 'El tiempo de retención no puede exceder 255 caracteres' })
  retentionTime: string;

  @ApiProperty({
    description: 'Medio de almacenamiento (opcional)',
    example: 'Archivo físico en oficina central',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'El medio de almacenamiento no puede exceder 500 caracteres' })
  storageMethod?: string;
}

export class UpdateRecordDto {
  @ApiProperty({
    description: 'Título del registro',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title?: string;

  @ApiProperty({
    description: 'Formato del registro',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'El formato no puede exceder 255 caracteres' })
  format?: string;

  @ApiProperty({
    description: 'Responsable del registro',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'El responsable no puede exceder 255 caracteres' })
  responsible?: string;

  @ApiProperty({
    description: 'Frecuencia de actualización',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'La frecuencia no puede exceder 255 caracteres' })
  frequency?: string;

  @ApiProperty({
    description: 'Tiempo de retención',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'El tiempo de retención no puede exceder 255 caracteres' })
  retentionTime?: string;

  @ApiProperty({
    description: 'Medio de almacenamiento',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'El medio de almacenamiento no puede exceder 500 caracteres' })
  storageMethod?: string;
}

export class UpdateRecordsDto {
  @ApiProperty({
    description: 'Lista completa de registros',
    type: [CreateRecordDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecordDto)
  records: CreateRecordDto[];
} 