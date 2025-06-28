'use client';

import React, { useState, useEffect } from 'react';
import { useAttachments } from '@/hooks/use-attachments';
import { AttachmentUploadZone } from './attachment-upload-zone';
import { AttachmentsList } from './attachments-list';
import { AttachmentDescriptionDialog } from './attachment-description-dialog';
import { POAAttachment } from '@/lib/schema';

interface AttachmentsFormProps {
  procedureId: string;
}

export function AttachmentsForm({ procedureId }: AttachmentsFormProps) {
  const {
    attachments,
    isLoading,
    isUploading,
    error,
    fetchAttachments,
    uploadAttachment,
    updateAttachmentDescription,
    removeAttachment,
    downloadAttachment,
  } = useAttachments(procedureId);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<POAAttachment | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUpload = async (file: File, description?: string) => {
    await uploadAttachment(file, description);
  };

  const handleEdit = (attachment: POAAttachment) => {
    setSelectedAttachment(attachment);
    setEditDialogOpen(true);
  };

  const handleSubmitDescription = async (attachmentId: string, description: string) => {
    await updateAttachmentDescription(attachmentId, description);
  };

  const handleDelete = async (attachmentId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este anexo?')) {
      await removeAttachment(attachmentId);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <AttachmentUploadZone
        onUpload={handleUpload}
        isUploading={isUploading}
        disabled={isLoading}
      />

      <AttachmentsList
        attachments={attachments}
        isLoading={isLoading}
        onDownload={downloadAttachment}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AttachmentDescriptionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        attachment={selectedAttachment}
        onSubmit={handleSubmitDescription}
        isLoading={isLoading}
      />
    </div>
  );
}