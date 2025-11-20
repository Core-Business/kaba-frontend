"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Building, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { EmailsAPI } from "@/api/emails";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Token de verificación no encontrado en la URL.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await EmailsAPI.verifyEmail({ token });
        setIsVerified(true);
        
        toast({
          title: "Email verificado",
          description: response.message,
        });
      } catch (unknownError) {
        console.error('Email verification error:', unknownError);

        let errorMessage = "Error al verificar el email. El token puede haber expirado.";
        if (
          typeof unknownError === "object" &&
          unknownError !== null &&
          "response" in unknownError &&
          typeof (unknownError as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
        ) {
          errorMessage = (unknownError as { response: { data: { message: string } } }).response.data.message;
        } else if (unknownError instanceof Error && unknownError.message) {
          errorMessage = unknownError.message;
        }

        setError(errorMessage);

        toast({
          title: "Error de verificación",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

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
            Verificación de Email
          </h2>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-8">
          <div className="text-center space-y-6">
            {isLoading && (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Verificando tu email...
                </p>
              </div>
            )}

            {!isLoading && isVerified && (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Email verificado exitosamente
                  </h3>
                  <p className="text-muted-foreground">
                    Tu cuenta ha sido activada. Ya puedes iniciar sesión.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">
                    Iniciar Sesión
                  </Link>
                </Button>
              </div>
            )}

            {!isLoading && error && (
              <div className="space-y-4">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Error de verificación
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {error}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/register">
                      Crear nueva cuenta
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">
                      Volver al inicio de sesión
                    </Link>
                  </Button>
                </div>
              </div>
            )}
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
