import { ResponsibilitiesForm } from "@/components/poa/responsibilities-form";

export default function ResponsibilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Responsabilidades</h3>
        <p className="text-sm text-muted-foreground">
          Define y genera los resúmenes de responsabilidades para cada rol involucrado en el proceso.
        </p>
      </div>
      <ResponsibilitiesForm />
    </div>
  );
} 