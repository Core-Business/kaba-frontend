'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ApprovalPersonCard } from './approval-person-card';
import type { POAApprovalPerson } from '@/lib/schema';

interface ApprovalSectionProps {
  title: string;
  description: string;
  people: POAApprovalPerson[];
  onAddPerson: () => void;
  onEditPerson: (person: POAApprovalPerson) => void;
  onDeletePerson: (personId: string) => void;
  isLoading: boolean;
}

export function ApprovalSection({
  title,
  description,
  people,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  isLoading,
}: ApprovalSectionProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-primary">
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <Button 
            onClick={onAddPerson} 
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {people.length > 0 ? (
            people.map((person) => (
              <ApprovalPersonCard
                key={person.id}
                person={person}
                onEdit={onEditPerson}
                onDelete={onDeletePerson}
                isLoading={isLoading}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="space-y-2">
                <p className="text-sm">No hay personas agregadas</p>
                <p className="text-xs">
                  Haz clic en "Agregar" para añadir a alguien que {title.toLowerCase()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 