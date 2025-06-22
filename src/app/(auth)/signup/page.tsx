import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
      title: 'Sign Up - KABA Services',
    description: 'Create a new KABA Services account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
