"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Lightbulb, PlusCircle, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { POAScopeHelperData, POAScopeUsuarioRol, POAScopeConexionDocumental, POAScopeReferenciaNorma } from "@/lib/schema";
import { useCallback } from "react";

type HelperField = 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas';
type HelperItem<T extends HelperField> =
  T extends 'usuariosYRoles'
    ? POAScopeUsuarioRol
    : T extends 'conexionesDocumentales'
      ? POAScopeConexionDocumental
      : POAScopeReferenciaNorma;

const ensureHelperArray = <T extends HelperField>(value: POAScopeHelperData[T]): HelperItem<T>[] =>
  (Array.isArray(value) ? [...value] : []) as HelperItem<T>[];

const createHelperItem = <T extends HelperField>(field: T): HelperItem<T> => {
  if (field === 'usuariosYRoles') {
    return { id: crypto.randomUUID(), usuario: '', rol: '' } as HelperItem<T>;
  }
  if (field === 'conexionesDocumentales') {
    return { id: crypto.randomUUID(), documento: '', codigo: '' } as HelperItem<T>;
  }
  return { id: crypto.randomUUID(), referencia: '', codigo: '' } as HelperItem<T>;
};

interface ScopeContextPanelProps {
  data: POAScopeHelperData;
  onChange: (data: POAScopeHelperData) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function ScopeContextPanel({ data, onChange, onGenerate, isGenerating }: ScopeContextPanelProps) {

  const handleInputChange = useCallback((field: keyof Omit<POAScopeHelperData, 'usuariosYRoles' | 'conexionesDocumentales' | 'referenciaANormas' >, value: string) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  const handleArrayItemChange = useCallback(
    <T extends POAScopeUsuarioRol | POAScopeConexionDocumental | POAScopeReferenciaNorma>(
      field: HelperField,
      index: number,
      subField: keyof T,
      value: string
    ) => {
      const currentArray = ensureHelperArray(data[field]);
      const newArray = currentArray.map((item, i) =>
        i === index ? { ...item, [subField]: value } : item
      );
      onChange({ ...data, [field]: newArray });
    },
    [data, onChange]
  );

  const addItem = useCallback(
    (field: HelperField) => {
      const currentArray = ensureHelperArray(data[field]);
      const newItem = createHelperItem(field);
      onChange({ ...data, [field]: [...currentArray, newItem] });
    },
    [data, onChange]
  );

  const removeItem = useCallback(
    (field: HelperField, index: number) => {
      const currentArray = ensureHelperArray(data[field]);
      const newArray = currentArray.filter((_, i) => i !== index); 
      const finalArray = newArray.length > 0 ? newArray : [createHelperItem(field)];
      onChange({ ...data, [field]: finalArray });
    },
    [data, onChange]
  );

  const canGenerate = Object.values(data).some(val => 
    Array.isArray(val) ? 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    val.some((item: any) => typeof item === 'string' ? item.trim() !== '' : (typeof item === 'object' && item !== null && Object.values(item).some((v: any) => typeof v === 'string' && v.trim() !== '')))
    : (typeof val === 'string' && val.trim() !== '')
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full shadow-sm flex flex-col sticky top-6">
      <div className="flex items-center gap-2 mb-6 text-gray-900">
        <div className="bg-amber-100 p-1.5 rounded-lg">
          <Lightbulb className="h-5 w-5 text-amber-600" />
        </div>
        <h3 className="font-semibold text-base">Asistente de Redacción</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <Accordion type="single" collapsible className="w-full space-y-2">
            
          {/* 1. Definición */}
          <AccordionItem value="item-1" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-blue-600">
                1. Definición del Ámbito
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Procesos y Actividades Clave</Label>
                    <Textarea 
                        value={data.procesosYActividades || ""} 
                        onChange={(e) => handleInputChange('procesosYActividades', e.target.value)}
                        placeholder="Actividades que abarca..."
                        className="min-h-[60px] text-xs bg-gray-50 resize-y"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Productos</Label>
                    <Input 
                        value={data.productosClave || ""} 
                        onChange={(e) => handleInputChange('productosClave', e.target.value)}
                        placeholder="Productos específicos..."
                        className="h-8 text-xs bg-gray-50"
                    />
                </div>
                 <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Dirección / Área</Label>
                    <Input 
                        value={data.direccionGerencia || ""} 
                        onChange={(e) => handleInputChange('direccionGerencia', e.target.value)}
                        placeholder="Unidades de negocio..."
                        className="h-8 text-xs bg-gray-50"
                    />
                </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Responsables */}
          <AccordionItem value="item-2" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-blue-600">
                2. Aplicabilidad
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Usuarios y Roles</Label>
                    {(data.usuariosYRoles || []).map((item, index) => (
                        <div key={item.id} className="space-y-2 p-2 bg-gray-50 rounded-md border border-gray-100 relative group">
                             <Input 
                                value={item.usuario || ""} 
                                onChange={(e) => handleArrayItemChange<POAScopeUsuarioRol>('usuariosYRoles', index, 'usuario', e.target.value)} 
                                placeholder="Usuario" 
                                className="h-7 text-xs bg-white"
                             />
                             <Input 
                                value={item.rol || ""} 
                                onChange={(e) => handleArrayItemChange<POAScopeUsuarioRol>('usuariosYRoles', index, 'rol', e.target.value)} 
                                placeholder="Rol" 
                                className="h-7 text-xs bg-white"
                             />
                             {(data.usuariosYRoles || []).length > 1 && (
                                <button onClick={() => removeItem('usuariosYRoles', index)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                             )}
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addItem('usuariosYRoles')} className="w-full text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <PlusCircle className="mr-2 h-3 w-3" /> Añadir Rol
                    </Button>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Grado de Inclusión</Label>
                    <Textarea 
                        value={data.gradoDeInclusion || ""} 
                        onChange={(e) => handleInputChange('gradoDeInclusion', e.target.value)}
                        placeholder="Global o áreas específicas..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Límites */}
          <AccordionItem value="item-3" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-blue-600">
                3. Límites y Exclusiones
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Delimitación (Inicio/Fin)</Label>
                    <Textarea 
                        value={data.delimitacionPrecisa || ""} 
                        onChange={(e) => handleInputChange('delimitacionPrecisa', e.target.value)}
                        placeholder="Qué marca el comienzo y fin..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Exclusiones Explícitas</Label>
                    <Textarea 
                        value={data.condicionesDeExclusion || ""} 
                        onChange={(e) => handleInputChange('condicionesDeExclusion', e.target.value)}
                        placeholder="Situaciones donde NO aplica..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Contexto */}
          <AccordionItem value="item-4" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-blue-600">
                4. Contexto y Condiciones
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Criterios de Activación</Label>
                    <Textarea 
                        value={data.criteriosDeActivacion || ""} 
                        onChange={(e) => handleInputChange('criteriosDeActivacion', e.target.value)}
                        placeholder="Cuándo se aplica..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Contexto Operativo</Label>
                    <Textarea 
                        value={data.contextoOperativo || ""} 
                        onChange={(e) => handleInputChange('contextoOperativo', e.target.value)}
                        placeholder="Sistemas, herramientas..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
            </AccordionContent>
          </AccordionItem>

           {/* 5. Interrelación */}
           <AccordionItem value="item-5" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-blue-600">
                5. Interrelaciones
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                 <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Documentos Relacionados</Label>
                    {(data.conexionesDocumentales || []).map((item, index) => (
                        <div key={item.id} className="flex gap-2 items-center">
                             <Input 
                                value={item.documento || ""} 
                                onChange={(e) => handleArrayItemChange<POAScopeConexionDocumental>('conexionesDocumentales', index, 'documento', e.target.value)} 
                                placeholder="Doc/Proceso" 
                                className="h-7 text-xs bg-gray-50 flex-grow"
                             />
                              <Input 
                                value={item.codigo || ""} 
                                onChange={(e) => handleArrayItemChange<POAScopeConexionDocumental>('conexionesDocumentales', index, 'codigo', e.target.value)} 
                                placeholder="Cod" 
                                className="h-7 text-xs bg-gray-50 w-16"
                             />
                             {(data.conexionesDocumentales || []).length > 1 && (
                                <button onClick={() => removeItem('conexionesDocumentales', index)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                             )}
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addItem('conexionesDocumentales')} className="w-full text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <PlusCircle className="mr-2 h-3 w-3" /> Añadir
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Normativas</Label>
                    {(data.referenciaANormas || []).map((item, index) => (
                        <div key={item.id} className="flex gap-2 items-center">
                             <Input 
                                value={item.referencia || ""} 
                                onChange={(e) => handleArrayItemChange<POAScopeReferenciaNorma>('referenciaANormas', index, 'referencia', e.target.value)} 
                                placeholder="Norma" 
                                className="h-7 text-xs bg-gray-50 flex-grow"
                             />
                              <Input 
                                value={item.codigo || ""} 
                                onChange={(e) => handleArrayItemChange<POAScopeReferenciaNorma>('referenciaANormas', index, 'codigo', e.target.value)} 
                                placeholder="Sec" 
                                className="h-7 text-xs bg-gray-50 w-16"
                             />
                             {(data.referenciaANormas || []).length > 1 && (
                                <button onClick={() => removeItem('referenciaANormas', index)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                             )}
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addItem('referenciaANormas')} className="w-full text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <PlusCircle className="mr-2 h-3 w-3" /> Añadir
                    </Button>
                </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Vigencia */}
           <AccordionItem value="item-6" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-blue-600">
                6. Vigencia y Revisión
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Duración / Periodicidad</Label>
                    <Textarea 
                        value={data.duracionYPeriodicidad || ""} 
                        onChange={(e) => handleInputChange('duracionYPeriodicidad', e.target.value)}
                        placeholder="Validez..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Condiciones de Revisión</Label>
                    <Textarea 
                         value={data.revision || ""} 
                        onChange={(e) => handleInputChange('revision', e.target.value)}
                        placeholder="Frecuencia..."
                        className="min-h-[50px] text-xs bg-gray-50 resize-y"
                    />
                </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
        >
          {isGenerating ? (
            <LoadingSpinner className="mr-2 h-4 w-4" />
          ) : (
            <Brain className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? "Generando..." : "Generar con IA"}
        </Button>
      </div>
    </div>
  );
}
