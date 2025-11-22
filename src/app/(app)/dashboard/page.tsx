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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Building, 
  FileText, 
  Settings, 
  Edit, 
  Download, 
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Loader2,
  AlertCircle,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedDateClient } from "@/components/shared/formatted-date";
import { SearchProceduresInput } from "@/components/dashboard/SearchProceduresInput";
import { NewProcedureButton } from "@/components/dashboard/NewProcedureButton";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import type { Procedure } from "@/api/procedures";

// Tipos para las métricas
interface DashboardMetrics {
  total: number;
  completed: number;
  drafts: number;
  recent: number;
}

// Tipos para los filtros
type FilterType = 'recent' | 'completed' | 'drafts';

// AppHeader component específico para el dashboard
function DashboardAppHeader() {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center h-20 px-6 border-b bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold mr-4" style={{ color: '#10367D' }}>Dashboard</h1>
        <WorkspaceSelector />
      </div>
      <UserNav />
    </header>
  );
}

// Componente del Sidebar
function DashboardSidebar() {
  const menuItems = [
    { 
      icon: FileText, 
      label: "Procedimientos", 
      href: "/dashboard",
      isActive: true 
    },
    { 
      icon: Settings, 
      label: "Configuraciones", 
      href: "/settings" 
    }
  ];

  return (
    <div className="w-64 border-r bg-background fixed left-0 top-20 bottom-0 z-40">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building className="h-8 w-8" style={{ color: '#10367D' }} />
          <span className="text-xl font-bold" style={{ color: '#10367D' }}>KABA Services</span>
        </Link>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              item.isActive 
                ? "text-white font-medium" 
                : "text-gray-600 hover:bg-gray-100"
            )}
            style={item.isActive ? { backgroundColor: '#10367D' } : {}}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

// Componente de métricas animadas con estilos mejorados
function MetricCard({ title, value, isLoading }: { title: string; value: number; isLoading: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    
    let start = 0;
    const end = value;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  return (
    <Card className="rounded-md border bg-white shadow-sm" data-testid="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0" data-testid="card-content">
        <div className="text-2xl font-bold" style={{ color: '#10367D' }}>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" data-testid="loading-spinner" />
          ) : (
            displayValue.toLocaleString()
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de lista de procedimientos
interface ProceduresListProps {
  procedures: Procedure[];
  onEdit: (procedure: Procedure) => void;
  onDownload: (procedure: Procedure) => void;
  onDuplicate: (procedure: Procedure) => void;
  onArchive: (procedure: Procedure) => void;
  onDelete: (procedure: Procedure) => void;
  deletingId?: string | null;
}

function ProceduresList({
  procedures,
  onEdit,
  onDownload,
  onDuplicate,
  onArchive,
  onDelete,
  deletingId,
}: ProceduresListProps) {
     const getStatusColor = (status?: string) => {
     switch (status?.toLowerCase()) {
       case 'published':
         return 'bg-green-100 text-green-800';
       case 'review':
         return 'bg-yellow-100 text-yellow-800';
       case 'draft':
         return 'bg-gray-100 text-gray-800';
       case 'archived':
         return 'bg-red-100 text-red-800';
       default:
         return 'bg-gray-100 text-gray-800';
     }
   };

   const getStatusLabel = (status?: string) => {
     switch (status?.toLowerCase()) {
       case 'published':
         return 'Publicado';
       case 'review':
         return 'En Revisión';
       case 'draft':
         return 'Borrador';
       case 'archived':
         return 'Archivado';
       default:
         return 'Borrador';
     }
   };

  return (
    <div className="space-y-4">
      {procedures.map((procedure) => (
        <Card
          key={procedure.id ?? `${procedure.code}-${procedure.updatedAt ?? procedure.createdAt ?? "draft"}`}
          className="hover:shadow-md transition-shadow rounded-md border bg-white shadow-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{procedure.title}</h3>
                  <Badge className={getStatusColor(procedure.status)}>
                    {getStatusLabel(procedure.status)}
                  </Badge>
                </div>
                
                {procedure.description && (
                  <p className="text-slate-500 text-sm">{procedure.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Código: {procedure.code}</span>
                  <span>Versión: {procedure.version}</span>
                                     <span>
                     Modificado: <FormattedDateClient dateString={procedure.updatedAt} />
                   </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(procedure)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(procedure)}
                                     disabled={procedure.status?.toLowerCase() !== 'published'}
                  className="disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
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
                      className="text-red-600"
                      disabled={deletingId === procedure.id}
                    >
                      {deletingId === procedure.id ? (
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Queries
  const proceduresQuery = useProceduresList();
  const createMutation = useCreateProcedureMutation();
  const deleteMutation = useDeleteProcedureMutation();

  // Métricas calculadas
  const metrics: DashboardMetrics = useMemo(() => {
    const procedures = (proceduresQuery.data ?? []) as Procedure[];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: procedures.length,
      completed: procedures.filter((procedure) => procedure.status?.toLowerCase() === "published").length,
      drafts: procedures.filter((procedure) => procedure.status?.toLowerCase() === "draft").length,
      recent: procedures.filter((procedure) => new Date(procedure.updatedAt ?? procedure.createdAt ?? "") >= sevenDaysAgo).length,
    };
  }, [proceduresQuery.data]);

  // Procedimientos filtrados y paginados
  const filteredAndPaginatedProcedures = useMemo(() => {
    const procedures = (proceduresQuery.data ?? []) as Procedure[];
    
    let filtered: Procedure[] = procedures;
    if (searchQuery) {
      filtered = procedures.filter((procedure) =>
        procedure.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        procedure.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        procedure.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
             case 'completed':
        filtered = filtered.filter((procedure) => procedure.status?.toLowerCase() === 'published');
         break;
      case 'drafts':
        filtered = filtered.filter((procedure) => procedure.status?.toLowerCase() === 'draft');
        break;
             case 'recent':
        {
          const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(
            (procedure) => new Date(procedure.updatedAt ?? procedure.createdAt ?? "") >= sevenDaysAgo,
          );
        }
         break;
    }
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProcedures = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      procedures: paginatedProcedures,
      totalPages,
      totalCount: filtered.length
    };
  }, [proceduresQuery.data, searchQuery, activeFilter, currentPage, itemsPerPage]);

  const handleCreateNew = async () => {
    try {
      // Mostrar loading state
      toast({
        title: "Creando Procedimiento",
        description: "Preparando el nuevo procedimiento...",
      });

      // Crear un procedimiento nuevo en el backend
      const newProcedure = await createMutation.mutateAsync({
        title: `Nuevo Procedimiento ${new Date().toLocaleDateString()}`,
        description: "Procedimiento creado desde el builder",
        code: `PROC-${Date.now()}`,
        version: 1,
        status: "draft"
      });

      // Redirigir al ID real del procedimiento creado
      if (newProcedure.id) {
        router.push(`/builder/${newProcedure.id}`);
      } else {
        router.push("/builder/new");
      }
      
      toast({
        title: "Procedimiento Creado",
        description: "Procedimiento creado exitosamente. Redirigiendo al editor...",
      });
    } catch (error) {
      console.error('Error creating procedure:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el procedimiento. Intentando modo offline...",
        variant: "destructive",
      });
      
      // Fallback: ir a builder/new como antes
      router.push('/builder/new');
    }
  };

  const handleEdit = (procedure: Procedure) => {
    router.push(`/builder/${procedure.id}`);
  };

  const handleDownload = (procedure: Procedure) => {
    // Implementar lógica de descarga
    toast({
      title: "Descarga Iniciada",
      description: `Descargando "${procedure.title}"...`,
    });
  };

  const handleDuplicate = async (procedure: Procedure) => {
    try {
      toast({
        title: "Procedimiento Duplicado",
        description: `Se ha creado una copia de "${procedure.title}".`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo duplicar el procedimiento.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = (procedure: Procedure) => {
    toast({
      title: "Procedimiento Archivado",
      description: `"${procedure.title}" ha sido archivado.`,
    });
  };

  const handleDelete = async (procedure: Procedure) => {
    if (!procedure.id) {
      toast({
        title: "Error",
        description: "No se encontró el identificador del procedimiento.",
        variant: "destructive",
      });
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar "${procedure.title}"? Esta acción no se puede deshacer.`;
    const isConfirmed = window.confirm(confirmMessage);
    if (!isConfirmed || deleteMutation.isPending) {
      return;
    }

    try {
      setDeletingId(procedure.id);
      await deleteMutation.mutateAsync(procedure.id);
      toast({
        title: "Procedimiento Eliminado",
        description: "El procedimiento ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting procedure:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el procedimiento.",
        variant: "destructive",
      });
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

  // 🔍 DIAGNÓSTICO MULTI-TENANT - Agregar antes de los otros useEffect
  useEffect(() => {
    console.log('🔍 DIAGNÓSTICO MULTI-TENANT - Dashboard');
    
    // Verificar localStorage
    const token = localStorage.getItem('kaba.token');
    const workspaceCtx = localStorage.getItem('kaba.lastWorkspace');
    
    console.log('📱 Token presente:', token ? 'SÍ' : 'NO');
    console.log('🏢 Workspace context:', workspaceCtx ? JSON.parse(workspaceCtx) : 'NO ENCONTRADO');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔐 JWT payload:', {
          sub: payload.sub,
          email: payload.email,
          org: payload.org,
          ws: payload.ws,
          role: payload.role,
        });
      } catch {
        console.error('❌ Error decodificando JWT');
      }
    }
    
    // Verificar si los headers se están enviando
    const originalFetch = window.fetch;
    window.fetch = async (input, init: RequestInit = {}) => {
      const headers = new Headers(init.headers ?? {});
      console.log('📤 Request headers:', {
        url: input,
        'X-Organization-Id': headers.get('X-Organization-Id'),
        'X-Workspace-Id': headers.get('X-Workspace-Id'),
        Authorization: headers.has('Authorization') ? 'Bearer ***' : 'NO TOKEN',
      });

      return originalFetch(input, init);
    };
    
    // Limpiar el monkey patch después de 10 segundos
    setTimeout(() => {
      window.fetch = originalFetch;
    }, 10000);
    
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardAppHeader />
      <div className="flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
            <DashboardSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 pt-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              data-testid="mobile-menu-button"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <p className="text-slate-500">Gestiona tus procedimientos existentes o crea uno nuevo.</p>
          </div>

          {/* Metrics Cards */}
          <div className="mb-6 mt-6" data-testid="metrics-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
            <MetricCard 
              title="Total de Procedimientos" 
              value={metrics.total} 
              isLoading={proceduresQuery.isLoading} 
            />
                         <MetricCard 
               title="Publicados" 
               value={metrics.completed} 
               isLoading={proceduresQuery.isLoading} 
             />
            <MetricCard 
              title="Borradores" 
              value={metrics.drafts} 
              isLoading={proceduresQuery.isLoading} 
            />
            <MetricCard 
              title="Recientes (7 días)" 
              value={metrics.recent} 
              isLoading={proceduresQuery.isLoading} 
            />
            </div>
          </div>

          {/* Filters, Search and New Procedure Button */}
          <Tabs value={activeFilter} onValueChange={(value) => handleFilterChange(value as FilterType)}>
            <div className="mt-6 flex justify-between items-center mb-6">
              <TabsList>
              <TabsTrigger value="recent">Recientes</TabsTrigger>
                             <TabsTrigger value="completed">Publicados</TabsTrigger>
              <TabsTrigger value="drafts">Borradores</TabsTrigger>
            </TabsList>
              
              <div className="flex items-center gap-4 ml-auto">
                <SearchProceduresInput onSearch={handleSearch} className="max-w-md" />
                <NewProcedureButton onClick={handleCreateNew} />
              </div>
            </div>

            <TabsContent value={activeFilter}>
              {proceduresQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Cargando procedimientos...</span>
                </div>
              ) : proceduresQuery.error ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <span>Error al cargar los procedimientos</span>
                </div>
              ) : filteredAndPaginatedProcedures.procedures.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-state">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay procedimientos
                  </h3>
                <p className="text-slate-500 mb-4">
                    {searchQuery ? 'No se encontraron procedimientos que coincidan con tu búsqueda.' : 'Crea tu primer procedimiento para comenzar.'}
                  </p>
                  {!searchQuery && (
                  <NewProcedureButton onClick={handleCreateNew} />
                  )}
                </div>
              ) : (
                <>
                  <ProceduresList
                    procedures={filteredAndPaginatedProcedures.procedures}
                    onEdit={handleEdit}
                    onDownload={handleDownload}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />

                  {/* Pagination */}
                  {filteredAndPaginatedProcedures.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      
                    <span className="text-sm text-slate-500">
                        Página {currentPage} de {filteredAndPaginatedProcedures.totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(filteredAndPaginatedProcedures.totalPages, currentPage + 1))}
                        disabled={currentPage === filteredAndPaginatedProcedures.totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
}