'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { validateFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, formatFileSize } from '@/lib/file-validation';

interface AttachmentUploadZoneProps {
  onUpload: (file: File, description?: string) => Promise<void>;
  isUploading: boolean;
  disabled?: boolean;
}

export function AttachmentUploadZone({ 
  onUpload, 
  isUploading, 
  disabled = false 
}: AttachmentUploadZoneProps) {
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0]; // Solo tomamos el primer archivo
    
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Archivo inválido');
      return;
    }
    
    setValidationError(null);
    
    try {
      await onUpload(file, description.trim() || undefined);
      setDescription(''); // Limpiar descripción después de subir
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  }, [onUpload, description]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false, // Solo un archivo a la vez
    disabled: disabled || isUploading,
    accept: Object.keys(ALLOWED_FILE_TYPES).reduce((acc, mimeType) => {
      acc[mimeType] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
  });

  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES)
    .map(type => type.label)
    .join(', ');

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Zona de descripción opcional */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción del anexo (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente el contenido del archivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              disabled={disabled || isUploading}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 caracteres
            </p>
          </div>

          {/* Zona de drag & drop */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
              ${isDragReject ? 'border-red-400 bg-red-50' : ''}
              ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
              ${!isDragActive && !isDragReject ? 'border-gray-300' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              {/* Icono */}
              <div className="flex justify-center">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>

              {/* Texto principal */}
              <div className="space-y-2">
                {isUploading ? (
                  <p className="text-lg font-medium text-blue-600">
                    Subiendo archivo...
                  </p>
                ) : isDragActive ? (
                  <p className="text-lg font-medium text-blue-600">
                    Suelta el archivo aquí
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Arrastra un archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Solo se permite un archivo a la vez
                    </p>
                  </div>
                )}
              </div>

              {/* Información de tipos permitidos */}
              {!isUploading && (
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Tipos permitidos:</strong> {allowedExtensions}</p>
                  <p><strong>Tamaño máximo:</strong> {formatFileSize(MAX_FILE_SIZE)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error de validación */}
          {validationError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{validationError}</span>
            </div>
          )}

          {/* Botón alternativo para seleccionar archivo */}
          {!isDragActive && !isUploading && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = Object.keys(ALLOWED_FILE_TYPES).join(',');
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      onDrop([file]);
                    }
                  };
                  input.click();
                }}
                disabled={disabled}
                className="gap-2"
              >
                <File className="h-4 w-4" />
                Seleccionar archivo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 