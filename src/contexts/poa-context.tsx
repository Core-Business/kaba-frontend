
"use client";

import type { POA, POAActivity, POAHeader, POAActivityDecisionBranches, POAActivityAlternativeBranch, POAObjectiveHelperData } from '@/lib/schema';
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
  addActivity: (activity?: Partial<Omit<POAActivity, 'id' | 'systemNumber' | 'nextActivityType' | 'description' >> & { parentId?: string | null, parentBranchCondition?: string | null }) => void;
  updateActivity: (activityId: string, updates: Partial<POAActivity>) => void;
  deleteActivity: (activityId: string) => void;
  setActivities: (activities: POAActivity[]) => void;
  loadPoa: (poaData: POA) => void;
  createNew: (id?: string, name?: string) => POA;
  updatePoaName: (name: string) => void;
  saveCurrentPOA: () => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  updateObjectiveHelperData: (data: POAObjectiveHelperData) => void;
  updateActivityBranchLabel: (activityId: string, branchType: 'decision' | 'alternative', index: number | 'yes' | 'no', label: string) => void;
  addAlternativeBranch: (activityId: string) => void;
  removeAlternativeBranch: (activityId: string, branchId: string) => void;
  getChildActivities: (parentId: string, parentBranchCondition: string) => POAActivity[];
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
      };
    });
  }, []);

  const updateField = useCallback((fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name' | 'objectiveHelperData'>, value: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, [fieldName]: value };
    });
  }, []);

  const updateObjectiveHelperData = useCallback((data: POAObjectiveHelperData) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, objectiveHelperData: data };
    });
  }, []);

  const addActivity = useCallback((options?: Partial<Omit<POAActivity, 'id' | 'systemNumber' | 'nextActivityType' | 'description' >> & { parentId?: string | null, parentBranchCondition?: string | null }) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      
      let systemNumber;
      const parentId = options?.parentId;
      const parentBranchCondition = options?.parentBranchCondition;

      if (parentId && parentBranchCondition) {
        const parentActivity = currentPoa.activities.find(act => act.id === parentId);
        if (parentActivity) {
          const childrenOfThisBranch = currentPoa.activities.filter(
            act => act.parentId === parentId && act.parentBranchCondition === parentBranchCondition
          );
          const branchPrefix = parentBranchCondition === 'yes' ? 'S' : parentBranchCondition === 'no' ? 'N' : `Alt${(parentActivity.alternativeBranches || []).findIndex(b => b.id === parentBranchCondition) + 1}`;
          systemNumber = `${parentActivity.systemNumber}.${branchPrefix}${childrenOfThisBranch.length + 1}`;
        } else {
          // Fallback if parent not found, though this shouldn't happen
          systemNumber = "ErrorNum";
        }
      } else {
        // Top-level activity numbering
        const topLevelActivities = currentPoa.activities.filter(act => !act.parentId);
        systemNumber = (topLevelActivities.length + 1).toString();
      }

      const newActivity: POAActivity = {
        id: crypto.randomUUID(),
        systemNumber: systemNumber,
        userNumber: options?.userNumber || '',
        responsible: options?.responsible || '',
        description: '',
        nextActivityType: 'individual',
        decisionBranches: options?.decisionBranches || { yesLabel: 'Sí', noLabel: 'No' },
        alternativeBranches: options?.alternativeBranches || [],
        parentId: parentId || null,
        parentBranchCondition: parentBranchCondition || null,
        ...options, // Spread other options like description, nextActivityType if provided
      };
      return {
        ...currentPoa,
        activities: [...currentPoa.activities, newActivity],
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
      };
    });
  }, []);

  const deleteActivity = useCallback((activityId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      
      const activitiesToDelete = new Set<string>();
      activitiesToDelete.add(activityId);

      // Find all children recursively to delete them as well
      let currentChildren = currentPoa.activities.filter(act => act.parentId === activityId);
      while (currentChildren.length > 0) {
          const nextGenerationChildren: POAActivity[] = [];
          currentChildren.forEach(child => {
              activitiesToDelete.add(child.id);
              nextGenerationChildren.push(...currentPoa.activities.filter(act => act.parentId === child.id));
          });
          currentChildren = nextGenerationChildren;
      }
      
      return {
        ...currentPoa,
        activities: currentPoa.activities.filter(act => !activitiesToDelete.has(act.id)),
      };
    });
  }, []);

  const setActivities = useCallback((activities: POAActivity[]) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, activities };
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
        activities: poaData.activities.map(act => ({
            decisionBranches: { yesLabel: 'Sí', noLabel: 'No' },
            alternativeBranches: [],
            responsible: '',
            userNumber: '',
            parentId: null,
            parentBranchCondition: null,
            ...act,
            systemNumber: act.systemNumber || act.id, 
            nextActivityType: act.nextActivityType || 'individual', 
        }))
    };
    setPoa(loadedPoaInstance);
    setIsDirty(false);
  }, []);

  const createNew = useCallback((id: string = crypto.randomUUID(), name: string = 'Nuevo Procedimiento POA Sin Título'): POA => {
    const newPoaInstance = createNewPOASchema(id, name);
    newPoaInstance.activities = newPoaInstance.activities.map(act => ({
        decisionBranches: { yesLabel: 'Sí', noLabel: 'No' },
        alternativeBranches: [],
        responsible: '',
        userNumber: '',
        parentId: null,
        parentBranchCondition: null,
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
              updatedAct.decisionBranches = { ...(act.decisionBranches || { yesLabel: 'Sí', noLabel: 'No' }), [indexOrKey as 'yes' | 'no']: label };
            } else if (branchType === 'alternative') {
              updatedAct.alternativeBranches = (act.alternativeBranches || []).map((branch, i) =>
                i === indexOrKey ? { ...branch, label } : branch
              );
            }
            return updatedAct;
          }
          return act;
        }),
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
            const newBranch: POAActivityAlternativeBranch = { id: crypto.randomUUID(), label: `Alternativa ${(act.alternativeBranches || []).length + 1}` };
            return {
              ...act,
              alternativeBranches: [...(act.alternativeBranches || []), newBranch]
            };
          }
          return act;
        }),
      };
    });
  }, []);

  const removeAlternativeBranch = useCallback((activityId: string, branchId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
       const childrenOfThisBranch = currentPoa.activities.filter(
        act => act.parentId === activityId && act.parentBranchCondition === branchId
      );
      const childrenIdsToDelete = new Set(childrenOfThisBranch.map(c => c.id));

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
        }).filter(act => !childrenIdsToDelete.has(act.id)), // Also remove children of the deleted branch
      };
    });
  }, []);

  const getChildActivities = useCallback((parentId: string, parentBranchCondition: string): POAActivity[] => {
    if (!poa) return [];
    return poa.activities
      .filter(act => act.parentId === parentId && act.parentBranchCondition === parentBranchCondition)
      .sort((a, b) => {
        // Basic sort by systemNumber, can be improved
        const numA = parseFloat(a.systemNumber.split('.').pop() || '0');
        const numB = parseFloat(b.systemNumber.split('.').pop() || '0');
        return numA - numB;
      });
  }, [poa]);


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
      getChildActivities,
    }}>
      {children}
    </POAContext.Provider>
  );
};
