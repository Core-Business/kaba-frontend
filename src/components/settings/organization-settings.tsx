"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Building, Users, Palette, Camera, Loader2 } from "lucide-react";
import { OrganizationAPI, Organization } from "@/api/organization";

export function OrganizationSettings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "COMPANY",
  });

  const loadOrganization = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await OrganizationAPI.getCurrent();
      setOrganization(data);
      setFormData({
        name: data.name || "",
        type: data.type || "COMPANY",
      });
    } catch (error) {
      console.error("Error loading organization:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la organización.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedOrg = await OrganizationAPI.updateCurrent({
        name: formData.name,
        type: formData.type as 'COMPANY' | 'CONSULTANCY',
      });
      setOrganization(updatedOrg);
      toast({
        title: "Organización actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la organización.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona una imagen.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingLogo(true);
      const { url } = await OrganizationAPI.uploadLogo(file);
      
      // Update local state with new logo URL
      if (organization) {
        const updatedOrg = {
          ...organization,
          branding: {
            ...organization.branding,
            logoUrl: url
          }
        };
        setOrganization(updatedOrg);
        
        // Also update in backend to persist the URL in branding jsonb
        await OrganizationAPI.updateCurrent({
          branding: updatedOrg.branding
        });
      }

      toast({
        title: "Logo actualizado",
        description: "El logo de la organización se ha actualizado.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información General
          </CardTitle>
          <CardDescription>
            Detalles básicos de tu organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre de la Organización</Label>
                <Input
                  id="orgName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Acme Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgType">Tipo de Organización</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="orgType">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">Empresa</SelectItem>
                    <SelectItem value="CONSULTANCY">Consultora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>
            Personaliza la apariencia de tu organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-transparent group-hover:border-primary transition-all" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={organization?.branding?.logoUrl || "https://placehold.co/200x200.png?text=Logo"} alt="Org Logo" />
                  <AvatarFallback className="text-2xl">
                    {organization?.name?.substring(0, 2).toUpperCase() || "OR"}
                  </AvatarFallback>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingLogo ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Logo de la Organización</h3>
                <p className="text-sm text-muted-foreground">
                  Sube un logo para personalizar tu espacio de trabajo. <br />
                  Formatos: PNG, JPG.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members (Placeholder for now as per plan) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros
          </CardTitle>
          <CardDescription>
            Gestiona los miembros de tu organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>La gestión avanzada de miembros estará disponible próximamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
