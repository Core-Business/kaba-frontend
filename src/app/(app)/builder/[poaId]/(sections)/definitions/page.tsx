import { DefinitionsForm } from "@/components/poa/definitions-form";

export default function DefinitionsPage() {
  return (
    <div className="w-full px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Definiciones</h1>
        <p className="text-muted-foreground mt-2">
          Define los términos técnicos y específicos utilizados en el procedimiento
        </p>
      </div>
      <DefinitionsForm />
    </div>
  );
} 