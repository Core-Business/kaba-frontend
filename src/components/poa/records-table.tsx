'use client';

import React from 'react';
import { POARecord } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RecordsTableProps {
  records: POARecord[];
  isLoading: boolean;
  onAddRecord: () => void;
  onEditRecord: (record: POARecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

export function RecordsTable({
  records,
  isLoading,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}: RecordsTableProps) {
  // Validar que records sea un array
  const safeRecords = Array.isArray(records) ? records : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-muted-foreground">Cargando registros...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registros ({safeRecords.length})
          </CardTitle>
          <Button onClick={onAddRecord} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Registro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {safeRecords.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay registros</h3>
            <p className="text-muted-foreground mb-4">
              Agrega el primer registro para comenzar a documentar los formatos y controles.
            </p>
            <Button onClick={onAddRecord}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Registro
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead className="min-w-[200px]">Título</TableHead>
                  <TableHead className="min-w-[150px]">Formato</TableHead>
                  <TableHead className="min-w-[150px]">Responsable</TableHead>
                  <TableHead className="min-w-[120px]">Frecuencia</TableHead>
                  <TableHead className="min-w-[120px]">Retención</TableHead>
                  <TableHead className="min-w-[150px]">Almacenamiento</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-center">
                      {record.recordNumber}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={record.title}>
                        {record.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={record.format}>
                        {record.format}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={record.responsible}>
                        {record.responsible}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate" title={record.frequency}>
                        {record.frequency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate" title={record.retentionTime}>
                        {record.retentionTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={record.storageMethod || 'No especificado'}>
                        {record.storageMethod || (
                          <span className="text-muted-foreground italic">No especificado</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRecord(record)}
                          title="Editar registro"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteRecord(record.id)}
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 