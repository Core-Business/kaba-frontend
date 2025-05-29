
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
  // Or redirect to '/dashboard' if auth is implemented and user is logged in
  // For now, always redirect to login as a starting point for the multi-user flow.
  return null; 
}
