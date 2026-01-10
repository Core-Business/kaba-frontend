'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthAPI } from '@/api/auth';
import { OTPInput } from '@/components/auth/otp-input';
import { 
  Loader2, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Clock,
  Shield
} from 'lucide-react';

const OTP_LENGTH = 10;

function VerifyOTPContent() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const isVerifyingRef = useRef(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'verification'; // 'verification' | 'reset'
  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Validación inicial
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleVerifyOTP = async () => {
    if (otp.length !== OTP_LENGTH || isVerifyingRef.current) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    isVerifyingRef.current = true;

    try {
      if (type === 'verification') {
        // Verificación para registro
        const response = await AuthAPI.verifyOTP(email, otp);
        setSuccess(response.message);
        
        if (response.requiresProfile) {
          // Redirigir a completar perfil
          setTimeout(() => {
            router.push(`/complete-profile?email=${encodeURIComponent(email)}`);
          }, 1500);
        } else {
          // Ya tiene perfil completo, redirigir al dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else if (type === 'reset') {
        // Verificación para reset de contraseña
        const response = await AuthAPI.verifyResetOTP(email, otp);
        setSuccess(response.message);
        
        if (response.resetToken) {
          // Redirigir a cambiar contraseña
          setTimeout(() => {
            router.push(`/reset-password?token=${response.resetToken}`);
          }, 1500);
        }
      }
    } catch (unknownError) {
      let errorMessage = 'Código incorrecto';
      if (
        typeof unknownError === "object" &&
        unknownError !== null &&
        "response" in unknownError &&
        typeof (unknownError as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
      ) {
        errorMessage = (unknownError as { response: { data: { message: string } } }).response.data.message;
      } else if (unknownError instanceof Error) {
        errorMessage = unknownError.message;
      }
      const attemptsMatch = errorMessage.match(/quedan (\d+) intentos/);
      setError(errorMessage);
      
      // Extraer intentos restantes si están en el mensaje
      if (attemptsMatch) {
        setRemainingAttempts(parseInt(attemptsMatch[1]));
      }
      
      // Limpiar OTP en caso de error
      setOtp('');
    } finally {
      isVerifyingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);
    isVerifyingRef.current = false;

    try {
      if (type === 'verification') {
        await AuthAPI.resendOTP(email);
        setSuccess('Nuevo código enviado a tu email');
      } else if (type === 'reset') {
        await AuthAPI.forgotPasswordOTP(email);
        setSuccess('Nuevo código enviado a tu email');
      }
      
      setCooldownSeconds(60); // Cooldown de 60 segundos
      setRemainingAttempts(null); // Reset intentos
      setOtp(''); // Limpiar input
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
        setError('Error al reenviar código');
      }
    } finally {
      setIsResending(false);
    }
  };

  const canResend = cooldownSeconds === 0 && !isResending && !isLoading;
  const canSubmit = otp.length === OTP_LENGTH && !isLoading;

  const pageTitle = type === 'verification' 
    ? 'Verifica tu email' 
    : 'Verifica código de recuperación';
    
  const pageDescription = type === 'verification'
    ? `Ingresa el código de ${OTP_LENGTH} dígitos que enviamos a ${email}`
    : `Ingresa el código de recuperación enviado a ${email}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {type === 'verification' ? (
              <Mail className="h-6 w-6 text-blue-600" />
            ) : (
              <Shield className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {pageTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {pageDescription}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* OTP Input */}
          <div className="space-y-4">
            <OTPInput
              length={OTP_LENGTH}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerifyOTP}
              disabled={isLoading}
              error={!!error}
              className="justify-center"
            />
          </div>

          {/* Información de intentos */}
          {remainingAttempts !== null && (
            <div className="text-center">
              <p className="text-sm text-orange-600">
                Te quedan {remainingAttempts} intentos
              </p>
            </div>
          )}

          {/* Mensajes de error y éxito */}
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

          {/* Botón principal */}
          <div>
            <Button
              onClick={handleVerifyOTP}
              disabled={!canSubmit}
              className="group relative flex w-full justify-center h-12 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Verificar código
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>

          {/* Opciones de reenvío */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              ¿No recibiste el código?
            </p>
            
            {canResend ? (
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={!canResend}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar código
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="mr-2 h-4 w-4" />
                Podrás reenviar en {cooldownSeconds}s
              </div>
            )}
          </div>

          {/* Enlaces de navegación */}
          <div className="text-center">
            <Link 
              href={type === 'verification' ? '/register' : '/forgot-password'}
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              ← Volver {type === 'verification' ? 'al registro' : 'a recuperar contraseña'}
            </Link>
          </div>
        </div>

        {/* Ayuda */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Revisa tu bandeja de entrada y carpeta de spam</p>
              <p>• El código expira en 60 minutos</p>
              <p>• Puedes reenviar el código después de 1 minuto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
