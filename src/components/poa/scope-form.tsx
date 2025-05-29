"use client";

import { usePOA } from "@/hooks/use-poa";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle, AiEnhanceButton } from "./common-form-elements";
import { enhanceText } from "@/ai/flows/enhance-text";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ScopeForm() {
  const { poa, updateField } = usePOA();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();

  const handleAiEnhance = async () => {
    if (!poa?.scope) return;
    setIsLoadingAi(true);
    try {
      const result = await enhanceText({ text: poa.scope });
      updateField("scope", result.enhancedText);
      toast({ title: "Scope Enhanced", description: "The scope text has been improved by AI." });
    } catch (error) {
      console.error("Error enhancing scope:", error);
      toast({ title: "AI Enhancement Failed", description: "Could not enhance the scope text.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };
  
  if (!poa) return <div>Loading POA data...</div>;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <SectionTitle title="Scope" description="Define the boundaries of this POA. This can be AI-generated from the Procedure Description or manually entered/edited." />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="scope">Scope Definition</Label>
          <Textarea
            id="scope"
            value={poa.scope || ""}
            onChange={(e) => updateField("scope", e.target.value)}
            placeholder="Describe the scope, including involved departments, processes, roles, and any exclusions..."
            rows={10}
            className="min-h-[200px]"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <AiEnhanceButton
            onClick={handleAiEnhance}
            isLoading={isLoadingAi}
            textExists={!!poa.scope && poa.scope.length > 10}
          />
        </div>
         {/* Displaying the AI-generated introduction here if it exists, as per original thought that scope/intro are related */}
        {poa.introduction && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="font-semibold text-lg mb-2 text-primary">Generated Introduction:</h4>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{poa.introduction}</p>
            <p className="text-xs text-muted-foreground mt-2">This introduction was automatically generated. You can copy and refine it as needed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
