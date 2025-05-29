"use client";

import { POAContext } from '@/contexts/poa-context';
import { useContext } from 'react';

export const usePOA = () => {
  const context = useContext(POAContext);
  if (context === undefined) {
    throw new Error('usePOA must be used within a POAProvider');
  }
  return context;
};
