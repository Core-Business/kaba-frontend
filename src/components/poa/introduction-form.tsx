"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { Button } from "@/components/ui/button";
import { generateIntroduction } from "@/ai/flows/generate-introduction";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function IntroductionForm() {
  const {
    poa,
    saveToBackend,
    isBackendLoading,
    backendProcedureId,
    updateField,
    setIsDirty,
  } = usePOA();
  const [isGeneratingAiIntro, setIsGeneratingAiIntro] = useState(false);
  const { toast } = useToast();

  const handleProcedureDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateField("procedureDescription", e.target.value);
    setIsDirty(true);
  };

  const handleGenerateIntroduction = async () => {
    if (!poa) return;

    setIsGeneratingAiIntro(true);
    try {
      const result = await generateIntroduction({
        procedureDescription: poa.procedureDescription || undefined,
        procedureName: poa.name,
        companyName: poa.header.companyName,
        department: poa.header.departmentArea,
        objective: poa.objective,
        scope: poa.scope,
        activities: poa.activities
          .map((a) => a.activityName)
          .filter(Boolean) as string[],
      });
      updateField("procedureDescription", result.introduction);
      toast({
        title: "Introducción Generada con IA",
        description:
          "Se ha generado una nueva introducción y se ha actualizado el campo.",
      });
    } catch (error) {
      console.error("Error generating introduction:", error);
      toast({
        title: "Fallo al Generar Introducción",
        description: "No se pudo generar la introducción.",
        variant: "destructive",
      });
    }
    setIsGeneratingAiIntro(false);
  };

  const handleSave = async () => {
    if (!poa || !backendProcedureId) {
      toast({
        title: "Error",
        description:
          "No hay datos para guardar o falta el ID del procedimiento.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(
        "Guardando introducción con procedureId:",
        backendProcedureId
      );
      await saveToBackend();
      toast({
        title: "Introducción Guardada",
        description:
          "La introducción ha sido guardada exitosamente en el servidor.",
      });
    } catch (error) {
      console.error("Error al guardar introducción:", error);
      toast({
        title: "Error al Guardar",
        description: `No se pudo guardar la introducción: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        variant: "destructive",
      });
    }
  };

  if (isBackendLoading || !poa)
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
        <p className="ml-2">Cargando datos...</p>
      </div>
    );

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle
          title="Introducción"
          description="Detalla la introducción del procedimiento. Esta información puede ser usada por IA para ayudar a generar otras secciones o refinar esta misma."
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="procedureDescription">
              Contenido de la Introducción
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateIntroduction}
              disabled={isGeneratingAiIntro}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 h-8"
            >
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              {isGeneratingAiIntro
                ? "Generando..."
                : "Editar Introducción con IA"}
            </Button>
          </div>
          <Textarea
            id="procedureDescription"
            value={poa.procedureDescription || ""}
            onChange={handleProcedureDescriptionChange}
            placeholder="Escribe aquí la introducción del procedimiento..."
            rows={10} // Reduced rows
            className="min-h-[200px] w-full" // Reduced min-height
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-start border-t pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Introducción
        </Button>
      </CardFooter>
    </Card>
  );
}
