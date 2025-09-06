import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Olvidé mi Contraseña - KABA Services',
  description: 'Recupera el acceso a tu cuenta de KABA Services.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
