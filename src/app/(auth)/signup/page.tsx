'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthAPI } from '@/api/auth';
import { Loader2, Mail, AlertCircle, CheckCircle, Check } from 'lucide-react';

// SVG de ondas decorativas
const WavesBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10"
    viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <g opacity="0.8">
      <path
        d="M0,50 Q100,0 200,50 T400,50 L400,150 Q300,100 200,150 T0,150 Z"
        fill="url(#waveGradient)"
        opacity="0.3"
      />
      <path
        d="M0,150 Q100,100 200,150 T400,150 L400,250 Q300,200 200,250 T0,250 Z"
        fill="url(#waveGradient)"
        opacity="0.2"
      />
      <path
        d="M0,250 Q100,200 200,250 T400,250 L400,350 Q300,300 200,350 T0,350 Z"
        fill="url(#waveGradient)"
        opacity="0.1"
      />
    </g>
  </svg>
);

// Logo oficial de KABA
const KabaLogo = () => (
  <div className="flex items-center mb-6">
    <Image 
      src="/images/KABA_Logo.jpg" 
      alt="KABA - Conocimiento que impulsa negocios"
      width={200}
      height={64}
      className="h-16 w-auto object-contain"
      priority
    />
  </div>
);

export default function SignupPage() {
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

  const handleSocialSignup = (provider: string) => {
    // TODO: Implementar en futuros PRs
    alert(`Registro con ${provider} será implementado en próximas versiones`);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = email && isValidEmail(email) && !isLoading;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_-20%_-10%,rgba(59,130,246,.10),transparent),radial-gradient(900px_500px_at_120%_110%,rgba(59,130,246,.08),transparent)] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="rounded-3xl bg-white shadow-2xl border border-gray-100 px-6 sm:px-8 md:px-14 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            
            {/* Lado izquierdo - Copy de marketing */}
            <div className="relative flex flex-col justify-center">
              <WavesBackground />
              
              <div className="relative z-10 space-y-8">
                <KabaLogo />
                
                <div className="space-y-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Transforme la gestión documental de su empresa
                  </h1>
                  
                  <p className="text-xl text-gray-600 font-medium">
                  Documente los procesos operativos de su empresa más rápido y asistido por inteligencia artificial
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-gray-700 text-lg">
                        Simplifique y mejore la documentación de sus procedimientos y manuales.
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-gray-700 text-lg">
                        Cumpla con estándares internacionales de calidad con nuestra plataforma integral.
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-gray-700 text-lg">
                        Invite a los miembros de su equipo a colaborar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado derecho - Formulario */}
            <div className="flex flex-col justify-center">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Inicie su período gratuito de 7 días
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Botones SSO */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50"
                    onClick={() => handleSocialSignup('Google')}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50"
                    onClick={() => handleSocialSignup('Microsoft')}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z"/>
                      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                      <path fill="#7fba00" d="M1 13h10v10H1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13z"/>
                    </svg>
                    Continuar con Microsoft
                  </Button>

                  {/* Divisor */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-gray-500 font-medium">o</span>
                    </div>
                  </div>

                  {/* Formulario de email */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico de su empresa
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="suemail@empresa.com"
                          className="pl-10 h-12 rounded-xl border-2 focus-visible:ring-0 focus-visible:border-[#2f3ccf]"
                          disabled={isLoading}
                        />
                      </div>
                      {email && !isValidEmail(email) && (
                        <p className="mt-2 text-sm text-red-600">
                          Por favor ingresa un email válido
                        </p>
                      )}
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

                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full rounded-full bg-[#2f3ccf] hover:bg-[#2533b8] h-12 text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Enviando código...
                        </>
                      ) : (
                        'Comenzar gratis'
                      )}
                    </Button>
                  </form>

                  {/* Textos legales */}
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Al registrarse, acepta nuestros{' '}
                      <Link href="/terms" className="text-[#2f3ccf] hover:underline">
                        términos de servicio
                      </Link>{' '}
                      y{' '}
                      <Link href="/privacy" className="text-[#2f3ccf] hover:underline">
                        política de privacidad
                      </Link>
                      .
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      ¿Ya tiene una cuenta?{' '}
                      <Link href="/login" className="text-[#2f3ccf] hover:underline font-medium">
                        Inicie sesión
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
