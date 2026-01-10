import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ProceduresAPI,
  type Procedure,
  type CreateProcedureRequest,
  type UpdateProcedureRequest,
} from "@/api/procedures";

const proceduresKeys = {
  all: ["procedures"] as const,
  detail: (id?: string | null) => ["procedures", id ?? ""] as const,
};

export const useProceduresList = () =>
  useQuery({
    queryKey: proceduresKeys.all,
    queryFn: ProceduresAPI.list,
  });

export const useProcedureQuery = (id?: string | null) =>
  useQuery({
    queryKey: proceduresKeys.detail(id),
    queryFn: () => {
      if (!id) {
        throw new Error("procedure id is required");
      }
      return ProceduresAPI.get(id);
    },
    enabled: Boolean(id),
  });

export const useCreateProcedureMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProcedureRequest) => ProceduresAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proceduresKeys.all });
    },
  });
};

export const useUpdateProcedureMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProcedureRequest }) =>
      ProceduresAPI.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: proceduresKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: proceduresKeys.all });
    },
  });
};

export const useDeleteProcedureMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ProceduresAPI.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: proceduresKeys.all });
      const previousProcedures = queryClient.getQueryData<Procedure[]>(
        proceduresKeys.all,
      );
      queryClient.setQueryData<Procedure[] | undefined>(
        proceduresKeys.all,
        (old) => old?.filter((procedure) => procedure.id !== id),
      );
      return { previousProcedures };
    },
    onError: (_error, _id, context) => {
      if (context?.previousProcedures) {
        queryClient.setQueryData(proceduresKeys.all, context.previousProcedures);
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: proceduresKeys.all });
      if (id) {
        queryClient.invalidateQueries({ queryKey: proceduresKeys.detail(id) });
      }
    },
  });
};