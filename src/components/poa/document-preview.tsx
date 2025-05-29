
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { generatePOAHTML } from "@/lib/html-generator";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function DocumentPreview() {
  const { poa } = usePOA();
  const { toast } = useToast();
  const [htmlPreview, setHtmlPreview] = useState<string>("");

  useEffect(() => {
    if (poa) {
      setHtmlPreview(generatePOAHTML(poa));
    }
  }, [poa]);

  const handleDownloadHTML = () => {
    if (!poa) {
      toast({ title: "Error", description: "No hay datos del Procedimiento POA para descargar.", variant: "destructive" });
      return;
    }
    const htmlContent = generatePOAHTML(poa);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = poa.header.title ? poa.header.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'procedimiento_poa';
    link.download = `${fileName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Descarga Iniciada", description: `${fileName}.html se está descargando.` });
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Vista Previa y Exportación del Documento" description="Revisa tu Procedimiento POA y descárgalo como archivo HTML." />
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-6">
          <Button onClick={handleDownloadHTML}>
            <Download className="mr-2 h-4 w-4" />
            Descargar HTML
          </Button>
        </div>
        
        <div className="border rounded-lg p-1 bg-muted aspect-[1/1.414] overflow-hidden"> 
           <iframe
            srcDoc={htmlPreview}
            title="Vista previa del Procedimiento POA"
            className="w-full h-full border-0"
            sandbox="allow-scripts" 
          />
        </div>
         <p className="text-xs text-muted-foreground mt-2 text-center">
            <Eye className="inline mr-1 h-3 w-3" /> Vista previa en vivo del documento HTML generado.
          </p>
      </CardContent>
    </Card>
  );
}
