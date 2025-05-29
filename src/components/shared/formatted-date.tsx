
"use client";

import { useState, useEffect } from 'react';
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
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // The date string "YYYY-MM-DD" is parsed as UTC midnight.
    // e.g., "2024-07-20" becomes 2024-07-20T00:00:00.000Z
    const dateObj = new Date(dateString);

    // toLocaleDateString will then format this specific moment in time
    // using the client's local timezone by default if no timezone is specified in options.
    // This ensures the date is displayed as per the user's local perception of that UTC date.
    setFormattedDate(dateObj.toLocaleDateString(locale, options));
  }, [dateString, locale, options]);

  return <>{formattedDate === null ? placeholder : formattedDate}</>;
}
