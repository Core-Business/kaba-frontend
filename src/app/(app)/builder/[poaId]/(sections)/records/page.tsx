'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordsForm } from '@/components/poa/records-form';

export default function RecordsPage() {
  const params = useParams();
  const procedureId = params.poaId as string;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Registros</h1>
        <p className="text-muted-foreground">
          Gestiona los registros y formatos asociados al procedimiento.
        </p>
      </div>
      
      <RecordsForm procedureId={procedureId} />
    </div>
  );
} 