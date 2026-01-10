"use client";

import { FileText, Edit, Download, MoreVertical, Copy, Archive, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormattedDateClient } from "@/components/shared/formatted-date";
import type { Procedure } from "@/api/procedures";

interface ProcedureCardProps {
  procedure: Procedure;
  onEdit: (procedure: Procedure) => void;
  onDownload: (procedure: Procedure) => void;
  onDuplicate: (procedure: Procedure) => void;
  onArchive: (procedure: Procedure) => void;
  onDelete: (procedure: Procedure) => void;
  isDeleting?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Publicado", className: "bg-green-100 text-green-700" },
  review: { label: "En Revisión", className: "bg-amber-100 text-amber-700" },
  draft: { label: "Borrador", className: "bg-gray-100 text-gray-700" },
  archived: { label: "Archivado", className: "bg-red-100 text-red-700" },
};

export function ProcedureCard({
  procedure,
  onEdit,
  onDownload,
  onDuplicate,
  onArchive,
  onDelete,
  isDeleting,
}: ProcedureCardProps) {
  const status = procedure.status?.toLowerCase() || "draft";
  const { label: statusLabel, className: statusClassName } = statusConfig[status] || statusConfig.draft;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 bg-blue-50 rounded-xl shrink-0">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{procedure.title}</h3>
            <Badge className={statusClassName}>{statusLabel}</Badge>
          </div>
          
          {procedure.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{procedure.description}</p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{procedure.code}</span>
            <span>·</span>
            <span>v{procedure.version}</span>
            <span>·</span>
            <span>
              <FormattedDateClient dateString={procedure.updatedAt} />
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="default" size="sm" onClick={() => onEdit(procedure)} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(procedure)}
            disabled={status !== "published"}
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(procedure)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(procedure)}>
                <Archive className="mr-2 h-4 w-4" />
                Archivar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(procedure)}
                className="text-red-600 focus:text-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
