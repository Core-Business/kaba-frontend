import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - POA Builder',
  description: 'Create a new POA Builder account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
