"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const MAX_FILE_SIZE_KB = 100;
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/svg+xml", "image/bmp", "image/tiff"];

interface LogoUploadZoneProps {
  logoPreview: string | null;
  logoFileName?: string;
  onLogoChange: (dataUrl: string, fileName: string) => void;
  onLogoRemove: () => void;
  disabled?: boolean;
}

export function LogoUploadZone({
  logoPreview,
  logoFileName,
  onLogoChange,
  onLogoRemove,
  disabled,
}: LogoUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    
    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError("Formato no válido. Usa JPEG, PNG, SVG, BMP o TIFF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_KB * 1024) {
      setError(`El archivo debe ser menor a ${MAX_FILE_SIZE_KB}KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultDataUrl = e.target?.result as string;
      onLogoChange(resultDataUrl, file.name);
    };
    reader.onerror = () => {
      setError("No se pudo cargar el archivo.");
    };
    reader.readAsDataURL(file);
  }, [onLogoChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (logoPreview) {
    return (
      <div className="relative group">
        <div className={cn(
          "relative w-full h-32 rounded-xl border-2 border-gray-200 bg-white overflow-hidden",
          "flex items-center justify-center"
        )}>
          <Image
            src={logoPreview}
            alt="Logo de la empresa"
            width={120}
            height={80}
            className="object-contain max-h-24"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onLogoRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {logoFileName && (
          <p className="text-xs text-muted-foreground mt-2 text-center truncate">
            {logoFileName}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById("logo-upload-input")?.click()}
        className={cn(
          "relative w-full h-32 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center gap-2",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "p-3 rounded-full transition-colors",
          isDragging ? "bg-blue-100" : "bg-gray-100"
        )}>
          {isDragging ? (
            <ImageIcon className="h-6 w-6 text-blue-500" />
          ) : (
            <UploadCloud className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {isDragging ? "Suelta aquí" : "Arrastra tu logo aquí"}
          </p>
          <p className="text-xs text-gray-500">
            o haz clic para seleccionar
          </p>
        </div>
        <input
          id="logo-upload-input"
          type="file"
          accept={ALLOWED_FORMATS.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        JPEG, PNG, SVG, BMP, TIFF (máx. {MAX_FILE_SIZE_KB}KB)
      </p>
    </div>
  );
}
