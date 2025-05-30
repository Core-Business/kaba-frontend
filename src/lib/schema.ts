
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
  responsible: z.string().optional(),
  description: z.string().min(1, "La descripción es requerida."),
  nextActivityType: z.enum(['individual', 'decision', 'alternatives']),
  decisionBranches: poaActivityDecisionBranchesSchema.optional(),
  alternativeBranches: z.array(poaActivityAlternativeBranchSchema).optional(),
  parentId: z.string().uuid().nullable().default(null), // ID of the parent activity
  parentBranchCondition: z.string().nullable().default(null), // 'yes', 'no', or alternative branch ID
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


export const poaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El Nombre del Procedimiento es requerido."),
  userId: z.string().optional(),
  header: poaHeaderSchema,
  objective: z.string().optional(),
  objectiveHelperData: poaObjectiveHelperDataSchema.optional(),
  procedureDescription: z.string().optional(), // User-written introduction
  introduction: z.string().optional(), // AI-suggested introduction based on procedureDescription
  scope: z.string().optional(),
  activities: z.array(poaActivitySchema),
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
    activities: [],
    createdAt: now,
    updatedAt: now,
  };
}
