
"use client";

import type { POA, POAActivity, POAHeader } from '@/lib/schema';
import { createNewPOA as createNewPOASchema } from '@/lib/schema';
import type React from 'react';
import { createContext, useCallback, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_POA_LIST_KEY = "poaApp_poas";
const LOCAL_STORAGE_POA_DETAIL_PREFIX = "poaApp_poa_detail_";

interface POAContextType {
  poa: POA | null;
  setPoa: React.Dispatch<React.SetStateAction<POA | null>>;
  updateHeader: (updates: Partial<POAHeader>) => void;
  updateField: (fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name'>, value: string) => void;
  addActivity: (activity?: Partial<POAActivity>) => void;
  updateActivity: (activityId: string, updates: Partial<POAActivity>) => void;
  deleteActivity: (activityId: string) => void;
  setActivities: (activities: POAActivity[]) => void;
  loadPoa: (poaData: POA) => void;
  createNew: (id?: string, name?: string) => POA; 
  updatePoaName: (name: string) => void;
  saveCurrentPOA: () => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

export const POAContext = createContext<POAContextType | undefined>(undefined);

export const POAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [poa, setPoa] = useState<POA | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const updatePoaListInStorage = (poaToUpdate: POA) => {
    if (typeof window !== 'undefined') {
      const storedPoasRaw = localStorage.getItem(LOCAL_STORAGE_POA_LIST_KEY);
      let poasList: { id: string; name: string; updatedAt: string; logo?: string }[] = [];
      if (storedPoasRaw) {
        try {
          poasList = JSON.parse(storedPoasRaw);
        } catch (e) {
          console.error("Error parsing POA list from localStorage for update", e);
        }
      }
      
      const existingIndex = poasList.findIndex(p => p.id === poaToUpdate.id);
      const summary = {
        id: poaToUpdate.id,
        name: poaToUpdate.name,
        updatedAt: poaToUpdate.updatedAt!,
        logo: poaToUpdate.header.logoUrl || "https://placehold.co/40x40.png"
      };

      if (existingIndex > -1) {
        poasList[existingIndex] = summary;
      } else {
        poasList.push(summary);
      }
      localStorage.setItem(LOCAL_STORAGE_POA_LIST_KEY, JSON.stringify(poasList));
    }
  };

  const saveCurrentPOA = useCallback(() => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      
      const poaToSave = {
        ...currentPoa,
        updatedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${LOCAL_STORAGE_POA_DETAIL_PREFIX}${poaToSave.id}`, JSON.stringify(poaToSave));
          updatePoaListInStorage(poaToSave); 
          toast({ title: "Procedimiento POA Guardado", description: `"${poaToSave.name}" ha sido guardado.` });
          setIsDirty(false); // Reset dirty state after save
        } catch (error) {
          console.error("Error saving POA to localStorage:", error);
          toast({ title: "Error al Guardar", description: "No se pudo guardar el Procedimiento POA.", variant: "destructive" });
        }
      }
      return poaToSave; 
    });
  }, [toast]);

  const updatePoaName = useCallback((name: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { 
        ...currentPoa, 
        name, 
        header: { ...currentPoa.header, title: name },
        updatedAt: new Date().toISOString() 
      };
    });
  }, []);
  
  const updateHeader = useCallback((updates: Partial<POAHeader>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      const newHeader = { ...currentPoa.header, ...updates };
      let newName = currentPoa.name;
      if (updates.title && updates.title !== currentPoa.name) {
        newName = updates.title; 
      }
      
      return {
        ...currentPoa,
        name: newName,
        header: newHeader,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateField = useCallback((fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name'>, value: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, [fieldName]: value, updatedAt: new Date().toISOString() };
    });
  }, []);

  const addActivity = useCallback((activity?: Partial<POAActivity>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      const newActivity: POAActivity = {
        id: crypto.randomUUID(),
        number: (currentPoa.activities.length + 1).toString(),
        description: '',
        type: 'individual',
        ...activity,
      };
      return {
        ...currentPoa,
        activities: [...currentPoa.activities, newActivity],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateActivity = useCallback((activityId: string, updates: Partial<POAActivity>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return {
        ...currentPoa,
        activities: currentPoa.activities.map(act =>
          act.id === activityId ? { ...act, ...updates } : act
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const deleteActivity = useCallback((activityId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return {
        ...currentPoa,
        activities: currentPoa.activities.filter(act => act.id !== activityId),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const setActivities = useCallback((activities: POAActivity[]) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, activities, updatedAt: new Date().toISOString() };
    });
  }, []);

  const loadPoa = useCallback((poaData: POA) => {
    const name = poaData.name || poaData.header.title || 'Procedimiento POA Cargado';
    const loadedPoaInstance = {
        ...poaData,
        name: name,
        header: {
            ...poaData.header,
            title: name 
        }
    };
    setPoa(loadedPoaInstance);
    setIsDirty(false); 
  }, []);
  
  const createNew = useCallback((id: string = crypto.randomUUID(), name: string = 'Nuevo Procedimiento POA Sin Título'): POA => {
    const newPoaInstance = createNewPOASchema(id, name);
    setPoa(newPoaInstance);
    setIsDirty(false); // A new POA starts clean, though it will be saved by Dashboard or BuilderLayout immediately
    return newPoaInstance;
  }, []);

  return (
    <POAContext.Provider value={{ 
      poa, 
      setPoa, 
      updateHeader, 
      updateField, 
      addActivity, 
      updateActivity, 
      deleteActivity,
      setActivities,
      loadPoa,
      createNew,
      updatePoaName,
      saveCurrentPOA,
      isDirty,
      setIsDirty,
    }}>
      {children}
    </POAContext.Provider>
  );
};

    