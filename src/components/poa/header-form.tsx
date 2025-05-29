
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import Image from "next/image";
import { UploadCloud, XCircle } from "lucide-react";
import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE_MB = 2;
const MAX_DIMENSION = 200; // 200x200 pixels
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/svg+xml", "image/bmp", "image/tiff"];

export function HeaderForm() {
  const { poa, updateHeader, updatePoaName } = usePOA();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  // const [logoFile, setLogoFile] = useState<File | null>(null); // No longer needed to store the file itself here

  useEffect(() => {
    if (poa?.header.logoUrl) {
      setLogoPreview(poa.header.logoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [poa?.header.logoUrl]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "poaName") {
      updatePoaName(value); 
    } else {
      updateHeader({ [name]: value });
    }
  };

  const handleLogoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({ title: "Formato de Archivo Inválido", description: "Por favor sube JPEG, PNG, SVG, BMP, o TIFF.", variant: "destructive" });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({ title: "Archivo Demasiado Grande", description: `El logo debe ser menor a ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          toast({ title: "Dimensiones de Imagen Demasiado Grandes", description: `El logo debe estar dentro de ${MAX_DIMENSION}x${MAX_DIMENSION} píxeles.`, variant: "destructive" });
          return;
        }
        const resultDataUrl = e.target?.result as string;
        setLogoPreview(resultDataUrl);
        // setLogoFile(file); // No longer strictly needed here if context handles the Data URL
        updateHeader({ logoUrl: resultDataUrl, logoFileName: file.name });
        toast({ title: "Logo Subido", description: "Vista previa del logo actualizada." });
      };
      img.onerror = () => {
        toast({ title: "Imagen Inválida", description: "No se pudo cargar el archivo de imagen.", variant: "destructive" });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [updateHeader, toast]);

  const removeLogo = () => {
    setLogoPreview(null);
    // setLogoFile(null); // No longer strictly needed here
    updateHeader({ logoUrl: "", logoFileName: "" });
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
     toast({ title: "Logo Eliminado", description: "El logo ha sido borrado." });
  };
  
  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Encabezado del Procedimiento POA" description="Define los detalles principales de tu Procedimiento POA." />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="poaName">Nombre/Título del Procedimiento POA</Label>
          <Input
            id="poaName"
            name="poaName"
            value={poa.name || ""}
            onChange={handleInputChange}
            placeholder="Ej., Estrategia de Marketing Q3"
            className="mt-1 w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">Este nombre se usa para identificar el Procedimiento POA en tu panel y como título en el documento.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="author">Autor</Label>
            <Input id="author" name="author" value={poa.header.author || ""} onChange={handleInputChange} placeholder="Tu Nombre/Departamento" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="version">Versión</Label>
            <Input id="version" name="version" value={poa.header.version || ""} onChange={handleInputChange} placeholder="e.g., 1.0" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input type="date" id="date" name="date" value={poa.header.date || ""} onChange={handleInputChange} className="mt-1 w-full" />
          </div>
        </div>

        <div>
          <Label htmlFor="logo-upload">Logo de la Empresa (máx 200x200px, &lt;{MAX_FILE_SIZE_MB}MB)</Label>
          <div className="mt-2 flex items-center gap-4">
            {logoPreview ? (
              <div className="relative group">
                <Image 
                  src={logoPreview} 
                  alt="Vista previa del logo" 
                  width={80} 
                  height={80} 
                  className="rounded border object-contain bg-muted"
                  data-ai-hint="company logo"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeLogo}
                  aria-label="Eliminar logo"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded border border-dashed flex items-center justify-center bg-muted">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <Input 
              id="logo-upload" 
              type="file" 
              accept={ALLOWED_FORMATS.join(",")} 
              onChange={handleLogoChange} 
              className="hidden" 
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
              {logoPreview ? "Cambiar Logo" : "Subir Logo"}
            </Button>
             {poa.header.logoFileName && <span className="text-sm text-muted-foreground truncate max-w-xs">Actual: {poa.header.logoFileName}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Formatos aceptados: JPEG, PNG, SVG, BMP, TIFF.</p>
        </div>
      </CardContent>
    </Card>
  );
}
