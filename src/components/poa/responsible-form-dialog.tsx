'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { poaResponsibleSchema } from '@/lib/schema';
import { useEffect } from 'react';

type POAResponsible = z.infer<typeof poaResponsibleSchema>;

const responsibleSchema = z.object({
  responsibleName: z.string().min(1, 'El nombre es requerido.'),
  role: z.string().min(1, 'El rol es requerido.'),
  summary: z.string().min(10, 'El resumen debe tener al menos 10 caracteres.'),
});

type ResponsibleFormData = z.infer<typeof responsibleSchema>;

interface ResponsibleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResponsibleFormData) => void;
  responsible?: POAResponsible | null;
  isLoading: boolean;
}

export function ResponsibleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  responsible,
  isLoading,
}: ResponsibleFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResponsibleFormData>({
    resolver: zodResolver(responsibleSchema),
  });

  useEffect(() => {
    if (responsible) {
      reset(responsible);
    } else {
      reset({ responsibleName: '', role: '', summary: '' });
    }
  }, [responsible, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{responsible ? 'Editar' : 'Agregar'} Responsable Manual</DialogTitle>
          <DialogDescription>
            {responsible
              ? 'Modifica los detalles de este responsable.'
              : 'Añade un nuevo responsable que no está asignado a ninguna actividad.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="responsibleName">Nombre del Responsable</Label>
            <Input id="responsibleName" {...register('responsibleName')} disabled={isLoading || responsible?.type === 'automatic'}/>
            {errors.responsibleName && <p className="text-red-500 text-xs mt-1">{errors.responsibleName.message}</p>}
          </div>
          <div>
            <Label htmlFor="role">Rol / Cargo</Label>
            <Input id="role" {...register('role')} disabled={isLoading} />
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
          <div>
            <Label htmlFor="summary">Resumen de Responsabilidades</Label>
            <Textarea id="summary" {...register('summary')} disabled={isLoading} />
            {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 