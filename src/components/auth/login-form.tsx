"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Building } from "lucide-react";
import { AuthAPI } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { setAuth, refreshContexts } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.login(email, password);
      
      // Establecer auth en contexto (persistirá automáticamente en localStorage)
      setAuth(response.accessToken, response.user, response.workspace);
      
      // Refrescar contextos disponibles después del login
      await refreshContexts();
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user?.email || email}`,
      });
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Correo electrónico o contraseña inválidos. Por favor, inténtalo de nuevo.";
      
      setError(errorMessage);
      
      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Función en desarrollo",
      description: "Esta función se encuentra en desarrollo y será desplegada próximamente",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl lg:rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[800px]">
          {/* Sección izquierda - Solo visible en desktop */}
          <div className="hidden lg:flex relative overflow-hidden" style={{ backgroundColor: '#004495' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-blue-900/20" />
            <div className="relative z-10 flex flex-col justify-center items-center w-full lg:py-16 px-12">
              <div className="max-w-md text-center">
                <div className="mb-8">
                  <Image
                    src="/images/login.png"
                    alt="Ilustración de login"
                    width={500}
                    height={400}
                    className="w-full max-w-lg mx-auto"
                    priority
                  />
                </div>
                <h1 className="text-3xl font-semibold text-white mb-6 tracking-wide leading-tight font-sans">
                  Bienvenido a KABA Services
                </h1>
                <p className="text-lg text-blue-100 leading-relaxed font-sans font-normal">
                  Optimiza la creación de tus procedimientos y manuales de operación de tu empresa con ayuda de nuestra aplicación e inteligencia artificial.
                </p>
              </div>
            </div>
          </div>

          {/* Sección derecha - Formulario de login */}
          <div className="flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex items-center space-x-2">
                    <Building className="h-8 w-8 text-blue-600" />
                    <span className="text-2xl font-semibold text-gray-900 tracking-wide font-sans">KABA Services</span>
                  </div>
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 tracking-wide leading-tight font-sans">Iniciar sesión</h2>
                <p className="mt-2 text-sm text-gray-600 tracking-normal font-sans font-normal leading-relaxed">
                  Ingresa tu correo electrónico para acceder a tu cuenta
                </p>
              </div>

              {/* Formulario */}
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-normal text-gray-700 tracking-normal font-sans leading-tight">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12 bg-transparent border-0 border-b border-[#D5DBE8] rounded-none px-0 pb-2 pt-2 focus:border-b-2 focus:border-blue-600 focus:ring-0 placeholder:text-gray-400 font-sans font-normal tracking-normal leading-tight"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-normal text-gray-700 tracking-normal font-sans leading-tight">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 bg-transparent border-0 border-b border-[#D5DBE8] rounded-none px-0 pb-2 pt-2 focus:border-b-2 focus:border-blue-600 focus:ring-0 placeholder:text-gray-400 font-sans font-normal tracking-normal leading-tight"
                    />
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-500 hover:underline font-sans font-normal tracking-normal"
                      onClick={() => {
                        toast({
                          title: "Función en desarrollo",
                          description: "Esta función se encuentra en desarrollo y será desplegada próximamente",
                          variant: "default",
                        });
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 font-sans font-normal tracking-normal leading-tight">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white tracking-wide font-sans leading-tight transition-all duration-150 hover:scale-105 shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-sans font-normal tracking-normal">
                      O continúa con
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-gray-300 hover:bg-gray-50 hover:text-gray-900 font-sans font-normal tracking-normal leading-tight"
                    onClick={() => handleSocialLogin('google')}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-gray-300 hover:bg-gray-50 hover:text-gray-900 font-sans font-normal tracking-normal leading-tight"
                    onClick={() => handleSocialLogin('microsoft')}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z" />
                      <path fill="#00a4ef" d="M13 1h10v10H13z" />
                      <path fill="#7fba00" d="M1 13h10v10H1z" />
                      <path fill="#ffb900" d="M13 13h10v10H13z" />
                    </svg>
                    Microsoft
                  </Button>
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-gray-600 font-sans font-normal tracking-normal leading-tight">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
