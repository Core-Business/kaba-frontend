
import { z } from 'zod';

export const poaActivitySchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  number: z.string().min(1, "El número de actividad es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  type: z.enum(['individual', 'decision', 'alternatives']),
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

export const poaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El Nombre del Procedimiento es requerido."), 
  userId: z.string().optional(),
  header: poaHeaderSchema,
  objective: z.string().optional(),
  procedureDescription: z.string().optional(), 
  introduction: z.string().optional(), 
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

export function createNewPOA(id: string = 'new', name: string = 'Procedimiento POA Sin Título'): POA {
  const now = new Date().toISOString();
  return {
    id,
    name, 
    header: { ...defaultPOAHeader, title: name }, 
    objective: '',
    procedureDescription: '',
    introduction: '',
    scope: '',
    activities: [],
    createdAt: now,
    updatedAt: now,
  };
}
