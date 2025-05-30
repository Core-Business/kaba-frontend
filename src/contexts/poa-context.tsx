
"use client";

import type { POA, POAActivity, POAHeader, POAActivityDecisionBranches, POAActivityAlternativeBranch } from '@/lib/schema';
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
  updateField: (fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name' | 'objectiveHelperData'>, value: string) => void;
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
  updateObjectiveHelperData: (data: POA['objectiveHelperData']) => void;
  updateActivityBranchLabel: (activityId: string, branchType: 'decision' | 'alternative', index: number | 'yes' | 'no', label: string) => void;
  addAlternativeBranch: (activityId: string) => void;
  removeAlternativeBranch: (activityId: string, branchId: string) => void;
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
          setTimeout(() => {
            toast({ title: "Procedimiento POA Guardado", description: `"${poaToSave.name}" ha sido guardado.` });
          }, 0);
          setIsDirty(false);
        } catch (error) {
          console.error("Error saving POA to localStorage:", error);
          setTimeout(() => {
            toast({ title: "Error al Guardar", description: "No se pudo guardar el Procedimiento POA.", variant: "destructive" });
          }, 0);
        }
      }
      return poaToSave;
    });
  }, [toast, setIsDirty]);

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

  const updateField = useCallback((fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name' | 'objectiveHelperData'>, value: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, [fieldName]: value, updatedAt: new Date().toISOString() };
    });
  }, []);

  const updateObjectiveHelperData = useCallback((data: POA['objectiveHelperData']) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, objectiveHelperData: data, updatedAt: new Date().toISOString() };
    });
  }, []);

  const addActivity = useCallback((activity?: Partial<POAActivity>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      const newActivity: POAActivity = {
        id: crypto.randomUUID(),
        systemNumber: (currentPoa.activities.filter(act => !act.systemNumber.includes('.')).length + 1).toString(), // Basic top-level numbering
        userNumber: '',
        responsible: '',
        description: '',
        nextActivityType: 'individual',
        decisionBranches: { yesLabel: '', noLabel: '' },
        alternativeBranches: [],
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
      // Also delete children if any (future implementation)
      return {
        ...currentPoa,
        activities: currentPoa.activities.filter(act => act.id !== activityId /* && act.parentId !== activityId */),
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
        },
        // Ensure activities have default structures for new fields if missing from old data
        activities: poaData.activities.map(act => ({
            decisionBranches: { yesLabel: '', noLabel: '' },
            alternativeBranches: [],
            responsible: '',
            userNumber: '',
            ...act,
            systemNumber: act.systemNumber || act.id, // Fallback for old data
            nextActivityType: act.nextActivityType || 'individual', // Fallback
        }))
    };
    setPoa(loadedPoaInstance);
    setIsDirty(false);
  }, []);

  const createNew = useCallback((id: string = crypto.randomUUID(), name: string = 'Nuevo Procedimiento POA Sin Título'): POA => {
    const newPoaInstance = createNewPOASchema(id, name);
    // Ensure new POAs also have default structures for activity branches
    newPoaInstance.activities = newPoaInstance.activities.map(act => ({
        decisionBranches: { yesLabel: '', noLabel: '' },
        alternativeBranches: [],
        responsible: '',
        userNumber: '',
        ...act
    }));
    setPoa(newPoaInstance);
    setIsDirty(false);
    return newPoaInstance;
  }, []);


  const updateActivityBranchLabel = useCallback((activityId: string, branchType: 'decision' | 'alternative', indexOrKey: number | 'yes' | 'no', label: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return {
        ...currentPoa,
        activities: currentPoa.activities.map(act => {
          if (act.id === activityId) {
            const updatedAct = { ...act };
            if (branchType === 'decision') {
              updatedAct.decisionBranches = { ...act.decisionBranches, [indexOrKey as 'yes' | 'no']: label };
            } else if (branchType === 'alternative') {
              updatedAct.alternativeBranches = (act.alternativeBranches || []).map((branch, i) =>
                i === indexOrKey ? { ...branch, label } : branch
              );
            }
            return updatedAct;
          }
          return act;
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const addAlternativeBranch = useCallback((activityId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return {
        ...currentPoa,
        activities: currentPoa.activities.map(act => {
          if (act.id === activityId) {
            const newBranch: POAActivityAlternativeBranch = { id: crypto.randomUUID(), label: '' };
            return {
              ...act,
              alternativeBranches: [...(act.alternativeBranches || []), newBranch]
            };
          }
          return act;
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeAlternativeBranch = useCallback((activityId: string, branchId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return {
        ...currentPoa,
        activities: currentPoa.activities.map(act => {
          if (act.id === activityId) {
            return {
              ...act,
              alternativeBranches: (act.alternativeBranches || []).filter(branch => branch.id !== branchId)
            };
          }
          return act;
        }),
        updatedAt: new Date().toISOString(),
      };
    });
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
      updateObjectiveHelperData,
      updateActivityBranchLabel,
      addAlternativeBranch,
      removeAlternativeBranch,
    }}>
      {children}
    </POAContext.Provider>
  );
};
