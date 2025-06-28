'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { POAAttachment } from '@/lib/schema';

interface AttachmentDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachment: POAAttachment | null;
  onSubmit: (attachmentId: string, description: string) => Promise<void>;
  isLoading: boolean;
}

export function AttachmentDescriptionDialog({
  open,
  onOpenChange,
  attachment,
  onSubmit,
  isLoading,
}: AttachmentDescriptionDialogProps) {
  const [description, setDescription] = useState('');

  // Actualizar descripción cuando cambie el anexo
  useEffect(() => {
    if (attachment) {
      setDescription(attachment.description || '');
    } else {
      setDescription('');
    }
  }, [attachment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attachment) return;
    
    try {
      await onSubmit(attachment.id, description.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar descripción:', error);
    }
  };

  const handleCancel = () => {
    setDescription(attachment?.description || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar descripción del anexo</DialogTitle>
          <DialogDescription>
            {attachment && (
              <>
                Archivo: <strong>{attachment.originalName}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción del anexo
              </Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el contenido del archivo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                {description.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 