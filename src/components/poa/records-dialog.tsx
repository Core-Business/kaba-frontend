'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { POARecord, CreateRecord, createRecordSchema } from '@/lib/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: POARecord | null;
  onSubmit: (data: CreateRecord) => Promise<void>;
  isLoading?: boolean;
}

export function RecordsDialog({
  open,
  onOpenChange,
  record,
  onSubmit,
  isLoading = false,
}: RecordsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!record;

  const form = useForm<CreateRecord>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      title: '',
      format: '',
      responsible: '',
      frequency: '',
      retentionTime: '',
      storageMethod: '',
    },
  });

  // Cargar datos del registro cuando se edita
  useEffect(() => {
    if (record && isEditing) {
      form.reset({
        title: record.title || '',
        format: record.format || '',
        responsible: record.responsible || '',
        frequency: record.frequency || '',
        retentionTime: record.retentionTime || '',
        storageMethod: record.storageMethod || '',
      });
    } else {
      form.reset({
        title: '',
        format: '',
        responsible: '',
        frequency: '',
        retentionTime: '',
        storageMethod: '',
      });
    }
  }, [record, isEditing, form]);

  const handleSubmit = async (data: CreateRecord) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error en el diálogo:', error);
      // El error ya se maneja en el hook useRecords
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Registro' : 'Agregar Nuevo Registro'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Título <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Registro de Capacitaciones"
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Formato */}
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Formato <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Formato KABA-REG-001"
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Responsable */}
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Responsable <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Coordinador de RRHH"
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Frecuencia */}
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Frecuencia <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Mensual, Trimestral, Anual"
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tiempo de Retención */}
              <FormField
                control={form.control}
                name="retentionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiempo de Retención <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 5 años, 3 años, Permanente"
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Medio de Almacenamiento (opcional) */}
              <FormField
                control={form.control}
                name="storageMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medio de Almacenamiento (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Archivo físico en oficina central, Sistema digital, Servidor local"
                        rows={3}
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              >
                {isSubmitting || isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">
                      {isEditing ? 'Actualizando...' : 'Agregando...'}
                    </span>
                  </>
                ) : (
                  isEditing ? 'Actualizar Registro' : 'Agregar Registro'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 