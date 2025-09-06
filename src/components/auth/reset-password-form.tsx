"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Building, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AuthAPI } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validaciones
    if (!token) {
      setError('Token de reset no encontrado en la URL.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await AuthAPI.resetPasswordWithToken(token, newPassword);
      
      setIsSuccess(true);
      
      toast({
        title: "Contraseña actualizada",
        description: response.message,
      });
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error al restablecer la contraseña. El token puede haber expirado.";
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/login.png" 
                alt="KABA Services Logo" 
                width={120} 
                height={120}
                className="rounded-lg shadow-sm"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Enlace inválido
            </h2>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-8">
            <div className="text-center space-y-6">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Token no encontrado
                </h3>
                <p className="text-muted-foreground text-sm">
                  El token para restablecer la contraseña no es válido o ha expirado.
                </p>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/forgot-password">
                    Solicitar nuevo código
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">
                    Volver al inicio de sesión
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/login.png" 
                alt="KABA Services Logo" 
                width={120} 
                height={120}
                className="rounded-lg shadow-sm"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Contraseña actualizada
            </h2>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-8">
            <div className="text-center space-y-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  ¡Listo!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Tu contraseña ha sido actualizada exitosamente. 
                  Serás redirigido al inicio de sesión en unos segundos.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">
                  Iniciar sesión ahora
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span className="text-sm">KABA Services</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="/images/login.png" 
              alt="KABA Services Logo" 
              width={120} 
              height={120}
              className="rounded-lg shadow-sm"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Establece una nueva contraseña para tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite la contraseña"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando contraseña...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                Volver al inicio de sesión
              </Link>
            </Button>
          </div>
        </form>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span className="text-sm">KABA Services</span>
          </div>
        </div>
      </div>
    </div>
  );
}
