"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Lightbulb } from "lucide-react";
import { KpiManager } from "./KpiManager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface HelperData {
  generalDescription: string;
  needOrProblem: string;
  purposeOrExpectedResult: string;
  targetAudience: string;
  desiredImpact: string;
  kpis: string[];
}

interface ContextPanelProps {
  data: HelperData;
  onChange: (data: HelperData) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function ContextPanel({ data, onChange, onGenerate, isGenerating }: ContextPanelProps) {
  const handleChange = (field: keyof Omit<HelperData, "kpis">, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleKpisChange = (newKpis: string[]) => {
    onChange({ ...data, kpis: newKpis });
  };

  const hasData = Object.values(data).some(val => 
    Array.isArray(val) ? val.some(s => s?.trim() !== '') : val?.trim() !== ''
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full shadow-sm flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-gray-900">
        <div className="bg-amber-100 p-1.5 rounded-lg">
          <Lightbulb className="h-5 w-5 text-amber-600" />
        </div>
        <h3 className="font-semibold text-base">Guía Inteligente</h3>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="generalDescription" className="text-xs font-medium text-gray-500">
              ¿Qué se hace? (Descripción)
            </Label>
            <Input
              id="generalDescription"
              value={data.generalDescription}
              onChange={(e) => handleChange("generalDescription", e.target.value)}
              placeholder="Ej: Implementar sistema de gestión..."
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="needOrProblem" className="text-xs font-medium text-gray-500">
              ¿Por qué? (Necesidad/Problema)
            </Label>
            <Input
              id="needOrProblem"
              value={data.needOrProblem}
              onChange={(e) => handleChange("needOrProblem", e.target.value)}
              placeholder="Ej: Reducir pérdidas..."
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purposeOrExpectedResult" className="text-xs font-medium text-gray-500">
              ¿Para qué? (Resultado)
            </Label>
            <Input
              id="purposeOrExpectedResult"
              value={data.purposeOrExpectedResult}
              onChange={(e) => handleChange("purposeOrExpectedResult", e.target.value)}
              placeholder="Ej: Lograr eficiencia operativa..."
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="targetAudience" className="text-xs font-medium text-gray-500">
                Audiencia
              </Label>
              <Input
                id="targetAudience"
                value={data.targetAudience}
                onChange={(e) => handleChange("targetAudience", e.target.value)}
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desiredImpact" className="text-xs font-medium text-gray-500">
                Impacto
              </Label>
              <Input
                id="desiredImpact"
                value={data.desiredImpact}
                onChange={(e) => handleChange("desiredImpact", e.target.value)}
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <KpiManager kpis={data.kpis} onChange={handleKpisChange} />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          onClick={onGenerate}
          disabled={!hasData || isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
        >
          {isGenerating ? (
            <LoadingSpinner className="mr-2 h-4 w-4" />
          ) : (
            <Brain className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? "Generando..." : "Generar con IA"}
        </Button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Completa los campos para generar un objetivo preciso
        </p>
      </div>
    </div>
  );
}
