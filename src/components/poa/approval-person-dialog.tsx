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
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import type { POAApprovalPerson, ApprovalType } from '@/lib/schema';

const approvalPersonFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  position: z.string().min(1, 'El cargo es requerido.')
    .max(255, 'El cargo no puede exceder 255 caracteres'),
});

type ApprovalPersonFormData = z.infer<typeof approvalPersonFormSchema>;

interface ApprovalPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalPersonFormData) => void;
  person?: POAApprovalPerson | null;
  isLoading: boolean;
  approvalType: ApprovalType;
}

const getTypeLabels = (type: ApprovalType) => {
  const labels = {
    elaborated: { title: 'Elaboró', description: 'Persona que elaboró el procedimiento' },
    reviewed: { title: 'Revisó', description: 'Persona que revisó el procedimiento' },
    authorized: { title: 'Autorizó', description: 'Persona que autorizó el procedimiento' },
  };
  return labels[type];
};

export function ApprovalPersonDialog({
  open,
  onOpenChange,
  onSubmit,
  person,
  isLoading,
  approvalType,
}: ApprovalPersonDialogProps) {
  const typeLabels = getTypeLabels(approvalType);
  const isEditing = !!person;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApprovalPersonFormData>({
    resolver: zodResolver(approvalPersonFormSchema),
  });

  useEffect(() => {
    if (person) {
      reset({
        name: person.name,
        position: person.position,
      });
    } else {
      reset({ name: '', position: '' });
    }
  }, [person, open, reset]);

  const handleFormSubmit = (data: ApprovalPersonFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar' : 'Agregar'} - {typeLabels.title}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Modifica los datos de esta persona que ${typeLabels.title.toLowerCase()}.`
              : `Agrega una nueva persona que ${typeLabels.title.toLowerCase()} el procedimiento.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={isLoading}
              placeholder="Ej., Juan Pérez López"
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              {...register('position')}
              disabled={isLoading}
              placeholder="Ej., Gerente de Operaciones"
              className="w-full"
            />
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 