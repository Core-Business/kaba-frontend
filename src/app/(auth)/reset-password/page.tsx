import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña - KABA Services',
  description: 'Establece una nueva contraseña para tu cuenta de KABA Services.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
