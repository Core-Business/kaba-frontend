import { VerifyEmailForm } from "../../../components/auth/verify-email-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Email - KABA Services',
  description: 'Verifica tu dirección de email para activar tu cuenta en KABA Services.',
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
