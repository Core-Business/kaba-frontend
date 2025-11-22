"use client";

import React from 'react';
import { ReferencesForm } from '@/components/poa/references-form';

export default function ReferencesPage() {
  return (
    <div className="w-full px-4 md:px-6 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Referencias</h1>
        <p className="text-muted-foreground">
          Gestiona las referencias bibliográficas, normativas y documentales del procedimiento.
        </p>
      </div>
      
      <ReferencesForm />
    </div>
  );
} 