"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchQuery?: string;
  onCreateNew: () => void;
}

export function EmptyState({ searchQuery, onCreateNew }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileText className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchQuery ? "Sin resultados" : "No hay procedimientos"}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {searchQuery
          ? "No se encontraron procedimientos que coincidan con tu búsqueda."
          : "Crea tu primer procedimiento para comenzar a documentar tus procesos."}
      </p>
      {!searchQuery && (
        <Button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Procedimiento
        </Button>
      )}
    </div>
  );
}
