"use client";

import { cn } from "@/lib/utils";
import type { POAStatusType } from "@/lib/schema";

const POA_STATUSES: { value: POAStatusType; label: string; color: string }[] = [
  { value: "Borrador", label: "Borrador", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  { value: "Vigente", label: "Vigente", color: "bg-green-100 text-green-700 hover:bg-green-200" },
  { value: "Revisión", label: "Revisión", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  { value: "Obsoleto", label: "Obsoleto", color: "bg-gray-200 text-gray-600 hover:bg-gray-300" },
  { value: "Cancelado", label: "Cancelado", color: "bg-red-100 text-red-700 hover:bg-red-200" },
];

interface StatusSelectorProps {
  value: POAStatusType;
  onChange: (value: POAStatusType) => void;
  disabled?: boolean;
}

export function StatusSelector({ value, onChange, disabled }: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {POA_STATUSES.map((status) => {
        const isActive = value === status.value;
        return (
          <button
            key={status.value}
            type="button"
            onClick={() => onChange(status.value)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              isActive
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                : "border-transparent " + status.color,
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {status.label}
          </button>
        );
      })}
    </div>
  );
}
