"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit3, FileText, Trash2, LayoutGrid, List, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProcedures } from "@/hooks/use-procedures";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FormattedDateClient } from "@/components/shared/formatted-date";
import { AppHeader } from "@/components/layout/app-header";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);
  const [newProcedureNameInput, setNewProcedureNameInput] = useState("");
  const [newProcedureDescriptionInput, setNewProcedureDescriptionInput] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Función para abrir un procedimiento como POA
  const handleOpenProcedure = (procedure: any) => {
    // Generar un ID único para el POA basado en el procedimiento
    const poaId = `proc-${procedure.id}-${Date.now()}`;
    
    // Crear los datos del POA basado en el procedimiento
    const poaData = {
      id: poaId,
      name: procedure.title,
      header: {
        title: procedure.title,
        author: 'Sistema',
        version: procedure.version?.toString() || '1.0',
        date: new Date().toISOString().split('T')[0],
        logoUrl: '',
        companyName: 'Tu Empresa',
        departmentArea: 'Área de Procedimientos',
        status: procedure.status || 'Borrador',
        fileLocation: 'Sistema',
        documentCode: procedure.code || `POA-${Date.now()}`,
      },
      objective: 'Objetivo basado en el procedimiento. Edita según sea necesario.',
      introduction: '',
      procedureDescription: procedure.description || 'Descripción del procedimiento.',
      scope: 'Alcance del procedimiento. Edita según sea necesario.',
      activities: [],
      createdAt: procedure.createdAt || new Date().toISOString(),
      updatedAt: procedure.updatedAt || new Date().toISOString(),
      objectiveHelperData: {
        generalObjective: '',
        specificObjectives: [''],
        scope: '',
        beneficiaries: '',
        resources: '',
        timeline: '',
        successIndicators: '',
        risks: '',
        dependencies: ''
      },
      scopeHelperData: {
        inScope: [''],
        outOfScope: [''],
        assumptions: [''],
        constraints: [''],
        deliverables: [''],
        stakeholders: [''],
        boundaries: ''
      }
    };

    // Guardar el POA en localStorage
    const LOCAL_STORAGE_POA_LIST_KEY = "poaApp_poas";
    const LOCAL_STORAGE_POA_DETAIL_PREFIX = "poaApp_poa_detail_";
    
    // Guardar el POA completo
    localStorage.setItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaId}`, JSON.stringify(poaData));
    
    // Actualizar la lista de POAs
    const storedPoasRaw = localStorage.getItem(LOCAL_STORAGE_POA_LIST_KEY);
    let poasList: any[] = [];
    if (storedPoasRaw) {
      try {
        poasList = JSON.parse(storedPoasRaw);
      } catch (e) {
        console.error("Error parsing POA list:", e);
      }
    }
    
    poasList.push({
      id: poaId,
      name: procedure.title,
      updatedAt: new Date().toISOString(),
      logo: "https://placehold.co/40x40.png"
    });
    
    localStorage.setItem(LOCAL_STORAGE_POA_LIST_KEY, JSON.stringify(poasList));
    
    // Redirigir al builder
    router.push(`/builder/${poaId}/header`);
    
    toast({
      title: "POA Creado",
      description: `Se ha creado un POA basado en "${procedure.title}".`,
    });
  };

  // Usar hooks de la API
  const { list, create, remove } = useProcedures();
  const proceduresQuery = list();
  const createProcedureMutation = create();
  const deleteProcedureMutation = remove();

  const handleConfirmCreateNewProcedure = async () => {
    if (!newProcedureNameInput.trim()) {
      toast({
        title: "Nombre Requerido",
        description: "Por favor, ingresa un nombre para el procedimiento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newProcedure = await createProcedureMutation.mutateAsync({
        title: newProcedureNameInput.trim(),
        description: newProcedureDescriptionInput.trim() || undefined,
        code: `PROC-${Date.now()}`, // Generar un código único
        version: 1,
        status: 'draft',
      });

              toast({
          title: "Procedimiento Creado",
          description: `El procedimiento "${newProcedure.title}" ha sido creado exitosamente.`,
        });

      // Redirigir al builder del procedimiento usando el formato consistente
      const poaId = `proc-${newProcedure.id}-${Date.now()}`;
      router.push(`/builder/${poaId}/header`);
      setIsCreateDialogVisible(false);
      setNewProcedureNameInput("");
      setNewProcedureDescriptionInput("");
    } catch (error) {
      console.error('Error creating procedure:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el procedimiento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProcedure = async (idToDelete: string) => {
    if (window.confirm("¿Estás seguro de que quieres borrar este procedimiento? Esta acción no se puede deshacer.")) {
      try {
        console.log('Starting deletion for ID:', idToDelete);
        await deleteProcedureMutation.mutateAsync(idToDelete);
        
        // Forzar una actualización inmediata de la lista
        await proceduresQuery.refetch();
        
        toast({ 
          title: "Procedimiento Eliminado", 
          description: "El procedimiento ha sido eliminado exitosamente." 
        });
        
        console.log('Deletion completed and UI updated');
      } catch (error) {
        console.error('Error deleting procedure:', error);
        toast({ 
          title: "Error", 
          description: "No se pudo eliminar el procedimiento.",
          variant: "destructive"
        });
      }
    }
  };

  const procedures = Array.isArray(proceduresQuery.data) ? proceduresQuery.data : [];

  return (
    <>
      <AppHeader />
      <div className="container mx-auto py-8 px-4 md:px-6 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Gestiona tus procedimientos existentes o crea uno nuevo.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setViewMode('grid')} 
                title="Vista de Cuadrícula"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setViewMode('list')} 
                title="Vista de Lista"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
            <Dialog open={isCreateDialogVisible} onOpenChange={setIsCreateDialogVisible}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => setIsCreateDialogVisible(true)}>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Crear Nuevo Procedimiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Procedimiento</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo procedimiento que podrás usar para generar POAs.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="procedureName">Nombre del Procedimiento</Label>
                    <Input
                      id="procedureName"
                      value={newProcedureNameInput}
                      onChange={(e) => setNewProcedureNameInput(e.target.value)}
                      placeholder="Ej., Despliegue de Software"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="procedureDescription">Descripción (opcional)</Label>
                    <Input
                      id="procedureDescription"
                      value={newProcedureDescriptionInput}
                      onChange={(e) => setNewProcedureDescriptionInput(e.target.value)}
                      placeholder="Ej., Procedimiento para desplegar aplicaciones"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => {
                      setNewProcedureNameInput("");
                      setNewProcedureDescriptionInput("");
                    }}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    onClick={handleConfirmCreateNewProcedure}
                    disabled={createProcedureMutation.isPending}
                  >
                    {createProcedureMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Procedimiento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {proceduresQuery.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando procedimientos...</span>
          </div>
        ) : proceduresQuery.error ? (
          <Card className="text-center py-12 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="mt-4 text-2xl">Error al cargar procedimientos</CardTitle>
              <CardDescription className="mt-2 text-lg">
                No se pudieron cargar los procedimientos. Verifica tu conexión a internet.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button onClick={() => proceduresQuery.refetch()}>
                Reintentar
              </Button>
            </CardFooter>
          </Card>
        ) : procedures.length === 0 ? (
          <Card className="text-center py-12 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-secondary p-3 rounded-full w-fit">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4 text-2xl">Aún no hay procedimientos</CardTitle>
              <CardDescription className="mt-2 text-lg">
                Comienza creando tu primer procedimiento.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Dialog open={isCreateDialogVisible} onOpenChange={setIsCreateDialogVisible}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={() => setIsCreateDialogVisible(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Crear Tu Primer Procedimiento
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardFooter>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {procedures.map((procedure) => (
                  <Card key={procedure.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg">{procedure.title}</CardTitle>
                      <CardDescription>
                        {procedure.description || 'Sin descripción'}
                      </CardDescription>
                      {procedure.updatedAt && (
                        <CardDescription className="text-xs">
                          Actualizado: <FormattedDateClient dateString={procedure.updatedAt} />
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {/* Aquí se podría mostrar más información del procedimiento */}
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleOpenProcedure(procedure)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Abrir Procedimiento
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeleteProcedure(procedure.id!)}
                        disabled={deleteProcedureMutation.isPending}
                      >
                        {deleteProcedureMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="p-3">Nombre</TableHead>
                        <TableHead className="p-3">Descripción</TableHead>
                        <TableHead className="p-3">Última Actualización</TableHead>
                        <TableHead className="text-right p-3">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {procedures.map((procedure) => (
                        <TableRow key={procedure.id}>
                          <TableCell className="font-medium p-3">{procedure.title}</TableCell>
                          <TableCell className="p-3">
                            {procedure.description || 'Sin descripción'}
                          </TableCell>
                          <TableCell className="p-3">
                            {procedure.updatedAt ? (
                              <FormattedDateClient dateString={procedure.updatedAt} />
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell className="text-right p-3">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenProcedure(procedure)}
                              >
                                <Edit3 className="mr-1 h-3.5 w-3.5" />
                                Abrir
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProcedure(procedure.id!)}
                                disabled={deleteProcedureMutation.isPending}
                              >
                                {deleteProcedureMutation.isPending ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                                )}
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
} 