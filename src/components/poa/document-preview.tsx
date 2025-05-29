"use client";

import { usePOA } from "@/hooks/use-poa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      toast({ title: "Error", description: "No POA data to download.", variant: "destructive" });
      return;
    }
    const htmlContent = generatePOAHTML(poa);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = poa.header.title ? poa.header.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'plan_of_action';
    link.download = `${fileName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Download Started", description: `${fileName}.html is being downloaded.` });
  };

  if (!poa) return <div>Loading POA data...</div>;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Document Preview & Export" description="Review your Plan of Action and download it as an HTML file." />
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-6">
          <Button onClick={handleDownloadHTML}>
            <Download className="mr-2 h-4 w-4" />
            Download HTML
          </Button>
        </div>
        
        <div className="border rounded-lg p-1 bg-muted aspect-[1/1.414] overflow-hidden"> {/* A4-like aspect ratio for preview frame */}
           <iframe
            srcDoc={htmlPreview}
            title="POA Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts" // Be cautious with scripts if user input can generate them
          />
        </div>
         <p className="text-xs text-muted-foreground mt-2 text-center">
            <Eye className="inline mr-1 h-3 w-3" /> Live preview of the generated HTML document.
          </p>
      </CardContent>
    </Card>
  );
}
