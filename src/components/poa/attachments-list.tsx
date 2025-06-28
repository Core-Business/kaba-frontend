'use client';

import React, { useState } from 'react';
import { Download, Edit, Trash2, File, Calendar, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { POAAttachment } from '@/lib/schema';
import { formatFileSize, getFileTypeLabel } from '@/lib/file-validation';

interface AttachmentsListProps {
  attachments: POAAttachment[];
  isLoading: boolean;
  onDownload: (attachment: POAAttachment) => Promise<void>;
  onEdit: (attachment: POAAttachment) => void;
  onDelete: (attachmentId: string) => Promise<void>;
}

export function AttachmentsList({
  attachments,
  isLoading,
  onDownload,
  onEdit,
  onDelete,
}: AttachmentsListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (attachment: POAAttachment) => {
    setDownloadingId(attachment.id);
    try {
      await onDownload(attachment);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando anexos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Anexos ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay anexos subidos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <File className="h-4 w-4 text-gray-500" />
                      <span className="font-medium truncate">{attachment.originalName}</span>
                      <Badge variant="outline" className="text-xs">
                        {getFileTypeLabel(attachment.mimeType)}
                      </Badge>
                    </div>
                    {attachment.description && (
                      <p className="text-sm text-gray-600 mb-1">{attachment.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>{new Date(attachment.createdAt).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      disabled={downloadingId === attachment.id}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(attachment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(attachment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}