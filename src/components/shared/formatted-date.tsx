
"use client";

import { useMemo } from 'react';
import type { ReactNode } from 'react';

interface FormattedDateClientProps {
  dateString: string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  placeholder?: ReactNode;
}

export function FormattedDateClient({
  dateString,
  locale = 'es-ES',
  options = { year: 'numeric', month: 'long', day: 'numeric' },
  placeholder = "...", // Simple placeholder
}: FormattedDateClientProps) {
  const formattedDate = useMemo(() => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString(locale, options);
  }, [dateString, locale, options]);

  return <>{formattedDate ?? placeholder}</>;
}
