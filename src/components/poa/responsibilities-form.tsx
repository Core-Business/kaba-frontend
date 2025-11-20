'use client';

import { useState } from 'react';
import { usePOA } from '@/hooks/use-poa';
import { useResponsibilities } from '@/hooks/use-responsibilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning, PlusCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ResponsibleCard } from './responsible-card';
import { ResponsibleFormDialog } from './responsible-form-dialog';
import type { POAResponsible } from '@/lib/schema';

// Helper para el tipo, ya que el import directo falla
type ResponsibleFormData = {
  responsibleName: string;
  role: string;
  summary: string;
};

export function ResponsibilitiesForm() {
  const { poa } = usePOA();
  const { 
    isLoading, 
    generateResponsibilities,
    addManualResponsible,
    updateResponsible,
    deleteResponsible,
  } = useResponsibilities();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponsible, setEditingResponsible] = useState<POAResponsible | null>(null);

  if (!poa) {
    return <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>;
  }

  const handleOpenDialog = (responsible?: POAResponsible | null) => {
    setEditingResponsible(responsible || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingResponsible(null);
  };

  const handleSubmit = (data: ResponsibleFormData) => {
    if (editingResponsible) {
      updateResponsible(editingResponsible.id, data).then(handleCloseDialog);
    } else {
      addManualResponsible(data).then(handleCloseDialog);
    }
  };

  const hasActivities = poa.activities && poa.activities.length > 0;
  const hasResponsibilities = poa.responsibilities && poa.responsibilities.length > 0;

  if (!hasActivities) {
    return (
      <Alert variant="default">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Sección Bloqueada</AlertTitle>
        <AlertDescription>
          Para generar responsabilidades, primero debe agregar actividades en la sección correspondiente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Responsabilidades del Proceso</CardTitle>
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button 
              onClick={() => generateResponsibilities(hasResponsibilities)}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
              {hasResponsibilities ? 'Regenerar Automáticos' : 'Generar Responsabilidades'}
            </Button>
            <Button onClick={() => handleOpenDialog()} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Responsable Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poa.responsibilities.map((resp) => (
              <ResponsibleCard 
                key={resp.id}
                responsible={resp}
                onEdit={() => handleOpenDialog(resp)}
                onDelete={deleteResponsible}
                isLoading={isLoading}
              />
            ))}
            {!hasResponsibilities && !isLoading && (
              <div className="text-center text-muted-foreground py-10">
                <p>Aún no se han generado responsabilidades.</p>
                <p>Haga clic en &quot;Generar&quot; para empezar o agregue uno manualmente.</p>
              </div>
            )}
            {isLoading && poa.responsibilities.length === 0 && <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>}
          </div>
        </CardContent>
      </Card>

      <ResponsibleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        responsible={editingResponsible}
        isLoading={isLoading}
      />
    </>
  );
} 