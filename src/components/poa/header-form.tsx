"use client";

import { usePOA } from "@/hooks/use-poa";
import {
  useProcedureQuery,
  useUpdateProcedureMutation,
} from "@/hooks/use-procedures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, FileText, Calendar, Hash, Building2, MapPin, User, FolderOpen, Loader2 } from "lucide-react";
import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { POAStatusType } from "@/lib/schema";
import { StatusSelector } from "./status-selector";
import { LogoUploadZone } from "./logo-upload-zone";

export function HeaderForm() {
  const { poa, saveToBackend, isBackendLoading, backendProcedureId, updateHeader, updatePoaName } = usePOA();
  const updateProcedureMutation = useUpdateProcedureMutation();
  const procedureQuery = useProcedureQuery(backendProcedureId);
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleStatusChange = (value: POAStatusType) => {
    updateHeader({ status: value });
  };

  const handleLogoChange = useCallback((dataUrl: string, fileName: string) => {
    setLogoPreview(dataUrl);
    updateHeader({ logoUrl: dataUrl, logoFileName: fileName });
    toast({ title: "Logo actualizado", description: "El logo ha sido cargado correctamente." });
  }, [updateHeader, toast]);

  const handleLogoRemove = useCallback(() => {
    setLogoPreview(null);
    updateHeader({ logoUrl: "", logoFileName: "" });
    toast({ title: "Logo eliminado" });
  }, [updateHeader, toast]);

  const handleSave = async () => {
    if (!poa || !backendProcedureId) {
      toast({
        title: "Error",
        description: "No hay datos para guardar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveToBackend();
      
      if (poa.name && procedureQuery.data) {
        try {
          await updateProcedureMutation.mutateAsync({
            id: backendProcedureId,
            payload: { title: poa.name }
          });
        } catch {
          // Non-critical sync error
        }
      }
      
      toast({
        title: "Guardado exitoso",
        description: "Los cambios han sido guardados.",
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isBackendLoading || !poa) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Encabezado del Procedimiento</h1>
        <p className="text-sm text-gray-500 mt-1">Define los detalles principales de tu procedimiento.</p>
      </div>

      {/* Top Section: Logo + Document Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Logo de la Empresa</h2>
          </div>
          <LogoUploadZone
            logoPreview={logoPreview}
            logoFileName={poa.header.logoFileName}
            onLogoChange={handleLogoChange}
            onLogoRemove={handleLogoRemove}
          />
        </div>

        {/* Document Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Información del Documento</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="documentCode" className="text-xs text-gray-500 flex items-center gap-1">
                <Hash className="h-3 w-3" /> Código
              </Label>
              <Input
                id="documentCode"
                name="documentCode"
                value={poa.header.documentCode || ""}
                onChange={handleInputChange}
                placeholder="PROC-001"
                className="h-9 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="version" className="text-xs text-gray-500">
                Versión
              </Label>
              <Input
                id="version"
                name="version"
                value={poa.header.version || ""}
                onChange={handleInputChange}
                placeholder="1.0"
                className="h-9 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="date" className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Fecha
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={poa.header.date || ""}
                onChange={handleInputChange}
                className="h-9 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* Procedure Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nombre del Procedimiento
          </Label>
          <Input
            id="name"
            name="name"
            value={poa.name || ""}
            onChange={handleInputChange}
            placeholder="Ej: Procedimiento de Gestión de Calidad"
            className="h-11 text-base bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
            maxLength={60}
          />
          <p className="text-xs text-gray-400">
            Este nombre aparecerá como título del documento (máx. 60 caracteres)
          </p>
        </div>

        {/* Status Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Estado</Label>
          <StatusSelector
            value={poa.header.status || "Borrador"}
            onChange={handleStatusChange}
          />
        </div>

        {/* Two Column Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-xs text-gray-500 flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Empresa
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={poa.header.companyName || ""}
              onChange={handleInputChange}
              placeholder="Nombre de la empresa"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="departmentArea" className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Área / Departamento
            </Label>
            <Input
              id="departmentArea"
              name="departmentArea"
              value={poa.header.departmentArea || ""}
              onChange={handleInputChange}
              placeholder="Ej: Operaciones"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author" className="text-xs text-gray-500 flex items-center gap-1">
              <User className="h-3 w-3" /> Autor
            </Label>
            <Input
              id="author"
              name="author"
              value={poa.header.author || ""}
              onChange={handleInputChange}
              placeholder="Nombre del autor"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fileLocation" className="text-xs text-gray-500 flex items-center gap-1">
              <FolderOpen className="h-3 w-3" /> Ubicación del Archivo
            </Label>
            <Input
              id="fileLocation"
              name="fileLocation"
              value={poa.header.fileLocation || ""}
              onChange={handleInputChange}
              placeholder="Servidor / Documentos / POAs"
              className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-11"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Encabezado
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
