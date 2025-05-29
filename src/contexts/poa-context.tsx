
"use client";

import type { POA, POAActivity, POAHeader } from '@/lib/schema';
import { createNewPOA } from '@/lib/schema';
import type React from 'react';
import { createContext, useCallback, useState } from 'react';

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
  createNew: (id?: string, name?: string) => void;
  updatePoaName: (name: string) => void;
}

export const POAContext = createContext<POAContextType | undefined>(undefined);

export const POAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [poa, setPoa] = useState<POA | null>(null);

  const updatePoaName = useCallback((name: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      return { ...currentPoa, name, updatedAt: new Date().toISOString() };
    });
  }, []);
  
  const updateHeader = useCallback((updates: Partial<POAHeader>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      return {
        ...currentPoa,
        header: { ...currentPoa.header, ...updates },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateField = useCallback((fieldName: keyof Omit<POA, 'id' | 'header' | 'activities' | 'createdAt' | 'updatedAt' | 'userId' | 'name'>, value: string) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      return { ...currentPoa, [fieldName]: value, updatedAt: new Date().toISOString() };
    });
  }, []);

  const addActivity = useCallback((activity?: Partial<POAActivity>) => {
    setPoa(currentPoa => {
      if (!currentPoa) return null;
      const newActivity: POAActivity = {
        id: crypto.randomUUID(),
        number: (currentPoa.activities.length + 1).toString(), // Basic numbering, needs improvement for hierarchy
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
      // Re-number activities after deletion if necessary (complex, simplify for now)
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
      return { ...currentPoa, activities, updatedAt: new Date().toISOString() };
    });
  }, []);


  const loadPoa = useCallback((poaData: POA) => {
    setPoa(poaData);
  }, []);
  
  const createNew = useCallback((id: string = 'new', name: string = 'POA Sin Título') => {
    setPoa(createNewPOA(id, name));
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
    }}>
      {children}
    </POAContext.Provider>
  );
};
