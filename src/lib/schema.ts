import { z } from 'zod';

export const poaActivitySchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  number: z.string().min(1, "Activity number is required."),
  description: z.string().min(1, "Description is required."),
  type: z.enum(['individual', 'decision', 'alternatives']),
  // For 'decision', could have 'ifYesLinkTo', 'ifNoLinkTo' (activity IDs or numbers)
  // For 'alternatives', could have an array of { optionText: string, linkTo: string }
  // Keeping it simple for now, UI will manage implications of type.
});
export type POAActivity = z.infer<typeof poaActivitySchema>;

export const poaHeaderSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().optional(),
  version: z.string().optional(),
  date: z.string().optional(), 
  logoUrl: z.string().optional(), // Will store data URL or uploaded file path
  logoFileName: z.string().optional(),
});
export type POAHeader = z.infer<typeof poaHeaderSchema>;

export const poaSchema = z.object({
  id: z.string(), // 'new' or UUID
  name: z.string().min(1, "POA Name/Title is required.").optional(), // For listing on dashboard
  userId: z.string().optional(),
  header: poaHeaderSchema,
  objective: z.string().optional(),
  procedureDescription: z.string().optional(),
  introduction: z.string().optional(), // AI-generated based on procedure description
  scope: z.string().optional(), // AI-generated based on procedure description
  activities: z.array(poaActivitySchema),
  createdAt: z.string().optional(), // ISO date string
  updatedAt: z.string().optional(), // ISO date string
});
export type POA = z.infer<typeof poaSchema>;

export const defaultPOAHeader: POAHeader = {
  title: '',
  author: '',
  version: '1.0',
  date: new Date().toISOString().split('T')[0],
  logoUrl: '',
  logoFileName: '',
};

// Used when creating a new POA
export function createNewPOA(id: string = 'new', name: string = 'Untitled POA'): POA {
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
