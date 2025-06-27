import { POAProvider } from "@/contexts/poa-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <POAProvider>
      <div className="min-h-screen bg-slate-50">
        <main className="flex-1">{children}</main>
      </div>
    </POAProvider>
  );
}
