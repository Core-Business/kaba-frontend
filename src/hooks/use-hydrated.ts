import { useState, useEffect } from 'react';

/**
 * Hook para detectar cuándo el componente ha sido hidratado en el cliente.
 * Útil para evitar errores de hidratación SSR/Cliente cuando el contenido
 * puede diferir entre servidor y cliente.
 * 
 * @returns boolean - true cuando el componente está hidratado en el cliente
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Solo se ejecuta en el cliente después de la hidratación
    setHydrated(true);
  }, []);

  return hydrated;
} 