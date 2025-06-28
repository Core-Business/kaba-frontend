'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, AlertCircle } from 'lucide-react';
import {
  CreateChangeControlEntry,
  UpdateChangeControlEntry,
  createChangeControlEntrySchema,
  updateChangeControlEntrySchema,
  POAChangeControlEntry,
} from '@/lib/schema';

interface ChangeControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  entry?: POAChangeControlEntry;
  onSubmit: (data: CreateChangeControlEntry | UpdateChangeControlEntry) => Promise<boolean>;
  isLoading?: boolean;
  getCurrentDateFormatted: () => string;
}

export function ChangeControlDialog({
  open,
  onOpenChange,
  mode,
  entry,
  onSubmit,
  isLoading = false,
  getCurrentDateFormatted,
}: ChangeControlDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Esquema dinámico basado en el modo
  const schema = mode === 'add' ? createChangeControlEntrySchema : updateChangeControlEntrySchema;
  
  const form = useForm<CreateChangeControlEntry | UpdateChangeControlEntry>({
    resolver: zodResolver(schema),
    defaultValues: {
      changeDate: '',
      changeReason: '',
      responsible: '',
    },
  });

  // Resetear formulario cuando cambia el modo o la entrada
  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          changeDate: getCurrentDateFormatted(),
          changeReason: '',
          responsible: '',
        });
      } else if (mode === 'edit' && entry) {
        form.reset({
          changeDate: entry.changeDate,
          changeReason: entry.changeReason,
          responsible: entry.responsible,
        });
      }
    }
  }, [open, mode, entry, form, getCurrentDateFormatted]);

  const handleSubmit = async (data: CreateChangeControlEntry | UpdateChangeControlEntry) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data);
      if (success) {
        onOpenChange(false);
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  // Validar formato de fecha en tiempo real
  const validateDateFormat = (value: string) => {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;
    return regex.test(value);
  };

  // Formatear fecha mientras se escribe
  const formatDateInput = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar formato MM-DD-YYYY
    if (numbers.length >= 5) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}`;
    } else if (numbers.length >= 3) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}`;
    } else {
      return numbers;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === 'add' ? 'Agregar Entrada de Control de Cambios' : 'Editar Entrada de Control de Cambios'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Complete la información para registrar un nuevo cambio en el procedimiento.'
              : 'Modifique los campos necesarios para actualizar la entrada.'
            }
            {mode === 'edit' && entry && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Entrada #{entry.entryNumber} (Última entrada)
                </Badge>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Campo de fecha */}
            <FormField
              control={form.control}
              name="changeDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Cambio *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MM-DD-YYYY"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={10}
                      className={validateDateFormat(field.value || '') ? '' : 'border-orange-300'}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    Formato: MM-DD-YYYY. No se permiten fechas futuras.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de motivo */}
            <FormField
              control={form.control}
              name="changeReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Motivo del Cambio *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el motivo o razón del cambio realizado..."
                      className="min-h-[100px] resize-none"
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center justify-between text-xs">
                    <span>Explique claramente qué cambió y por qué</span>
                    <span className={(field.value?.length || 0) > 200 ? 'text-orange-600' : 'text-muted-foreground'}>
                      {field.value?.length || 0}/255
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de responsable */}
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Responsable del Cambio *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del responsable del cambio"
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center justify-between text-xs">
                    <span>Nombre completo de quien realizó o autorizó el cambio</span>
                    <span className={(field.value?.length || 0) > 200 ? 'text-orange-600' : 'text-muted-foreground'}>
                      {field.value?.length || 0}/255
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información adicional para modo edición */}
            {mode === 'edit' && entry && (
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-2">Información de la entrada:</h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Número de entrada:</span> #{entry.entryNumber}
                  </div>
                  <div>
                    <span className="font-medium">Creada:</span>{' '}
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="min-w-[120px]"
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {mode === 'add' ? 'Agregando...' : 'Actualizando...'}
                  </div>
                ) : (
                  mode === 'add' ? 'Agregar Entrada' : 'Actualizar Entrada'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 