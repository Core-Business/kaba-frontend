"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

interface KpiManagerProps {
  kpis: string[];
  onChange: (kpis: string[]) => void;
}

export function KpiManager({ kpis, onChange }: KpiManagerProps) {
  const [newKpi, setNewKpi] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newKpi.trim()) {
      onChange([...kpis, newKpi.trim()]);
      setNewKpi("");
      setIsAdding(false);
    }
  };

  const handleRemove = (index: number) => {
    const newKpis = kpis.filter((_, i) => i !== index);
    onChange(newKpis);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">KPIs (Indicadores Clave)</Label>
      <div className="flex flex-wrap gap-2">
        {kpis.filter(k => k.trim() !== "").map((kpi, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 pl-2.5 pr-1.5 py-1 text-sm font-normal border border-blue-100"
          >
            {kpi}
            <button
              onClick={() => handleRemove(index)}
              className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {isAdding ? (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Input
              value={newKpi}
              onChange={(e) => setNewKpi(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 text-xs px-2 bg-white border-blue-300 focus:ring-blue-500 w-full"
              placeholder="Escribe y presiona Enter..."
              autoFocus
              onBlur={() => {
                 if(newKpi.trim()) handleAdd();
                 else setIsAdding(false);
              }}
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 px-2 text-xs border border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar KPI
          </Button>
        )}
      </div>
    </div>
  );
}
