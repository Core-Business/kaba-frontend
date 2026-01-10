import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  POAAPI,
  type CreatePOARequest,
  type UpdateDefinitionsRequest,
  type UpdateReferencesRequest,
} from "@/api/poa";
import type { POA } from "@/lib/schema";

type ProcedureScoped<T extends object = Record<string, never>> = T & {
  procedureId: string;
};

const poaQueryKey = (procedureId: string | null | undefined) =>
  ["poa", procedureId ?? ""] as const;

export const usePoaQuery = (procedureId?: string | null) =>
  useQuery({
    queryKey: poaQueryKey(procedureId),
    queryFn: () => {
      if (!procedureId) {
        throw new Error("procedureId is required to fetch a POA");
      }
      return POAAPI.getByProcedureId(procedureId);
    },
    enabled: Boolean(procedureId),
  });

export const useCreatePoaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ procedureId, poa }: ProcedureScoped<{ poa: CreatePOARequest }>) =>
      POAAPI.create(procedureId, poa),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};

export const useAutoCreatePoaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      procedureId,
      partialPoa,
    }: ProcedureScoped<{ partialPoa?: Partial<CreatePOARequest> }>) =>
      POAAPI.autoCreate(procedureId, partialPoa),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};

export const useUpdatePoaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ procedureId, poa }: ProcedureScoped<{ poa: POA }>) =>
      POAAPI.update(procedureId, poa),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};

export const usePartialUpdatePoaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ procedureId, poa }: ProcedureScoped<{ poa: POA }>) =>
      POAAPI.partialUpdate(procedureId, poa),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};

export const useDeletePoaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ procedureId }: ProcedureScoped) => POAAPI.delete(procedureId),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};

export const useGeneratePoaDocumentMutation = () =>
  useMutation({
    mutationFn: ({ procedureId }: ProcedureScoped) =>
      POAAPI.generateDocument(procedureId),
  });

export const useUpdateDefinitionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      procedureId,
      definitions,
    }: ProcedureScoped<{ definitions: UpdateDefinitionsRequest }>) =>
      POAAPI.updateDefinitions(procedureId, definitions),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};

export const useUpdateReferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      procedureId,
      references,
    }: ProcedureScoped<{ references: UpdateReferencesRequest }>) =>
      POAAPI.updateReferences(procedureId, references),
    onSuccess: (_, { procedureId }) => {
      queryClient.invalidateQueries({ queryKey: poaQueryKey(procedureId) });
    },
  });
};