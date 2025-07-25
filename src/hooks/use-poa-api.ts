import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { POAAPI, CreatePOARequest, UpdatePOARequest, UpdateDefinitionsRequest, UpdateReferencesRequest } from "@/api/poa";
import type { POA } from "@/lib/schema";

export function usePOAAPI() {
  const queryClient = useQueryClient();

  const getByProcedureId = (procedureId: string) =>
    useQuery({ 
      queryKey: ["poa", procedureId], 
      queryFn: () => POAAPI.getByProcedureId(procedureId),
      enabled: !!procedureId
    });

  const create = () => 
    useMutation({
      mutationFn: ({ procedureId, poa }: { procedureId: string; poa: CreatePOARequest }) =>
        POAAPI.create(procedureId, poa),
      onSuccess: (_, { procedureId }) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  const autoCreate = () => 
    useMutation({
      mutationFn: ({ procedureId, partialPoa }: { procedureId: string; partialPoa?: Partial<CreatePOARequest> }) =>
        POAAPI.autoCreate(procedureId, partialPoa),
      onSuccess: (_, { procedureId }) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  const update = () => 
    useMutation({
      mutationFn: ({ procedureId, poa }: { procedureId: string; poa: POA }) =>
        POAAPI.update(procedureId, poa),
      onSuccess: (_, { procedureId }) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  const partialUpdate = () => 
    useMutation({
      mutationFn: ({ procedureId, poa }: { procedureId: string; poa: POA }) =>
        POAAPI.partialUpdate(procedureId, poa),
      onSuccess: (_, { procedureId }) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  const remove = () =>
    useMutation({
      mutationFn: POAAPI.delete,
      onSuccess: (_, procedureId) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  const generateDocument = () =>
    useMutation({
      mutationFn: POAAPI.generateDocument,
    });

  const updateDefinitions = () =>
    useMutation({
      mutationFn: ({ procedureId, definitions }: { procedureId: string; definitions: UpdateDefinitionsRequest }) =>
        POAAPI.updateDefinitions(procedureId, definitions),
      onSuccess: (_, { procedureId }) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  const updateReferences = () =>
    useMutation({
      mutationFn: ({ procedureId, references }: { procedureId: string; references: UpdateReferencesRequest }) =>
        POAAPI.updateReferences(procedureId, references),
      onSuccess: (_, { procedureId }) => {
        queryClient.invalidateQueries({ queryKey: ["poa", procedureId] });
      },
    });

  return { 
    getByProcedureId, 
    create, 
    autoCreate, 
    update, 
    partialUpdate, 
    remove, 
    generateDocument,
    updateDefinitions,
    updateReferences
  };
} 