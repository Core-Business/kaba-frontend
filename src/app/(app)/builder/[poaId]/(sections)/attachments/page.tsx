'use client';

import { use } from 'react';
import { AttachmentsForm } from '@/components/poa/attachments-form';

interface AttachmentsPageProps {
  params: Promise<{
    poaId: string;
  }>;
}

export default function AttachmentsPage({ params }: AttachmentsPageProps) {
  const { poaId } = use(params);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Anexos</h1>
        <p className="text-gray-600 mt-1">
          Sube documentos auxiliares que complementen este procedimiento. Los anexos no se incluyen en el documento principal, pero se mantienen como archivos separados para referencia.
        </p>
      </div>

      <AttachmentsForm procedureId={poaId} />
    </div>
  );
} 