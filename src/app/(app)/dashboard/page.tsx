
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit3, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePOA } from "@/hooks/use-poa";
import Image from "next/image";

// Mock data for POAs - replace with actual data fetching
const mockPoas = [
  { id: "1", name: "Plan de Despliegue de Software", updatedAt: "2024-07-20", logo: "https://placehold.co/40x40.png?text=PDS" },
  { id: "2", name: "Incorporación de Nuevos Empleados", updatedAt: "2024-07-18", logo: "https://placehold.co/40x40.png?text=INE" },
  { id: "3", name: "Campaña de Marketing Q3", updatedAt: "2024-07-15", logo: "https://placehold.co/40x40.png?text=CMQ3" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { createNew } = usePOA();

  const handleCreateNewPOA = () => {
    const newPoaId = crypto.randomUUID(); // Generate a unique ID for the new POA
    createNew(newPoaId, "Nuevo POA"); // Initialize context with this new POA
    router.push(`/builder/${newPoaId}/header`);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Planes de Acción</h1>
          <p className="text-muted-foreground">Gestiona tus POA existentes o crea uno nuevo.</p>
        </div>
        <Button onClick={handleCreateNewPOA} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Crear Nuevo POA
        </Button>
      </div>

      {mockPoas.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-secondary p-3 rounded-full w-fit">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4 text-2xl">Aún no hay POAs</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Comienza creando tu primer Plan de Acción.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={handleCreateNewPOA} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crea Tu Primer POA
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockPoas.map((poa) => (
            <Card key={poa.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                <div className="flex-shrink-0">
                  <Image 
                    src={poa.logo || "https://placehold.co/40x40.png?text=POA"} 
                    alt={`${poa.name} logo`}
                    width={40} 
                    height={40} 
                    className="rounded-md aspect-square object-cover"
                    data-ai-hint="document logo"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{poa.name}</CardTitle>
                  <CardDescription>Última actualización: {new Date(poa.updatedAt).toLocaleDateString()}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Optionally, add a brief description or stats here */}
              </CardContent>
              <CardFooter>
                <Link href={`/builder/${poa.id}/header`} passHref legacyBehavior>
                  <Button variant="outline" className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar POA
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
