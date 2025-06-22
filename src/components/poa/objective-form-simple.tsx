"use client";

import { usePOABackend } from "@/hooks/use-poa-backend";
import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, Brain, Wand2, Lightbulb } from "lucide-react";
import { useParams } from "next/navigation";

export function ObjectiveFormSimple() {
  const params = useParams();
  const poaId = typeof params.poaId === 'string' ? params.poaId : '';
  const { poa, saveToBackend } = usePOABackend(poaId);
  const { updateField } = usePOA();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField("objective", e.target.value);
  };

  const handleSave = async () => {
    if (!poa) return;
    
    setIsLoading(true);
    try {
      await saveToBackend();
      toast({ 
        title: "Objetivo Guardado", 
        description: "El objetivo se ha guardado correctamente." 
      });
    } catch (error) {
      console.error("Error guardando objetivo:", error);
      toast({ 
        title: "Error al Guardar", 
        description: "No se pudo guardar el objetivo.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const handleAiEnhance = () => {
    toast({ 
      title: "Funcionalidad de IA Pendiente", 
      description: "La funcionalidad de IA estará disponible pronto. Por favor, configura tu clave API de Google Gemini.", 
      variant: "default" 
    });
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle 
          title="Objetivo" 
          description="Establece claramente la meta principal o propósito de este Procedimiento POA." 
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 w-full">
          <Label htmlFor="objective">Declaración del Objetivo</Label>
          <Textarea
            id="objective"
            value={poa.objective || ""}
            onChange={handleObjectiveChange}
            placeholder="Describe el objetivo principal aquí..."
            rows={5}
            className="min-h-[100px] w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={handleAiEnhance}
            className="flex items-center"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Editar con IA
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleAiEnhance}
            className="flex items-center"
          >
            <Brain className="mr-2 h-4 w-4" />
            Generar con IA
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Consejos para redactar un buen objetivo:</p>
              <ul className="space-y-1 text-xs">
                <li>• Inicia con un verbo en infinitivo (establecer, implementar, mejorar, etc.)</li>
                <li>• Sé específico y medible cuando sea posible</li>
                <li>• Indica claramente qué se quiere lograr</li>
                <li>• Mantén la redacción clara y concisa</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Auto-guardado cada 2 minutos
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : "Guardar Objetivo"}
        </Button>
      </CardFooter>
    </Card>
  );
} 