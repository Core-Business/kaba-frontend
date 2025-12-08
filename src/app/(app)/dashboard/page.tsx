"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateProcedureMutation,
  useDeleteProcedureMutation,
  useProceduresList,
} from "@/hooks/use-procedures";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  FileText,
  Settings,
  LayoutGrid,
  CheckCircle,
  FileEdit,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchProceduresInput } from "@/components/dashboard/SearchProceduresInput";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { UserNav } from "@/components/layout/user-nav";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProcedureCard } from "@/components/dashboard/ProcedureCard";
import { FilterTabs } from "@/components/dashboard/FilterTabs";
import { EmptyState } from "@/components/dashboard/EmptyState";
import Link from "next/link";
import type { Procedure } from "@/api/procedures";

// Types
interface DashboardMetrics {
  total: number;
  completed: number;
  drafts: number;
  recent: number;
}

type FilterType = "recent" | "completed" | "drafts";

// Dashboard Header
function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center h-16 px-6 border-b bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <WorkspaceSelector />
      </div>
      <UserNav />
    </header>
  );
}

// Dashboard Sidebar
function DashboardSidebar() {
  const menuItems = [
    { icon: FileText, label: "Procedimientos", href: "/dashboard", isActive: true },
    { icon: Settings, label: "Configuraciones", href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-40">
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logo-kaba-blue.png"
            alt="KABA"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>

      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
              item.isActive
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Queries
  const proceduresQuery = useProceduresList();
  const createMutation = useCreateProcedureMutation();
  const deleteMutation = useDeleteProcedureMutation();

  // Metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const procedures = (proceduresQuery.data ?? []) as Procedure[];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: procedures.length,
      completed: procedures.filter((p) => p.status?.toLowerCase() === "published").length,
      drafts: procedures.filter((p) => p.status?.toLowerCase() === "draft").length,
      recent: procedures.filter(
        (p) => new Date(p.updatedAt ?? p.createdAt ?? "") >= sevenDaysAgo
      ).length,
    };
  }, [proceduresQuery.data]);

  // Filtered procedures
  const filteredProcedures = useMemo(() => {
    const procedures = (proceduresQuery.data ?? []) as Procedure[];

    let filtered = procedures;
    if (searchQuery) {
      filtered = procedures.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case "completed":
        filtered = filtered.filter((p) => p.status?.toLowerCase() === "published");
        break;
      case "drafts":
        filtered = filtered.filter((p) => p.status?.toLowerCase() === "draft");
        break;
      case "recent": {
        const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (p) => new Date(p.updatedAt ?? p.createdAt ?? "") >= sevenDaysAgo
        );
        break;
      }
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProcedures = filtered.slice(startIndex, startIndex + itemsPerPage);

    return { procedures: paginatedProcedures, totalPages, totalCount: filtered.length };
  }, [proceduresQuery.data, searchQuery, activeFilter, currentPage]);

  // Handlers
  const handleCreateNew = async () => {
    try {
      toast({ title: "Creando Procedimiento", description: "Preparando el nuevo procedimiento..." });
      const newProcedure = await createMutation.mutateAsync({
        title: `Nuevo Procedimiento ${new Date().toLocaleDateString()}`,
        description: "Procedimiento creado desde el builder",
        code: `PROC-${Date.now()}`,
        version: 1,
        status: "draft",
      });
      if (newProcedure.id) {
        router.push(`/builder/${newProcedure.id}`);
      } else {
        router.push("/builder/new");
      }
    } catch (error) {
      console.error("Error creating procedure:", error);
      toast({ title: "Error", description: "No se pudo crear el procedimiento.", variant: "destructive" });
      router.push("/builder/new");
    }
  };

  const handleEdit = (procedure: Procedure) => router.push(`/builder/${procedure.id}`);
  const handleDownload = (procedure: Procedure) => {
    toast({ title: "Descarga Iniciada", description: `Descargando "${procedure.title}"...` });
  };
  const handleDuplicate = (procedure: Procedure) => {
    toast({ title: "Procedimiento Duplicado", description: `Se ha creado una copia de "${procedure.title}".` });
  };
  const handleArchive = (procedure: Procedure) => {
    toast({ title: "Procedimiento Archivado", description: `"${procedure.title}" ha sido archivado.` });
  };

  const handleDelete = async (procedure: Procedure) => {
    if (!procedure.id || deleteMutation.isPending) return;
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar "${procedure.title}"? Esta acción no se puede deshacer.`
    );
    if (!isConfirmed) return;

    try {
      setDeletingId(procedure.id);
      await deleteMutation.mutateAsync(procedure.id);
      toast({ title: "Procedimiento Eliminado", description: "El procedimiento ha sido eliminado exitosamente." });
    } catch (error) {
      console.error("Error deleting procedure:", error);
      toast({ title: "Error", description: "No se pudo eliminar el procedimiento.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader />
      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
              <DashboardSidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Mobile Menu Button */}
            <div className="lg:hidden mb-4">
              <Button variant="outline" size="sm" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
              <p className="text-gray-500 mt-1">
                Gestiona tus procedimientos existentes o crea uno nuevo.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Total de Procedimientos"
                value={metrics.total}
                icon={LayoutGrid}
                color="blue"
                isLoading={proceduresQuery.isLoading}
              />
              <MetricCard
                title="Publicados"
                value={metrics.completed}
                icon={CheckCircle}
                color="green"
                isLoading={proceduresQuery.isLoading}
              />
              <MetricCard
                title="Borradores"
                value={metrics.drafts}
                icon={FileEdit}
                color="gray"
                isLoading={proceduresQuery.isLoading}
              />
              <MetricCard
                title="Recientes (7 días)"
                value={metrics.recent}
                icon={Clock}
                color="purple"
                isLoading={proceduresQuery.isLoading}
              />
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
              <div className="flex items-center gap-3">
                <SearchProceduresInput onSearch={handleSearch} className="w-64" />
                <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 rounded-full px-5">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo
                </Button>
              </div>
            </div>

            {/* Procedures List */}
            {proceduresQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-500">Cargando procedimientos...</span>
              </div>
            ) : proceduresQuery.error ? (
              <div className="flex items-center justify-center py-16 text-red-600">
                <AlertCircle className="h-8 w-8 mr-2" />
                <span>Error al cargar los procedimientos</span>
              </div>
            ) : filteredProcedures.procedures.length === 0 ? (
              <EmptyState searchQuery={searchQuery} onCreateNew={handleCreateNew} />
            ) : (
              <>
                <div className="space-y-3">
                  {filteredProcedures.procedures.map((procedure) => (
                    <ProcedureCard
                      key={procedure.id}
                      procedure={procedure}
                      onEdit={handleEdit}
                      onDownload={handleDownload}
                      onDuplicate={handleDuplicate}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      isDeleting={deletingId === procedure.id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {filteredProcedures.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-500">
                      Página {currentPage} de {filteredProcedures.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.min(filteredProcedures.totalPages, currentPage + 1))
                      }
                      disabled={currentPage === filteredProcedures.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}