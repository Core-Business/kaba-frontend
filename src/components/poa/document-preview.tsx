
"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle } from "./common-form-elements";
import { generatePOAHTML } from "@/lib/html-generator";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { useAttachments } from "@/hooks/use-attachments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileCode, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { POAAPI } from "@/api/poa";

export function DocumentPreview() {
  const { poa } = usePOA();
  const { toast } = useToast();
  const { attachments } = useAttachments(poa?.procedureId || "");
  const [isDownloading, setIsDownloading] = useState(false);

  const htmlPreview = useMemo(() => (poa ? generatePOAHTML(poa, attachments) : ""), [poa, attachments]);

  const handleDownloadHTML = () => {
    if (!poa) {
      toast({ title: "Error", description: "No hay datos del Procedimiento POA para descargar.", variant: "destructive" });
      return;
    }
    const htmlContent = generatePOAHTML(poa, attachments);
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

  const handleDownloadPDF = async () => {
    if (!poa) return;
    try {
      setIsDownloading(true);
      const blob = await POAAPI.downloadPdf(poa.procedureId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = poa.header.title ? poa.header.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'procedimiento_poa';
      link.setAttribute('download', `${fileName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast({ title: "Descarga completada", description: "El PDF se ha descargado correctamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo descargar el PDF.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!poa) return <div>Cargando datos del Procedimiento POA...</div>;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <SectionTitle title="Vista Previa y Exportación del Documento" description="Revisa tu Procedimiento POA y descárgalo como archivo HTML." />
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadHTML}>
                <FileCode className="mr-2 h-4 w-4" />
                Descargar HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Descargar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="w-full border rounded-lg p-1 bg-muted aspect-[1/1.414] overflow-hidden"> 
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
