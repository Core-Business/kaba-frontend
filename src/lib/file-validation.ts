export const ALLOWED_FILE_TYPES = {
  'application/pdf': { extension: 'pdf', label: 'PDF' },
  'text/plain': { extension: 'txt', label: 'TXT' },
  'image/jpeg': { extension: 'jpg', label: 'JPG' },
  'image/png': { extension: 'png', label: 'PNG' },
  'application/msword': { extension: 'doc', label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: 'docx', label: 'DOCX' 
  },
  'application/vnd.ms-excel': { extension: 'xls', label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    extension: 'xlsx', label: 'XLSX' 
  },
  'application/vnd.ms-powerpoint': { extension: 'ppt', label: 'PPT' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { 
    extension: 'pptx', label: 'PPTX' 
  },
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Validar tipo
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    const allowedExtensions = Object.values(ALLOWED_FILE_TYPES)
      .map(type => type.label)
      .join(', ');
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedExtensions}`
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'El archivo no puede exceder 10 MB'
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeLabel(mimeType: string): string {
  return ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]?.label || 'Desconocido';
} 