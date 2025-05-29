
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import Image from "next/image";
import { UploadCloud, XCircle, Save } from "lucide-react";
import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea if fileLocation becomes one

const MAX_FILE_SIZE_KB = 100; // 100KB
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/svg+xml", "image/bmp", "image/tiff"];
const POA_STATUSES = ['Borrador', 'Activo', 'Cancelado', 'Obsoleto'] as const;


export function HeaderForm() {
  const { poa, updateHeader, updatePoaName, saveCurrentPOA } = usePOA();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (poa?.header.logoUrl) {
      setLogoPreview(poa.header.logoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [poa?.header.logoUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "poaName") { 
      updatePoaName(value); 
    } else {
      updateHeader({ [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    updateHeader({ [name]: value });
  };

  const handleLogoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({ title: "Formato de Archivo Inválido", description: "Por favor sube JPEG, PNG, SVG, BMP, o TIFF.", variant: "destructive" });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE_KB * 1024) { // Check against KB
        toast({ title: "Archivo Demasiado Grande", description: `El logo debe ser menor a ${MAX_FILE_SIZE_KB}KB.`, variant: "destructive" });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img"); // Still need img to read properties if necessary, but not for dimension check
      img.onload = () => {
        // Dimension check removed
        const resultDataUrl = e.target?.result as string;
        setLogoPreview(resultDataUrl);
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
    updateHeader({ logoUrl: "", logoFileName: "" });
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
     toast({ title: "Logo Eliminado", description: "El logo ha sido borrado." });
  };
  
  const handleSave = () => {
    if (poa) {
      saveCurrentPOA();
    }
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Encabezado del Procedimiento POA" description="Define los detalles principales de tu Procedimiento POA." />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="md:col-span-2"> 
            <Label htmlFor="poaName">Nombre del Procedimiento</Label>
            <Input
              id="poaName"
              name="poaName"
              value={poa.name || ""}
              onChange={handleInputChange}
              placeholder="Ej., Estrategia de Marketing Q3, Manual de Operaciones X"
              className="mt-1 w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">Este nombre se usa para identificar el Procedimiento POA en tu panel y como título en el documento.</p>
          </div>
          
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa</Label>
            <Input id="companyName" name="companyName" value={poa.header.companyName || ""} onChange={handleInputChange} placeholder="Nombre de tu Empresa" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="departmentArea">Área o Departamento</Label>
            <Input id="departmentArea" name="departmentArea" value={poa.header.departmentArea || ""} onChange={handleInputChange} placeholder="Ej., Marketing, Operaciones" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="author">Nombre del Autor</Label>
            <Input id="author" name="author" value={poa.header.author || ""} onChange={handleInputChange} placeholder="Ej., Juan Pérez" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="documentCode">Código del Documento (Opcional)</Label>
            <Input id="documentCode" name="documentCode" value={poa.header.documentCode || ""} onChange={handleInputChange} placeholder="Ej., RH-PROC-001" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="version">Versión (Opcional)</Label>
            <Input id="version" name="version" value={poa.header.version || ""} onChange={handleInputChange} placeholder="Ej., 1.0" className="mt-1 w-full" />
          </div>
           <div>
            <Label htmlFor="date">Fecha</Label>
            <Input type="date" id="date" name="date" value={poa.header.date || ""} onChange={handleInputChange} className="mt-1 w-full" />
          </div>
           <div>
            <Label htmlFor="status">Estado</Label>
            <Select 
              name="status" 
              value={poa.header.status || 'Borrador'} 
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger id="status" className="mt-1 w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {POA_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="fileLocation">Ubicación del Archivo</Label>
            <Input id="fileLocation" name="fileLocation" value={poa.header.fileLocation || ""} onChange={handleInputChange} placeholder="Ej., Servidor Interno / Documentos / POAs" className="mt-1 w-full" />
          </div>
        </div>

        <div>
          <Label htmlFor="logo-upload">Logo de la Compañía (máx {MAX_FILE_SIZE_KB}KB)</Label>
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
      <CardFooter className="flex justify-end border-t pt-6">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Encabezado
        </Button>
      </CardFooter>
    </Card>
  );
}

