import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Olvidé mi Contraseña - KABA Services',
  description: 'Recupera el acceso a tu cuenta de KABA Services.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
