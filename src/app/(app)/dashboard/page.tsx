
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit3, FileText, Trash2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePOA } from "@/hooks/use-poa";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FormattedDateClient } from "@/components/shared/formatted-date";
import { AppHeader } from "@/components/layout/app-header";

const LOCAL_STORAGE_POA_LIST_KEY = "poaApp_poas";
const LOCAL_STORAGE_POA_DETAIL_PREFIX = "poaApp_poa_detail_";

// initialMockPoas is removed as per requirement

type DisplayedPOA = {
  id: string;
  name: string;
  updatedAt: string;
  logo?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { createNew } = usePOA();
  const [displayedPoas, setDisplayedPoas] = useState<DisplayedPOA[]>([]);
  const { toast } = useToast();
  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);
  const [newPoaNameInput, setNewPoaNameInput] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPoasRaw = localStorage.getItem(LOCAL_STORAGE_POA_LIST_KEY);
      if (storedPoasRaw) {
        try {
          const parsedPoas: DisplayedPOA[] = JSON.parse(storedPoasRaw);
          setDisplayedPoas(parsedPoas);
        } catch (error) {
          console.error("Error parsing POAs from localStorage", error);
          setDisplayedPoas([]); // Initialize as empty if error
          localStorage.setItem(LOCAL_STORAGE_POA_LIST_KEY, JSON.stringify([]));
        }
      } else {
        setDisplayedPoas([]); // Initialize as empty for new users or empty localStorage
        localStorage.setItem(LOCAL_STORAGE_POA_LIST_KEY, JSON.stringify([]));
      }
    }
  }, []);

  const handleConfirmCreateNewPOA = () => {
    if (!newPoaNameInput.trim()) {
      toast({
        title: "Nombre Requerido",
        description: "Por favor, ingresa un nombre para el Procedimiento POA.",
        variant: "destructive",
      });
      return;
    }

    const newPoaId = crypto.randomUUID();
    const newPoaName = newPoaNameInput.trim();

    const newPoaInstance = createNew(newPoaId, newPoaName);

    const newPoaEntry: DisplayedPOA = {
      id: newPoaId,
      name: newPoaName,
      updatedAt: new Date().toISOString(),
      logo: newPoaInstance.header.logoUrl || "https://placehold.co/40x40.png"
    };

    const updatedPoasList = [...displayedPoas, newPoaEntry];
    setDisplayedPoas(updatedPoasList);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_POA_LIST_KEY, JSON.stringify(updatedPoasList));
      localStorage.setItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${newPoaId}`, JSON.stringify(newPoaInstance));
    }

    router.push(`/builder/${newPoaId}/header`);
    setIsCreateDialogVisible(false);
    setNewPoaNameInput("");
  };

  const handleDeletePOA = (idToDelete: string) => {
    if (window.confirm("¿Estás seguro de que quieres borrar este Procedimiento POA? Esta acción no se puede deshacer.")) {
      setDisplayedPoas(prevPoas => {
        const updatedPoas = prevPoas.filter(p => p.id !== idToDelete);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_POA_LIST_KEY, JSON.stringify(updatedPoas));
          localStorage.removeItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${idToDelete}`);
        }
        return updatedPoas;
      });
      toast({ title: "Procedimiento POA Borrado", description: "El Procedimiento POA ha sido eliminado." });
    }
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto py-8 px-4 md:px-6 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">POA - Inicio</h1>
            <p className="text-muted-foreground">Gestiona tus Procedimientos POA existentes o crea uno nuevo.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Vista de Cuadrícula">
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} title="Vista de Lista">
                <List className="h-5 w-5" />
              </Button>
            </div>
            <Dialog open={isCreateDialogVisible} onOpenChange={setIsCreateDialogVisible}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => setIsCreateDialogVisible(true)}>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Crear Nuevo Procedimiento POA
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Procedimiento POA</DialogTitle>
                  <DialogDescription>
                    Ingresa un nombre para tu nuevo Procedimiento POA. Este nombre se usará para identificarlo.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="poaName" className="text-right col-span-1">
                      Nombre del Procedimiento (POA)
                    </Label>
                    <Input
                      id="poaName"
                      value={newPoaNameInput}
                      onChange={(e) => setNewPoaNameInput(e.target.value)}
                      className="col-span-3"
                      placeholder="Ej., Despliegue de Software Q4"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => setNewPoaNameInput("")}>Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleConfirmCreateNewPOA}>Crear Procedimiento POA</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {displayedPoas.length === 0 ? (
          <Card className="text-center py-12 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-secondary p-3 rounded-full w-fit">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4 text-2xl">Aún no hay Procedimientos POA</CardTitle>
              <CardDescription className="mt-2 text-lg">
                Comienza creando tu primer Procedimiento POA.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Dialog open={isCreateDialogVisible} onOpenChange={(open) => { if (!open) setNewPoaNameInput(""); setIsCreateDialogVisible(open);}}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={() => { setIsCreateDialogVisible(true); setNewPoaNameInput("");}}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Crea Tu Primer Procedimiento POA
                  </Button>
                </DialogTrigger>
                 <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Nuevo Procedimiento POA</DialogTitle>
                    <DialogDescription>
                      Ingresa un nombre para tu nuevo Procedimiento POA. Este nombre se usará para identificarlo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="poaNameModalEmpty" className="text-right col-span-1">
                        Nombre del Procedimiento (POA)
                      </Label>
                      <Input
                        id="poaNameModalEmpty"
                        value={newPoaNameInput}
                        onChange={(e) => setNewPoaNameInput(e.target.value)}
                        className="col-span-3"
                        placeholder="Ej., Despliegue de Software Q4"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => setNewPoaNameInput("")}>Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleConfirmCreateNewPOA}>Crear Procedimiento POA</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedPoas.map((poa) => (
                  <Card key={poa.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={poa.logo || "https://placehold.co/40x40.png"}
                          alt={`${poa.name} logo`}
                          width={40}
                          height={40}
                          className="rounded-md aspect-square object-cover"
                          data-ai-hint="document logo"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{poa.name}</CardTitle>
                        <CardDescription>Última actualización: <FormattedDateClient dateString={poa.updatedAt} /></CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch">
                      <Link href={`/builder/${poa.id}/header`} passHref legacyBehavior>
                        <Button variant="outline" className="w-full">
                          <Edit3 className="mr-2 h-4 w-4" />
                          Editar Procedimiento POA
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => handleDeletePOA(poa.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Borrar Procedimiento POA
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
                        <TableHead className="w-[60px] p-3">Logo</TableHead>
                        <TableHead className="p-3">Nombre</TableHead>
                        <TableHead className="p-3">Última Actualización</TableHead>
                        <TableHead className="text-right p-3">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedPoas.map((poa) => (
                        <TableRow key={poa.id}>
                          <TableCell className="p-3">
                            <Image
                              src={poa.logo || "https://placehold.co/32x32.png"}
                              alt={`${poa.name} logo`}
                              width={32}
                              height={32}
                              className="rounded-sm aspect-square object-cover"
                              data-ai-hint="document logo"
                            />
                          </TableCell>
                          <TableCell className="font-medium p-3">{poa.name}</TableCell>
                          <TableCell className="p-3">
                            <FormattedDateClient dateString={poa.updatedAt} />
                          </TableCell>
                          <TableCell className="text-right p-3">
                            <div className="flex gap-2 justify-end">
                              <Link href={`/builder/${poa.id}/header`} passHref legacyBehavior>
                                <Button variant="outline" size="sm">
                                  <Edit3 className="mr-1 h-3.5 w-3.5" />
                                  Editar
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePOA(poa.id)}
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Borrar
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
