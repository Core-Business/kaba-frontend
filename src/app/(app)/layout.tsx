import { AppHeader } from "@/components/layout/app-header";
import { POAProvider } from "@/contexts/poa-context";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <POAProvider>
      <div className="relative flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </POAProvider>
  );
}
