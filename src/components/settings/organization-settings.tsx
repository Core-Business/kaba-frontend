import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export function OrganizationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Configuración de la Organización
        </CardTitle>
        <CardDescription>
          Gestiona la información y preferencias de tu organización.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <Building className="h-12 w-12 mb-4 opacity-20" />
          <p>Las configuraciones de la organización estarán disponibles próximamente.</p>
        </div>
      </CardContent>
    </Card>
  );
}
