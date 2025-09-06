import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña - KABA Services',
  description: 'Establece una nueva contraseña para tu cuenta de KABA Services.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
