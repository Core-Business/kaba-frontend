import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
      title: 'Login - KABA Services',
    description: 'Login to your KABA Services account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
