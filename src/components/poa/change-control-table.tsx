'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Calendar, User, FileText } from 'lucide-react';
import { POAChangeControlEntry } from '@/lib/schema';

interface ChangeControlTableProps {
  entries: POAChangeControlEntry[];
  isLoading?: boolean;
  onEdit?: (entry: POAChangeControlEntry) => void;
  onDelete?: (entry: POAChangeControlEntry) => void;
  isLastEntry?: (entryNumber: number) => boolean;
  formatDateForDisplay?: (date: string) => string;
}

export function ChangeControlTable({
  entries,
  isLoading = false,
  onEdit,
  onDelete,
  isLastEntry = () => false,
  formatDateForDisplay = (date) => date,
}: ChangeControlTableProps) {
  // Validación de seguridad: asegurar que entries sea un array
  const safeEntries = Array.isArray(entries) ? entries : [];
  if (isLoading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead className="w-32">Fecha</TableHead>
              <TableHead>Motivo del Cambio</TableHead>
              <TableHead className="w-48">Responsable</TableHead>
              <TableHead className="w-20">Firma</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (safeEntries.length === 0) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead className="w-32">Fecha</TableHead>
              <TableHead>Motivo del Cambio</TableHead>
              <TableHead className="w-48">Responsable</TableHead>
              <TableHead className="w-20">Firma</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                  <p>No hay entradas de control de cambios</p>
                  <p className="text-sm">Agrega la primera entrada para comenzar el seguimiento</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No.</TableHead>
            <TableHead className="w-32">Fecha</TableHead>
            <TableHead>Motivo del Cambio</TableHead>
            <TableHead className="w-48">Responsable</TableHead>
            <TableHead className="w-20">Firma</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeEntries.map((entry) => {
            const isLast = isLastEntry(entry.entryNumber);
            
            return (
              <TableRow key={entry.entryNumber} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{entry.entryNumber}</span>
                    {isLast && (
                      <Badge variant="secondary" className="text-xs">
                        Última
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDateForDisplay(entry.changeDate)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm line-clamp-2" title={entry.changeReason}>
                      {entry.changeReason}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm" title={entry.responsible}>
                      {entry.responsible}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-center">
                    {entry.signature ? (
                      <Badge variant="outline" className="text-xs">
                        Firmado
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Pendiente
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {isLast && (onEdit || onDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(entry)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar entrada
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(entry)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar entrada
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {safeEntries.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {safeEntries.length} {safeEntries.length === 1 ? 'entrada' : 'entradas'} de control de cambios
          </p>
          <p className="text-xs mt-1">
            Solo se puede editar o eliminar la última entrada
          </p>
        </div>
      )}
    </div>
  );
} 