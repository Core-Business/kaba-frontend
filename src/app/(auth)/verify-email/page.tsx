import { VerifyEmailForm } from "../../../components/auth/verify-email-form";
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Email - KABA Services',
  description: 'Verifica tu dirección de email para activar tu cuenta en KABA Services.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
