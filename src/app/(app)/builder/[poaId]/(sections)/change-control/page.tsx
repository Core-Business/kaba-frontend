'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ChangeControlForm } from '@/components/poa/change-control-form';

export default function ChangeControlPage() {
  const params = useParams();
  const poaId = params?.poaId as string;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Control de Cambios</h1>
        <p className="text-muted-foreground">
          Gestiona y rastrea todos los cambios realizados al procedimiento operativo.
        </p>
      </div>

      <ChangeControlForm
        procedureId={poaId}
        className="w-full"
      />
    </div>
  );
} 