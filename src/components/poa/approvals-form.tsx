'use client';

import { useState } from 'react';
import { usePOA } from '@/hooks/use-poa';
import { useApprovals } from '@/hooks/use-approvals';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from './common-form-elements';
import { ApprovalSection } from './approval-section';
import { ApprovalPersonDialog } from './approval-person-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import type { POAApprovalPerson, ApprovalType } from '@/lib/schema';

interface ApprovalPersonFormData {
  name: string;
  position: string;
}

const approvalSections = [
  {
    type: 'elaborated' as ApprovalType,
    title: 'Elaboró',
    description: 'Personas que elaboraron el procedimiento',
  },
  {
    type: 'reviewed' as ApprovalType,
    title: 'Revisó',
    description: 'Personas que revisaron el procedimiento',
  },
  {
    type: 'authorized' as ApprovalType,
    title: 'Autorizó',
    description: 'Personas que autorizaron el procedimiento',
  },
];

export function ApprovalsForm() {
  const { poa, saveCurrentPOA } = usePOA();
  const {
    isLoading,
    addApprovalPerson,
    updateApprovalPerson,
    deleteApprovalPerson,
  } = useApprovals();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<POAApprovalPerson | null>(null);
  const [currentType, setCurrentType] = useState<ApprovalType>('elaborated');

  if (!poa) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner />
      </div>
    );
  }

  // Usar valores por defecto si no existen aprobaciones
  const approvals = poa.approvals || {
    elaborated: [],
    reviewed: [],
    authorized: [],
  };

  const handleOpenDialog = (type: ApprovalType, person?: POAApprovalPerson | null) => {
    setCurrentType(type);
    setEditingPerson(person || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPerson(null);
  };

  const handleSubmit = async (data: ApprovalPersonFormData) => {
    try {
      if (editingPerson) {
        await updateApprovalPerson(currentType, editingPerson.id, data);
      } else {
        await addApprovalPerson(currentType, data);
      }
      handleCloseDialog();
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error submitting approval person:', error);
    }
  };

  const handleEditPerson = (type: ApprovalType) => (person: POAApprovalPerson) => {
    handleOpenDialog(type, person);
  };

  const handleDeletePerson = (type: ApprovalType) => async (personId: string) => {
    try {
      await deleteApprovalPerson(type, personId);
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error deleting approval person:', error);
    }
  };

  const handleSave = async () => {
    if (!poa) {
      toast({
        title: "Error",
        description: "No hay datos para guardar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveCurrentPOA();
      toast({
        title: "Aprobaciones Guardadas",
        description: "Las aprobaciones han sido guardadas exitosamente.",
      });
    } catch (error) {
      console.error('Error al guardar aprobaciones:', error);
      toast({
        title: "Error al Guardar",
        description: `No se pudieron guardar las aprobaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="shadow-lg w-full">
        <CardHeader>
          <SectionTitle 
            title="Aprobaciones del Procedimiento" 
            description="Define las personas que participaron en la elaboración, revisión y autorización del procedimiento." 
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Layout responsive: Desktop = 3 columnas, Tablet = 2 columnas, Mobile = 1 columna */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvalSections.map((section) => (
              <ApprovalSection
                key={section.type}
                title={section.title}
                description={section.description}
                people={approvals[section.type] || []}
                onAddPerson={() => handleOpenDialog(section.type)}
                onEditPerson={handleEditPerson(section.type)}
                onDeletePerson={handleDeletePerson(section.type)}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Mensaje informativo si no hay aprobaciones */}
          {approvalSections.every(section => 
            !approvals[section.type] || approvals[section.type].length === 0
          ) && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              <div className="space-y-2">
                <p className="text-base font-medium">Sin aprobaciones definidas</p>
                <p className="text-sm">
                  Las aprobaciones son opcionales, pero recomendadas para documentar formalmente
                  quiénes participaron en la creación del procedimiento.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-start border-t pt-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Aprobaciones
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo para agregar/editar personas */}
      <ApprovalPersonDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        person={editingPerson}
        isLoading={isLoading}
        approvalType={currentType}
      />
    </>
  );
} 