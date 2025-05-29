import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - POA Builder',
  description: 'Login to your POA Builder account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
