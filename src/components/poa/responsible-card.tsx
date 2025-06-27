'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, UserCheck, Bot } from 'lucide-react';
import type { POAResponsible } from '@/lib/schema';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface ResponsibleCardProps {
  responsible: POAResponsible;
  onEdit: (responsible: POAResponsible) => void;
  onDelete: (responsibleId: string) => void;
  isLoading: boolean;
}

export function ResponsibleCard({ responsible, onEdit, onDelete, isLoading }: ResponsibleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle>{responsible.responsibleName}</CardTitle>
              <CardDescription>{responsible.role}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={responsible.type === 'automatic' ? 'secondary' : 'outline'}>
                {responsible.type === 'automatic' ? <Bot className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                {responsible.type === 'automatic' ? 'Automático' : 'Manual'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(responsible)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  {responsible.type === 'manual' && (
                    <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{responsible.summary}</p>
        </CardContent>
        {responsible.type === 'automatic' && (
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Basado en {responsible.activitiesCount} actividades asignadas.
            </p>
          </CardFooter>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar a {responsible.responsibleName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El responsable será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(responsible.id)}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 