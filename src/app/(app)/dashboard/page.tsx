"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProcedures } from "@/hooks/use-procedures";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Building, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Download, 
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  User,
  CreditCard,
  LogOut,
  Loader2,
  AlertCircle,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedDateClient } from "@/components/shared/formatted-date";
import Link from "next/link";

// Tipos para las métricas
interface DashboardMetrics {
  total: number;
  completed: number;
  drafts: number;
  recent: number;
}

// Tipos para los filtros
type FilterType = 'recent' | 'completed' | 'drafts';

// Componente del Sidebar
function DashboardSidebar() {
  const router = useRouter();
  
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
    <div className="w-64 border-r bg-background h-screen fixed left-0 top-0 z-40">
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

// Componente de métricas animadas
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: '#10367D' }}>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            displayValue.toLocaleString()
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de la barra superior
function TopBar({ onSearch, onCreateNew }: { onSearch: (query: string) => void; onCreateNew: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex items-center space-x-2 max-w-md">
          <Input
            placeholder="Buscar procedimientos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          onClick={onCreateNew}
          style={{ backgroundColor: '#10367D' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Procedimiento
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.png" alt="Usuario" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Administrar suscripción</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Componente de lista de procedimientos
function ProceduresList({ 
  procedures, 
  onEdit, 
  onDownload, 
  onDuplicate, 
  onArchive, 
  onDelete 
}: {
  procedures: any[];
  onEdit: (procedure: any) => void;
  onDownload: (procedure: any) => void;
  onDuplicate: (procedure: any) => void;
  onArchive: (procedure: any) => void;
  onDelete: (procedure: any) => void;
}) {
     const getStatusColor = (status: string) => {
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

   const getStatusLabel = (status: string) => {
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
        <Card key={procedure.id} className="hover:shadow-md transition-shadow">
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
                  <p className="text-gray-600 text-sm">{procedure.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
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

// Componente principal del Dashboard
export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Hooks de la API
  const { list, create, remove } = useProcedures();
  const proceduresQuery = list();
  const createProcedureMutation = create();
  const deleteProcedureMutation = remove();

  // Calcular métricas
  const metrics = useMemo((): DashboardMetrics => {
    const procedures = Array.isArray(proceduresQuery.data) ? proceduresQuery.data : [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
         return {
       total: procedures.length,
       completed: procedures.filter(p => p.status?.toLowerCase() === 'published').length,
       drafts: procedures.filter(p => p.status?.toLowerCase() === 'draft' || !p.status).length,
       recent: procedures.filter(p => p.updatedAt && new Date(p.updatedAt) >= sevenDaysAgo).length,
     };
  }, [proceduresQuery.data]);

  // Filtrar y paginar procedimientos
  const filteredAndPaginatedProcedures = useMemo(() => {
    let procedures = Array.isArray(proceduresQuery.data) ? proceduresQuery.data : [];
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      procedures = procedures.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por tipo
    switch (activeFilter) {
             case 'completed':
         procedures = procedures.filter(p => p.status?.toLowerCase() === 'published');
         break;
      case 'drafts':
        procedures = procedures.filter(p => p.status?.toLowerCase() === 'draft' || !p.status);
        break;
             case 'recent':
         const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
         procedures = procedures.filter(p => p.updatedAt && new Date(p.updatedAt) >= sevenDaysAgo);
         break;
    }
    
         // Ordenar por fecha de modificación (más reciente primero)
     procedures.sort((a, b) => {
       const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
       const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
       return dateB - dateA;
     });
    
    // Paginar
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProcedures = procedures.slice(startIndex, endIndex);
    
    return {
      procedures: paginatedProcedures,
      totalCount: procedures.length,
      totalPages: Math.ceil(procedures.length / itemsPerPage)
    };
  }, [proceduresQuery.data, searchQuery, activeFilter, currentPage]);

  // Handlers
  const handleCreateNew = async () => {
    const defaultName = `Nuevo Procedimiento ${Date.now()}`;
    
    try {
      const newProcedure = await createProcedureMutation.mutateAsync({
        title: defaultName,
        description: "Descripción del procedimiento",
        code: `PROC-${Date.now()}`,
        version: 1,
        status: 'draft',
      });

      toast({
        title: "Procedimiento Creado",
        description: `El procedimiento "${newProcedure.title}" ha sido creado exitosamente.`,
      });

      // Redirigir al builder
      const poaId = `proc-${newProcedure.id}-${Date.now()}`;
      router.push(`/builder/${poaId}/header`);
    } catch (error) {
      console.error('Error creating procedure:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el procedimiento.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (procedure: any) => {
    const poaId = `proc-${procedure.id}-${Date.now()}`;
    router.push(`/builder/${poaId}/header`);
  };

     const handleDownload = (procedure: any) => {
     if (procedure.status?.toLowerCase() !== 'published') {
       toast({
         title: "Descarga no disponible",
         description: "Solo se pueden descargar procedimientos publicados.",
         variant: "destructive",
       });
       return;
     }
    
    // TODO: Implementar lógica de descarga
    toast({
      title: "Descarga iniciada",
      description: `Descargando ${procedure.title}...`,
    });
  };

  const handleDuplicate = async (procedure: any) => {
    try {
      const duplicatedProcedure = await createProcedureMutation.mutateAsync({
        title: `${procedure.title} (Copia)`,
        description: procedure.description,
        code: `PROC-${Date.now()}`,
        version: 1,
        status: 'draft',
      });

      toast({
        title: "Procedimiento Duplicado",
        description: `Se ha creado una copia de "${procedure.title}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo duplicar el procedimiento.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = (procedure: any) => {
    // TODO: Implementar lógica de archivado
    toast({
      title: "Procedimiento Archivado",
      description: `"${procedure.title}" ha sido archivado.`,
    });
  };

  const handleDelete = async (procedure: any) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este procedimiento? Esta acción no se puede deshacer.")) {
      try {
        await deleteProcedureMutation.mutateAsync(procedure.id);
        toast({
          title: "Procedimiento Eliminado",
          description: "El procedimiento ha sido eliminado exitosamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el procedimiento.",
          variant: "destructive",
        });
      }
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
    <div className="flex h-screen bg-gray-50">
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
      <div className="flex-1 lg:ml-64">
        <div className="p-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#10367D' }}>Dashboard</h1>
            <p className="text-gray-600">Gestiona tus procedimientos existentes o crea uno nuevo.</p>
          </div>

          {/* Top Bar */}
          <TopBar onSearch={handleSearch} onCreateNew={handleCreateNew} />

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Filters and Content */}
          <Tabs value={activeFilter} onValueChange={(value) => handleFilterChange(value as FilterType)}>
            <TabsList className="mb-6">
              <TabsTrigger value="recent">Recientes</TabsTrigger>
                             <TabsTrigger value="completed">Publicados</TabsTrigger>
              <TabsTrigger value="drafts">Borradores</TabsTrigger>
            </TabsList>

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
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay procedimientos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'No se encontraron procedimientos que coincidan con tu búsqueda.' : 'Crea tu primer procedimiento para comenzar.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateNew} style={{ backgroundColor: '#10367D' }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Procedimiento
                    </Button>
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
                      
                      <span className="text-sm text-gray-600">
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
  );
}