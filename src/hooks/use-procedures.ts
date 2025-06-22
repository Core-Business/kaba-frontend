import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProceduresAPI, Procedure, CreateProcedureRequest, UpdateProcedureRequest } from "@/api/procedures";

export function useProcedures() {
  const queryClient = useQueryClient();

  const list = () => 
    useQuery({ 
      queryKey: ["procedures"], 
      queryFn: async () => {
        try {
          const data = await ProceduresAPI.list();
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching procedures:', error);
          return [];
        }
      }
    });

  const get = (id: string) =>
    useQuery({ 
      queryKey: ["procedure", id], 
      queryFn: () => ProceduresAPI.get(id),
      enabled: !!id
    });

  const create = () => 
    useMutation({
      mutationFn: ProceduresAPI.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
      },
    });

  const update = () => 
    useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateProcedureRequest }) =>
        ProceduresAPI.update(id, payload),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["procedure", id] });
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
      },
    });

  const remove = () =>
    useMutation({
      mutationFn: ProceduresAPI.delete,
      onSuccess: (_, deletedId) => {
        console.log('Procedure deleted, invalidating cache for ID:', deletedId);
        
        // WORKAROUND: Eliminar optimísticamente del cache mientras se corrige el backend
        queryClient.setQueryData(["procedures"], (oldData: any) => {
          if (Array.isArray(oldData)) {
            return oldData.filter(procedure => procedure.id !== deletedId);
          }
          return oldData;
        });
        
        // Invalidar todas las queries relacionadas con procedimientos
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        queryClient.invalidateQueries({ queryKey: ["procedure", deletedId] });
        
        console.log('Cache updated optimistically - procedure removed from UI');
      },
      onError: (error) => {
        console.error('Error in remove mutation:', error);
        // En caso de error, refrescar para mostrar el estado real
        queryClient.refetchQueries({ queryKey: ["procedures"] });
      },
    });

  return { list, get, create, update, remove };
} 