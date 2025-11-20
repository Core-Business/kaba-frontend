'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function OTPInput({
  length = 10,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  // Asegurar que el valor tenga la longitud correcta
  const digits = value.padEnd(length, '').split('').slice(0, length);

  useEffect(() => {
    // Auto-focus en el primer input vacío
    const firstEmptyIndex = digits.findIndex(digit => digit === '');
    if (firstEmptyIndex !== -1 && !disabled) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, [digits, disabled]);

  useEffect(() => {
    // Llamar onComplete cuando esté completo
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Solo permitir números
    const numericDigit = digit.replace(/\D/g, '');
    
    if (numericDigit.length > 1) {
      // Si pegan múltiples dígitos
      const newValue = value.substring(0, index) + numericDigit.substring(0, length - index);
      onChange(newValue.substring(0, length));
      
      // Focus en el siguiente input disponible
      const nextIndex = Math.min(index + numericDigit.length, length - 1);
      setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);
    } else {
      // Un solo dígito
      const newDigits = [...digits];
      newDigits[index] = numericDigit;
      const newValue = newDigits.join('').replace(/\s/g, '');
      onChange(newValue);

      // Auto-avanzar al siguiente input
      if (numericDigit && index < length - 1) {
        setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      
      if (digits[index]) {
        // Borrar el dígito actual
        newDigits[index] = '';
      } else if (index > 0) {
        // Moverse al anterior y borrarlo
        newDigits[index - 1] = '';
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
      }
      
      const newValue = newDigits.join('').replace(/\s/g, '');
      onChange(newValue);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (value.length === length && onComplete) {
        onComplete(value);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Seleccionar todo el contenido al hacer focus
    setTimeout(() => inputRefs.current[index]?.select(), 0);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData) {
      const newValue = pastedData.substring(0, length);
      onChange(newValue);
      
      // Focus en el último input llenado
      const focusIndex = Math.min(newValue.length - 1, length - 1);
      setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
    }
  };

  return (
    <div 
      className={cn('flex gap-3 justify-center', className)}
      onPaste={handlePaste}
    >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'w-12 h-12 text-center text-lg font-mono font-semibold',
              'border-2 rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              
              // Estados normales
              !error && !disabled && 'border-gray-300 bg-white text-gray-900',
              !error && !disabled && 'hover:border-gray-400',
              !error && !disabled && 'focus:border-blue-500 focus:ring-blue-500',
              
              // Estado con valor
              !error && !disabled && digits[index] && 'border-blue-500 bg-blue-50',
              
              // Estado focused
              !error && !disabled && focusedIndex === index && 'border-blue-500 ring-2 ring-blue-500',
              
              // Estado error
              error && 'border-red-500 bg-red-50 text-red-900',
              error && 'focus:border-red-500 focus:ring-red-500',
              
              // Estado disabled
              disabled && 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed',
            )}
            aria-label={`Dígito ${index + 1} del código OTP`}
          />
        ))}
    </div>
  );
}
