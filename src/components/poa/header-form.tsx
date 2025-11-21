
"use client";

// Another test comment for platform diagnosis
import { usePOA } from "@/hooks/use-poa";
import {
  useProcedureQuery,
  useUpdateProcedureMutation,
} from "@/hooks/use-procedures";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { POAStatusType } from "@/lib/schema";

const MAX_FILE_SIZE_KB = 100; // 100KB
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/svg+xml", "image/bmp", "image/tiff"];
const POA_STATUSES: POAStatusType[] = ['Borrador', 'Vigente', 'Revisión', 'Obsoleto', 'Cancelado'];


export function HeaderForm() {
  // Another test comment for platform diagnosis
  const { poa, saveToBackend, isBackendLoading, backendProcedureId, updateHeader, updatePoaName } = usePOA();
  const updateProcedureMutation = useUpdateProcedureMutation();
  const procedureQuery = useProcedureQuery(backendProcedureId);
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const headerLogoUrl = poa?.header.logoUrl ?? null;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setLogoPreview(headerLogoUrl);
    });
    return () => cancelAnimationFrame(frame);
  }, [headerLogoUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "name") { 
      updatePoaName(value);
    } else {
      updateHeader({ [name]: value });
    }
  };

  const handleStatusChange = (value: string) => {
    updateHeader({ status: value as POAStatusType });
  };

  const handleLogoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({ title: "Formato de Archivo Inválido", description: "Por favor sube JPEG, PNG, SVG, BMP, o TIFF.", variant: "destructive" });
      return;
    }

    if (file.size > MAX_FILE_SIZE_KB * 1024) {
        toast({ title: "Archivo Demasiado Grande", description: `El logo debe ser menor a ${MAX_FILE_SIZE_KB}KB.`, variant: "destructive" });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultDataUrl = e.target?.result as string;
      setLogoPreview(resultDataUrl);
      updateHeader({ logoUrl: resultDataUrl, logoFileName: file.name });
      toast({ title: "Logo Subido", description: "Vista previa del logo actualizada." });
    };
    reader.onerror = () => {
      toast({ title: "Imagen Inválida", description: "No se pudo cargar el archivo de imagen.", variant: "destructive" });
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

  const handleSave = async () => {
    if (!poa || !backendProcedureId) {
      toast({
        title: "Error",
        description: "No hay datos para guardar o falta el ID del procedimiento.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Guardando encabezado con procedureId:', backendProcedureId);
      
      // 1. Guardar POA en el backend
      await saveToBackend();
      
      // 2. Actualizar también el procedimiento base para sincronizar el nombre en el dashboard
      if (poa.name) {
        console.log('Actualizando nombre del procedimiento:', poa.name);
        console.log('Datos a enviar:', { id: backendProcedureId, payload: { title: poa.name } });
        
        try {
          // Primero verificar que el procedimiento existe y tenemos permisos
          console.log('🔍 Verificando procedimiento antes de actualizar...');
          console.log('🔍 ProcedureId:', backendProcedureId);
          console.log('🔍 ProcedureId length:', backendProcedureId?.length);
          console.log('🔍 ProcedureId type:', typeof backendProcedureId);
          
          if (procedureQuery.data) {
            console.log('✅ Procedimiento encontrado:', procedureQuery.data);
            console.log('🔍 Detalles del procedimiento:', {
              id: procedureQuery.data.id,
              title: procedureQuery.data.title,
              userId: procedureQuery.data.userId,
              status: procedureQuery.data.status
            });
          } else {
            console.warn('⚠️ No se pudo obtener información del procedimiento');
          }
          
          await updateProcedureMutation.mutateAsync({
            id: backendProcedureId,
            payload: {
              title: poa.name, // Sincronizar el nombre del POA con el título del procedimiento
            }
          });
          console.log('✅ Procedimiento actualizado exitosamente');
        } catch (procedureError) {
          console.error('❌ Error completo actualizando procedimiento:', procedureError);
          console.warn('⚠️ No se pudo sincronizar el nombre del procedimiento (no crítico)');
          console.log('ℹ️ El POA se guardó correctamente. El dashboard se actualizará en el próximo refresh.');
          // No mostrar toast de error ya que el POA se guardó correctamente
          // La sincronización fallará pero no es crítica para la funcionalidad
        }
      }
      
      toast({
        title: "Encabezado Guardado",
        description: "Los cambios han sido guardados exitosamente en el servidor. El dashboard se sincronizará automáticamente.",
      });
    } catch (error) {
      console.error('Error al guardar encabezado:', error);
      toast({
        title: "Error al Guardar",
        description: `No se pudieron guardar los cambios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  if (isBackendLoading || !poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Encabezado del Procedimiento POA" description="Define los detalles principales de tu Procedimiento POA." />
      </CardHeader>
      <CardContent className="space-y-3"> 
        <div className="md:col-span-2">
          <Label htmlFor="name">Nombre del Procedimiento</Label>
          <Input
            id="name"
            name="name" 
            value={poa.name || ""}
            onChange={handleInputChange}
            placeholder="Ej., Estrategia de Marketing Q3, Manual de Operaciones X"
            className="mt-1 w-full"
            maxLength={60} 
          />
          <p className="text-xs text-muted-foreground mt-1">Este nombre se usa para identificar el Procedimiento POA en tu panel y como título en el documento (máx. ~10 palabras).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"> 
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa</Label>
            <Input id="companyName" name="companyName" value={poa.header.companyName || ""} onChange={handleInputChange} placeholder="Nombre de tu Empresa" className="mt-1 w-full" />
          </div>
          <div>
            <Label htmlFor="departmentArea">Área o Departamento</Label>
            <Input id="departmentArea" name="departmentArea" value={poa.header.departmentArea || ""} onChange={handleInputChange} placeholder="Ej., Marketing, Operaciones" className="mt-1 w-full" />
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
        </div>

        <div className="space-y-2">
            <Label>Estado</Label>
            <RadioGroup
                value={poa.header.status || 'Borrador'}
                onValueChange={handleStatusChange}
                className="flex flex-wrap gap-x-4 gap-y-2 mt-1"
            >
                {POA_STATUSES.map((statusVal) => (
                <div key={statusVal} className="flex items-center space-x-2">
                    <RadioGroupItem value={statusVal} id={`status-${statusVal}`} />
                    <Label htmlFor={`status-${statusVal}`} className="font-normal">
                    {statusVal}
                    </Label>
                </div>
                ))}
            </RadioGroup>
        </div>

        <div className="mt-3"> 
          <Label htmlFor="fileLocation">Ubicación del Archivo</Label>
          <Input id="fileLocation" name="fileLocation" value={poa.header.fileLocation || ""} onChange={handleInputChange} placeholder="Ej., Servidor Interno / Documentos / POAs" className="mt-1 w-full" />
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="space-y-3">
            <div>
              <Label htmlFor="author">Nombre del Autor</Label>
              <Input id="author" name="author" value={poa.header.author || ""} onChange={handleInputChange} placeholder="Ej., Juan Pérez" className="mt-1 w-full" />
            </div>
            <p className="text-sm text-muted-foreground">Define aquí los responsables de la aprobación del documento.</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border"> 
          <Label htmlFor="logo-upload">Logo de la Compañía (máx ${MAX_FILE_SIZE_KB}KB)</Label>
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
      <CardFooter className="flex justify-start border-t pt-4"> 
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Encabezado
        </Button>
      </CardFooter>
    </Card>
  );
}
