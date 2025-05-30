
"use client";

import type { POA, POAActivity, POAHeader, POAActivityDecisionBranches, POAActivityAlternativeBranch, POAObjectiveHelperData } from '@/lib/schema';
import { createNewPOA as createNewPOASchema, defaultPOAObjectiveHelperData } from '@/lib/schema';
import type React from 'react';
import { createContext, useCallback, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_POA_LIST_KEY = "poaApp_poas";
const LOCAL_STORAGE_POA_DETAIL_PREFIX = "poaApp_poa_detail_";

interface POAContextType {
  poa: POA | null;
  setPoa: React.Dispatch<React.SetStateAction<POA | null>>;
  updateHeader: (updates: Partial<POAHeader>) => void;
  updateField: (fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name' | 'objectiveHelperData'>, value: string) => void;
  addActivity: (options?: Partial<Omit<POAActivity, 'id' | 'systemNumber' | 'nextActivityType' | 'description' | 'responsible' | 'userNumber' | 'activityName' | 'nextIndividualActivityRef' >> & { parentId?: string | null, parentBranchCondition?: string | null }) => void;
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
  updateActivityBranchLabel: (activityId: string, branchType: 'decision' | 'alternative', indexOrKey: number | 'yes' | 'no', label: string) => void;
  addAlternativeBranch: (activityId: string) => void;
  removeAlternativeBranch: (activityId: string, branchId: string) => void;
  getChildActivities: (parentId: string, parentBranchCondition: string) => POAActivity[];
}

export const POAContext = createContext<POAContextType | undefined>(undefined);

// Helper function to get activities in their procedural order
function getActivitiesInProceduralOrder(allActivities: POAActivity[]): POAActivity[] {
  const activitiesMap = new Map(allActivities.map(act => [act.id, act]));
  const orderedActivities: POAActivity[] = [];
  const processedIds = new Set<string>();

  function sortSiblings(siblingActivities: POAActivity[]): POAActivity[] {
    return siblingActivities.sort((a, b) =>
      (a.systemNumber || "").localeCompare(b.systemNumber || "", undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  function processActivityRecursive(activity: POAActivity | undefined) {
    if (!activity || processedIds.has(activity.id)) return;

    orderedActivities.push(activity);
    processedIds.add(activity.id);

    if (activity.nextActivityType === 'decision') {
      const yesChildren = sortSiblings(
        allActivities.filter(act => act.parentId === activity.id && act.parentBranchCondition === 'yes')
      );
      yesChildren.forEach(child => processActivityRecursive(activitiesMap.get(child.id)));

      const noChildren = sortSiblings(
        allActivities.filter(act => act.parentId === activity.id && act.parentBranchCondition === 'no')
      );
      noChildren.forEach(child => processActivityRecursive(activitiesMap.get(child.id)));
    } else if (activity.nextActivityType === 'alternatives' && activity.alternativeBranches) {
      activity.alternativeBranches.forEach(branch => {
        const branchChildren = sortSiblings(
          allActivities.filter(act => act.parentId === activity.id && act.parentBranchCondition === branch.id)
        );
        branchChildren.forEach(child => processActivityRecursive(activitiesMap.get(child.id)));
      });
    }
  }

  const topLevelActivities = sortSiblings(allActivities.filter(act => !act.parentId));
  topLevelActivities.forEach(activity => processActivityRecursive(activitiesMap.get(activity.id)));
  
  allActivities.forEach(act => {
    if (!processedIds.has(act.id)) {
      orderedActivities.push(act); 
    }
  });
  
  return orderedActivities;
}


function renumberUserNumbers(activities: POAActivity[]): POAActivity[] {
  if (!activities || activities.length === 0) return [];
  const proceduralOrder = getActivitiesInProceduralOrder(activities);
  const userNumberMap = new Map(proceduralOrder.map((act, index) => [act.id, (index + 1).toString()]));

  return activities.map(act => ({
    ...act,
    userNumber: userNumberMap.get(act.id) || act.userNumber || '', 
  }));
}


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
           setTimeout(() => { // Defer toast to avoid update during render
            toast({ title: "Procedimiento POA Guardado", description: `"${poaToSave.name}" ha sido guardado.` });
          }, 0);
          setIsDirty(false);
        } catch (error) {
          console.error("Error saving POA to localStorage:", error);
          setTimeout(() => { // Defer toast
            toast({ title: "Error al Guardar", description: "No se pudo guardar el Procedimiento POA.", variant: "destructive" });
          }, 0);
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
      };
    });
  }, []);

  const updateHeader = useCallback((updates: Partial<POAHeader>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      const newHeader = { ...currentPoa.header, ...updates };
      let newName = currentPoa.name;
      if (updates.title && updates.title !== currentPoa.header.title) {
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

  const addActivity = useCallback((options?: Partial<Omit<POAActivity, 'id' | 'systemNumber' | 'nextActivityType' | 'description' | 'responsible' | 'userNumber' | 'activityName' | 'nextIndividualActivityRef' >> & { parentId?: string | null, parentBranchCondition?: string | null }) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);

      let systemNumber;
      const parentId = options?.parentId;
      const parentBranchCondition = options?.parentBranchCondition;

      if (parentId && parentBranchCondition) {
        const parentActivity = currentPoa.activities.find(act => act.id === parentId);
        if (parentActivity && parentActivity.systemNumber) {
          const childrenOfThisBranch = currentPoa.activities.filter(
            act => act.parentId === parentId && act.parentBranchCondition === parentBranchCondition
          );
          let branchIndicator = '';
          if (parentActivity.nextActivityType === 'decision') {
            branchIndicator = parentBranchCondition === 'yes' ? 'S' : 'N';
          } else if (parentActivity.nextActivityType === 'alternatives' && parentActivity.alternativeBranches) {
            const branchIndex = parentActivity.alternativeBranches.findIndex(b => b.id === parentBranchCondition);
            branchIndicator = `A${branchIndex + 1}`;
          }
          systemNumber = `${parentActivity.systemNumber}.${branchIndicator}${childrenOfThisBranch.length + 1}`;
        } else {
          systemNumber = `ErrorNum-${crypto.randomUUID().substring(0,4)}`; 
        }
      } else {
        const topLevelActivities = currentPoa.activities.filter(act => !act.parentId);
        systemNumber = (topLevelActivities.length + 1).toString();
      }

      const newActivity: POAActivity = {
        id: crypto.randomUUID(),
        systemNumber: systemNumber,
        userNumber: '', 
        activityName: '',
        responsible: '',
        description: '',
        nextActivityType: 'individual',
        nextIndividualActivityRef: '', 
        decisionBranches: { yesLabel: '', noLabel: '' }, // Initialize with empty strings
        alternativeBranches: [],
        parentId: parentId || null,
        parentBranchCondition: parentBranchCondition || null,
        ...options,
      };
      
      let activitiesToProcess = [...currentPoa.activities, newActivity];
      let finalActivities = renumberUserNumbers(activitiesToProcess);

      const newlyAddedActivityIndex = finalActivities.findIndex(act => act.id === newActivity.id);
      if (newlyAddedActivityIndex !== -1) {
        const newlyAddedActivityInFinalList = finalActivities[newlyAddedActivityIndex];
         if (!newlyAddedActivityInFinalList.parentId && newlyAddedActivityInFinalList.nextActivityType === 'individual') {
            const currentUserNumber = parseInt(newlyAddedActivityInFinalList.userNumber || '0', 10);
            if (!isNaN(currentUserNumber) && currentUserNumber > 0) {
                finalActivities[newlyAddedActivityIndex] = {
                    ...finalActivities[newlyAddedActivityIndex],
                    nextIndividualActivityRef: (currentUserNumber + 1).toString()
                };
            }
        }
      }
      
      return {
        ...currentPoa,
        activities: finalActivities,
      };
    });
  }, []);

  const updateActivity = useCallback((activityId: string, updates: Partial<POAActivity>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      let updatedActivities = currentPoa.activities.map(act =>
        act.id === activityId ? { ...act, ...updates } : act
      );
      if (updates.nextActivityType || 'systemNumber' in updates || 'parentId' in updates || 'description' in updates || 'responsible' in updates || 'userNumber' in updates ) {
        updatedActivities = renumberUserNumbers(updatedActivities);
      }
      return {
        ...currentPoa,
        activities: updatedActivities,
      };
    });
  }, []);

  const deleteActivity = useCallback((activityId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);

      const activitiesToDelete = new Set<string>();
      const queue = [activityId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (currentId) {
          activitiesToDelete.add(currentId);
          const children = currentPoa.activities.filter(act => act.parentId === currentId);
          children.forEach(child => queue.push(child.id));
        }
      }
      
      let remainingActivities = currentPoa.activities.filter(act => !activitiesToDelete.has(act.id));
      let finalActivities = renumberUserNumbers(remainingActivities);
      
      return {
        ...currentPoa,
        activities: finalActivities,
      };
    });
  }, []);

  const setActivities = useCallback((activities: POAActivity[]) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);
      return { ...currentPoa, activities: renumberUserNumbers(activities) };
    });
  }, []);

  const loadPoa = useCallback((poaData: POA) => {
    const name = poaData.name || poaData.header.title || 'Procedimiento POA Cargado';
    const loadedActivities = (poaData.activities || []).map(act => ({
        decisionBranches: { yesLabel: '', noLabel: '', ...(act.decisionBranches || {}) }, // Default to empty strings
        alternativeBranches: act.alternativeBranches || [],
        responsible: act.responsible || '',
        userNumber: act.userNumber || '', 
        activityName: act.activityName || '',
        nextIndividualActivityRef: (act.nextIndividualActivityRef === undefined || act.nextIndividualActivityRef === null) ? '' : act.nextIndividualActivityRef,
        parentId: act.parentId || null,
        parentBranchCondition: act.parentBranchCondition || null,
        ...act,
        systemNumber: act.systemNumber || `Error-${act.id.substring(0,4)}`, 
        nextActivityType: act.nextActivityType || 'individual',
    }));
    const poaInstance = {
        ...poaData,
        name: name,
        header: {
            ...poaData.header,
            title: name 
        },
        activities: renumberUserNumbers(loadedActivities),
        objectiveHelperData: poaData.objectiveHelperData || {...defaultPOAObjectiveHelperData},
    };
    setPoa(poaInstance);
    setIsDirty(false); 
  }, []);

  const createNew = useCallback((id: string = crypto.randomUUID(), name: string = 'Nuevo Procedimiento POA Sin Título'): POA => {
    const newPoaInstance = createNewPOASchema(id, name);
    const initialActivities = (newPoaInstance.activities || []).map(act => ({
        decisionBranches: { yesLabel: '', noLabel: '' }, // Default to empty strings
        alternativeBranches: [],
        responsible: '',
        userNumber: '', 
        activityName: '',
        nextIndividualActivityRef: '', 
        parentId: null,
        parentBranchCondition: null,
        ...act
    }));
    newPoaInstance.activities = renumberUserNumbers(initialActivities); 
    newPoaInstance.header.title = name; 
    newPoaInstance.objectiveHelperData = {...defaultPOAObjectiveHelperData};
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
            if (branchType === 'decision' && (indexOrKey === 'yes' || indexOrKey === 'no')) {
              const currentDecisionBranches = updatedAct.decisionBranches || { yesLabel: '', noLabel: '' }; // Default to empty
              updatedAct.decisionBranches = { ...currentDecisionBranches, [indexOrKey]: label };
            } else if (branchType === 'alternative' && typeof indexOrKey === 'number') {
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
      const updatedActivities = currentPoa.activities.map(act => {
        if (act.id === activityId) {
          const newBranch: POAActivityAlternativeBranch = { id: crypto.randomUUID(), label: `Alternativa ${(act.alternativeBranches || []).length + 1}` };
          return {
            ...act,
            alternativeBranches: [...(act.alternativeBranches || []), newBranch]
          };
        }
        return act;
      });
      return {
        ...currentPoa,
        activities: renumberUserNumbers(updatedActivities) 
      };
    });
  }, []);

  const removeAlternativeBranch = useCallback((activityId: string, branchId: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      setIsDirty(true);

      const branchChildrenIdsToDelete = new Set<string>();
      const queue: string[] = currentPoa.activities
                                .filter(act => act.parentId === activityId && act.parentBranchCondition === branchId)
                                .map(c => c.id);
      
      while(queue.length > 0) {
        const currentChildId = queue.shift()!;
        if (currentChildId) {
            branchChildrenIdsToDelete.add(currentChildId);
            currentPoa.activities.filter(act => act.parentId === currentChildId)
                                 .forEach(grandchild => queue.push(grandchild.id));
        }
      }

      let updatedActivities = currentPoa.activities.map(act => {
        if (act.id === activityId) {
          return {
            ...act,
            alternativeBranches: (act.alternativeBranches || []).filter(branch => branch.id !== branchId)
          };
        }
        return act;
      }).filter(act => !branchChildrenIdsToDelete.has(act.id)); 

      return {
        ...currentPoa,
        activities: renumberUserNumbers(updatedActivities)
      };
    });
  }, []);

  const getChildActivities = useCallback((parentId: string, parentBranchCondition: string): POAActivity[] => {
    if (!poa) return [];
    return poa.activities
      .filter(act => act.parentId === parentId && act.parentBranchCondition === parentBranchCondition)
      .sort((a, b) => {
        if (!a.systemNumber || !b.systemNumber) return 0;
        return a.systemNumber.localeCompare(b.systemNumber, undefined, { numeric: true, sensitivity: 'base' });
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
