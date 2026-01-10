import { z } from 'zod';

export const poaActivityDecisionBranchesSchema = z.object({
  yesLabel: z.string().optional(),
  noLabel: z.string().optional(),
});
export type POAActivityDecisionBranches = z.infer<typeof poaActivityDecisionBranchesSchema>;

export const poaActivityAlternativeBranchSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  label: z.string().optional(),
});
export type POAActivityAlternativeBranch = z.infer<typeof poaActivityAlternativeBranchSchema>;

export const poaActivitySchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  systemNumber: z.string().min(1, "El número de sistema es requerido."),
  userNumber: z.string().optional(),
  activityName: z.string().optional(),
  responsible: z.string().min(1, "El responsable es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  nextActivityType: z.enum(['individual', 'decision', 'alternatives', 'alternative_end', 'process_end']),
  nextIndividualActivityRef: z.string().optional(),
  decisionBranches: poaActivityDecisionBranchesSchema.optional(),
  alternativeBranches: z.array(poaActivityAlternativeBranchSchema).optional(),
  parentId: z.string().uuid().nullable().default(null),
  parentBranchCondition: z.string().nullable().default(null),
});
export type POAActivity = z.infer<typeof poaActivitySchema>;

export const poaStatusType = z.enum(['Borrador', 'Vigente', 'Revisión', 'Obsoleto', 'Cancelado']);
export type POAStatusType = z.infer<typeof poaStatusType>;

export const poaHeaderSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  author: z.string().optional(),
  companyName: z.string().optional(),
  documentCode: z.string().optional(),
  departmentArea: z.string().optional(),
  status: poaStatusType.default('Borrador').optional(),
  fileLocation: z.string().optional(),
  version: z.string().optional(),
  date: z.string().optional(),
  logoUrl: z.string().optional(),
  logoFileName: z.string().optional(),
});
export type POAHeader = z.infer<typeof poaHeaderSchema>;

export const poaObjectiveHelperDataSchema = z.object({
  generalDescription: z.string().optional(),
  needOrProblem: z.string().optional(),
  purposeOrExpectedResult: z.string().optional(),
  targetAudience: z.string().optional(),
  desiredImpact: z.string().optional(),
  kpis: z.array(z.string()).optional(),
});
export type POAObjectiveHelperData = z.infer<typeof poaObjectiveHelperDataSchema>;

// Schemas for Scope Helper Data
const poaScopeUsuarioRolSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  usuario: z.string().optional(),
  rol: z.string().optional(),
});
export type POAScopeUsuarioRol = z.infer<typeof poaScopeUsuarioRolSchema>;

const poaScopeConexionDocumentalSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  documento: z.string().optional(),
  codigo: z.string().optional(),
});
export type POAScopeConexionDocumental = z.infer<typeof poaScopeConexionDocumentalSchema>;

const poaScopeReferenciaNormaSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  referencia: z.string().optional(),
  codigo: z.string().optional(),
});
export type POAScopeReferenciaNorma = z.infer<typeof poaScopeReferenciaNormaSchema>;

export const poaScopeHelperDataSchema = z.object({
  // 1. Definición del Ámbito de Aplicación
  procesosYActividades: z.string().optional(),
  productosClave: z.string().optional(),
  direccionGerencia: z.string().optional(), // New field
  // 2. Aplicabilidad y Responsables
  usuariosYRoles: z.array(poaScopeUsuarioRolSchema).optional(),
  gradoDeInclusion: z.string().optional(),
  // 3. Límites y Exclusiones
  delimitacionPrecisa: z.string().optional(),
  condicionesDeExclusion: z.string().optional(),
  // 4. Condiciones y Contexto de Aplicación
  criteriosDeActivacion: z.string().optional(),
  contextoOperativo: z.string().optional(),
  // 5. Interrelación con Otros Procesos y Normas
  conexionesDocumentales: z.array(poaScopeConexionDocumentalSchema).optional(),
  referenciaANormas: z.array(poaScopeReferenciaNormaSchema).optional(),
  // 6. Vigencia y Revisión (opcional)
  duracionYPeriodicidad: z.string().optional(),
  revision: z.string().optional(),
});
export type POAScopeHelperData = z.infer<typeof poaScopeHelperDataSchema>;

export const poaResponsibleSchema = z.object({
  id: z.string(),
  responsibleName: z.string(),
  type: z.enum(['automatic', 'manual']),
  activitiesCount: z.number(),
  summary: z.string(),
  role: z.string().optional(),
  activityIds: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type POAResponsible = z.infer<typeof poaResponsibleSchema>;

export const poaDefinitionSchema = z.object({
  term: z.string().min(1, "El término es requerido.").max(250, "El término no puede exceder 250 caracteres."),
  definition: z.string().min(1, "La definición es requerida.").max(4000, "La definición no puede exceder 4000 caracteres."),
});
export type POADefinition = z.infer<typeof poaDefinitionSchema>;

export const poaReferenceSchema = z.object({
  codigo: z.string().max(255, "El código no puede exceder 255 caracteres.").optional(),
  nombreReferencia: z.string().min(1, "El nombre de la referencia es requerido.").max(500, "El nombre de la referencia no puede exceder 500 caracteres."),
  tipoReferencia: z.string().min(1, "El tipo de referencia es requerido.").max(80, "El tipo de referencia no puede exceder 80 caracteres."),
  enlace: z.string().max(500, "El enlace no puede exceder 500 caracteres.").optional(),
});
export type POAReference = z.infer<typeof poaReferenceSchema>;

// Esquemas para aprobaciones (MVP)
export const poaApprovalPersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido.").max(255, "El nombre no puede exceder 255 caracteres."),
  position: z.string().min(1, "El cargo es requerido.").max(255, "El cargo no puede exceder 255 caracteres."),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type POAApprovalPerson = z.infer<typeof poaApprovalPersonSchema>;

export const poaApprovalsSchema = z.object({
  elaborated: z.array(poaApprovalPersonSchema).default([]),
  reviewed: z.array(poaApprovalPersonSchema).default([]),
  authorized: z.array(poaApprovalPersonSchema).default([]),
});
export type POAApprovals = z.infer<typeof poaApprovalsSchema>;

// Tipo para tipos de aprobación
export type ApprovalType = 'elaborated' | 'reviewed' | 'authorized';

// Esquemas para control de cambios (MVP)
export const poaChangeControlEntrySchema = z.object({
  entryNumber: z.number().int().positive("El número de entrada debe ser positivo."),
  changeDate: z.string()
    .min(1, "La fecha de cambio es requerida.")
    .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/, "La fecha debe estar en formato MM-DD-YYYY.")
    .refine((date) => {
      // Validar que la fecha no sea futura
      const [month, day, year] = date.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
      return inputDate <= today;
    }, "La fecha no puede ser futura."),
  changeReason: z.string()
    .min(1, "El motivo del cambio es requerido.")
    .max(255, "El motivo del cambio no puede exceder 255 caracteres."),
  responsible: z.string()
    .min(1, "El responsable es requerido.")
    .max(255, "El responsable no puede exceder 255 caracteres."),
  signature: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type POAChangeControlEntry = z.infer<typeof poaChangeControlEntrySchema>;

// Esquema para crear nueva entrada (sin entryNumber auto-generado)
export const createChangeControlEntrySchema = z.object({
  changeDate: z.string()
    .min(1, "La fecha de cambio es requerida.")
    .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/, "La fecha debe estar en formato MM-DD-YYYY.")
    .refine((date) => {
      const [month, day, year] = date.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate <= today;
    }, "La fecha no puede ser futura."),
  changeReason: z.string()
    .min(1, "El motivo del cambio es requerido.")
    .max(255, "El motivo del cambio no puede exceder 255 caracteres."),
  responsible: z.string()
    .min(1, "El responsable es requerido.")
    .max(255, "El responsable no puede exceder 255 caracteres."),
});
export type CreateChangeControlEntry = z.infer<typeof createChangeControlEntrySchema>;

// Esquema para actualizar entrada existente (campos opcionales)
export const updateChangeControlEntrySchema = z.object({
  changeDate: z.string()
    .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/, "La fecha debe estar en formato MM-DD-YYYY.")
    .refine((date) => {
      const [month, day, year] = date.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate <= today;
    }, "La fecha no puede ser futura.")
    .optional(),
  changeReason: z.string()
    .max(255, "El motivo del cambio no puede exceder 255 caracteres.")
    .optional(),
  responsible: z.string()
    .max(255, "El responsable no puede exceder 255 caracteres.")
    .optional(),
});
export type UpdateChangeControlEntry = z.infer<typeof updateChangeControlEntrySchema>;

// Esquemas para registros (MVP)
export const poaRecordSchema = z.object({
  id: z.string(),
  recordNumber: z.number().int().positive("El número de registro debe ser positivo."),
  title: z.string()
    .min(1, "El título del registro es requerido.")
    .max(255, "El título no puede exceder 255 caracteres."),
  format: z.string()
    .min(1, "El formato es requerido.")
    .max(255, "El formato no puede exceder 255 caracteres."),
  responsible: z.string()
    .min(1, "El responsable es requerido.")
    .max(255, "El responsable no puede exceder 255 caracteres."),
  frequency: z.string()
    .min(1, "La frecuencia es requerida.")
    .max(255, "La frecuencia no puede exceder 255 caracteres."),
  retentionTime: z.string()
    .min(1, "El tiempo de retención es requerido.")
    .max(255, "El tiempo de retención no puede exceder 255 caracteres."),
  storageMethod: z.string()
    .max(500, "El medio de almacenamiento no puede exceder 500 caracteres.")
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type POARecord = z.infer<typeof poaRecordSchema>;

// Esquema para crear nuevo registro (sin id ni recordNumber auto-generados)
export const createRecordSchema = z.object({
  title: z.string()
    .min(1, "El título del registro es requerido.")
    .max(255, "El título no puede exceder 255 caracteres."),
  format: z.string()
    .min(1, "El formato es requerido.")
    .max(255, "El formato no puede exceder 255 caracteres."),
  responsible: z.string()
    .min(1, "El responsable es requerido.")
    .max(255, "El responsable no puede exceder 255 caracteres."),
  frequency: z.string()
    .min(1, "La frecuencia es requerida.")
    .max(255, "La frecuencia no puede exceder 255 caracteres."),
  retentionTime: z.string()
    .min(1, "El tiempo de retención es requerido.")
    .max(255, "El tiempo de retención no puede exceder 255 caracteres."),
  storageMethod: z.string()
    .max(500, "El medio de almacenamiento no puede exceder 500 caracteres.")
    .optional(),
});
export type CreateRecord = z.infer<typeof createRecordSchema>;

// Esquema para actualizar registro existente (todos los campos opcionales)
export const updateRecordSchema = z.object({
  title: z.string()
    .max(255, "El título no puede exceder 255 caracteres.")
    .optional(),
  format: z.string()
    .max(255, "El formato no puede exceder 255 caracteres.")
    .optional(),
  responsible: z.string()
    .max(255, "El responsable no puede exceder 255 caracteres.")
    .optional(),
  frequency: z.string()
    .max(255, "La frecuencia no puede exceder 255 caracteres.")
    .optional(),
  retentionTime: z.string()
    .max(255, "El tiempo de retención no puede exceder 255 caracteres.")
    .optional(),
  storageMethod: z.string()
    .max(500, "El medio de almacenamiento no puede exceder 500 caracteres.")
    .optional(),
});
export type UpdateRecord = z.infer<typeof updateRecordSchema>;

export const poaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El Nombre del Procedimiento es requerido."),
  userId: z.string().optional(),
  header: poaHeaderSchema,
  objective: z.string().optional(),
  objectiveHelperData: poaObjectiveHelperDataSchema.optional(),
  procedureDescription: z.string().optional(),
  introduction: z.string().optional(),
  scope: z.string().optional(),
  scopeHelperData: poaScopeHelperDataSchema.optional(),
  activities: z.array(poaActivitySchema),
  responsibilities: z.array(poaResponsibleSchema),
  definitions: z.array(poaDefinitionSchema),
  references: z.array(poaReferenceSchema),
  approvals: poaApprovalsSchema.optional(),
  changeControl: z.array(poaChangeControlEntrySchema).default([]),
  records: z.array(poaRecordSchema).default([]),
  procedureId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type POA = z.infer<typeof poaSchema>;

export const defaultPOAHeader: POAHeader = {
  title: '',
  author: '',
  companyName: '',
  documentCode: '',
  departmentArea: '',
  status: 'Borrador',
  fileLocation: '',
  version: '1.0',
  date: new Date().toISOString().split('T')[0],
  logoUrl: '',
  logoFileName: '',
};

export const defaultPOAObjectiveHelperData: POAObjectiveHelperData = {
  generalDescription: '',
  needOrProblem: '',
  purposeOrExpectedResult: '',
  targetAudience: '',
  desiredImpact: '',
  kpis: [''],
};

export const defaultPOAScopeHelperData: POAScopeHelperData = {
  procesosYActividades: '',
  productosClave: '',
  direccionGerencia: '', // New field default
  usuariosYRoles: [{ id: crypto.randomUUID(), usuario: '', rol: '' }],
  gradoDeInclusion: '',
  delimitacionPrecisa: '',
  condicionesDeExclusion: '',
  criteriosDeActivacion: '',
  contextoOperativo: '',
  conexionesDocumentales: [{ id: crypto.randomUUID(), documento: '', codigo: '' }],
  referenciaANormas: [{ id: crypto.randomUUID(), referencia: '', codigo: '' }],
  duracionYPeriodicidad: '',
  revision: '',
};

export const defaultPOAApprovals: POAApprovals = {
  elaborated: [],
  reviewed: [],
  authorized: [],
};

export function createNewPOA(id: string = 'new', name: string = 'Nuevo Procedimiento POA Sin Título'): POA {
  const now = new Date().toISOString();
  return {
    id,
    name,
    header: { ...defaultPOAHeader, title: name },
    objective: '',
    objectiveHelperData: { ...defaultPOAObjectiveHelperData },
    procedureDescription: '',
    introduction: '',
    scope: '',
    scopeHelperData: { ...defaultPOAScopeHelperData },
    activities: [],
    responsibilities: [],
    definitions: [],
    references: [],
    approvals: { ...defaultPOAApprovals },
    changeControl: [],
    records: [],
    procedureId: '',
    createdAt: now,
    updatedAt: now,
  };
}

export type ProcedureStatus = z.infer<typeof poaStatusType>;

// =====================================
// ESQUEMAS PARA ANEXOS (POA ATTACHMENTS)
// =====================================

export const poaAttachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalName: z.string().min(1, "El nombre del archivo es requerido"),
  mimeType: z.string(),
  size: z.number().positive("El tamaño debe ser positivo"),
  url: z.string().url("URL inválida"),
  poaId: z.string(),
  procedureId: z.string(),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  uploadedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAttachmentSchema = z.object({
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
});

export const updateAttachmentSchema = z.object({
  description: z.string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede exceder 500 caracteres"),
});

export type POAAttachment = z.infer<typeof poaAttachmentSchema>;
export type CreateAttachment = z.infer<typeof createAttachmentSchema>;
export type UpdateAttachment = z.infer<typeof updateAttachmentSchema>;
