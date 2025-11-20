'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthAPI } from '@/api/auth';
import { Loader2, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await AuthAPI.registerEmail(email);
      setSuccess(response.message);
      
      // Redirigir a verificación OTP después de 2 segundos
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=verification`);
      }, 2000);
      
    } catch (unknownError) {
      if (
        typeof unknownError === "object" &&
        unknownError !== null &&
        "response" in unknownError &&
        typeof (unknownError as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
      ) {
        setError((unknownError as { response: { data: { message: string } } }).response.data.message);
      } else if (unknownError instanceof Error) {
        setError(unknownError.message);
      } else {
        setError('Error al enviar código de verificación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = email && isValidEmail(email) && !isLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Crear cuenta en KABA
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email para comenzar el proceso de registro
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="pl-10 h-12"
                  disabled={isLoading}
                />
              </div>
              {email && !isValidEmail(email) && (
                <p className="mt-1 text-sm text-red-600">
                  Por favor ingresa un email válido
                </p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="group relative flex w-full justify-center h-12 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando código...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Al continuar, recibirás un código de verificación en tu email
            </p>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-50 px-2 text-gray-500">o</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Proceso de registro seguro
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Te enviaremos un código de 10 dígitos a tu email</li>
                  <li>Verifica tu email con el código recibido</li>
                  <li>Completa tu perfil y crea tu organización</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
