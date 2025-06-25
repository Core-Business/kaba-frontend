"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, LogOut } from "lucide-react";
import { AuthAPI } from "@/api/auth";

export default function WorkspaceRevokedPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar cualquier token o contexto inválido
    localStorage.removeItem("kaba.token");
    localStorage.removeItem("kaba.user");
    localStorage.removeItem("kaba.lastWorkspace");
  }, []);

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  const handleLogout = () => {
    AuthAPI.logout();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold text-destructive">
            Acceso Denegado
          </CardTitle>
          <CardDescription className="text-center">
            Tu acceso a este workspace ha sido revocado o ya no tienes permisos para acceder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Esto puede ocurrir si:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Tu rol en el workspace fue modificado</li>
              <li>• Fuiste removido del workspace</li>
              <li>• El workspace fue eliminado</li>
              <li>• Tu organización cambió los permisos</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleGoHome} 
              className="w-full" 
              variant="default"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
            
            <Button 
              onClick={handleLogout} 
              className="w-full" 
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Si crees que esto es un error, contacta al administrador de tu organización.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 