
import { POAProvider } from "@/contexts/poa-context";
// AppHeader is removed from here, will be added by specific page layouts (Dashboard, Builder)

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <POAProvider>
      <div className="relative flex min-h-screen flex-col">
        {/* AppHeader is no longer globally rendered here */}
        <main className="flex-1 flex flex-col">{children}</main> {/* Ensure main can flex its content */}
      </div>
    </POAProvider>
  );
}
