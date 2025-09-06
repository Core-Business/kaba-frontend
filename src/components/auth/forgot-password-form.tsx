"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Building, Mail, ArrowLeft } from "lucide-react";
import { EmailsAPI } from "@/api/emails";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await EmailsAPI.forgotPassword({ email });
      
      setIsSubmitted(true);
      
      toast({
        title: "Solicitud enviada",
        description: response.message,
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error al enviar la solicitud. Por favor, inténtalo de nuevo.";
      
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

  if (isSubmitted) {
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
              Revisa tu email
            </h2>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-8">
            <div className="text-center space-y-6">
              <Mail className="mx-auto h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Solicitud enviada
                </h3>
                <p className="text-muted-foreground text-sm">
                  Si existe una cuenta con el email <strong>{email}</strong>, 
                  recibirás un enlace para restablecer tu contraseña en unos minutos.
                </p>
                <p className="text-muted-foreground text-xs">
                  No olvides revisar tu carpeta de spam.
                </p>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Enviar a otro email
                </Button>
              </div>
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
            Olvidé mi contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              disabled={isLoading}
            />
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
              {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
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
