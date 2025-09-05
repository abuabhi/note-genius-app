import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useManagedTimeout } from '@/utils/performance';

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const DebouncedInput = React.memo(({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  debounceMs = 300,
  className 
}: DebouncedInputProps) => {
  // Don't use internal state to prevent focus issues
  console.log('🔍 [DEBOUNCED INPUT] Rendering with value:', value);

  // Use ref to track the last onChange call to prevent infinite updates
  const lastChangeRef = React.useRef<string>('');
  const [pendingValue, setPendingValue] = React.useState<string | null>(null);

  // Set up managed timeout for debouncing
  useManagedTimeout('debounced-input', () => {
    if (pendingValue !== null && pendingValue !== lastChangeRef.current) {
      console.log('🔍 [DEBOUNCED INPUT] Calling onChange with:', pendingValue);
      lastChangeRef.current = pendingValue;
      onChange(pendingValue);
      setPendingValue(null);
    }
  }, pendingValue !== null ? debounceMs : null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('🔍 [DEBOUNCED INPUT] Input changed to:', newValue);
    setPendingValue(newValue);
  }, []);

  const clearInput = useCallback(() => {
    console.log('🔍 [DEBOUNCED INPUT] Clearing input');
    onChange('');
  }, [onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mint-400" />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`pl-10 pr-10 border-mint-200 focus-visible:ring-mint-400 ${className || ''}`}
        autoComplete="off"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearInput}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

DebouncedInput.displayName = 'DebouncedInput';